
"use client";

import { Bell, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_REMINDERS, MOCK_MEDICATIONS } from "@/lib/constants"; // Using mock data
import type { Reminder, Medication } from "@/lib/types";
import { useState, useEffect } from "react";

interface UpcomingReminderItemProps {
  reminder: Reminder;
  medication?: Medication;
  onToggleTaken: (id: string, taken: boolean) => void;
  isTaken: boolean;
}

function UpcomingReminderItem({ reminder, medication, onToggleTaken, isTaken }: UpcomingReminderItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3">
        {medication?.imageUrl && (
            <img src={medication.imageUrl} alt={medication.name} className="w-10 h-10 rounded-md object-cover" data-ai-hint={medication.dataAiHint || "pill"} />
        )}
        <div>
          <p className="font-semibold">{medication?.name || reminder.medicationName}</p>
          <p className="text-sm text-muted-foreground">
            {medication?.dosage} - {reminder.time}
          </p>
        </div>
      </div>
      <Button
        variant={isTaken ? "outline" : "default"}
        size="sm"
        onClick={() => onToggleTaken(reminder.id, !isTaken)}
        className={isTaken ? "border-green-500 text-green-500 hover:bg-green-500/10" : ""}
      >
        {isTaken ? <CheckCircle className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
        {isTaken ? "Taken" : "Mark as Taken"}
      </Button>
    </div>
  );
}


export function UpcomingReminders() {
  // Filter to show only enabled reminders and sort by time for "today"
  // In a real app, this would be more sophisticated, considering actual dates and times
  const upcoming = MOCK_REMINDERS
    .filter(r => r.isEnabled && (r.days.includes("Daily") || r.days.includes(new Date().toLocaleDateString('en-US', { weekday: 'short' }))))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3); // Show top 3 upcoming

  const [takenStatus, setTakenStatus] = useState<Record<string, boolean>>({});

  const handleToggleTaken = (reminderId: string, taken: boolean) => {
    setTakenStatus(prev => ({ ...prev, [reminderId]: taken }));
    // Here you would typically also send this to a backend
  };
  
  if (upcoming.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming reminders for today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.map((reminder) => {
          const medication = MOCK_MEDICATIONS.find(m => m.id === reminder.medicationId);
          return (
            <UpcomingReminderItem 
              key={reminder.id} 
              reminder={reminder} 
              medication={medication}
              onToggleTaken={handleToggleTaken}
              isTaken={!!takenStatus[reminder.id]}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
