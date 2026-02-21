import { Loader2 } from "lucide-react";

export default function LoadingDebate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
      <div className="flex items-center gap-3 text-lg">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading debate view...
      </div>
    </div>
  );
}
