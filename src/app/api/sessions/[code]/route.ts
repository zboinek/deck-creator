import { NextRequest, NextResponse } from "next/server";
import { getSession, getSubscriberCount, endSession } from "@/lib/session-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = getSession(code);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: session.slug,
    currentSlide: session.currentSlide,
    viewers: getSubscriberCount(code),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const success = endSession(code, token);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid session or token" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
