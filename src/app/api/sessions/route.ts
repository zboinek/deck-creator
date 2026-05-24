import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const { code, token } = createSession(slug);
    return NextResponse.json({ code, token });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
