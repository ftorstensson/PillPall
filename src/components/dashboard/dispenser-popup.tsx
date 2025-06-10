
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pill, Check, XIcon, CalendarDays } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MOCK_REMINDERS, MOCK_MEDICATIONS, MOOD_OPTIONS, MOCK_DAILY_MED_STATUSES, MOCK_MOOD_ENTRIES } from "@/lib/constants";
import type { Reminder, Medication, Mood, MoodEntry } from "@/lib/types";
import type { PhilMotivatorInput } from "@/ai/flows/phil-motivator";


interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetDate: Date | null;
  triggerPhilMessage: (eventType: string, eventContext?: string) => void;
}

interface MedicationStatus {
  [reminderId: string]: "taken" | undefined;
}

interface TimeSlot {
  name: "Morning" | "Lunch" | "Dinner" | "Night";
  startHour: number;
  endHour: number;
  medications: Reminder[];
}

export function DispenserPopup({
  isOpen,
  onOpenChange,
  targetDate,
  triggerPhilMessage,
}: DispenserPopupProps) {
  const [medicationStatus, setMedicationStatus] = useState<MedicationStatus>({});
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);


  const formattedDate = targetDate
    ? targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Today";
  
  const dateISO = targetDate ? targetDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const saveCurrentState = useCallback(() => {
    // Persist medication status
    if (!MOCK_DAILY_MED_STATUSES[dateISO]) {
      MOCK_DAILY_MED_STATUSES[dateISO] = {};
    }
    MOCK_DAILY_MED_STATUSES[dateISO].medStatus = { ...medicationStatus };

    // Persist mood and notes
    const existingMoodIndex = MOCK_MOOD_ENTRIES.findIndex(entry => entry.date === dateISO);
    if (selectedMood || notes) {
      const moodEntry: MoodEntry = {
        id: existingMoodIndex > -1 ? MOCK_MOOD_ENTRIES[existingMoodIndex].id : String(Date.now()),
        date: dateISO,
        mood: selectedMood!, // Non-null assertion as it's checked
        notes: notes,
      };
      if (existingMoodIndex > -1) {
        MOCK_MOOD_ENTRIES[existingMoodIndex] = moodEntry;
      } else {
        MOCK_MOOD_ENTRIES.push(moodEntry);
      }
    } else if (existingMoodIndex > -1 && !selectedMood && !notes) {
      // If mood and notes are cleared, remove the entry
      MOCK_MOOD_ENTRIES.splice(existingMoodIndex, 1);
    }
    
    MOCK_DAILY_MED_STATUSES[dateISO].mood = selectedMood;
    MOCK_DAILY_MED_STATUSES[dateISO].notes = notes;

    toast({
      title: "Status Updated",
      description: "Your changes have been automatically updated.",
    });
    triggerPhilMessage("STATUS_SAVED_POPUP", `Updated log for ${formattedDate}`);
  }, [dateISO, medicationStatus, selectedMood, notes, toast, triggerPhilMessage, formattedDate]);


  useEffect(() => {
    if (isOpen && targetDate) {
      const dayString = targetDate.toLocaleDateString("en-US", { weekday: "short" });
      const currentDayReminders = MOCK_REMINDERS.filter(
        (r) => r.isEnabled && (r.days.includes("Daily") || r.days.includes(dayString))
      );

      // Load persisted status for the targetDate
      const persistedStatus = MOCK_DAILY_MED_STATUSES[dateISO]?.medStatus || {};
      setMedicationStatus(persistedStatus);

      // Load persisted mood and notes
      const todaysMoodEntry = MOCK_MOOD_ENTRIES.find(entry => entry.date === dateISO);
      setSelectedMood(todaysMoodEntry?.mood || null);
      setNotes(todaysMoodEntry?.notes || "");
      
      // Determine which accordions should be open by default (if they have meds)
      const timeSlotsWithMeds = getTimeSlots(currentDayReminders)
        .filter(slot => slot.medications.length > 0)
        .map(slot => slot.name);
      setActiveAccordionItems(timeSlotsWithMeds);

    } else {
      // Reset when closed or no target date
      setMedicationStatus({});
      setSelectedMood(null);
      setNotes("");
      setActiveAccordionItems([]);
    }
  }, [isOpen, targetDate, dateISO]);

  const getTimeSlots = (reminders: Reminder[]): TimeSlot[] => {
    return [
      {
        name: "Morning",
        startHour: 5,
        endHour: 11,
        medications: reminders.filter((r) => {
          const hour = parseInt(r.time.split(":")[0]);
          return hour >= 5 && hour < 12;
        }).sort((a, b) => a.time.localeCompare(b.time)),
      },
      {
        name: "Lunch",
        startHour: 12,
        endHour: 15,
        medications: reminders.filter((r) => {
          const hour = parseInt(r.time.split(":")[0]);
          return hour >= 12 && hour < 16;
        }).sort((a, b) => a.time.localeCompare(b.time)),
      },
      {
        name: "Dinner",
        startHour: 16,
        endHour: 20,
        medications: reminders.filter((r) => {
          const hour = parseInt(r.time.split(":")[0]);
          return hour >= 16 && hour < 21;
        }).sort((a, b) => a.time.localeCompare(b.time)),
      },
      {
        name: "Night",
        startHour: 21,
        endHour: 4, // Wraps around midnight
        medications: reminders.filter((r) => {
          const hour = parseInt(r.time.split(":")[0]);
          return hour >= 21 || hour < 5; // Covers 9 PM to before 5 AM
        }).sort((a, b) => a.time.localeCompare(b.time)),
      },
    ];
  };
  
  const dayString = targetDate ? targetDate.toLocaleDateString("en-US", { weekday: "short" }) : "";
  const currentDayReminders = MOCK_REMINDERS.filter(
    (r) => r.isEnabled && (r.days.includes("Daily") || r.days.includes(dayString))
  );
  const timeSlots = getTimeSlots(currentDayReminders);

  const handleMarkSectionAsTaken = (slotName: TimeSlot["name"]) => {
    const slot = timeSlots.find(s => s.name === slotName);
    if (!slot || slot.medications.length === 0) return;

    const allTakenInSection = slot.medications.every(rem => medicationStatus[rem.id] === "taken");
    const newStatusForSection = allTakenInSection ? undefined : "taken";
    
    let newMedicationStatus = { ...medicationStatus };
    slot.medications.forEach((rem) => {
      newMedicationStatus[rem.id] = newStatusForSection;
    });
    setMedicationStatus(newMedicationStatus);
    if (newStatusForSection === "taken") {
      triggerPhilMessage("MEDICATION_TAKEN", `All ${slotName} medications marked as taken.`);
    }
    saveCurrentState(); // Auto-save
  };
  
  const handleMoodSelect = (mood: Mood) => {
    const newMood = selectedMood === mood ? null : mood;
    setSelectedMood(newMood);
    saveCurrentState(); // Auto-save
  };

  if (!isOpen || !targetDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Daily Log for {formattedDate}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage your daily medication adherence based on your weekly schedule and track how you&apos;re feeling. Changes are saved automatically.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-auto p-1 text-sm">
                Save & Close <XIcon className="w-4 h-4 ml-1" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-grow p-6 pt-3">
          <div className="space-y-4">
            <Accordion 
                type="multiple" 
                className="w-full" 
                value={activeAccordionItems}
                onValueChange={setActiveAccordionItems}
            >
              {timeSlots.map((slot) => {
                const medicationsInSlot = slot.medications;
                const allMedsTaken = medicationsInSlot.length > 0 && medicationsInSlot.every(rem => medicationStatus[rem.id] === "taken");
                const noMedsInSlot = medicationsInSlot.length === 0;
                
                let accordionItemClass = "border-b";
                if (noMedsInSlot) {
                    accordionItemClass = cn(accordionItemClass, "bg-muted");
                } else if (allMedsTaken) {
                    accordionItemClass = cn(accordionItemClass, "bg-green-500/10");
                } else {
                     accordionItemClass = cn(accordionItemClass, "bg-primary/10"); // Default if has meds but not all taken
                }


                return (
                  <AccordionItem key={slot.name} value={slot.name} className={accordionItemClass}>
                    <AccordionTrigger className="text-md font-medium px-3 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <span>{slot.name} Medications</span>
                        {medicationsInSlot.length > 0 && (
                           <Pill className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      {medicationsInSlot.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No medications scheduled for {slot.name.toLowerCase()} this day.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {medicationsInSlot.map((reminder) => {
                            const medication = MOCK_MEDICATIONS.find(
                              (m) => m.id === reminder.medicationId
                            );
                            const isTaken = medicationStatus[reminder.id] === "taken";
                            return (
                              <div
                                key={reminder.id}
                                className="flex items-center justify-between p-2.5 rounded-md bg-background shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  {medication?.imageUrl && (
                                    <Image
                                      src={medication.imageUrl}
                                      alt={medication.name}
                                      width={36}
                                      height={36}
                                      className="rounded-md object-cover"
                                      data-ai-hint={medication.dataAiHint || "pill"}
                                    />
                                  )}
                                  <div>
                                    <span className="font-medium text-sm text-foreground">
                                      {medication?.name || reminder.medicationName}
                                    </span>
                                    <span className="text-xs text-foreground ml-1">
                                      ({medication?.dosage})
                                    </span>
                                  </div>
                                </div>
                                {/* Individual check removed for simplicity, manage via "Mark All" */}
                              </div>
                            );
                          })}
                           <Button
                            variant={allMedsTaken ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "w-full mt-2",
                                allMedsTaken ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                                {"opacity-50 cursor-not-allowed": noMedsInSlot && !allMedsTaken} // Keep disabled logic if no meds but not all taken (edge case)
                            )}
                            onClick={() => handleMarkSectionAsTaken(slot.name)}
                            disabled={noMedsInSlot && !allMedsTaken} // Disable if no meds AND not all are already marked taken
                            >
                            {allMedsTaken ? (
                                <>
                                <Check className="w-4 h-4 mr-2" />
                                All {slot.name} Taken
                                </>
                            ) : (
                                `Mark All ${slot.name} as Taken`
                            )}
                            </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <div className="pt-2">
              <h3 className="text-md font-medium mb-2 text-foreground">How are you feeling?</h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3">
                {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedMood === value ? "default" : "outline"}
                    onClick={() => handleMoodSelect(value)}
                    className={cn(
                        "flex-1 min-w-[70px] py-2 h-auto flex-col gap-1 transition-all",
                        selectedMood === value ? 
                        'bg-accent text-accent-foreground hover:bg-accent/90' : 
                        'text-foreground border-input hover:bg-muted'
                    )}
                  >
                    <Icon className={cn("w-6 h-6 mb-0.5", selectedMood === value ? 'text-accent-foreground' : 'text-foreground')} />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Any notes about your day or mood? (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveCurrentState} // Save notes if user clicks away
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

