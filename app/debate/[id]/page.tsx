"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ControlBar } from "@/components/control-bar";
import { DebateCard } from "@/components/debate-card";
import { DebateLog } from "@/components/debate-log";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeToggle } from "@/components/theme-toggle";
import { WinnerBanner } from "@/components/winner-banner";
import { Badge } from "@/components/ui/badge";
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="swiss-loader" />
        <div className="mx-auto max-w-6xl px-6 py-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            Loading debate...
          </span>
        </div>
      </div>
    );
  }

  const statusLabel = (() => {
    if (isCompleted) return "COMPLETED";
    if (isPaused) return "PAUSED";
    if (connectionStatus === "connected") return "LIVE";
    if (connectionStatus === "reconnecting") return "RECONNECTING";
    if (connectionStatus === "error") return "ERROR";
    return "CONNECTING";
  })();

  const statusColor = (() => {
    if (statusLabel === "LIVE") return "text-[#FF4500]";
    if (statusLabel === "ERROR") return "text-[#FF4500]";
    if (statusLabel === "COMPLETED") return "text-foreground";
    return "text-muted-foreground";
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Connection bar */}
      {connectionStatus === "connecting" || connectionStatus === "reconnecting" ? (
        <div className="swiss-loader" />
      ) : null}

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${statusColor}`}>
                [{statusLabel}]
              </span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-[0.05em]">
                {turns.length} turns
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg truncate">
              {debate.topic}
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground mt-1">
              {debate.debaterA.name} vs {debate.debaterB.name}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
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

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
        {/* Error banner */}
        {errorBanner ? (
          <div className="border border-[#FF4500] p-4 animate-fade-in">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#FF4500]">
              [ERROR: {errorBanner.toUpperCase()}]
            </p>
          </div>
        ) : null}

        {/* Winner banner */}
        {isCompleted ? (
          <WinnerBanner
            winner={debate.winner ?? null}
            winnerName={winnerName}
            reason={winnerReason || "Debate completed"}
          />
        ) : null}

        {/* Active debate cards */}
        <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Divider */}
        <div className="h-px w-full bg-foreground/10" />

        {/* Transcript */}
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
