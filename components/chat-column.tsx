"use client";

import { useEffect, useMemo, useRef } from "react";

import { Speaker, Turn } from "@/lib/types";

interface ChatColumnProps {
  turns: Turn[];
  typingSpeaker: Speaker | null;
  streamingContent: Record<Speaker, string>;
  getDebaterName: (speaker: Speaker) => string;
  className?: string;
}

function formatTurnNumber(n: number): string {
  return `TURN_${String(n).padStart(3, "0")}`;
}

export function ChatColumn({
  turns,
  typingSpeaker,
  streamingContent,
  getDebaterName,
  className,
}: ChatColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveContent = typingSpeaker ? streamingContent[typingSpeaker] : "";

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [turns, liveContent, typingSpeaker]);

  const sortedTurns = useMemo(
    () => [...turns].sort((a, b) => a.number - b.number),
    [turns],
  );

  return (
    <section className={className}>
      <h2 className="font-mono text-sm uppercase tracking-[0.05em] text-foreground">
        CHAT
      </h2>

      <div
        ref={scrollRef}
        className="mt-4 max-h-[72vh] min-h-[440px] overflow-y-auto border border-foreground/10 px-3 py-4"
      >
        {sortedTurns.length === 0 && !typingSpeaker ? (
          <div className="px-1 py-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
              [NO_MESSAGES]
            </span>
          </div>
        ) : null}

        <div className="space-y-3">
          {sortedTurns.map((turn) => {
            const isModelOne = turn.speaker === "A";
            return (
              <div
                key={`${turn.number}-${turn.speaker}`}
                className={`flex ${isModelOne ? "justify-start" : "justify-end"}`}
              >
                <article
                  className={`w-full max-w-[90%] border px-3 py-3 ${
                    isModelOne
                      ? "border-[#FF4500]/80 bg-background"
                      : "border-foreground/10 bg-muted/30"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.05em] ${
                        isModelOne ? "text-[#FF4500]" : "text-muted-foreground"
                      }`}
                    >
                      {formatTurnNumber(turn.number)} {getDebaterName(turn.speaker)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(turn.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {turn.content}
                  </p>
                </article>
              </div>
            );
          })}

          {typingSpeaker ? (
            <div
              className={`flex ${
                typingSpeaker === "A" ? "justify-start" : "justify-end"
              } animate-fade-in`}
            >
              <article
                className={`w-full max-w-[90%] border px-3 py-3 ${
                  typingSpeaker === "A"
                    ? "border-[#FF4500]/80 bg-background"
                    : "border-foreground/10 bg-muted/30"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.05em] ${
                      typingSpeaker === "A"
                        ? "text-[#FF4500]"
                        : "text-muted-foreground"
                    }`}
                  >
                    [LIVE] {getDebaterName(typingSpeaker)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    [PROCESSING]
                  </span>
                </div>
                {liveContent ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {liveContent}
                    <span className="typing-cursor ml-1 inline-block">|</span>
                  </p>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    [WAITING_FOR_TOKENS]
                  </p>
                )}
              </article>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
