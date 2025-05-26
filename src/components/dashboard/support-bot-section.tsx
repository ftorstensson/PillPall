
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { pillWiseAssistant, PillWiseAssistantInput } from "@/ai/flows/pillwise-assistant";

export function SupportBotSection() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitQuery = async () => {
    if (!input.trim()) {
      toast({ title: "Input Required", description: "Please type your question for Phil.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResponse("");
    try {
      const aiInput: PillWiseAssistantInput = {
        medicationName: "General Health", 
        question: input,
      };
      const result = await pillWiseAssistant(aiInput);
      setResponse(result.answer);
      toast({ title: "Phil Responded" });
    } catch (error) {
      console.error("Error with Phil:", error);
      toast({ title: "Error", description: "Could not get a response from Phil.", variant: "destructive" });
      setResponse("Sorry, I couldn't process that right now.");
    } finally {
      setIsLoading(false);
      setInput(""); 
    }
  };

  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
        <Bot className="w-6 h-6 text-primary" />
        Phil
      </h2>
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Ask Phil anything about your medications or health..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="border-border focus:ring-primary bg-yellow-100 pr-24" // Added pr-24 for button space
          />
          <Button 
            onClick={handleSubmitQuery} 
            disabled={isLoading} 
            size="sm"
            className="absolute bottom-2 right-2 bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? "Thinking..." : "Ask Phil"}
          </Button>
        </div>
        {response && (
          <div className="p-3 mt-4 border rounded-md bg-yellow-100 text-foreground">
            <h4 className="font-semibold text-sm mb-1">Phil says:</h4>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
