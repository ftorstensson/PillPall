
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_OPTIONS, MOCK_MEDICATIONS, MOCK_REMINDERS } from "@/lib/constants";
import type { Mood, MoodEntry, Medication, Reminder } from "@/lib/types";
import { CheckCircle, Smile, Save } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetDate?: Date;
  triggerPhilMessage: (eventType: string, eventContext?: string) => Promise<void>;
}

interface MedicationToTake extends Reminder {
    medicationDetails?: Medication;
    status?: 'taken' | 'skipped';
}

const getTimeCategory = (time: string): 'morning' | 'lunch' | 'dinner' | 'night' => {
  const [hourStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  if (hour >= 5 && hour < 12) return 'morning'; // 5:00 AM - 11:59 AM
  if (hour >= 12 && hour < 17) return 'lunch';  // 12:00 PM - 4:59 PM
  if (hour >= 17 && hour < 21) return 'dinner'; // 5:00 PM - 8:59 PM
  return 'night'; // 9:00 PM - 4:59 AM
};

export function DispenserPopup({ isOpen, onOpenChange, targetDate, triggerPhilMessage }: DispenserPopupProps) {
  const [currentDisplayDate, setCurrentDisplayDate] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [medicationsForDay, setMedicationsForDay] = useState<MedicationToTake[]>([]);
  
  const defaultOpenAccordionItems = ['morning', 'lunch', 'dinner', 'night'];

  useEffect(() => {
    if (isOpen) {
      const dateToUse = targetDate || new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setCurrentDisplayDate(new Intl.DateTimeFormat('en-US', options).format(dateToUse));

      const dayStr = dateToUse.toLocaleDateString('en-US', { weekday: 'short' });
      const remindersForDate = MOCK_REMINDERS.filter(r =>
          r.isEnabled && (r.days.includes("Daily") || r.days.includes(dayStr))
      ).map(reminder => {
          const medDetails = MOCK_MEDICATIONS.find(m => m.id === reminder.medicationId);
          return { ...reminder, medicationDetails: medDetails, status: undefined };
      }).sort((a, b) => {
        const timeA = parseInt(a.time.replace(':', ''), 10);
        const timeB = parseInt(b.time.replace(':', ''), 10);
        return timeA - timeB;
      });
      
      setMedicationsForDay(remindersForDate);
      setSelectedMood(null);
      setNotes("");
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
    const medIdsInSection = medsInSection.map(med => med.id);

    setMedicationsForDay(prevMeds =>
        prevMeds.map(med =>
            // Mark as taken if it's in the section, and not already skipped (optional: or allow overriding skipped)
            medIdsInSection.includes(med.id) ? { ...med, status: 'taken' } : med
        )
    );
  };

  const handleSaveStatus = async () => {
    const dateForEntry = (targetDate || new Date()).toISOString().split('T')[0];
    console.log("Medication Statuses for", dateForEntry, ":", medicationsForDay.map(m => ({id: m.id, name: m.medicationName, status: m.status})));
    if (selectedMood) {
      const newMoodEntry: MoodEntry = {
        id: String(Date.now()),
        date: dateForEntry,
        mood: selectedMood,
        notes: notes,
      };
      console.log("Mood Entry for", dateForEntry, ":", newMoodEntry);
    }
    toast({ title: "Status Saved", description: "Your medication and mood status has been recorded." });
    try {
      await triggerPhilMessage("STATUS_SAVED_POPUP");
    } catch (error) {
      console.error("Failed to trigger Phil's message from popup:", error);
    }
    onOpenChange(false);
  };
  
  const medicationSection = (title: string, meds: MedicationToTake[], sectionKey: 'morning' | 'lunch' | 'dinner' | 'night') => {
    const allTakenInSection = meds.length > 0 && meds.every(med => med.status === 'taken');
    const anySkippedInSection = meds.some(med => med.status === 'skipped'); // To potentially disable "Mark All Taken" if needed

    return (
        <AccordionItem value={sectionKey} className="border-b-0 bg-primary/10 border border-primary/20 rounded-lg mb-3 p-1">
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
                            <li key={med.id} className={`flex items-center gap-3 p-2 rounded-md ${med.status === 'taken' ? 'bg-green-500/20' : med.status === 'skipped' ? 'bg-red-500/20 line-through' : 'bg-background/50'}`}>
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
                                    <p className="font-medium text-sm">{med.medicationDetails?.name || med.medicationName}</p>
                                    <p className="text-xs text-muted-foreground">{med.medicationDetails?.dosage} - {med.time}</p>
                                </div>
                                {med.status === 'taken' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </li>
                            ))}
                        </ul>
                        <Button
                            variant={allTakenInSection ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleMarkSectionAsTaken(sectionKey)}
                            className={`w-full ${allTakenInSection ? "border-green-600 text-green-600 hover:bg-green-500/10" : "bg-green-600 hover:bg-green-700 text-white"}`}
                            disabled={allTakenInSection || anySkippedInSection} // Optionally disable if any are skipped and you don't want to override
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> 
                            {allTakenInSection ? "All Taken" : `Mark All ${title} as Taken`}
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
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{currentDisplayDate}</DialogTitle>
          <DialogDescription>
            Manage your medications and track how you&apos;re feeling.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <section>
            <h3 className="text-md font-semibold mb-2 text-foreground">Your Medications Today</h3>
            <Accordion type="multiple" className="w-full space-y-1" defaultValue={defaultOpenAccordionItems}>
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
                  variant={selectedMood === value ? "default" : "outline"}
                  onClick={() => setSelectedMood(value)}
                  className={`flex-1 min-w-[70px] sm:min-w-[80px] py-2 h-auto flex-col gap-1 ${selectedMood === value ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 ${selectedMood === value ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Any notes about your mood or day? (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </section>
        </div>

        <DialogFooter className="sm:justify-between pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveStatus} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
