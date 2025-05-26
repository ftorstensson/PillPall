
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Keep Card for structure if desired, or remove
import { Bot, Send } from "lucide-react";
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
        medicationName: "General Health", // This can be made dynamic if needed
        question: input,
      };
      const result = await pillWiseAssistant(aiInput);
      setResponse(result.answer);
    } catch (error) {
      console.error("Error with Phil:", error);
      toast({ title: "Error", description: "Could not get a response from Phil.", variant: "destructive" });
      setResponse("Sorry, I couldn't process that right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-3">
        <Bot className="w-6 h-6 text-primary" />
        Phil
      </h2>
      <div className="space-y-3">
        <Textarea
          placeholder="Type your question for Phil..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="border-border focus:ring-primary bg-yellow-100 resize-none"
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
        {response && (
          <div className="p-3 border rounded-md bg-yellow-100 text-foreground mt-3 max-h-60 overflow-y-auto">
            <h4 className="font-semibold text-sm mb-1">Phil says:</h4>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
