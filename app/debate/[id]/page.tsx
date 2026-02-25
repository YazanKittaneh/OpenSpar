"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ChatColumn } from "@/components/chat-column";
import { ControlBar } from "@/components/control-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { ReasoningColumn } from "@/components/reasoning-column";
import { ThemeToggle } from "@/components/theme-toggle";
import { WinnerBanner } from "@/components/winner-banner";
import { normalizeCompletedTurn, TurnCompletedPayload } from "@/lib/turn-events";
import { Speaker, Turn } from "@/lib/types";

type DebateApi = {
  _id: string;
  topic: string;
  status: "created" | "running" | "paused" | "completed" | "aborted";
  winner?: "A" | "B" | "draw";
  debaterA: { name: string };
  debaterB: { name: string };
};

type ActionType = "pause" | "resume" | "skip" | "inject" | "stop";

type QueuedAction = {
  type: ActionType;
  payload?: string;
  apiKey?: string;
};

type MobileTab = "chat" | "A" | "B";

type StreamEvent = {
  type: string;
  speaker?: Speaker;
  turnNumber?: number;
  content?: string;
  fullContent?: string;
  reasoning?: string;
  timestamp?: number;
  winner?: "A" | "B" | "draw" | null;
  reason?: string;
  message?: string;
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
  const [typingSpeaker, setTypingSpeaker] = useState<Speaker | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "reconnecting" | "error">("connecting");
  const [winnerReason, setWinnerReason] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  const isCompleted = debate?.status === "completed" || debate?.status === "aborted";
  const isPaused = debate?.status === "paused";
  const isAborted = debate?.status === "aborted";

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
          const event = JSON.parse(message.data) as StreamEvent;

          switch (event.type) {
            case "turn.started": {
              const speaker = event.speaker;
              if (!speaker) break;
              setTypingSpeaker(speaker);
              setStreamingContent((prev) => ({ ...prev, [speaker]: "" }));
              break;
            }
            case "token": {
              const speaker = event.speaker;
              if (!speaker) break;
              setTypingSpeaker(speaker);
              setStreamingContent((prev) => ({
                ...prev,
                [speaker]: `${prev[speaker]}${event.content ?? ""}`,
              }));
              break;
            }
            case "turn.completed": {
              const payload = event as TurnCompletedPayload;
              setTurns((prev) => {
                const normalized = normalizeCompletedTurn(payload, prev.length + 1);
                if (!normalized) return prev;

                const hasExplicitTurnNumber =
                  typeof event.turnNumber === "number" &&
                  Number.isInteger(event.turnNumber) &&
                  event.turnNumber > 0;

                const existingIndex = hasExplicitTurnNumber
                  ? prev.findIndex((turn) => turn.number === normalized.number)
                  : prev.findIndex(
                      (turn) =>
                        turn.speaker === normalized.speaker &&
                        turn.content === normalized.content,
                    );

                if (existingIndex >= 0) {
                  const next = [...prev];
                  next[existingIndex] = {
                    ...next[existingIndex],
                    ...normalized,
                    reasoning: normalized.reasoning ?? next[existingIndex].reasoning,
                  };
                  return next.sort((a, b) => a.number - b.number);
                }

                return [...prev, normalized].sort((a, b) => a.number - b.number);
              });

              const speaker = event.speaker;
              if (speaker) {
                setStreamingContent((prev) => ({ ...prev, [speaker]: "" }));
              }
              setTypingSpeaker(null);
              break;
            }
            case "debate.completed": {
              const reasonText = (event.reason ?? "").toLowerCase();
              const stopped = reasonText.includes("aborted") || reasonText.includes("stopped");
              setDebate((prev) =>
                prev
                  ? {
                      ...prev,
                      status: stopped ? "aborted" : "completed",
                      winner: event.winner ?? undefined,
                    }
                  : prev,
              );
              setWinnerReason(event.reason ?? "Debate completed");
              setTypingSpeaker(null);
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
          let message = "Failed to send action";
          try {
            const data = (await response.json()) as { error?: unknown };
            if (typeof data.error === "string" && data.error.trim()) {
              message = data.error;
            }
          } catch {
            // Ignore non-JSON error bodies and fall back to generic message.
          }
          throw new Error(message);
        }

        if (action.type === "pause") {
          setDebate((prev) => (prev ? { ...prev, status: "paused" } : prev));
        }
        if (action.type === "resume") {
          setDebate((prev) => (prev ? { ...prev, status: "running" } : prev));
        }
        if (action.type === "stop") {
          setDebate((prev) => (prev ? { ...prev, status: "aborted" } : prev));
          setTypingSpeaker(null);
          setStreamingContent({ A: "", B: "" });
        }
      } catch (error) {
        const isNetworkError = error instanceof TypeError;

        if (isNetworkError) {
          setQueuedActions((prev) => [...prev, action]);
          setErrorBanner(
            error instanceof Error
              ? `${error.message}. Action queued for retry.`
              : "Action queued for retry.",
          );
        } else {
          setErrorBanner(error instanceof Error ? error.message : "Failed to send action");
        }
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

  const getResumeApiKey = useCallback(() => {
    const stored = getStoredApiKey();
    if (stored) return stored;
    return undefined;
  }, [getStoredApiKey]);

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

  const statusLabel = (() => {
    if (isAborted) return "STOPPED";
    if (isCompleted) return "COMPLETED";
    if (isPaused) return "PAUSED";
    if (connectionStatus === "connected") return "LIVE";
    if (connectionStatus === "reconnecting") return "RECONNECTING";
    if (connectionStatus === "error") return "ERROR";
    return "CONNECTING";
  })();

  const statusColor = (() => {
    if (statusLabel === "LIVE") return "text-[#FF4500]";
    if (statusLabel === "STOPPED") return "text-[#FF4500]";
    if (statusLabel === "ERROR") return "text-[#FF4500]";
    if (statusLabel === "COMPLETED") return "text-foreground";
    return "text-muted-foreground";
  })();

  if (!debate) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="swiss-loader" />
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            Loading debate...
          </span>
        </div>
      </div>
    );
  }

  const mobileTabButtonClass = (tab: MobileTab) =>
    [
      "h-9 border px-3 font-mono text-[10px] uppercase tracking-[0.05em]",
      mobileTab === tab
        ? "border-[#FF4500] text-[#FF4500]"
        : "border-border text-muted-foreground",
    ].join(" ");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {connectionStatus === "connecting" || connectionStatus === "reconnecting" ? (
        <div className="swiss-loader" />
      ) : null}

      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-3">
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${statusColor}`}>
                [{statusLabel}]
              </span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-[0.05em]">
                {turns.length} turns
              </span>
            </div>
            <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
              {debate.topic}
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
              {debate.debaterA.name} vs {debate.debaterB.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <ControlBar
              isPaused={isPaused}
              isCompleted={Boolean(isCompleted)}
              isSubmitting={isActionLoading}
              onPause={() =>
                sendAction(
                  isPaused
                    ? { type: "resume", apiKey: getResumeApiKey() }
                    : { type: "pause" },
                )
              }
              onStop={() => sendAction({ type: "stop" })}
              onSkip={() => sendAction({ type: "skip" })}
              onInject={(comment) => sendAction({ type: "inject", payload: comment })}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] space-y-8 px-6 py-8">
        {errorBanner ? (
          <div className="animate-fade-in border border-[#FF4500] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#FF4500]">
              [ERROR: {errorBanner.toUpperCase()}]
            </p>
          </div>
        ) : null}

        {isCompleted ? (
          <WinnerBanner
            winner={debate.winner ?? null}
            winnerName={winnerName}
            reason={winnerReason || "Debate completed"}
          />
        ) : null}

        <div className="space-y-4 lg:hidden">
          <div className="grid grid-cols-3 gap-2 border border-border p-2">
            <button
              type="button"
              className={mobileTabButtonClass("chat")}
              onClick={() => setMobileTab("chat")}
            >
              CHAT
            </button>
            <button
              type="button"
              className={mobileTabButtonClass("A")}
              onClick={() => setMobileTab("A")}
            >
              MODEL 1
            </button>
            <button
              type="button"
              className={mobileTabButtonClass("B")}
              onClick={() => setMobileTab("B")}
            >
              MODEL 2
            </button>
          </div>

          {mobileTab === "chat" ? (
            <ChatColumn
              turns={turns}
              typingSpeaker={typingSpeaker}
              streamingContent={streamingContent}
              getDebaterName={getDebaterName}
            />
          ) : null}

          {mobileTab === "A" ? (
            <ReasoningColumn
              speaker="A"
              title="MODEL 1 REASONING"
              turns={turns}
              typingSpeaker={typingSpeaker}
              getDebaterName={getDebaterName}
            />
          ) : null}

          {mobileTab === "B" ? (
            <ReasoningColumn
              speaker="B"
              title="MODEL 2 REASONING"
              turns={turns}
              typingSpeaker={typingSpeaker}
              getDebaterName={getDebaterName}
            />
          ) : null}
        </div>

        <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
          <ReasoningColumn
            speaker="A"
            title="MODEL 1 REASONING"
            turns={turns}
            typingSpeaker={typingSpeaker}
            getDebaterName={getDebaterName}
          />

          <ChatColumn
            turns={turns}
            typingSpeaker={typingSpeaker}
            streamingContent={streamingContent}
            getDebaterName={getDebaterName}
          />

          <ReasoningColumn
            speaker="B"
            title="MODEL 2 REASONING"
            turns={turns}
            typingSpeaker={typingSpeaker}
            getDebaterName={getDebaterName}
          />
        </div>
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
