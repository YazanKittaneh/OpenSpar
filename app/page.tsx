"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONFIG, WINNING_CONDITIONS } from "@/lib/config";
import { WinningCondition } from "@/lib/types";

type DebaterForm = {
  model: string;
  name: string;
  objective?: string;
};

function SetupPage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [debaterA, setDebaterA] = useState<DebaterForm>({
    model: CONFIG.DEFAULT_MODELS[0].id,
    name: "Debater A",
    objective: "",
  });
  const [debaterB, setDebaterB] = useState<DebaterForm>({
    model: CONFIG.DEFAULT_MODELS[2].id,
    name: "Debater B",
    objective: "",
  });
  const [maxTurns, setMaxTurns] = useState<number>(CONFIG.MAX_TURNS_DEFAULT);
  const [winningCondition, setWinningCondition] = useState<WinningCondition>("self-terminate");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicError = useMemo(() => {
    if (!topic.trim()) return "Topic is required.";
    if (topic.trim().length < 10) return "Topic should be at least 10 characters.";
    return null;
  }, [topic]);

  async function handleStartDebate() {
    if (topicError) {
      setError(topicError);
      return;
    }
    if (!apiKey.trim()) {
      setError("OpenRouter API key is required.");
      return;
    }

    const clampedTurns = Math.max(
      CONFIG.MAX_TURNS_MIN,
      Math.min(CONFIG.MAX_TURNS_LIMIT, maxTurns),
    );

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          debaterA: {
            ...debaterA,
            objective: debaterA.objective?.trim() || undefined,
          },
          debaterB: {
            ...debaterB,
            objective: debaterB.objective?.trim() || undefined,
          },
          maxTurns: clampedTurns,
          winningCondition,
          apiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create debate");
      }

      const data = await response.json();
      const debateId = data?.debate?.id ?? data?.debate?._id;
      if (!debateId) {
        throw new Error("Debate created but no id was returned.");
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`debate-key:${debateId}`, apiKey.trim());
      }

      router.push(`/debate/${debateId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start debate.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-swiss-grid pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:py-20">
        {/* Header - Left-aligned, architectural */}
        <div className="stagger-children mb-16 sm:mb-20">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              LLM Combat System v0.1
            </span>
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-[1.1] sm:text-6xl lg:text-7xl">
            DEBATE<br />
            <span className="text-[#FF4500]">ARENA</span>
          </h1>
          <div className="mt-4 h-px w-24 bg-[#FF4500]" />
          <p className="mt-6 max-w-md text-sm text-muted-foreground leading-relaxed">
            Configure two models, set the win condition, and watch a structured debate unfold in real-time.
          </p>
        </div>

        {/* Main form area */}
        <div className="stagger-children space-y-16">

          {/* TOPIC SECTION */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">01</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Topic</span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>
            <Textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Should frontier AI labs be regulated like critical infrastructure?"
              className="min-h-28 text-lg border-foreground/10"
            />
            {topicError && topic.length > 0 ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.05em] text-[#FF4500]">
                [ERROR: {topicError.toUpperCase()}]
              </p>
            ) : null}
          </section>

          {/* DEBATERS SECTION */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">02</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Combatants</span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
              {/* Debater A */}
              <div className="space-y-6 border border-foreground/10 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.05em] text-foreground font-bold">
                    Side A
                  </span>
                  <Badge variant="outline" className="border-foreground/20 text-muted-foreground">
                    {debaterA.model.split("/").pop()}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="a-model">Model</Label>
                  <Select
                    value={debaterA.model}
                    onValueChange={(value) => setDebaterA((prev) => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger id="a-model">
                      <SelectValue placeholder="Choose model" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIG.DEFAULT_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="a-name">Display_Name</Label>
                  <Input
                    id="a-name"
                    value={debaterA.name}
                    onChange={(event) => setDebaterA((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="a-objective">Objective [optional]</Label>
                  <Textarea
                    id="a-objective"
                    value={debaterA.objective}
                    onChange={(event) => setDebaterA((prev) => ({ ...prev, objective: event.target.value }))}
                    className="min-h-16"
                  />
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex items-center justify-center lg:flex-col lg:py-16">
                <div className="h-px w-8 bg-foreground/10 lg:h-8 lg:w-px" />
                <span className="mx-3 font-mono text-xs font-bold text-[#FF4500] lg:my-3">VS</span>
                <div className="h-px w-8 bg-foreground/10 lg:h-8 lg:w-px" />
              </div>

              {/* Debater B */}
              <div className="space-y-6 border border-foreground/10 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.05em] text-foreground font-bold">
                    Side B
                  </span>
                  <Badge variant="outline" className="border-foreground/20 text-muted-foreground">
                    {debaterB.model.split("/").pop()}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-model">Model</Label>
                  <Select
                    value={debaterB.model}
                    onValueChange={(value) => setDebaterB((prev) => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger id="b-model">
                      <SelectValue placeholder="Choose model" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIG.DEFAULT_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-name">Display_Name</Label>
                  <Input
                    id="b-name"
                    value={debaterB.name}
                    onChange={(event) => setDebaterB((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-objective">Objective [optional]</Label>
                  <Textarea
                    id="b-objective"
                    value={debaterB.objective}
                    onChange={(event) => setDebaterB((prev) => ({ ...prev, objective: event.target.value }))}
                    className="min-h-16"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PARAMETERS SECTION */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">03</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Parameters</span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="max-turns">Max_Turns [2-50]</Label>
                <Input
                  id="max-turns"
                  type="number"
                  min={CONFIG.MAX_TURNS_MIN}
                  max={CONFIG.MAX_TURNS_LIMIT}
                  value={maxTurns}
                  onChange={(event) => setMaxTurns(Number(event.target.value))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="winning">Win_Condition</Label>
                <Select
                  value={winningCondition}
                  onValueChange={(value) => setWinningCondition(value as WinningCondition)}
                >
                  <SelectTrigger id="winning">
                    <SelectValue placeholder="Choose condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {WINNING_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* API KEY SECTION */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">04</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Authentication</span>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="max-w-lg space-y-1">
              <Label htmlFor="api-key">OpenRouter_API_Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-or-v1-..."
                autoComplete="off"
              />
              <p className="pt-1 font-mono text-[10px] text-muted-foreground tracking-[0.02em]">
                Used only in server memory for this debate. Not persisted.
              </p>
            </div>
          </section>

          {/* ERROR + SUBMIT */}
          <section className="pb-20">
            {error ? (
              <div className="mb-6 border border-[#FF4500] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#FF4500]">
                  [ERROR: {error.toUpperCase()}]
                </p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="mb-6">
                <div className="swiss-loader" />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  Initializing debate...
                </p>
              </div>
            ) : null}

            <Button
              onClick={() => void handleStartDebate()}
              disabled={isLoading || Boolean(topicError)}
              className="bg-[#FF4500] text-white hover:bg-foreground hover:text-background w-full sm:w-auto"
              size="lg"
            >
              {isLoading ? "Initializing..." : "> Start Debate"}
            </Button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <SetupPage />
    </ErrorBoundary>
  );
}
