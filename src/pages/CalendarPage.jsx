import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle, Printer } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import EventList from '@/components/calendar/EventList';
import EventFormDialog from '@/components/calendar/EventFormDialog';
import { supabase } from '@/lib/supabaseClient';

export const eventTypes = [
  { value: "Prestation", label: "Prestation", color: "bg-blue-500" },
  { value: "Maintenance", label: "Maintenance", color: "bg-yellow-500" },
  { value: "Interne", label: "Interne", color: "bg-green-500" },
  { value: "Rappel", label: "Rappel", color: "bg-purple-500" },
];

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { toast } = useToast();

  const loadCalendarData = useCallback(async () => {
    try {
      // Charger les prestations depuis Supabase
      const { data: prestationsData, error: prestationsError } = await supabase
        .from('prestations')
        .select('*, clients(nom)')
        .order('date_prestation', { ascending: true });

      if (prestationsError) throw prestationsError;

      // Convertir les prestations en événements du calendrier
      const prestationEvents = prestationsData.map(prestation => ({
        id: prestation.id,
        title: `${prestation.type_prestation} - ${prestation.clients?.nom || 'Client non spécifié'}`,
        date: prestation.date_prestation,
        type: "Prestation",
        color: eventTypes.find(et => et.value === "Prestation")?.color || "bg-blue-500",
        originalData: prestation,
      }));

      // Charger les événements personnalisés depuis le localStorage
      const storedCustomEvents = JSON.parse(localStorage.getItem('calendarCustomEvents') || '[]');
      
      // Combiner les prestations et les événements personnalisés
      const allEvents = [...prestationEvents, ...storedCustomEvents];
      setEvents(allEvents);

    } catch (error) {
      console.error("Erreur lors du chargement des données du calendrier:", error);
      toast({ 
        title: "Erreur de chargement", 
        description: "Impossible de charger les prestations.", 
        variant: "destructive" 
      });
    }
  }, [toast]);

  useEffect(() => {
    loadCalendarData();
    const intervalId = setInterval(loadCalendarData, 5000); // Rafraîchir toutes les 5 secondes
    return () => clearInterval(intervalId);
  }, [loadCalendarData]);

  const saveCustomEventsToLocalStorage = (updatedCustomEvents) => {
    localStorage.setItem('calendarCustomEvents', JSON.stringify(updatedCustomEvents));
    loadCalendarData(); // Reload all events to reflect changes
  };

  const handleDateClick = (day) => setSelectedDate(day);
  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleAddEvent = (day) => {
    setSelectedDate(day);
    setCurrentEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event) => {
    if (!event.id.startsWith('cust-')) {
      toast({ 
        title: "Modification non autorisée", 
        description: "Les prestations doivent être modifiées depuis le module Prestations.", 
        variant: "destructive" 
      });
      return;
    }
    setSelectedDate(parseISO(event.date));
    setCurrentEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const handleDeleteEvent = (eventId) => {
    if (!eventId.startsWith('cust-')) {
      toast({ 
        title: "Suppression non autorisée", 
        description: "Les prestations doivent être supprimées depuis le module Prestations.", 
        variant: "destructive" 
      });
      return;
    }
    const customEvents = JSON.parse(localStorage.getItem('calendarCustomEvents') || '[]');
    const updatedCustomEvents = customEvents.filter(e => e.id !== eventId);
    saveCustomEventsToLocalStorage(updatedCustomEvents);
    toast({ title: "Événement supprimé", description: "L'événement personnalisé a été retiré du calendrier." });
  };

  const handleEventSubmit = (eventData) => {
    const customEvents = JSON.parse(localStorage.getItem('calendarCustomEvents') || '[]');
    let updatedCustomEvents;

    if (currentEvent && !currentEvent.id.startsWith('serv-')) {
      updatedCustomEvents = customEvents.map(e => e.id === currentEvent.id ? { ...eventData, id: currentEvent.id } : e);
      toast({ title: "Événement modifié", description: "L'événement personnalisé a été mis à jour." });
    } else {
      const newEvent = { ...eventData, id: `cust-${Date.now()}` };
      updatedCustomEvents = [...customEvents, newEvent];
      toast({ title: "Événement ajouté", description: "Le nouvel événement personnalisé a été ajouté." });
    }
    saveCustomEventsToLocalStorage(updatedCustomEvents);
    setIsEventDialogOpen(false);
    setCurrentEvent(null);
  };
  
  const handlePrintCalendar = () => {
    const calendarElement = document.getElementById('calendar-to-print');
    if (!calendarElement) {
      toast({
        title: "Erreur d'impression",
        description: "Impossible de trouver le contenu du calendrier à imprimer.",
        variant: "destructive"
      });
      return;
    }

    // Créer la fenêtre d'impression
    const printWindow = window.open('', '', 'width=1000,height=600');
    printWindow.document.open();

    // Récupérer les événements
    const events = Array.from(calendarElement.querySelectorAll('.print-calendar-event')).map(event => {
      const dayEl = event.closest('.print-calendar-day');
      return {
        date: dayEl.querySelector('.print-calendar-day-number').textContent,
        title: event.textContent,
        color: Array.from(event.classList).find(c => c.startsWith('bg-')) || ''
      };
    }).sort((a, b) => parseInt(a.date) - parseInt(b.date));

    // Styles pour l'impression
    const styles = `
      @page { size: landscape; margin: 1cm; }
      * { box-sizing: border-box; }
      body { 
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 15px;
        background: white;
      }
      .page {
        page-break-after: always;
        padding: 15px;
      }
      .page:last-child {
        page-break-after: avoid;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header h1 {
        font-size: 24px;
        margin: 0 0 5px 0;
      }
      .header p {
        color: #666;
        margin: 0;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: #ddd;
        border: 1px solid #ccc;
        margin-bottom: 20px;
      }
      .calendar-day {
        background: white;
        padding: 8px;
        min-height: 100px;
      }
      .day-header {
        display: flex;
        justify-content: space-between;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
      }
      .day-name {
        font-size: 12px;
        color: #666;
      }
      .day-number {
        font-weight: bold;
      }
      .event {
        margin: 3px 0;
        padding: 4px 6px;
        border-radius: 3px;
        font-size: 11px;
        color: white;
      }
      .events-page {
        padding: 20px;
      }
      .events-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
      }
      .event-card {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 12px;
      }
      .event-date {
        color: #666;
        margin-bottom: 5px;
      }
      .bg-blue-500 { background-color: #3b82f6 !important; }
      .bg-yellow-500 { background-color: #eab308 !important; }
      .bg-green-500 { background-color: #22c55e !important; }
      .bg-purple-500 { background-color: #a855f7 !important; }
    `;

    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const days = Array.from(calendarElement.querySelectorAll('.print-calendar-day'));
    
    const calendarContent = days.map((day, idx) => {
      const dayNumber = day.querySelector('.print-calendar-day-number').textContent;
      const events = Array.from(day.querySelectorAll('.print-calendar-event')).map(event => {
        const className = Array.from(event.classList).find(c => c.startsWith('bg-'));
        return `<div class="event ${className}">${event.textContent}</div>`;
      }).join('');

      return `
        <div class="calendar-day${day.classList.contains('outside-month') ? ' outside-month' : ''}">
          <div class="day-header">
            <span class="day-name">${weekDays[idx % 7]}</span>
            <span class="day-number">${dayNumber}</span>
          </div>
          ${events}
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Calendrier - ${format(currentMonth, "MMMM yyyy", { locale: fr })}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1>Planning de ${format(currentMonth, "MMMM yyyy", { locale: fr })}</h1>
              <p>Imprimé le ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
            </div>
            <div class="calendar-grid">
              ${calendarContent}
            </div>
          </div>
          <div class="page events-page">
            <div class="header">
              <h1>Liste des événements - ${format(currentMonth, "MMMM yyyy", { locale: fr })}</h1>
              <p>${events.length} événement${events.length > 1 ? 's' : ''}</p>
            </div>
            <div class="events-list">
              ${events.map(event => `
                <div class="event-card">
                  <div class="event-date">Jour ${event.date}</div>
                  <div class="event ${event.color}">${event.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Attendre que tout soit chargé
    const checkReadyState = setInterval(() => {
      if (printWindow.document.readyState === 'complete') {
        clearInterval(checkReadyState);
        printWindow.focus();
        printWindow.print();
      }
    }, 250);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendrier des Prestations</h1>
        <Button onClick={handlePrintCalendar} variant="outline" className="mt-4 sm:mt-0">
          <Printer className="mr-2 h-4 w-4" /> Imprimer le Calendrier
        </Button>
      </div>
      
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div id="calendar-to-print" className="md:col-span-2">
          <CalendarView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            events={events}
            onDateClick={handleDateClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        <Card className="mt-6 md:mt-0 shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 print:hidden">
          <CardHeader>
            <CardTitle>Événements du {format(selectedDate, "PPP", { locale: fr })}</CardTitle>
            <Button size="sm" onClick={() => handleAddEvent(selectedDate)} className="mt-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Événement Personnalisé
            </Button>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            <EventList
              selectedDate={selectedDate}
              events={events}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </CardContent>
        </Card>
      </div>

      <EventFormDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={handleEventSubmit}
        event={currentEvent}
        selectedDate={selectedDate}
        eventTypes={eventTypes.filter(et => et.value !== "Prestation")} 
      />
    </div>
  );
};

export default CalendarPage;