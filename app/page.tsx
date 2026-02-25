"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

import { ErrorBoundary } from "@/components/error-boundary";
import { ModelPicker } from "@/components/model-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONFIG, WINNING_CONDITIONS } from "@/lib/config";
import { findModelById, getCuratedModels, mergeModelCatalogs, ModelCatalogEntry } from "@/lib/models";
import { WinningCondition } from "@/lib/types";

type DebaterForm = {
  model: string;
  name: string;
  objective?: string;
  reasoningEnabled?: boolean;
  reasoningToggleable?: boolean;
};

function SetupPage() {
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  const [topic, setTopic] = useState("");
  const [curatedModels] = useState(() => getCuratedModels());
  const [fetchedModels, setFetchedModels] = useState<ModelCatalogEntry[]>([]);
  const [isModelCatalogLoading, setIsModelCatalogLoading] = useState(false);
  const [modelCatalogError, setModelCatalogError] = useState<string | null>(null);
  const [debaterA, setDebaterA] = useState<DebaterForm>({
    model: CONFIG.DEFAULT_MODELS[0].id,
    name: "Debater A",
    objective: "",
    reasoningEnabled: false,
    reasoningToggleable: CONFIG.DEFAULT_MODELS[0].reasoningToggleable,
  });
  const [debaterB, setDebaterB] = useState<DebaterForm>({
    model: CONFIG.DEFAULT_MODELS[2].id,
    name: "Debater B",
    objective: "",
    reasoningEnabled: false,
    reasoningToggleable: CONFIG.DEFAULT_MODELS[2].reasoningToggleable,
  });
  const [maxTurns, setMaxTurns] = useState<number>(CONFIG.MAX_TURNS_DEFAULT);
  const [winningCondition, setWinningCondition] = useState<WinningCondition>("self-terminate");
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [savedKeyMask, setSavedKeyMask] = useState<string | null>(null);
  const [isSavedKeyLoading, setIsSavedKeyLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicError = useMemo(() => {
    if (!topic.trim()) return "Topic is required.";
    if (topic.trim().length < 10) return "Topic should be at least 10 characters.";
    return null;
  }, [topic]);

  const modelCatalog = useMemo(
    () => mergeModelCatalogs(curatedModels, fetchedModels),
    [curatedModels, fetchedModels],
  );

  const selectedModelA = useMemo(
    () => findModelById(modelCatalog, debaterA.model),
    [modelCatalog, debaterA.model],
  );
  const selectedModelB = useMemo(
    () => findModelById(modelCatalog, debaterB.model),
    [modelCatalog, debaterB.model],
  );
  const aReasoningToggleable = Boolean(selectedModelA?.reasoningToggleable);
  const bReasoningToggleable = Boolean(selectedModelB?.reasoningToggleable);

  useEffect(() => {
    const loadModelCatalog = async () => {
      try {
        setIsModelCatalogLoading(true);
        setModelCatalogError(null);
        const response = await fetch("/api/models");
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load model catalog.");
        }
        const data = (await response.json()) as { models?: ModelCatalogEntry[] };
        setFetchedModels(Array.isArray(data.models) ? data.models : []);
      } catch (err) {
        setModelCatalogError(err instanceof Error ? err.message : "Failed to load model catalog.");
      } finally {
        setIsModelCatalogLoading(false);
      }
    };

    void loadModelCatalog();
  }, []);

  const getReasoningHelperText = (model: ModelCatalogEntry | undefined) => {
    if (!model) return "Reasoning support unknown for this model.";
    if (model.reasoningToggleable) {
      return "Runtime reasoning toggle supported by OpenRouter for this model.";
    }
    if (model.reasoningCapable) {
      return "Reasoning-capable model, but OpenRouter does not expose a toggle here.";
    }
    return "No reasoning toggle support detected for this model.";
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedKeyMask(null);
      return;
    }

    const loadSavedKeyState = async () => {
      try {
        setIsSavedKeyLoading(true);
        const response = await fetch("/api/account/api-key");
        if (!response.ok) {
          throw new Error("Failed to load account key status.");
        }
        const data = await response.json();
        setSavedKeyMask(data?.hasSavedKey ? data.maskedKey ?? "saved" : null);
      } catch (err) {
        setAuthMessage(err instanceof Error ? err.message : "Failed to load account key status.");
      } finally {
        setIsSavedKeyLoading(false);
      }
    };

    void loadSavedKeyState();
  }, [isAuthenticated]);

  async function handleAuthSubmit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setAuthMessage("Email and password are required.");
      return;
    }

    setIsAuthSubmitting(true);
    setAuthMessage(null);
    try {
      await signIn("password", {
        flow: authMode,
        email: normalizedEmail,
        password,
      });
      setPassword("");
      if (authMode === "signUp") {
        setAuthMode("signIn");
        setAuthMessage("Account created. You are now signed in.");
      } else {
        setAuthMessage("Signed in.");
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsAuthSubmitting(true);
    setAuthMessage(null);
    try {
      await signOut();
      setSavedKeyMask(null);
      setAuthMessage("Signed out.");
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Failed to sign out.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSaveAccountKey() {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError("Enter an API key to save.");
      return;
    }

    try {
      const response = await fetch("/api/account/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save API key.");
      }
      const data = await response.json();
      setSavedKeyMask(data?.maskedKey ?? "saved");
      setAuthMessage("API key saved to your account.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key.");
    }
  }

  async function handleDeleteAccountKey() {
    try {
      const response = await fetch("/api/account/api-key", {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete saved API key.");
      }
      setSavedKeyMask(null);
      setAuthMessage("Saved API key removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete saved API key.");
    }
  }

  async function handleStartDebate() {
    if (topicError) {
      setError(topicError);
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
            reasoningEnabled:
              aReasoningToggleable ? Boolean(debaterA.reasoningEnabled) : undefined,
            reasoningToggleable: aReasoningToggleable ? true : undefined,
          },
          debaterB: {
            ...debaterB,
            objective: debaterB.objective?.trim() || undefined,
            reasoningEnabled:
              bReasoningToggleable ? Boolean(debaterB.reasoningEnabled) : undefined,
            reasoningToggleable: bReasoningToggleable ? true : undefined,
          },
          maxTurns: clampedTurns,
          winningCondition,
          apiKey: apiKey.trim() || undefined,
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
      if (typeof window !== "undefined" && apiKey.trim()) {
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

          {/* ACCESS SECTION */}
          <section>
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">00</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Account + Key</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2 border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  Account [optional]
                </p>

                {!isAuthLoading && isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Signed in. Save one OpenRouter key and reuse it across devices.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleSignOut()}
                        disabled={isAuthSubmitting}
                      >
                        Sign out
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDeleteAccountKey()}
                        disabled={isAuthSubmitting || !savedKeyMask}
                      >
                        Remove saved key
                      </Button>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                      {isSavedKeyLoading
                        ? "Saved key: [LOADING]"
                        : savedKeyMask
                          ? `Saved key: [${savedKeyMask}]`
                          : "Saved key: [NONE]"}
                    </p>
                  </div>
                ) : (
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAuthSubmit();
                    }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="account-email">Email</Label>
                        <Input
                          id="account-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="account-password">Password</Label>
                        <Input
                          id="account-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete={authMode === "signUp" ? "new-password" : "current-password"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant={authMode === "signIn" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthMode("signIn")}
                      >
                        Sign in
                      </Button>
                      <Button
                        type="button"
                        variant={authMode === "signUp" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAuthMode("signUp")}
                      >
                        Create account
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isAuthSubmitting}
                        className="bg-[#FF4500] text-white hover:bg-foreground hover:text-background"
                      >
                        {isAuthSubmitting ? "Submitting..." : authMode === "signUp" ? "Create account" : "Sign in"}
                      </Button>
                    </div>
                  </form>
                )}
                {authMessage ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    [{authMessage}]
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  OpenRouter Key
                </p>
                <div className="space-y-1">
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
                    Optional if you have a saved account key. Provide one here to override for this run.
                  </p>
                  {isAuthenticated ? (
                    <div className="pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleSaveAccountKey()}
                        disabled={!apiKey.trim()}
                      >
                        Save current key to account
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* TOPIC SECTION */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#FF4500] tracking-[0.08em]">01</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">Topic</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Should frontier AI labs be regulated like critical infrastructure?"
              className="min-h-28 text-lg border-border"
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
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
              {/* Debater A */}
              <div className="space-y-6 border border-border p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.05em] text-foreground font-bold">
                    Side A
                  </span>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {debaterA.model.split("/").pop()}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="a-model">Model</Label>
                  <ModelPicker
                    id="a-model"
                    label="Choose Side A Model"
                    value={debaterA.model}
                    models={modelCatalog}
                    isLoading={isModelCatalogLoading}
                    loadError={modelCatalogError}
                    onValueChange={(value) =>
                      setDebaterA((prev) => {
                        const selected = findModelById(modelCatalog, value);
                        return {
                          ...prev,
                          model: value,
                          reasoningToggleable: selected?.reasoningToggleable ?? false,
                          reasoningEnabled:
                            selected?.reasoningToggleable
                              ? prev.reasoningEnabled ?? false
                              : false,
                        };
                      })
                    }
                  />
                </div>

                <div className="space-y-2 border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="a-reasoning">Reasoning</Label>
                    <Button
                      id="a-reasoning"
                      type="button"
                      size="xs"
                      variant={debaterA.reasoningEnabled ? "default" : "outline"}
                      onClick={() =>
                        setDebaterA((prev) =>
                          aReasoningToggleable
                            ? { ...prev, reasoningEnabled: !prev.reasoningEnabled }
                            : { ...prev, reasoningEnabled: false },
                        )
                      }
                      disabled={!aReasoningToggleable}
                    >
                      {debaterA.reasoningEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {getReasoningHelperText(selectedModelA)}
                  </p>
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
                <div className="h-px w-8 bg-border lg:h-8 lg:w-px" />
                <span className="mx-3 font-mono text-xs font-bold text-[#FF4500] lg:my-3">VS</span>
                <div className="h-px w-8 bg-border lg:h-8 lg:w-px" />
              </div>

              {/* Debater B */}
              <div className="space-y-6 border border-border p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.05em] text-foreground font-bold">
                    Side B
                  </span>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {debaterB.model.split("/").pop()}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-model">Model</Label>
                  <ModelPicker
                    id="b-model"
                    label="Choose Side B Model"
                    value={debaterB.model}
                    models={modelCatalog}
                    isLoading={isModelCatalogLoading}
                    loadError={modelCatalogError}
                    onValueChange={(value) =>
                      setDebaterB((prev) => {
                        const selected = findModelById(modelCatalog, value);
                        return {
                          ...prev,
                          model: value,
                          reasoningToggleable: selected?.reasoningToggleable ?? false,
                          reasoningEnabled:
                            selected?.reasoningToggleable
                              ? prev.reasoningEnabled ?? false
                              : false,
                        };
                      })
                    }
                  />
                </div>

                <div className="space-y-2 border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="b-reasoning">Reasoning</Label>
                    <Button
                      id="b-reasoning"
                      type="button"
                      size="xs"
                      variant={debaterB.reasoningEnabled ? "default" : "outline"}
                      onClick={() =>
                        setDebaterB((prev) =>
                          bReasoningToggleable
                            ? { ...prev, reasoningEnabled: !prev.reasoningEnabled }
                            : { ...prev, reasoningEnabled: false },
                        )
                      }
                      disabled={!bReasoningToggleable}
                    >
                      {debaterB.reasoningEnabled ? "On" : "Off"}
                    </Button>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {getReasoningHelperText(selectedModelB)}
                  </p>
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
              <div className="h-px flex-1 bg-border" />
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
