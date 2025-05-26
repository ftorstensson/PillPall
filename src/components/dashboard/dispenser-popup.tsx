
"use client";

import { useState, useEffect } from "react";
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
import { CheckCircle, XCircle, Smile, MessageCircle, Save } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MedicationToTake extends Reminder {
    medicationDetails?: Medication;
    status?: 'taken' | 'skipped';
}

export function DispenserPopup({ isOpen, onOpenChange }: DispenserPopupProps) {
  const [currentDate, setCurrentDate] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [medicationsForToday, setMedicationsForToday] = useState<MedicationToTake[]>([]);


  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(new Intl.DateTimeFormat('en-US', options).format(date));

    // Filter reminders for today and find corresponding medication details
    const todayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const todaysReminders = MOCK_REMINDERS.filter(r => 
        r.isEnabled && (r.days.includes("Daily") || r.days.includes(todayStr))
    ).map(reminder => {
        const medDetails = MOCK_MEDICATIONS.find(m => m.id === reminder.medicationId);
        return { ...reminder, medicationDetails: medDetails };
    }).sort((a, b) => a.time.localeCompare(b.time));
    setMedicationsForToday(todaysReminders);

  }, [isOpen]); // Re-calculate when popup opens

  const handleMedicationStatus = (id: string, status: 'taken' | 'skipped') => {
    setMedicationsForToday(prevMeds => prevMeds.map(med => med.id === id ? {...med, status} : med));
  };

  const handleSaveStatus = () => {
    // In a real app, save medication status and mood entry to backend
    console.log("Medication Statuses:", medicationsForToday.map(m => ({id: m.id, name: m.medicationName, status: m.status})));
    if (selectedMood) {
      const newMoodEntry: MoodEntry = {
        id: String(Date.now()),
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        notes: notes,
      };
      console.log("Mood Entry:", newMoodEntry);
      // MOCK_MOOD_ENTRIES.push(newMoodEntry); // Mock save if needed
    }
    toast({ title: "Status Saved", description: "Your medication and mood status has been recorded." });
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{currentDate}</DialogTitle>
          <DialogDescription>
            Manage your medications and track how you&apos;re feeling.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-1">
          <section>
            <h3 className="text-md font-semibold mb-3 text-foreground">Your Medications</h3>
            {medicationsForToday.length > 0 ? (
              <div className="flex flex-col space-y-3">
                {medicationsForToday.map((med) => (
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
              <p className="text-sm text-muted-foreground">No medications scheduled for today.</p>
            )}
          </section>

          <section>
            <h3 className="text-md font-semibold mb-3 text-foreground">How Are You Feeling Today?</h3>
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
              placeholder="Had a good day overall... (Optional notes)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </section>
        </div>

        <DialogFooter className="sm:justify-between">
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
