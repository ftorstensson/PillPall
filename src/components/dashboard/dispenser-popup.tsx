
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { MOOD_OPTIONS, MOCK_MEDICATIONS, MOCK_REMINDERS, MOCK_DAILY_MED_STATUSES, MOCK_MOOD_ENTRIES } from "@/lib/constants";
import type { Mood, MoodEntry, Medication, Reminder } from "@/lib/types";
import { CheckCircle, XIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetDate?: Date;
  triggerPhilMessage: (eventType: string, eventContext?: string) => Promise<void>;
}

interface MedicationToTake extends Reminder {
    medicationDetails?: Medication;
    status?: 'taken' | undefined; // 'skipped' status removed as per prior simplification
}

const getTimeCategory = (time: string): 'morning' | 'lunch' | 'dinner' | 'night' => {
  const [hourStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'lunch';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'night';
};

export function DispenserPopup({ isOpen, onOpenChange, targetDate, triggerPhilMessage }: DispenserPopupProps) {
  const [currentDisplayDate, setCurrentDisplayDate] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [medicationsForDay, setMedicationsForDay] = useState<MedicationToTake[]>([]);

  const getDateISO = (date: Date): string => date.toISOString().split('T')[0];

  const saveCurrentState = useCallback(async (currentMeds: MedicationToTake[], currentMood: Mood | null, currentNotes: string) => {
    const dateForEntry = getDateISO(targetDate || new Date());
    
    // Persist medication statuses
    if (!MOCK_DAILY_MED_STATUSES[dateForEntry]) {
      MOCK_DAILY_MED_STATUSES[dateForEntry] = {};
    }
    currentMeds.forEach(med => {
      MOCK_DAILY_MED_STATUSES[dateForEntry][med.id] = med.status;
    });
    console.log("Medication Statuses for", dateForEntry, ":", MOCK_DAILY_MED_STATUSES[dateForEntry]);

    // Log mood entry whether it's null or a Mood value
    const newMoodEntry: MoodEntry | { date: string, mood: null, notes: string } = {
      id: String(Date.now()), // Mock ID
      date: dateForEntry,
      mood: currentMood, 
      notes: currentNotes,
    };
    console.log("Mood Entry for", dateForEntry, ":", newMoodEntry);
    // In a real app, you'd persist newMoodEntry
    // And MOCK_MOOD_ENTRIES would also be updated or use a persistent source
    const existingMoodIndex = MOCK_MOOD_ENTRIES.findIndex(e => e.date === dateForEntry);
    if (existingMoodIndex > -1) {
        if (currentMood === null && currentNotes === "") { // If mood is deselected and notes are empty, remove entry
            MOCK_MOOD_ENTRIES.splice(existingMoodIndex, 1);
        } else {
            MOCK_MOOD_ENTRIES[existingMoodIndex] = { ...MOCK_MOOD_ENTRIES[existingMoodIndex], mood: currentMood!, notes: currentNotes };
        }
    } else if (currentMood !== null || currentNotes !== "") { // Only add if there's a mood or notes
        MOCK_MOOD_ENTRIES.push(newMoodEntry as MoodEntry);
    }
    
    toast({ title: "Status Updated", description: "Your changes have been automatically updated." });
    try {
      await triggerPhilMessage("STATUS_SAVED_POPUP", `Updated log for ${currentDisplayDate}`);
    } catch (error) {
      console.error("Failed to trigger Phil's message from popup:", error);
    }
  }, [targetDate, triggerPhilMessage, currentDisplayDate, toast]);


  useEffect(() => {
    if (isOpen) {
      const dateToUse = targetDate || new Date();
      const dateISO = getDateISO(dateToUse);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateToUse);
      setCurrentDisplayDate(formattedDate);

      const dayStr = dateToUse.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Load persisted statuses for the day
      const dailyStatuses = MOCK_DAILY_MED_STATUSES[dateISO] || {};

      const remindersForDate = MOCK_REMINDERS.filter(r =>
          r.isEnabled && (r.days.includes("Daily") || r.days.includes(dayStr))
      ).map(reminder => {
          const medDetails = MOCK_MEDICATIONS.find(m => m.id === reminder.medicationId);
          return { 
            ...reminder, 
            medicationDetails: medDetails, 
            status: dailyStatuses[reminder.id] // Apply persisted status
          };
      }).sort((a, b) => {
        const timeA = parseInt(a.time.replace(':', ''), 10);
        const timeB = parseInt(b.time.replace(':', ''), 10);
        return timeA - timeB;
      });

      setMedicationsForDay(remindersForDate);

      // Load persisted mood and notes
      const todaysMoodEntry = MOCK_MOOD_ENTRIES.find(entry => entry.date === dateISO);
      setSelectedMood(todaysMoodEntry?.mood || null); 
      setNotes(todaysMoodEntry?.notes || ""); 
    }
  }, [isOpen, targetDate]);

  const categorizedMeds = useMemo(() => {
    const morning: MedicationToTake[] = [];
    const lunch: MedicationToTake[] = [];
    const dinner: MedicationToTake[] = [];
    const night: MedicationToTake[] = [];

    medicationsForDay.forEach(med => {
      const category = getTimeCategory(med.time);
      if (category === 'morning') morning.push(med);
      else if (category === 'lunch') lunch.push(med);
      else if (category === 'dinner') dinner.push(med);
      else night.push(med);
    });
    return { morning, lunch, dinner, night };
  }, [medicationsForDay]);

  const handleMarkSectionAsTaken = (sectionKey: 'morning' | 'lunch' | 'dinner' | 'night') => {
    const medsInSection = categorizedMeds[sectionKey];
    if (medsInSection.length === 0) return;

    const medIdsInSection = medsInSection.map(med => med.id);
    const areAllCurrentlyTaken = medsInSection.every(med => med.status === 'taken');
    const newStatus = areAllCurrentlyTaken ? undefined : 'taken';

    const newMeds = medicationsForDay.map(med =>
        medIdsInSection.includes(med.id) ? { ...med, status: newStatus } : med
    );
    setMedicationsForDay(newMeds);
    saveCurrentState(newMeds, selectedMood, notes);
  };

  const handleMoodSelect = (moodValue: Mood) => {
    const newSelectedMood = selectedMood === moodValue ? null : moodValue;
    setSelectedMood(newSelectedMood);
    saveCurrentState(medicationsForDay, newSelectedMood, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
  };
  
  const handleNotesBlur = () => {
    saveCurrentState(medicationsForDay, selectedMood, notes);
  }


  const medicationSection = (title: string, meds: MedicationToTake[], sectionKey: 'morning' | 'lunch' | 'dinner' | 'night') => {
    const allTakenInSection = meds.length > 0 && meds.every(med => med.status === 'taken');
    const buttonText = allTakenInSection ? `Unmark All ${title}` : `Mark All ${title} as Taken`;
    const accordionBgClass = 
        meds.length === 0 ? "bg-muted border-muted-foreground/20" :
        allTakenInSection ? "bg-green-500/10 border-green-500/30" : "bg-primary/10 border-primary/20";

    return (
        <AccordionItem
            value={sectionKey}
            className={cn("border-b-0 border rounded-lg mb-3 p-1", accordionBgClass)}
        >
             <AccordionTrigger
                className="text-md font-semibold text-foreground hover:no-underline py-3 px-3"
            >
                {title} ({meds.length})
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-3 px-3">
                 {meds.length > 0 ? (
                    <>
                        <ul className="space-y-3 mb-4">
                            {meds.map((med) => (
                            <li key={med.id} className={`flex items-center gap-3 p-2 rounded-md ${med.status === 'taken' ? 'bg-green-500/20' : 'bg-background/50'}`}>
                                {med.medicationDetails?.imageUrl && (
                                <Image
                                    src={med.medicationDetails.imageUrl}
                                    alt={med.medicationDetails.name}
                                    width={32}
                                    height={32}
                                    className="rounded-md object-cover"
                                    data-ai-hint={med.medicationDetails.dataAiHint || "pill"}
                                />
                                )}
                                <div className="flex-grow">
                                    <p className="font-medium text-sm text-foreground">
                                        {med.medicationDetails?.name || med.medicationName}
                                        {med.medicationDetails?.dosage && <span className="font-normal text-xs text-foreground ml-2">{med.medicationDetails.dosage}</span>}
                                    </p>
                                </div>
                                {med.status === 'taken' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </li>
                            ))}
                        </ul>
                        <Button
                            size="sm"
                            onClick={() => handleMarkSectionAsTaken(sectionKey)}
                            className={cn(
                                "w-full",
                                allTakenInSection
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                            )}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {buttonText}
                        </Button>
                    </>
                 ) : (
                     <p className="text-sm text-muted-foreground pt-2">No medications scheduled for {sectionKey.toLowerCase()}.</p>
                 )}
            </AccordionContent>
        </AccordionItem>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4 h-auto p-1 text-sm text-muted-foreground hover:text-foreground">
            Save & Close 
            <XIcon className="w-4 h-4 ml-1" />
          </Button>
        </DialogClose>
        <DialogHeader className="pr-16">
          <DialogTitle className="text-lg font-semibold">{currentDisplayDate}</DialogTitle>
          <DialogDescription>
            Manage your medications and track how you&apos;re feeling. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <section>
            <h3 className="text-md font-semibold mb-2 text-foreground">Your Medications Today</h3>
            <Accordion type="multiple" className="w-full space-y-1">
                {medicationSection("Morning", categorizedMeds.morning, 'morning')}
                {medicationSection("Lunch", categorizedMeds.lunch, 'lunch')}
                {medicationSection("Dinner", categorizedMeds.dinner, 'dinner')}
                {medicationSection("Night", categorizedMeds.night, 'night')}
            </Accordion>
            {medicationsForDay.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No medications scheduled for this day.</p>
            )}
          </section>

          <section className="pt-2">
            <h3 className="text-md font-semibold mb-3 text-foreground">How Are You Feeling?</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-3">
              {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  onClick={() => handleMoodSelect(value)}
                  className={cn(
                    'flex-1 min-w-[70px] sm:min-w-[80px] py-2 h-auto flex-col gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md', 
                    selectedMood === value
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 mb-0.5',
                      selectedMood === value ? 'text-accent-foreground' : 'text-foreground'
                    )}
                  />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Any notes about your mood or day? (Optional)"
              value={notes}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              rows={3}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
