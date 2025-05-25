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

  const loadCalendarData = useCallback(() => {
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    const serviceEvents = storedServices.map(service => ({
      id: `serv-${service.id}`,
      title: `${service.type} - ${service.client}`,
      date: service.date, // Assumes service.date is ISO string
      type: "Prestation",
      color: eventTypes.find(et => et.value === "Prestation")?.color || "bg-blue-500",
      originalData: service,
    }));

    const storedCustomEvents = JSON.parse(localStorage.getItem('calendarCustomEvents') || '[]');
    const allEvents = [...serviceEvents, ...storedCustomEvents];
    setEvents(allEvents);
  }, []);

  useEffect(() => {
    loadCalendarData();
    const intervalId = setInterval(loadCalendarData, 5000); // Refresh every 5 seconds
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
    if (event.id.startsWith('serv-')) {
      toast({ title: "Modification non autorisée", description: "Les prestations doivent être modifiées depuis le module Prestations.", variant: "destructive" });
      return;
    }
    setSelectedDate(parseISO(event.date));
    setCurrentEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const handleDeleteEvent = (eventId) => {
    if (eventId.startsWith('serv-')) {
      toast({ title: "Suppression non autorisée", description: "Les prestations doivent être supprimées depuis le module Prestations.", variant: "destructive" });
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
    const printWindow = window.open('', '_blank');
    const calendarElement = document.getElementById('calendar-to-print');
    if (calendarElement) {
      const headerContent = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1>Planning de ${format(currentMonth, "MMMM yyyy", { locale: fr })}</h1>
          <p>Imprimé le: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
        </div>
      `;
      const styles = `
        body { font-family: Arial, sans-serif; margin: 20px; }
        .print-calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #ccc; }
        .print-calendar-header { text-align: center; font-weight: bold; padding: 8px; border-bottom: 1px solid #ccc; background-color: #f0f0f0; }
        .print-calendar-day { border: 1px solid #eee; padding: 5px; min-height: 100px; position: relative; }
        .print-calendar-day-number { font-weight: bold; margin-bottom: 5px; }
        .print-calendar-day.outside-month { background-color: #f9f9f9; color: #aaa; }
        .print-calendar-event { font-size: 0.8em; padding: 2px 4px; margin-bottom: 2px; border-radius: 3px; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bg-blue-500 { background-color: #3b82f6 !important; }
        .bg-yellow-500 { background-color: #eab308 !important; }
        .bg-green-500 { background-color: #22c55e !important; }
        .bg-purple-500 { background-color: #a855f7 !important; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-calendar-event { color: white !important; } /* Ensure text color on backgrounds */
        }
      `;
      printWindow.document.write('<html><head><title>Calendrier Imprimable</title>');
      printWindow.document.write(`<style>${styles}</style>`);
      printWindow.document.write('</head><body>');
      printWindow.document.write(headerContent);
      printWindow.document.write(calendarElement.innerHTML);
      printWindow.document.write('<script>setTimeout(() => { window.print(); window.close(); }, 500);</script>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
    } else {
      toast({title: "Erreur d'impression", description: "Impossible de trouver le contenu du calendrier à imprimer.", variant: "destructive"});
    }
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