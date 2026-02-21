"use client";

import { useState } from "react";
import { MessageSquare, Pause, Play, SkipForward } from "lucide-react";

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
  onSkip: () => Promise<void>;
  onInject: (comment: string) => Promise<void>;
}

export function ControlBar({
  isPaused,
  isCompleted,
  isSubmitting,
  onPause,
  onSkip,
  onInject,
}: ControlBarProps) {
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => void onPause()} disabled={isCompleted || isSubmitting}>
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>

      <Button variant="outline" size="sm" onClick={() => void onSkip()} disabled={isCompleted || isSubmitting}>
        <SkipForward className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isCompleted || isSubmitting}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Inject Comment</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add moderator guidance for the current debate turn.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Example: Focus on empirical evidence only."
            className="min-h-28"
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
