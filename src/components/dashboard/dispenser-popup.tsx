
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { XIcon, Bot, CheckCircle, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_REMINDERS, MOCK_MEDICATIONS, MOCK_MOOD_ENTRIES, MOOD_OPTIONS, MOCK_DAILY_MED_STATUSES } from "@/lib/constants";
import type { Reminder, Medication, MoodEntry, Mood } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { philMotivator, PhilMotivatorInput } from "@/ai/flows/phil-motivator";


interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetDate: Date | null;
  triggerPhilMessage: (eventType: string, eventContext?: string) => void;
}

type MedicationStatus = "taken" | "skipped" | undefined; // undefined means pending

interface DailyMedStatus {
  [reminderId: string]: MedicationStatus;
}

export function DispenserPopup({
  isOpen,
  onOpenChange,
  targetDate,
  triggerPhilMessage,
}: DispenserPopupProps) {
  const [currentMedStatuses, setCurrentMedStatuses] = useState<DailyMedStatus>({});
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const dateISO = targetDate ? targetDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const saveCurrentState = useCallback(async (updatedMedStatuses: DailyMedStatus, mood: Mood | null, currentNotes: string) => {
    if (!targetDate) return;
    setIsSaving(true);
    const dateKey = targetDate.toISOString().split("T")[0];

    // Persist medication statuses
    MOCK_DAILY_MED_STATUSES[dateKey] = { ...MOCK_DAILY_MED_STATUSES[dateKey], ...updatedMedStatuses };

    // Persist mood and notes
    const moodEntryIndex = MOCK_MOOD_ENTRIES.findIndex(e => e.date === dateKey);
    if (mood) {
      if (moodEntryIndex > -1) {
        MOCK_MOOD_ENTRIES[moodEntryIndex] = { ...MOCK_MOOD_ENTRIES[moodEntryIndex], mood, notes: currentNotes };
      } else {
        MOCK_MOOD_ENTRIES.push({ id: String(Date.now()), date: dateKey, mood, notes: currentNotes });
      }
    } else if (moodEntryIndex > -1 && currentNotes !== MOCK_MOOD_ENTRIES[moodEntryIndex].notes) { // Mood is null, but notes might have changed
       MOCK_MOOD_ENTRIES[moodEntryIndex].notes = currentNotes;
    } else if (moodEntryIndex === -1 && currentNotes) { // No mood, but notes exist
        MOCK_MOOD_ENTRIES.push({ id: String(Date.now()), date: dateKey, mood: 'okay', notes: currentNotes }); // Default to 'okay' if only notes
    }


    toast({
      title: "Status Updated",
      description: "Your changes have been automatically updated.",
    });
    await triggerPhilMessage("STATUS_SAVED_POPUP", `Updated log for ${targetDate.toLocaleDateString()}`);
    setIsSaving(false);
  }, [targetDate, toast, triggerPhilMessage]);


  useEffect(() => {
    if (isOpen && targetDate) {
      const dateKey = targetDate.toISOString().split('T')[0];
      
      // Load persisted medication statuses
      setCurrentMedStatuses(MOCK_DAILY_MED_STATUSES[dateKey] || {});

      // Load persisted mood and notes
      const todaysMoodEntry = MOCK_MOOD_ENTRIES.find(entry => entry.date === dateKey);
      setSelectedMood(todaysMoodEntry?.mood || null);
      setNotes(todaysMoodEntry?.notes || "");
    }
  }, [isOpen, targetDate]);

  const scheduledReminders = targetDate
    ? MOCK_REMINDERS.filter((r) => {
        if (!r.isEnabled) return false;
        const reminderDate = new Date(targetDate); // Clone to avoid modifying original
        reminderDate.setHours(
          parseInt(r.time.split(":")[0]),
          parseInt(r.time.split(":")[1]),
          0,
          0
        );
        const dayOfWeek = reminderDate.toLocaleDateString("en-US", { weekday: "short" });
        return r.days.includes("Daily") || r.days.includes(dayOfWeek);
      })
    : [];

  const getMedicationsForSlot = (slot: "Morning" | "Lunch" | "Dinner" | "Night") => {
    return scheduledReminders
      .filter((r) => {
        const hour = parseInt(r.time.split(":")[0]);
        if (slot === "Morning" && hour >= 5 && hour < 12) return true;
        if (slot === "Lunch" && hour >= 12 && hour < 17) return true;
        if (slot === "Dinner" && hour >= 17 && hour < 21) return true;
        if (slot === "Night" && (hour >= 21 || hour < 5)) return true;
        return false;
      })
      .map((r) => ({
        ...r,
        medication: MOCK_MEDICATIONS.find((m) => m.id === r.medicationId),
        status: currentMedStatuses[r.id],
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const timeSlots = ["Morning", "Lunch", "Dinner", "Night"] as const;
  
  const handleMarkSectionAsTaken = (slot: "Morning" | "Lunch" | "Dinner" | "Night") => {
    const medsInSlot = getMedicationsForSlot(slot);
    const allCurrentlyTaken = medsInSlot.every(m => currentMedStatuses[m.id] === 'taken');
    const newStatus = allCurrentlyTaken ? undefined : 'taken';
    
    const updatedSectionStatuses: DailyMedStatus = {};
    medsInSlot.forEach(m => {
      updatedSectionStatuses[m.id] = newStatus;
    });
    const newStatuses = { ...currentMedStatuses, ...updatedSectionStatuses };
    setCurrentMedStatuses(newStatuses);
    saveCurrentState(newStatuses, selectedMood, notes);
  };

  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? null : mood;
    setSelectedMood(newMood);
    saveCurrentState(currentMedStatuses, newMood, notes);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
  };
  
  const handleNotesBlur = () => {
    saveCurrentState(currentMedStatuses, selectedMood, notes);
  };

  const defaultOpenSections = timeSlots.filter(slot => getMedicationsForSlot(slot).length > 0);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[85vh] flex flex-col">
         <DialogClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4 h-auto p-1 text-sm text-muted-foreground hover:text-foreground">
            Save & Close
            <XIcon className="w-4 h-4 ml-1" />
          </Button>
        </DialogClose>
        <DialogHeader className="pr-16"> {/* Added pr-16 to avoid overlap with custom close button */}
          <DialogTitle className="text-lg font-semibold">
            Daily Check-in for {targetDate ? targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Today"}
          </DialogTitle>
          <DialogDescription>
            Manage your daily medication adherence based on your weekly schedule and track how you're feeling. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-2">
          <Accordion type="multiple" defaultValue={defaultOpenSections} className="w-full space-y-3">
            {timeSlots.map((slot) => {
              const medicationsInSlot = getMedicationsForSlot(slot);
              const isEmpty = medicationsInSlot.length === 0;
              const allTakenInSlot = !isEmpty && medicationsInSlot.every(m => m.status === 'taken');
              
              let accordionBgClass = "bg-primary/10"; // Default light blue
              if (isEmpty) {
                accordionBgClass = "bg-muted"; // Gray if no meds
              } else if (allTakenInSlot) {
                accordionBgClass = "bg-green-500/10"; // Light green if all taken
              }

              return (
                <AccordionItem
                  key={slot}
                  value={slot}
                  className={cn("border rounded-md shadow-sm", accordionBgClass)}
                >
                  <AccordionTrigger className="px-4 py-3 text-md font-medium hover:no-underline">
                    {slot} ({medicationsInSlot.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0">
                    {isEmpty ? (
                      <p className="text-sm text-muted-foreground">No medications scheduled for {slot.toLowerCase()}.</p>
                    ) : (
                      <div className="space-y-3">
                        <ul className="space-y-2">
                          {medicationsInSlot.map(({ medication, time, id, status }) => (
                            <li key={id} className={cn(
                                "flex items-center justify-between p-2 rounded-md",
                                status === 'taken' ? 'bg-green-100' : 'bg-background/50'
                              )}>
                              <div className="flex items-center gap-3">
                                {medication?.imageUrl && (
                                  <Image
                                    src={medication.imageUrl}
                                    alt={medication.name}
                                    width={32}
                                    height={32}
                                    className="rounded-md object-cover"
                                    data-ai-hint={medication.dataAiHint || "pill"}
                                  />
                                )}
                                <div>
                                  <span className="font-medium text-foreground">{medication?.name}</span>
                                  <span className="text-sm text-foreground ml-2">{medication?.dosage}</span>
                                </div>
                              </div>
                              {status === 'taken' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handleMarkSectionAsTaken(slot)}
                          variant={allTakenInSlot ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full",
                            allTakenInSlot ? "bg-green-600 hover:bg-green-700 text-white" : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          )}
                          disabled={isSaving}
                        >
                          {allTakenInSlot ? `All ${slot} Meds Taken` : `Mark All ${slot} as Taken`}
                           {allTakenInSlot && <CheckCircle className="w-4 h-4 ml-2" />}
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Card className="p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-primary" /> How are you feeling?
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2 mb-3">
              {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={selectedMood === value ? "default" : "outline"}
                  onClick={() => handleMoodSelect(value)}
                  className={cn(
                    "flex-1 min-w-[60px] sm:min-w-[70px] py-2 h-auto flex-col gap-1 text-xs",
                    selectedMood === value 
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                      : 'text-foreground border-input hover:bg-muted'
                  )}
                  disabled={isSaving}
                >
                  <Icon className={cn("w-6 h-6 mb-0.5", selectedMood === value ? 'text-accent-foreground' : 'text-foreground')} />
                  {label}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Any notes about your day or mood? (Optional)"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleNotesBlur}
              rows={3}
              className="text-sm"
              disabled={isSaving}
            />
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    