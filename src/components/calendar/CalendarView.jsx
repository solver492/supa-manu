import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

const CalendarView = ({ currentMonth, selectedDate, events, onDateClick, onPrevMonth, onNextMonth }) => {
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { locale: fr }),
    end: endOfWeek(endOfMonth(currentMonth), { locale: fr }),
  });

  const eventsForDay = (day) => events.filter(event => isSameDay(parseISO(event.date), day)).sort((a,b) => parseISO(a.date) - parseISO(b.date));

  return (
    <Card className="shadow-xl border-none bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="flex flex-row items-center justify-between print:hidden">
        <CardTitle>{format(currentMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
        <div className="space-x-2">
          <Button variant="outline" onClick={onPrevMonth}>Précédent</Button>
          <Button variant="outline" onClick={onNextMonth}>Suivant</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground border-b print-calendar-header">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 print-calendar-grid">
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`h-28 border p-1.5 overflow-y-auto cursor-pointer transition-colors print-calendar-day
                ${!isSameMonth(day, currentMonth) ? "bg-muted/30 text-muted-foreground/50 dark:bg-muted/10 dark:text-muted-foreground/30 outside-month" : "hover:bg-primary/5 dark:hover:bg-primary/10"}
                ${isSameDay(day, selectedDate) ? "ring-2 ring-primary bg-primary/10 dark:bg-primary/20" : ""}
              `}
              onClick={() => onDateClick(day)}
            >
              <div className={`font-medium print-calendar-day-number ${isSameDay(day, new Date()) ? "text-primary font-bold" : ""}`}>
                {format(day, "d")}
              </div>
              <div className="mt-1 space-y-0.5">
                {eventsForDay(day).slice(0,2).map(event => (
                  <motion.div 
                    key={event.id} 
                    className={`text-xs p-0.5 rounded-sm truncate text-white ${event.color} print-calendar-event`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {event.title}
                  </motion.div>
                ))}
                {eventsForDay(day).length > 2 && (
                   <div className="text-xs text-muted-foreground text-center">+{eventsForDay(day).length - 2} autres</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;