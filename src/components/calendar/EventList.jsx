import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const EventList = ({ selectedDate, events, onEditEvent, onDeleteEvent }) => {
  const eventsForSelectedDay = events
    .filter(event => format(parseISO(event.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    .sort((a,b) => parseISO(a.date) - parseISO(b.date));

  return (
    <AnimatePresence>
      {eventsForSelectedDay.length > 0 ? (
        eventsForSelectedDay.map(event => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`p-3 mb-2 rounded-lg shadow ${event.color} text-white`}
          >
            <div className="font-semibold">{event.title}</div>
            <div className="text-sm opacity-90">{format(parseISO(event.date), "HH:mm")} - {event.type}</div>
            {event.originalData?.notes && <p className="text-xs opacity-80 mt-1 truncate">Notes: {event.originalData.notes}</p>}
            {!event.id.startsWith('serv-') && (
              <div className="mt-1 flex justify-end space-x-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => onEditEvent(event)}><Edit2 size={14}/></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => onDeleteEvent(event.id)}><Trash2 size={14}/></Button>
              </div>
            )}
          </motion.div>
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">Aucun événement pour cette date.</p>
      )}
    </AnimatePresence>
  );
};

export default EventList;