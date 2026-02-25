export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Loading
          </span>
        </div>
        <div className="swiss-loader mb-4" />
        <div className="space-y-8 mt-12">
          <div className="h-12 w-64 bg-muted animate-pulse" />
          <div className="h-px w-24 bg-border" />
          <div className="h-32 w-full bg-muted animate-pulse" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-48 border border-muted animate-pulse" />
            <div className="h-48 border border-muted animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
