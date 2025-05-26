
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyCalendarViewProps {
  onDayClick: (dayIndex: number) => void; // dayIndex: 0 for Monday, ..., 6 for Sunday
}

export function WeeklyCalendarView({ onDayClick }: WeeklyCalendarViewProps) {
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
          {DAYS_OF_WEEK.map((day, index) => (
            <Card 
              key={day} 
              className={cn(
                "p-3 text-center bg-primary/20 cursor-pointer hover:bg-primary/30 transition-colors",
                // Add specific styling for today if desired
              )}
              onClick={() => onDayClick(index)}
            >
              <p className="font-medium text-sm">{day}</p>
              {/* Placeholder for content for each day */}
              {/* <p className="text-xs text-muted-foreground mt-1">No activity</p> */}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
