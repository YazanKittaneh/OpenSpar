"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModelCatalogEntry } from "@/lib/models";
import { cn } from "@/lib/utils";

type ModelPickerProps = {
  id: string;
  value: string;
  models: ModelCatalogEntry[];
  onValueChange: (value: string) => void;
  label?: string;
  isLoading?: boolean;
  loadError?: string | null;
};

function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: ModelCatalogEntry;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      className={cn(
        "w-full border border-transparent px-3 py-3 text-left transition-none hover:border-foreground/20 hover:bg-foreground hover:text-background",
        selected && "border-[#FF4500] bg-[#FF4500]/5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{model.name}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            {model.id}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Badge variant="outline" className="border-foreground/20 text-[10px]">
            {model.provider}
          </Badge>
          {model.reasoningCapable ? (
            <Badge variant="outline" className="border-foreground/20 text-[10px]">
              <Sparkles className="size-3" />
              Reasoning
            </Badge>
          ) : null}
          {model.reasoningToggleable ? (
            <Badge variant="outline" className="border-foreground/20 text-[10px]">
              Toggle
            </Badge>
          ) : null}
          {model.source === "curated" ? (
            <Badge variant="outline" className="border-[#FF4500]/40 text-[10px] text-[#FF4500]">
              Curated
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function groupModels(models: ModelCatalogEntry[]) {
  return {
    curated: models.filter((model) => model.source === "curated"),
    openrouter: models.filter((model) => model.source === "openrouter"),
  };
}

export function ModelPicker({
  id,
  value,
  models,
  onValueChange,
  label = "Model",
  isLoading = false,
  loadError = null,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedModel = models.find((model) => model.id === value) ?? {
    id: value,
    name: value.split("/").pop() || value,
    provider: value.split("/")[0] || "Unknown",
    source: "openrouter" as const,
    reasoningCapable: false,
    reasoningToggleable: false,
  };

  const filteredModels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return models;
    return models.filter((model) =>
      [model.name, model.id, model.provider].some((part) =>
        part.toLowerCase().includes(needle),
      ),
    );
  }, [models, query]);

  const groups = groupModels(filteredModels);

  const selectModel = (modelId: string) => {
    onValueChange(modelId);
    setOpen(false);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border-b border-t-0 border-l-0 border-r-0 border-[var(--border)] bg-transparent px-0 py-2 text-left text-sm text-foreground outline-none transition-none focus-visible:border-b-2 focus-visible:border-b-[#FF4500]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate">{selectedModel.name}</p>
            <p className="truncate pt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              {selectedModel.id}
            </p>
          </div>
          <Search className="size-4 shrink-0 opacity-50" />
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogHeader className="border-b border-foreground/10 p-6 pb-4">
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Search curated defaults or the live OpenRouter model catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-foreground/10 px-6 py-4">
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, provider, or model id..."
            />
            {loadError ? (
              <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.04em] text-[#FF4500]">
                Catalog unavailable. Showing curated models only.
              </p>
            ) : isLoading ? (
              <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                Loading catalog...
              </p>
            ) : null}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {groups.curated.length > 0 ? (
              <div className="mb-4">
                <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  Curated
                </p>
                <div className="space-y-1">
                  {groups.curated.map((model) => (
                    <ModelRow
                      key={model.id}
                      model={model}
                      selected={model.id === value}
                      onSelect={selectModel}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {groups.openrouter.length > 0 ? (
              <div>
                <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  All OpenRouter Models
                </p>
                <div className="space-y-1">
                  {groups.openrouter.map((model) => (
                    <ModelRow
                      key={model.id}
                      model={model}
                      selected={model.id === value}
                      onSelect={selectModel}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {groups.curated.length === 0 && groups.openrouter.length === 0 ? (
              <div className="px-3 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  [NO MODELS MATCH SEARCH]
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

