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
    <div
      className={[
        "border bg-[#0A0A0A] p-0 rounded-[2px] transition-none",
        isCurrentSpeaker
          ? "border-[#FF4500] border-l-2"
          : "border-foreground/10",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-foreground font-bold text-base leading-[1.1]">
          {name}
        </span>
        {isCurrentSpeaker ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#FF4500]">
            SPEAKING
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-0">
        {isTyping || content ? (
          <div className="whitespace-pre-wrap text-foreground text-sm leading-[1.5]">
            {content}
            {isTyping ? (
              <span className="typing-cursor ml-1 inline-block">|</span>
            ) : null}
          </div>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
            {isCurrentSpeaker ? "[PROCESSING]" : "[STANDBY]"}
          </span>
        )}
      </div>
    </div>
  );
}
