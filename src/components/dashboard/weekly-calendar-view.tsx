
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK, MOCK_REMINDERS } from "@/lib/constants";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyCalendarViewProps {
  onDayClick: (dayIndex: number) => void; // dayIndex: 0 for Monday, ..., 6 for Sunday
}

export function WeeklyCalendarView({ onDayClick }: WeeklyCalendarViewProps) {
  const today = new Date();
  const currentDayOfWeekJS = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
  // Adjust so Monday is 0, Tuesday is 1, ..., Sunday is 6
  const todayDayOfWeekMon0 = (currentDayOfWeekJS === 0) ? 6 : currentDayOfWeekJS - 1;

  return (
    <Card className="mb-6 bg-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Your Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayIndex = index; // 0 for Monday, ..., 6 for Sunday

            // Calculate the actual date for this day card
            const dayDifference = dayIndex - todayDayOfWeekMon0;
            const dateForThisDayCard = new Date(today);
            dateForThisDayCard.setDate(today.getDate() + dayDifference);
            dateForThisDayCard.setHours(0, 0, 0, 0); // Normalize time for accurate comparison

            const shortDayStr = dateForThisDayCard.toLocaleDateString('en-US', { weekday: 'short' });
            
            const medsForThisDay = MOCK_REMINDERS.filter(r =>
                r.isEnabled && (r.days.includes("Daily") || r.days.includes(shortDayStr))
            );
            const medicationCount = medsForThisDay.length;

            const isToday = today.toDateString() === dateForThisDayCard.toDateString();

            // Placeholder for future adherence status:
            // const isSuccessDay = false; // Logic to determine if all meds taken
            // const isMissedDay = false;  // Logic to determine if any med skipped

            return (
              <Card 
                key={day} 
                className={cn(
                  "p-3 text-center bg-primary/20 cursor-pointer hover:bg-primary/30 transition-colors",
                  isToday && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary/30", // Highlight for today
                  // isSuccessDay && "bg-green-300 border-green-500 hover:bg-green-400/80",
                  // isMissedDay && "bg-red-300 border-red-500 hover:bg-red-400/80",
                )}
                onClick={() => onDayClick(index)}
              >
                <p className="font-medium text-sm text-foreground">{day}</p>
                {medicationCount > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {medicationCount} med{medicationCount === 1 ? '' : 's'}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">-</p>
                )}
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
