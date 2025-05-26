
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { pillWiseAssistant, PillWiseAssistantInput } from "@/ai/flows/pillwise-assistant";

export function SupportBotSection() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPhilPopupOpen, setIsPhilPopupOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmitQuery = async () => {
    if (!input.trim()) {
      toast({ title: "Input Required", description: "Please type your question for Phil.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResponse(""); // Clear previous response before new query
    try {
      const aiInput: PillWiseAssistantInput = {
        medicationName: "General Health",
        question: input,
      };
      const result = await pillWiseAssistant(aiInput);
      setResponse(result.answer);
      // toast({ title: "Phil Responded" }); // Toast can be a bit much for chat
    } catch (error) {
      console.error("Error with Phil:", error);
      toast({ title: "Error", description: "Could not get a response from Phil.", variant: "destructive" });
      setResponse("Sorry, I couldn't process that right now.");
    } finally {
      setIsLoading(false);
      // setInput(""); // Optionally clear input after sending, or let user clear
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsPhilPopupOpen(open);
    if (!open) {
      // Reset chat state when dialog closes
      setInput("");
      setResponse("");
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-2">
        <Bot className="w-6 h-6 text-primary" />
        Phil
      </h2>
      <Dialog open={isPhilPopupOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 h-auto text-primary hover:underline">
            Ask Phil a question
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> Ask Phil
            </DialogTitle>
            <DialogDescription>
              Type your question for Phil below. He can help with medication queries and general health information.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] flex flex-col">
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
              {response && (
                <div className="p-3 border rounded-md bg-yellow-100 text-foreground">
                  <h4 className="font-semibold text-sm mb-1">Phil says:</h4>
                  <p className="text-sm whitespace-pre-wrap">{response}</p>
                </div>
              )}
            </div>
            <div className="mt-auto space-y-2">
              <Textarea
                placeholder="Type your question for Phil..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                className="border-border focus:ring-primary bg-yellow-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSubmitQuery();
                  }
                }}
              />
              <Button
                onClick={handleSubmitQuery}
                disabled={isLoading || !input.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Phil is thinking..." : "Send to Phil"}
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
