import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";

import { checkForAgreement, checkForCircularArgument } from "@/lib/debate-intelligence";
import { streamDebateResponse } from "@/lib/llm";
import { Turn } from "@/lib/types";

export const runDebateTurn = action({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    const debate = await ctx.runQuery(api.debates.getDebate, { id: args.debateId });
    if (!debate || debate.status !== "running") {
      return false;
    }

    const turnCount = await ctx.runQuery(api.turns.getTurnCount, {
      debateId: args.debateId,
    });

    if (turnCount >= debate.maxTurns * 2) {
      await ctx.runMutation(api.debates.updateDebate, {
        id: args.debateId,
        updates: { status: "completed" },
      });
      await ctx.runMutation(api.events.appendEvent, {
        debateId: args.debateId,
        type: "debate.completed",
        payload: JSON.stringify({
          winner: null,
          reason: "Max turns reached",
        }),
      });
      return false;
    }

    const turnsResult = await ctx.runQuery(api.turns.getDebateTurns, {
      debateId: args.debateId,
      limit: 500,
    });

    const speaker = debate.currentSpeaker;
    const debater = speaker === "A" ? debate.debaterA : debate.debaterB;
    const opponent = speaker === "A" ? debate.debaterB : debate.debaterA;

    const mappedTurns: Turn[] = turnsResult.turns.map((turn: any) => ({
      number: turn.number,
      speaker: turn.speaker,
      content: turn.content,
      reasoning: turn.reasoning,
      timestamp: new Date(turn.timestamp),
    }));

    let streamedContent = "";
    let result: { content: string; reasoning?: string } = { content: "" };
    const turnNumber = turnCount + 1;

    await ctx.runMutation(api.events.appendEvent, {
      debateId: args.debateId,
      type: "turn.started",
      payload: JSON.stringify({ speaker, turnNumber }),
    });

    const stream = streamDebateResponse(
      speaker,
      debater,
      debate.topic,
      mappedTurns,
      opponent.objective,
    );

    while (true) {
      const next = await stream.next();
      if (next.done) {
        result = next.value;
        break;
      }
      streamedContent += next.value;
      await ctx.runMutation(api.events.appendEvent, {
        debateId: args.debateId,
        type: "token",
        payload: JSON.stringify({ speaker, content: next.value }),
      });
    }

    const finalContent = result.content || streamedContent;

    await ctx.runMutation(api.turns.addTurn, {
      debateId: args.debateId,
      number: turnNumber,
      speaker,
      content: finalContent,
      reasoning: result.reasoning,
    });
    await ctx.runMutation(api.events.appendEvent, {
      debateId: args.debateId,
      type: "turn.completed",
      payload: JSON.stringify({ speaker, fullContent: finalContent }),
    });

    const withCurrentTurn: Turn[] = [
      ...mappedTurns,
      {
        number: turnCount + 1,
        speaker,
        content: finalContent,
        reasoning: result.reasoning,
        timestamp: new Date(),
      },
    ];

    if (checkForAgreement(finalContent)) {
      await ctx.runMutation(api.debates.updateDebate, {
        id: args.debateId,
        updates: {
          status: "completed",
          winner: speaker,
        },
      });
      await ctx.runMutation(api.events.appendEvent, {
        debateId: args.debateId,
        type: "debate.completed",
        payload: JSON.stringify({
          winner: speaker,
          reason: "Agreement detected",
        }),
      });
      return false;
    }

    if (checkForCircularArgument(withCurrentTurn)) {
      await ctx.runMutation(api.debates.updateDebate, {
        id: args.debateId,
        updates: {
          status: "completed",
          winner: "draw",
        },
      });
      await ctx.runMutation(api.events.appendEvent, {
        debateId: args.debateId,
        type: "debate.completed",
        payload: JSON.stringify({
          winner: "draw",
          reason: "Circular argument detected",
        }),
      });
      return false;
    }

    await ctx.runMutation(api.debates.updateDebate, {
      id: args.debateId,
      updates: {
        currentSpeaker: speaker === "A" ? "B" : "A",
      },
    });

    return true;
  },
});

export const startDebate = action({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.debates.updateDebateStatus, {
      id: args.debateId,
      status: "running",
    });
    await ctx.runMutation(api.events.appendEvent, {
      debateId: args.debateId,
      type: "debate.started",
      payload: JSON.stringify({ debateId: args.debateId }),
    });

    let keepRunning = true;
    while (keepRunning) {
      keepRunning = await ctx.runAction(api.debateEngine.runDebateTurn, {
        debateId: args.debateId,
      });

      const updated = await ctx.runQuery(api.debates.getDebate, {
        id: args.debateId,
      });

      if (!updated || updated.status !== "running") {
        break;
      }
    }

    return true;
  },
});
