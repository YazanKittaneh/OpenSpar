import { api } from "@/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex";

const encoder = new TextEncoder();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const convex = getConvexHttpClient();

  let closed = false;
  let lastSequence = 0;
  let completionSent = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        if (!closed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      };

      while (!closed) {
        try {
          const debate = await convex.query(api.subscriptions.watchDebate, {
            id: id as never,
          });

          if (!debate) {
            send({ type: "error", message: "Debate not found" });
            break;
          }

          const events = await convex.query(api.subscriptions.watchEvents, {
            debateId: id as never,
            afterSequence: lastSequence,
            limit: 500,
          });

          if (events.length > 0) {
            for (const event of events) {
              const payload = JSON.parse(event.payload);
              send({ type: event.type, ...payload });
              lastSequence = Math.max(lastSequence, event.sequence);
              if (event.type === "debate.completed") {
                completionSent = true;
              }
            }
          }

          if (debate.status === "completed" || debate.status === "aborted") {
            if (!completionSent) {
              send({
                type: "debate.completed",
                winner: debate.winner ?? null,
                reason: debate.status === "aborted" ? "Debate aborted" : "Debate completed",
              });
            }
            break;
          }
        } catch {
          send({ type: "error", message: "Stream error" });
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 750));
      }

      controller.close();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
