"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { OverviewCard } from "@/components/dashboard/overview-card";
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders";
import { MoodLogger } from "@/components/dashboard/mood-logger";
import { MOCK_MEDICATIONS, MOCK_REMINDERS, MOCK_MOOD_ENTRIES } from "@/lib/constants";
import { Pill, Bell, Smile, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";
import { generateMedicationSummary, MedicationSummaryInput } from "@/ai/flows/medication-summary";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const medicationsCount = MOCK_MEDICATIONS.length;
  const activeRemindersCount = MOCK_REMINDERS.filter(r => r.isEnabled).length;
  
  const today = new Date().toISOString().split('T')[0];
  const moodToday = MOCK_MOOD_ENTRIES.find(entry => entry.date === today)?.mood || "Not logged";

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setGeneratedSummary("");
    try {
      const medicationList = MOCK_MEDICATIONS.map(m => m.name).join(', ');
      const dosageDetails = MOCK_MEDICATIONS.map(m => `${m.name}: ${m.dosage}`).join('; ');
      const schedule = MOCK_MEDICATIONS.map(m => `${m.name}: ${m.schedule}`).join('; ');
      const moodDiary = MOCK_MOOD_ENTRIES.slice(-7).map(e => `${e.date}: ${e.mood} - ${e.notes || 'No notes'}`).join('\n');

      const input: MedicationSummaryInput = {
        medicationList,
        dosageDetails,
        schedule,
        moodDiary,
        additionalContext: additionalContext || undefined,
      };
      const result = await generateMedicationSummary(input);
      setGeneratedSummary(result.summary);
      toast({ title: "Summary Generated", description: "Medication summary is ready." });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
      setGeneratedSummary("Could not generate summary at this time.");
    } finally {
      setIsGenerating(false);
    }
  };


  const headerActions = (
    <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Share2 className="w-4 h-4 mr-2" />
          Share with Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Medication Summary</DialogTitle>
          <DialogDescription>
            Generate a summary of your medications and mood to share with your doctor.
          </DialogDescription>
        </DialogHeader>
        {generatedSummary ? (
          <div className="p-4 my-4 border rounded-md bg-muted max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-2">Your Summary:</h3>
            <pre className="whitespace-pre-wrap text-sm">{generatedSummary}</pre>
          </div>
        ) : (
          <Textarea
            placeholder="Add any additional context or specific questions for your doctor..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="my-4"
          />
        )}
        <DialogFooter className="sm:justify-start">
           {generatedSummary ? (
            <Button type="button" variant="outline" onClick={() => { setGeneratedSummary(""); setAdditionalContext(""); }}>
              Generate New
            </Button>
          ) : (
            <Button type="button" onClick={handleGenerateSummary} disabled={isGenerating} className="bg-primary text-primary-foreground">
              {isGenerating ? "Generating..." : "Generate Summary"}
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => setSummaryDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout pageTitle="Dashboard" headerActions={headerActions}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCard title="Medications" value={String(medicationsCount)} icon={Pill} description="Total tracked medications" />
        <OverviewCard title="Active Reminders" value={String(activeRemindersCount)} icon={Bell} description="Enabled reminders" />
        <OverviewCard title="Mood Today" value={moodToday.charAt(0).toUpperCase() + moodToday.slice(1)} icon={Smile} description="Last logged mood" />
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        <UpcomingReminders />
        <MoodLogger />
      </div>
    </MainLayout>
  );
}