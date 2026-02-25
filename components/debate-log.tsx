"use client";
import { useEffect, useRef } from "react";
import { Speaker, Turn } from "@/lib/types";

interface DebateLogProps {
  turns: Turn[];
  getDebaterName: (speaker: Speaker) => string;
}

function formatTurnNumber(n: number): string {
  return `TURN_${String(n).padStart(3, "0")}`;
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
      {/* Header: monospace uppercase label */}
      <h2 className="font-mono text-sm uppercase tracking-[0.05em] text-foreground">
        TRANSCRIPT
      </h2>

      {/* Scrollable transcript area: flat, no rounded corners */}
      <div
        ref={scrollRef}
        className="max-h-[480px] overflow-y-auto border border-border rounded-none"
      >
        {turns.length === 0 ? (
          <div className="px-4 py-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
              [NO_ENTRIES]
            </span>
          </div>
        ) : (
          turns.map((turn, index) => (
            <div
              key={`${turn.number}-${turn.speaker}`}
              className={`px-4 py-3 ${
                index < turns.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              {/* Meta row: turn number (left) + timestamp (right) */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  {formatTurnNumber(turn.number)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(turn.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Speaker name: orange for A, white/foreground for B */}
              <div
                className={`font-bold text-sm mb-1 ${
                  turn.speaker === "A"
                    ? "text-[#FF4500]"
                    : "text-foreground"
                }`}
              >
                {getDebaterName(turn.speaker)}
              </div>

              {/* Turn content */}
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {turn.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
