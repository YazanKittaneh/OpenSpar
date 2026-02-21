"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Speaker, Turn } from "@/lib/types";

interface DebateLogProps {
  turns: Turn[];
  getDebaterName: (speaker: Speaker) => string;
}

export function DebateLog({ turns, getDebaterName }: DebateLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [turns]);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-zinc-100">Debate Log</h2>
      <div ref={scrollRef} className="max-h-[480px] space-y-3 overflow-y-auto rounded-xl border border-zinc-800 p-2">
        {turns.map((turn) => (
          <Card key={`${turn.number}-${turn.speaker}`} className="border-zinc-800 bg-zinc-900/40">
            <CardContent className="pt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="outline">Turn {turn.number}</Badge>
                <span className="text-xs text-zinc-500">
                  {new Date(turn.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mb-2 text-sm font-semibold text-orange-400">
                {getDebaterName(turn.speaker)}
              </div>
              <p className="whitespace-pre-wrap text-zinc-200">{turn.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
