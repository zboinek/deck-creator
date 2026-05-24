import { NextRequest, NextResponse } from "next/server";
import { navigateTo, getSubscriberCount } from "@/lib/session-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { slide, token } = body;

    if (typeof slide !== "number" || typeof token !== "string") {
      return NextResponse.json(
        { error: "slide (number) and token (string) are required" },
        { status: 400 }
      );
    }

    const success = navigateTo(code, token, slide);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid session or token" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, viewers: getSubscriberCount(code) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
