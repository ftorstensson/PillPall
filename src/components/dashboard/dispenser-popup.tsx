
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_OPTIONS, MOCK_MEDICATIONS, MOCK_REMINDERS } from "@/lib/constants";
import type { Mood, MoodEntry, Medication, Reminder } from "@/lib/types";
import { CheckCircle, XCircle, Smile, MessageCircle, Save, ChevronDown, ChevronUp } from "lucide-react";
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    morning: true,
    lunch: true,
    dinner: true,
    night: true,
  });

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
      // Reset open sections, or determine dynamically based on content
      setOpenSections({ morning: true, lunch: true, dinner: true, night: true });
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

  const handleMedicationStatus = (id: string, status: 'taken' | 'skipped') => {
    setMedicationsForDay(prevMeds => prevMeds.map(med => med.id === id ? {...med, status} : med));
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

  const toggleSection = (section: 'morning' | 'lunch' | 'dinner' | 'night') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const medicationSection = (title: string, meds: MedicationToTake[], sectionKey: 'morning' | 'lunch' | 'dinner' | 'night') => {
    if (meds.length === 0 && !['morning', 'lunch', 'dinner', 'night'].includes(sectionKey)) { // Only hide if not a time-based section
        return null;
    }

    return (
        <AccordionItem value={sectionKey} className="border-b-0">
             <AccordionTrigger 
                onClick={(e) => { e.preventDefault(); toggleSection(sectionKey);}} 
                className="text-md font-semibold text-foreground hover:no-underline py-3 px-1"
            >
                <div className="flex justify-between items-center w-full">
                    <span>{title} ({meds.length})</span>
                    {openSections[sectionKey] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </AccordionTrigger>
            {openSections[sectionKey] && (
                <AccordionContent className="pt-0 pb-2 px-1">
                     {meds.length > 0 ? (
                        <div className="flex flex-col space-y-3 pt-2">
                            {meds.map((med) => (
                            <Card key={med.id} className={`p-3 border rounded-lg ${med.status === 'taken' ? 'border-green-500 bg-green-500/10' : med.status === 'skipped' ? 'border-red-500 bg-red-500/10' : 'bg-card'}`}>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {med.medicationDetails?.imageUrl && (
                                    <Image
                                        src={med.medicationDetails.imageUrl}
                                        alt={med.medicationDetails.name}
                                        width={40}
                                        height={40}
                                        className="rounded-md object-cover"
                                        data-ai-hint={med.medicationDetails.dataAiHint || "pill"}
                                    />
                                    )}
                                    <div>
                                    <p className="font-medium">{med.medicationDetails?.name || med.medicationName}</p>
                                    <p className="text-sm text-muted-foreground">{med.medicationDetails?.dosage} - {med.time}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                    variant={med.status === 'taken' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleMedicationStatus(med.id, 'taken')}
                                    className={med.status === 'taken' ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                    disabled={med.status === 'skipped'}
                                    >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Taken
                                    </Button>
                                    <Button
                                    variant={med.status === 'skipped' ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => handleMedicationStatus(med.id, 'skipped')}
                                    disabled={med.status === 'taken'}
                                    >
                                    <XCircle className="w-4 h-4 mr-1" /> Skip
                                    </Button>
                                </div>
                                </div>
                            </Card>
                            ))}
                        </div>
                     ) : (
                         <p className="text-sm text-muted-foreground pt-2">No medications scheduled for {sectionKey}.</p>
                     )}
                </AccordionContent>
            )}
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
            <h3 className="text-md font-semibold mb-1 text-foreground">Your Medications Today</h3>
            <Accordion type="multiple" className="w-full space-y-1" defaultValue={Object.keys(openSections).filter(key => openSections[key as keyof typeof openSections])}>
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
