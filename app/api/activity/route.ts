import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { ACTIVITY_FILE, activityAfter, readActivity, type ActivityEvent } from "@/lib/store/activity";
import { defaultStore } from "@/lib/store/fs-store";

export const dynamic = "force-dynamic";

// On connect, replay what agents did in the last few seconds so a reload during a session still shows it.
const REPLAY_MS = 15_000;
const POLL_MS = 200;
const HEARTBEAT_MS = 15_000;

// Server-sent events for agent activity. The MCP server appends to the log; this streams new entries.
export function GET(request: Request) {
  if (process.env.KB_LOCAL !== "1") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const root = defaultStore().root;
  const file = path.join(root, ACTIVITY_FILE);
  const encoder = new TextEncoder();
  let poll: ReturnType<typeof setInterval> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let cursor: { id: string; at: number } | null = null;
      let stamp = "";
      const send = (events: ActivityEvent[]) => {
        for (const event of events) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        const last = events.at(-1);
        if (last) cursor = { id: last.id, at: last.at };
      };
      const check = () => {
        let next = "";
        try {
          const stat = fs.statSync(file);
          next = `${stat.size}:${stat.mtimeMs}`;
        } catch {
          return;
        }
        if (next === stamp) return;
        stamp = next;
        send(activityAfter(readActivity(root), cursor));
      };
      const all = readActivity(root);
      const last = all.at(-1);
      cursor = last ? { id: last.id, at: last.at } : null;
      send(all.filter((event) => event.at > Date.now() - REPLAY_MS));
      if (last) cursor = { id: last.id, at: last.at };
      try {
        const stat = fs.statSync(file);
        stamp = `${stat.size}:${stat.mtimeMs}`;
      } catch {
        /* No agent has written yet. */
      }
      controller.enqueue(encoder.encode(": connected\n\n"));
      poll = setInterval(check, POLL_MS);
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), HEARTBEAT_MS);
      request.signal.addEventListener("abort", () => {
        clearInterval(poll);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* Already closed. */
        }
      });
    },
    cancel() {
      clearInterval(poll);
      clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
