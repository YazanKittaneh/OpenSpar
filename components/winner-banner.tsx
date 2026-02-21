import Link from "next/link";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WinnerBannerProps {
  winner: "A" | "B" | "draw" | null;
  winnerName: string;
  reason: string;
}

export function WinnerBanner({ winner, winnerName, reason }: WinnerBannerProps) {
  return (
    <div className="animate-fade-in mb-8 text-center">
      <div className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-yellow-700 via-orange-600 to-amber-500 px-6 py-5 shadow-xl">
        <Trophy className="h-10 w-10 text-yellow-100" />
        <div className="text-left">
          <div className="text-xs uppercase tracking-wider text-yellow-100/90">Winner</div>
          <div className="text-2xl font-bold text-white">{winner === "draw" ? "Draw" : winnerName}</div>
          <div className="text-sm text-yellow-100">{reason}</div>
        </div>
      </div>
      <div className="mt-5">
        <Link href="/">
          <Button variant="outline" size="lg">
            Start New Debate
          </Button>
        </Link>
      </div>
    </div>
  );
}
