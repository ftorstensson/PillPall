
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK, MOCK_REMINDERS } from "@/lib/constants";
import { CalendarDays, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface WeeklyCalendarViewProps {
  onDayClick: (dayIndex: number) => void; // dayIndex: 0 for Monday, ..., 6 for Sunday
}

export function WeeklyCalendarView({ onDayClick }: WeeklyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    setCurrentDate(new Date());
  }, []); // Empty dependency array ensures this runs once on mount

  // Values derived from currentDate
  // Ensure these handle `currentDate` being null initially for server/initial-client render consistency
  const currentDayOfWeekJS = currentDate ? currentDate.getDay() : -1; // Sunday is 0, Monday is 1, ..., Saturday is 6
  const todayDayOfWeekMon0 = currentDate ? ((currentDayOfWeekJS === 0) ? 6 : currentDayOfWeekJS - 1) : -1; // Adjust so Monday is 0, ..., Sunday is 6

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

            let shortDayStr = "";
            let isTodayClient = false;
            let medicationCount = 0;

            if (currentDate && todayDayOfWeekMon0 !== -1) {
              const dateForThisDayCard = new Date(currentDate);
              const dayDifference = dayIndex - todayDayOfWeekMon0;
              dateForThisDayCard.setDate(currentDate.getDate() + dayDifference);
              dateForThisDayCard.setHours(0, 0, 0, 0);

              shortDayStr = dateForThisDayCard.toLocaleDateString('en-US', { weekday: 'short' });
              
              const medsForThisDay = MOCK_REMINDERS.filter(r =>
                  r.isEnabled && (r.days.includes("Daily") || r.days.includes(shortDayStr))
              );
              medicationCount = medsForThisDay.length;
              isTodayClient = currentDate.toDateString() === dateForThisDayCard.toDateString();
            }

            return (
              <Card
                key={day}
                className={cn(
                  "p-3 bg-primary/20 cursor-pointer hover:bg-primary/30 transition-colors",
                  isTodayClient && "ring-2 ring-black ring-offset-2 ring-offset-primary/30", // Updated for thicker black outline for today
                )}
                onClick={() => onDayClick(index)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-md text-foreground">{day}</p>
                  {medicationCount > 0 ? (
                    <div className="flex items-center gap-1">
                      <Pill className="w-4 h-4 text-foreground" />
                      <p className="text-sm text-foreground">
                        {medicationCount} med{medicationCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">{currentDate ? "-" : "..."}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
