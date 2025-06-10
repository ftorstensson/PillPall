
"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, XIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { medicationScheduler, MedicationSchedulerInput } from "@/ai/flows/medication-scheduler-flow";

interface ScheduleChatPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "phil";
  text: string;
}

export function ScheduleChatPopup({ isOpen, onOpenChange }: ScheduleChatPopupProps) {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialInstructions = "Hi! I'm Phil. Let's set up your weekly medication schedule. Tell me about the medications you take: their names, dosages, what time you take them, and on which days. For example, you can say: 'Lisinopril 10mg every morning at 8 AM' or 'Metformin 500mg twice a day with meals on weekdays.'";

  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([
        { id: "phil-intro", sender: "phil", text: initialInstructions },
      ]);
    }
    // Do not clear chat history on close, so user can resume
  }, [isOpen, chatMessages.length]); // Added chatMessages.length to re-trigger intro if cleared elsewhere

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: userInput.trim(),
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    const currentInput = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    try {
      const input: MedicationSchedulerInput = { userInput: currentInput };
      const response = await medicationScheduler(input);
      const philResponseMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "phil",
        text: response.philResponse,
      };
      setChatMessages((prev) => [...prev, philResponseMessage]);
    } catch (error) {
      console.error("Error calling medicationScheduler flow:", error);
      const errorResponseMessage: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "phil",
        text: "Sorry, I had a little trouble understanding that. Could you try rephrasing?",
      };
      setChatMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
           <div className="flex justify-between items-center">
            <div>
                <DialogTitle className="text-lg font-semibold">
                Set Up Your Schedule with Phil
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                Phil will help you input your weekly medications.
                </DialogDescription>
            </div>
            <DialogClose asChild>
                <Button variant="ghost" className="h-auto p-1 text-sm text-muted-foreground hover:text-foreground">
                Close
                <XIcon className="w-4 h-4 ml-1" />
                </Button>
            </DialogClose>
           </div>
        </DialogHeader>

        <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg max-w-[85%]",
                  msg.sender === "phil"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground self-end ml-auto"
                )}
              >
                {msg.sender === "phil" ? (
                  <Bot className="w-6 h-6 shrink-0 text-primary mt-1" />
                ) : (
                  <User className="w-6 h-6 shrink-0 text-primary-foreground mt-1" />
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted text-foreground self-start max-w-[85%]">
                <Bot className="w-6 h-6 shrink-0 text-primary mt-1" />
                <p className="text-sm italic flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Phil is thinking...
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSendMessage}
          className="border-t p-4 flex items-center gap-2 bg-background"
        >
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Tell Phil about your medications..."
            rows={1}
            className="flex-grow resize-none min-h-[40px] max-h-[120px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !userInput.trim()} size="icon" className="shrink-0 bg-accent hover:bg-accent/90">
            <Send className="w-5 h-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
