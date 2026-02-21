"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ControlBar } from "@/components/control-bar";
import { DebateCard } from "@/components/debate-card";
import { DebateLog } from "@/components/debate-log";
import { ErrorBoundary } from "@/components/error-boundary";
import { WinnerBanner } from "@/components/winner-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Speaker, Turn } from "@/lib/types";

type DebateApi = {
  _id: string;
  topic: string;
  status: "created" | "running" | "paused" | "completed" | "aborted";
  winner?: "A" | "B" | "draw";
  debaterA: { name: string };
  debaterB: { name: string };
};

type ActionType = "pause" | "resume" | "skip" | "inject";

type QueuedAction = {
  type: ActionType;
  payload?: string;
  apiKey?: string;
};

function DebatePageContent() {
  const params = useParams<{ id: string }>();
  const debateId = params?.id;

  const [debate, setDebate] = useState<DebateApi | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streamingContent, setStreamingContent] = useState<Record<Speaker, string>>({
    A: "",
    B: "",
  });
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [typingSpeaker, setTypingSpeaker] = useState<Speaker | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "reconnecting" | "error">("connecting");
  const [winnerReason, setWinnerReason] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  const isCompleted = debate?.status === "completed" || debate?.status === "aborted";
  const isPaused = debate?.status === "paused";

  const getDebaterName = useCallback(
    (speaker: Speaker) =>
      speaker === "A" ? (debate?.debaterA.name ?? "Debater A") : (debate?.debaterB.name ?? "Debater B"),
    [debate],
  );

  useEffect(() => {
    if (!debateId) return;

    const loadDebate = async () => {
      try {
        const response = await fetch(`/api/debates/${debateId}`);
        if (!response.ok) {
          throw new Error("Failed to load debate");
        }
        const data = await response.json();
        setDebate(data.debate);
      } catch (error) {
        setConnectionStatus("error");
        setErrorBanner(error instanceof Error ? error.message : "Could not load debate");
      }
    };

    void loadDebate();
  }, [debateId]);

  useEffect(() => {
    if (!debateId) return;

    let cancelled = false;
    let retryCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (cancelled) return;
      setConnectionStatus(retryCount === 0 ? "connecting" : "reconnecting");

      const source = new EventSource(`/api/debates/${debateId}/stream`);
      eventSourceRef.current = source;

      source.onopen = () => {
        retryCount = 0;
        setConnectionStatus("connected");
        setErrorBanner(null);
      };

      source.onerror = () => {
        source.close();
        if (cancelled) return;
        retryCount += 1;
        const delayMs = Math.min(1_000 * 2 ** (retryCount - 1), 15_000);
        setConnectionStatus("reconnecting");
        setErrorBanner(`Connection interrupted. Retrying in ${Math.round(delayMs / 1000)}s...`);
        retryTimeout = setTimeout(connect, delayMs);
      };

      source.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as {
            type: string;
            speaker?: Speaker;
            turnNumber?: number;
            content?: string;
            fullContent?: string;
            winner?: "A" | "B" | "draw" | null;
            reason?: string;
            message?: string;
          };

          switch (event.type) {
            case "turn.started": {
              if (!event.speaker) break;
              setCurrentSpeaker(event.speaker);
              setTypingSpeaker(event.speaker);
              setStreamingContent((prev) => ({ ...prev, [event.speaker!]: "" }));
              break;
            }
            case "token": {
              if (!event.speaker) break;
              setTypingSpeaker(event.speaker);
              setStreamingContent((prev) => ({
                ...prev,
                [event.speaker!]: `${prev[event.speaker!]}${event.content ?? ""}`,
              }));
              break;
            }
            case "turn.completed": {
              if (!event.speaker) break;
              setTurns((prev) => [
                ...prev,
                {
                  number: prev.length + 1,
                  speaker: event.speaker!,
                  content: event.fullContent ?? "",
                  timestamp: new Date(),
                },
              ]);
              setTypingSpeaker(null);
              setStreamingContent((prev) => ({ ...prev, [event.speaker!]: "" }));
              break;
            }
            case "debate.completed": {
              setDebate((prev) => (prev ? { ...prev, status: "completed", winner: event.winner ?? undefined } : prev));
              setWinnerReason(event.reason ?? "Debate completed");
              setTypingSpeaker(null);
              setCurrentSpeaker(null);
              break;
            }
            case "action.processed":
              break;
            case "error": {
              setErrorBanner(event.message ?? "Stream error");
              break;
            }
            default:
              break;
          }
        } catch {
          setErrorBanner("Received malformed stream message");
        }
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      eventSourceRef.current?.close();
    };
  }, [debateId]);

  const sendAction = useCallback(
    async (action: QueuedAction) => {
      if (!debateId) return;
      setIsActionLoading(true);
      try {
        const response = await fetch(`/api/debates/${debateId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });

        if (!response.ok) {
          throw new Error("Failed to send action");
        }

        if (action.type === "pause") {
          setDebate((prev) => (prev ? { ...prev, status: "paused" } : prev));
        }
        if (action.type === "resume") {
          setDebate((prev) => (prev ? { ...prev, status: "running" } : prev));
        }
      } catch (error) {
        setQueuedActions((prev) => [...prev, action]);
        setErrorBanner(
          error instanceof Error
            ? `${error.message}. Action queued for retry.`
            : "Action queued for retry.",
        );
      } finally {
        setIsActionLoading(false);
      }
    },
    [debateId],
  );

  const getStoredApiKey = useCallback(() => {
    if (!debateId || typeof window === "undefined") return undefined;
    const key = sessionStorage.getItem(`debate-key:${debateId}`) ?? undefined;
    return key && key.trim().length > 0 ? key : undefined;
  }, [debateId]);

  const getOrAskApiKey = useCallback(() => {
    const stored = getStoredApiKey();
    if (stored) return stored;
    if (typeof window === "undefined" || !debateId) return undefined;
    const entered = window.prompt("Enter your OpenRouter API key to resume this debate:")?.trim();
    if (entered) {
      sessionStorage.setItem(`debate-key:${debateId}`, entered);
      return entered;
    }
    return undefined;
  }, [debateId, getStoredApiKey]);

  useEffect(() => {
    if (connectionStatus !== "connected" || queuedActions.length === 0) return;

    const queue = [...queuedActions];
    setQueuedActions([]);

    const replay = async () => {
      for (const action of queue) {
        await sendAction(action);
      }
    };

    void replay();
  }, [connectionStatus, queuedActions, sendAction]);

  const winnerName = useMemo(() => {
    if (!debate) return "";
    if (debate.winner === "A") return debate.debaterA.name;
    if (debate.winner === "B") return debate.debaterB.name;
    return "Draw";
  }, [debate]);

  if (!debate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Loading debate...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">{debate.topic}</h1>
            <p className="text-sm text-zinc-400">
              {debate.debaterA.name} vs {debate.debaterB.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {connectionStatus}
            </Badge>
            <ControlBar
              isPaused={isPaused}
              isCompleted={Boolean(isCompleted)}
              isSubmitting={isActionLoading}
              onPause={() =>
                sendAction(
                  isPaused
                    ? { type: "resume", apiKey: getOrAskApiKey() }
                    : { type: "pause" },
                )
              }
              onSkip={() => sendAction({ type: "skip" })}
              onInject={(comment) => sendAction({ type: "inject", payload: comment })}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {errorBanner ? (
          <Card className="border-red-900/70 bg-red-950/40">
            <CardContent className="py-3 text-sm text-red-200">{errorBanner}</CardContent>
          </Card>
        ) : null}

        {isCompleted ? (
          <WinnerBanner
            winner={debate.winner ?? null}
            winnerName={winnerName}
            reason={winnerReason || "Debate completed"}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <DebateCard
            name={debate.debaterA.name}
            isCurrentSpeaker={currentSpeaker === "A"}
            isTyping={typingSpeaker === "A"}
            content={streamingContent.A}
          />
          <DebateCard
            name={debate.debaterB.name}
            isCurrentSpeaker={currentSpeaker === "B"}
            isTyping={typingSpeaker === "B"}
            content={streamingContent.B}
          />
        </div>

        <Separator className="bg-zinc-800" />

        <DebateLog turns={turns} getDebaterName={getDebaterName} />
      </main>
    </div>
  );
}

export default function DebatePage() {
  return (
    <ErrorBoundary>
      <DebatePageContent />
    </ErrorBoundary>
  );
}
