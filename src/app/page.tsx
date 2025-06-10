
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react"; 
import { DispenserPopup } from "@/components/dashboard/dispenser-popup";
import { ScheduleChatPopup } from "@/components/dashboard/schedule-chat-popup"; // Renamed import
import { SupportBotSection } from "@/components/dashboard/support-bot-section";
import { WeeklyCalendarView } from "@/components/dashboard/weekly-calendar-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { philMotivator, PhilMotivatorInput } from "@/ai/flows/phil-motivator";

export default function HomePage() {
  const [dailyDispenserOpen, setDailyDispenserOpen] = useState(false);
  const [selectedDateForDispenser, setSelectedDateForDispenser] = useState<Date | null>(null);
  const [scheduleChatOpen, setScheduleChatOpen] = useState(false);

  const { toast } = useToast();
  const pageTitle = "PillPal"; 
  
  const [philMessage, setPhilMessage] = useState<string>("Thinking...");
  const [philEmoji, setPhilEmoji] = useState<string>("⏳");
  const [isPhilLoading, setIsPhilLoading] = useState(true);

  const triggerPhilMessage = useCallback(async (eventType: string, eventContext?: string) => {
    setIsPhilLoading(true);
    try {
      const input: PhilMotivatorInput = { eventType, eventContext };
      const result = await philMotivator(input);
      setPhilMessage(result.message);
      setPhilEmoji(result.emoji);
    } catch (error) {
      console.error("Error with Phil's motivation:", error);
      setPhilMessage("Had a little hiccup, but I'm still here for you!");
      setPhilEmoji("😅");
    } finally {
      setIsPhilLoading(false);
    }
  }, []);

  useEffect(() => {
    triggerPhilMessage("PAGE_LOAD");
  }, [triggerPhilMessage]);

  const handleOpenReFillPalChat = () => {
    setScheduleChatOpen(true);
  };

  const handleCalendarDayClick = (dayIndex: number) => { 
    const today = new Date();
    const currentDayOfWeekJS = today.getDay(); 
    const todayDayOfWeekMon0 = (currentDayOfWeekJS === 0) ? 6 : currentDayOfWeekJS - 1;
    const dayDifference = dayIndex - todayDayOfWeekMon0;
    const calculatedDate = new Date(today);
    calculatedDate.setDate(today.getDate() + dayDifference);
    
    setSelectedDateForDispenser(calculatedDate);
    setDailyDispenserOpen(true);
  };
  
  const handleHeaderReFillPalClick = () => {
    setScheduleChatOpen(true); // Open schedule setup chat
  };


  const headerActions = (
    <Button
      variant="outline"
      className="border-black text-black bg-white hover:bg-gray-100 hover:text-black focus:ring-black"
      onClick={handleHeaderReFillPalClick}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      ReFillPal
    </Button>
  );

  return (
    <MainLayout pageTitle={pageTitle} headerActions={headerActions} showDate={true}>
      <DispenserPopup 
        isOpen={dailyDispenserOpen} 
        onOpenChange={setDailyDispenserOpen}
        targetDate={selectedDateForDispenser}
        triggerPhilMessage={triggerPhilMessage}
      />
      <ScheduleChatPopup
        isOpen={scheduleChatOpen}
        onOpenChange={setScheduleChatOpen}
      />
      
      <div className="max-w-lg mx-auto space-y-6">
        <SupportBotSection 
          philMessage={isPhilLoading ? "Phil is thinking..." : philMessage} 
          philEmoji={isPhilLoading ? "⏳" : philEmoji} 
        />
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
