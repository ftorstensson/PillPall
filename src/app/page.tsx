
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Pill, RotateCcw } from "lucide-react"; // Changed Share2 to RotateCcw for ReFillPal
import { DispenserPopup } from "@/components/dashboard/dispenser-popup";
import { SupportBotSection } from "@/components/dashboard/support-bot-section";
import { WeeklyCalendarView } from "@/components/dashboard/weekly-calendar-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [dispenserPopupOpen, setDispenserPopupOpen] = useState(false);
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState("PillPal"); // Default title
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    setCurrentDate(formattedDate);
    // Update page title dynamically if needed, or keep static as "PillPal"
    // setPageTitle(`PillPal - ${formattedDate}`);
  }, []);


  const headerActions = (
    <Button
      variant="outline"
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={() => setDispenserPopupOpen(true)}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      ReFillPal
    </Button>
  );

  return (
    <MainLayout pageTitle={pageTitle} headerActions={headerActions} showDate={true}>
      <DispenserPopup isOpen={dispenserPopupOpen} onOpenChange={setDispenserPopupOpen} />
      
      <div className="max-w-2xl mx-auto space-y-6">
        <SupportBotSection />
        <WeeklyCalendarView />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="mood">
            <AccordionTrigger className="text-lg font-semibold">Mood</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Track and view your mood patterns over time. Your logged moods will appear here.
                    {/* Placeholder for mood chart or summary */}
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="streak">
            <AccordionTrigger className="text-lg font-semibold">Streak</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Maintain your medication adherence streak! Your progress will be shown here.
                    {/* Placeholder for streak information */}
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </MainLayout>
  );
}
