import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventFormDialog = ({ isOpen, onClose, onSubmit, event, selectedDate, eventTypes }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState(eventTypes.length > 0 ? eventTypes[0].value : "");
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setTime(format(parseISO(event.date), "HH:mm"));
      setType(event.type);
    } else {
      setTitle("");
      setTime("09:00");
      setType(eventTypes.length > 0 ? eventTypes[0].value : "");
    }
  }, [event, isOpen, eventTypes]);

  const handleSubmit = () => {
    if (!title) {
      toast({ title: "Erreur", description: "Le titre de l'événement est requis.", variant: "destructive" });
      return;
    }
    const [hours, minutes] = time.split(':');
    const eventDateWithTime = new Date(selectedDate);
    eventDateWithTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const selectedEventTypeDetails = eventTypes.find(et => et.value === type);

    onSubmit({
      title,
      date: eventDateWithTime.toISOString(),
      type,
      color: selectedEventTypeDetails ? selectedEventTypeDetails.color : "bg-gray-500",
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? "Modifier l'Événement Personnalisé" : "Ajouter un Événement Personnalisé"}</DialogTitle>
          <DialogDescription>
            Planifiez un nouvel événement pour le {format(selectedDate, "PPP", { locale: fr })}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div>
            <Label htmlFor="eventTitle">Titre</Label>
            <Input id="eventTitle" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="eventTime">Heure</Label>
            <Input id="eventTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="eventType">Type d'événement</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(et => (
                  <SelectItem key={et.value} value={et.value}>
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${et.color}`}></span>
                    {et.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
            {event ? "Sauvegarder" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;