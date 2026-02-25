"use client";

import { useState } from "react";
import { MessageSquare, Pause, Play, SkipForward, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ControlBarProps {
  isPaused: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  onPause: () => Promise<void>;
  onStop: () => Promise<void>;
  onSkip: () => Promise<void>;
  onInject: (comment: string) => Promise<void>;
}

export function ControlBar({
  isPaused,
  isCompleted,
  isSubmitting,
  onPause,
  onStop,
  onSkip,
  onInject,
}: ControlBarProps) {
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  const disabled = isCompleted || isSubmitting;

  return (
    <div className="flex items-center gap-2">
      {/* Pause / Resume */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => void onPause()}
        disabled={disabled}
        className="font-mono"
      >
        {isPaused ? (
          <>
            <Play className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">RESUME</span>
          </>
        ) : (
          <>
            <Pause className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">PAUSE</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => void onStop()}
        disabled={disabled}
        className="font-mono border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white"
      >
        <Square className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">STOP</span>
      </Button>

      {/* Skip */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => void onSkip()}
        disabled={disabled}
        className="font-mono"
      >
        <SkipForward className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">SKIP</span>
      </Button>

      {/* Inject Comment */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="font-mono"
          >
            <MessageSquare className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">INJECT</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-[0.05em]">
              Inject Comment
            </DialogTitle>
            <DialogDescription>
              Add moderator guidance for the current debate turn.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Example: Focus on empirical evidence only."
            className="min-h-28 rounded-none"
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                const trimmed = comment.trim();
                if (!trimmed) return;
                await onInject(trimmed);
                setComment("");
                setOpen(false);
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
