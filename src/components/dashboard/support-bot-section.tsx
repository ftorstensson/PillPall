
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import type { ReactNode } from "react";

interface SupportBotSectionProps {
  philMessage: string | ReactNode;
  philEmoji: string;
}

export function SupportBotSection({ philMessage, philEmoji }: SupportBotSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-3">
        <Bot className="w-6 h-6 text-primary" />
        Phil
      </h2>
      {philMessage ? (
        <div className="p-4 border rounded-md bg-yellow-100 text-foreground min-h-[60px]">
          <p className="text-sm whitespace-pre-wrap">
            {philMessage} {philEmoji}
          </p>
        </div>
      ) : (
        <div className="p-4 border rounded-md bg-yellow-100 text-muted-foreground min-h-[60px]">
          <p className="text-sm italic">Phil is thinking...</p>
        </div>
      )}
    </div>
  );
}
