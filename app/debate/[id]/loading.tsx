export default function LoadingDebate() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header skeleton */}
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-muted animate-pulse" />
            <div className="h-3 w-32 bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 border border-muted animate-pulse" />
            <div className="h-8 w-16 border border-muted animate-pulse" />
          </div>
        </div>
      </header>

      {/* Loading bar */}
      <div className="swiss-loader" />

      {/* Content skeleton */}
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
          Connecting to debate stream...
        </p>
      </main>
    </div>
  );
}
