"use client";

import { useEffect, useMemo, useRef } from "react";

import { Speaker, Turn } from "@/lib/types";

interface ReasoningColumnProps {
  speaker: Speaker;
  title: string;
  turns: Turn[];
  typingSpeaker: Speaker | null;
  getDebaterName: (speaker: Speaker) => string;
  className?: string;
}

function formatTurnNumber(n: number): string {
  return `TURN_${String(n).padStart(3, "0")}`;
}

export function ReasoningColumn({
  speaker,
  title,
  turns,
  typingSpeaker,
  getDebaterName,
  className,
}: ReasoningColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const speakerTurns = useMemo(
    () =>
      turns
        .filter((turn) => turn.speaker === speaker)
        .sort((a, b) => a.number - b.number),
    [speaker, turns],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [speakerTurns, typingSpeaker, speaker]);

  return (
    <section className={className}>
      <h2 className="font-mono text-sm uppercase tracking-[0.05em] text-foreground">
        {title}
      </h2>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
        {getDebaterName(speaker)}
      </p>

      <div
        ref={scrollRef}
        className="mt-4 max-h-[72vh] min-h-[440px] overflow-y-auto border border-foreground/10"
      >
        {speakerTurns.length === 0 ? (
          <div className="px-4 py-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
              [NO_REASONING_ENTRIES]
            </span>
          </div>
        ) : (
          speakerTurns.map((turn, index) => (
            <div
              key={`${turn.number}-${speaker}`}
              className={`px-4 py-3 ${
                index < speakerTurns.length - 1
                  ? "border-b border-foreground/10"
                  : ""
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  {formatTurnNumber(turn.number)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(turn.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {turn.reasoning ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {turn.reasoning}
                </p>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  [NO_REASONING]
                </span>
              )}
            </div>
          ))
        )}

        {typingSpeaker === speaker ? (
          <div className="border-t border-foreground/10 px-4 py-3 animate-fade-in">
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#FF4500]">
              [PROCESSING_REASONING]
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
