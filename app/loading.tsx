import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="mx-auto h-12 w-72" />
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
