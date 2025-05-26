"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_OPTIONS, MOCK_MOOD_ENTRIES } from "@/lib/constants";
import type { Mood, MoodEntry } from "@/lib/types";
import { Smile, MessageCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoggedToday, setIsLoggedToday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = MOCK_MOOD_ENTRIES.find(entry => entry.date === today);
    if (todaysEntry) {
      setSelectedMood(todaysEntry.mood);
      setNotes(todaysEntry.notes || "");
      setIsLoggedToday(true);
    }
  }, []);

  const handleSubmitMood = () => {
    if (!selectedMood) {
      toast({
        title: "Select a Mood",
        description: "Please select how you're feeling today.",
        variant: "destructive",
      });
      return;
    }
    // In a real app, this would save to a backend
    const newEntry: MoodEntry = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      notes: notes,
    };
    MOCK_MOOD_ENTRIES.push(newEntry); // Mock save
    setIsLoggedToday(true);
    toast({
      title: "Mood Logged!",
      description: `Your mood (${selectedMood}) has been saved.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-primary" />
          How are you feeling today?
        </CardTitle>
        {isLoggedToday && <CardDescription>You've already logged your mood for today. You can update it if you like.</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={selectedMood === value ? "default" : "outline"}
              onClick={() => setSelectedMood(value)}
              className={`flex-1 min-w-[80px] sm:min-w-[100px] py-3 h-auto flex-col gap-1 ${selectedMood === value ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
            >
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mb-1 ${selectedMood === value ? 'text-primary-foreground' : 'text-primary'}`} />
              <span className="text-xs sm:text-sm">{label}</span>
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="Any notes about your mood or day? (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        <Button onClick={handleSubmitMood} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="w-4 h-4 mr-2" />
          {isLoggedToday ? "Update Mood" : "Log Mood"}
        </Button>
      </CardContent>
    </Card>
  );
}