"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="mb-3 bg-gradient-to-r from-orange-300 via-red-400 to-amber-500 bg-clip-text text-4xl font-bold text-transparent sm:text-6xl">
            LLM Debate Arena
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-zinc-400 sm:text-lg">
            Configure two models, set the win condition, and watch a structured debate unfold in real-time.
          </p>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-zinc-100">Debate Configuration</CardTitle>
            <CardDescription className="text-zinc-400">
              Choose models and goals for each side before starting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: Should frontier AI labs be regulated like critical infrastructure?"
                className="min-h-24"
              />
              {topicError && topic.length > 0 ? (
                <p className="text-xs text-red-400">{topicError}</p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
              <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader>
                  <CardTitle className="text-base">Debater A</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="a-name">Display Name</Label>
                    <Input
                      id="a-name"
                      value={debaterA.name}
                      onChange={(event) => setDebaterA((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="a-objective">Objective (Optional)</Label>
                    <Textarea
                      id="a-objective"
                      value={debaterA.objective}
                      onChange={(event) => setDebaterA((prev) => ({ ...prev, objective: event.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center md:pt-16">
                <Badge className="h-fit bg-orange-500 px-3 py-1 text-black">VS</Badge>
              </div>

              <Card className="border-zinc-800 bg-zinc-900/70">
                <CardHeader>
                  <CardTitle className="text-base">Debater B</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="b-name">Display Name</Label>
                    <Input
                      id="b-name"
                      value={debaterB.name}
                      onChange={(event) => setDebaterB((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-objective">Objective (Optional)</Label>
                    <Textarea
                      id="b-objective"
                      value={debaterB.objective}
                      onChange={(event) => setDebaterB((prev) => ({ ...prev, objective: event.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max-turns">Max Turns (2-50)</Label>
                <Input
                  id="max-turns"
                  type="number"
                  min={CONFIG.MAX_TURNS_MIN}
                  max={CONFIG.MAX_TURNS_LIMIT}
                  value={maxTurns}
                  onChange={(event) => setMaxTurns(Number(event.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="winning">Winning Condition</Label>
                <Select
                  value={winningCondition}
                  onValueChange={(value) => setWinningCondition(value as WinningCondition)}
                >
                  <SelectTrigger id="winning">
                    <SelectValue placeholder="Choose winning condition" />
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

            <div className="space-y-2">
              <Label htmlFor="api-key">Your OpenRouter API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-or-v1-..."
                autoComplete="off"
              />
              <p className="text-xs text-zinc-500">
                Used only in server memory for this debate and not written to Convex.
              </p>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button
              onClick={() => void handleStartDebate()}
              disabled={isLoading || Boolean(topicError)}
              className="w-full bg-orange-500 text-black hover:bg-orange-400"
              size="lg"
            >
              {isLoading ? "Starting debate..." : "Start Debate"}
            </Button>
          </CardContent>
        </Card>
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
