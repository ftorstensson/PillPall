
"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { XIcon, Send, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { medicationScheduler } from "@/ai/flows/medication-scheduler-flow"; // New flow

interface DispenserPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // targetDate and triggerPhilMessage are no longer needed for this version
}

interface ChatMessage {
  id: string;
  sender: "user" | "phil";
  text: string;
}

export function DispenserPopup({ isOpen, onOpenChange }: DispenserPopupProps) {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize with Phil's greeting when popup opens
      setChatMessages([
        {
          id: String(Date.now()),
          sender: "phil",
          text: "Hello! I'm Phil. Let's set up your weekly medication schedule. Tell me what medications you take, the dosage, what time, and on which days. For example: 'Lisinopril 10mg every morning at 8 AM.'",
        },
      ]);
      setUserInput("");
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: userInput.trim(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await medicationScheduler({ userInput: newUserMessage.text });
      const philResponseMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "phil",
        text: response.philResponse,
      };
      setChatMessages((prevMessages) => [...prevMessages, philResponseMessage]);
    } catch (error) {
      console.error("Error getting response from Phil:", error);
      const errorResponseMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "phil",
        text: "Sorry, I had a little trouble understanding that. Could you try rephrasing?",
      };
      setChatMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogClose asChild>
          <Button variant="ghost" className="absolute right-4 top-4 h-auto p-1 text-sm text-muted-foreground hover:text-foreground">
            Save & Close
            <XIcon className="w-4 h-4 ml-1" />
          </Button>
        </DialogClose>
        <DialogHeader className="pr-16">
          <DialogTitle className="text-lg font-semibold">Set Up Your Medication Schedule with Phil</DialogTitle>
          <DialogDescription>
            Phil will help you define your weekly medication routine. Changes will be reflected in your schedule.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-grow p-1 -mx-1 mb-4 border-y">
          <div className="space-y-4 p-3">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg max-w-[85%]",
                  message.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.sender === "phil" && <Bot className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted max-w-[85%]">
                <Bot className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm italic">Phil is thinking...</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-auto flex gap-2 items-center">
          <Textarea
            placeholder="Type your schedule details here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            className="flex-grow resize-none"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
