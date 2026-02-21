import { Bot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebateCardProps {
  name: string;
  isCurrentSpeaker: boolean;
  isTyping: boolean;
  content: string;
}

export function DebateCard({
  name,
  isCurrentSpeaker,
  isTyping,
  content,
}: DebateCardProps) {
  return (
    <Card
      className={`border-zinc-800 bg-zinc-900/60 transition ${
        isCurrentSpeaker ? "ring-2 ring-orange-500/80" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <Bot className="h-5 w-5 text-orange-400" />
          {name}
          {isCurrentSpeaker ? (
            <Badge className="ml-auto animate-pulse bg-orange-500 text-black hover:bg-orange-500">
              Speaking...
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTyping || content ? (
          <div className="whitespace-pre-wrap text-zinc-200">
            {content}
            {isTyping ? <span className="typing-cursor ml-1 inline-block">|</span> : null}
          </div>
        ) : (
          <p className="italic text-zinc-500">
            {isCurrentSpeaker ? "Thinking..." : "Waiting..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
