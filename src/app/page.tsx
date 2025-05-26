
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Pill, RotateCcw } from "lucide-react"; 
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
  const [selectedDateForPopup, setSelectedDateForPopup] = useState<Date | null>(null);
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState("PillPal"); 
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    setCurrentDate(formattedDate);
  }, []);

  const handleOpenReFillPal = () => {
    setSelectedDateForPopup(new Date()); // Set to today for the generic ReFillPal button
    setDispenserPopupOpen(true);
  };

  const handleCalendarDayClick = (dayIndex: number) => { // dayIndex: 0 for Mon, ..., 6 for Sun
    const today = new Date();
    const currentDayOfWeekJS = today.getDay(); // 0 for Sun, 1 for Mon, ..., 6 for Sat
    
    // Adjust today's day to be Mon=0, ..., Sun=6 to match dayIndex
    const todayDayOfWeekMon0 = (currentDayOfWeekJS === 0) ? 6 : currentDayOfWeekJS - 1;
    
    const dayDifference = dayIndex - todayDayOfWeekMon0;
    
    const calculatedDate = new Date(today);
    calculatedDate.setDate(today.getDate() + dayDifference);
    
    setSelectedDateForPopup(calculatedDate);
    setDispenserPopupOpen(true);
  };

  const headerActions = (
    <Button
      variant="outline"
      className="border-black text-black bg-white hover:bg-gray-100 hover:text-black focus:ring-black"
      onClick={handleOpenReFillPal}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      ReFillPal
    </Button>
  );

  return (
    <MainLayout pageTitle={pageTitle} headerActions={headerActions} showDate={true}>
      <DispenserPopup 
        isOpen={dispenserPopupOpen} 
        onOpenChange={setDispenserPopupOpen} 
        targetDate={selectedDateForPopup || undefined} // Pass the selected date
      />
      
      <div className="max-w-2xl mx-auto space-y-6">
        <SupportBotSection />
        <WeeklyCalendarView onDayClick={handleCalendarDayClick} />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="mood">
            <AccordionTrigger className="text-lg font-semibold">Mood</AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Track and view your mood patterns over time. Your logged moods will appear here.
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
