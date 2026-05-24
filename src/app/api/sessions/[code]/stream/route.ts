import { NextRequest } from "next/server";
import { getSession, subscribe, unsubscribe } from "@/lib/session-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = getSession(code);

  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let controllerRef: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      subscribe(code, controller);

      const init = `data: ${JSON.stringify({ slide: session.currentSlide, init: true })}\n\n`;
      controller.enqueue(new TextEncoder().encode(init));
    },
    cancel() {
      if (controllerRef) {
        unsubscribe(code, controllerRef);
      }
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
