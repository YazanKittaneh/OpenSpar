import Link from "next/link";

interface WinnerBannerProps {
  winner: "A" | "B" | "draw" | null;
  winnerName: string;
  reason: string;
}

export function WinnerBanner({ winner, winnerName, reason }: WinnerBannerProps) {
  const displayName = winner === "draw" ? "DRAW" : winnerName;

  return (
    <div className="animate-fade-in mb-8">
      <div className="border-l-2 border-[#FF4500] pl-6 py-2">
        <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[#FF4500]">
          Result
        </span>

        <h2 className="mt-2 text-4xl font-black tracking-tight text-foreground leading-[1.1]">
          {displayName}
        </h2>

        <div className="mt-2 h-[2px] w-16 bg-[#FF4500]" />

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {reason}
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block font-mono text-xs uppercase tracking-[0.05em] text-foreground hover:text-[#FF4500] focus-visible:outline-2 focus-visible:outline-[#FF4500] focus-visible:outline-offset-2"
          >
            {">"} New Debate
          </Link>
        </div>
      </div>
    </div>
  );
}
