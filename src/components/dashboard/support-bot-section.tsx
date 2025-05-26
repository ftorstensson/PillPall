
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Assuming a general question, not tied to a specific medication for this general support bot
      // You might want a different flow or adapt pillWiseAssistant if it needs medicationName
      const aiInput: PillWiseAssistantInput = {
        medicationName: "General Health", // Placeholder or make optional in flow
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
      setInput(""); // Clear input after submission
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Phil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Ask Phil anything about your medications or health..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
        />
        <Button onClick={handleSubmitQuery} disabled={isLoading} className="w-full bg-primary text-primary-foreground">
          {isLoading ? "Thinking..." : "Ask Phil"}
        </Button>
        {response && (
          <div className="p-3 mt-4 border rounded-md bg-yellow-100">
            <h4 className="font-semibold text-sm mb-1">Phil says:</h4>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
