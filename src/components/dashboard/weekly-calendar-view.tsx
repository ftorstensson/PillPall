
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { CalendarDays } from "lucide-react";

export function WeeklyCalendarView() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Your Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2"> {/* Changed from grid to flex flex-col */}
          {DAYS_OF_WEEK.map((day) => (
            <Card key={day} className="p-3 text-center bg-muted/50">
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

