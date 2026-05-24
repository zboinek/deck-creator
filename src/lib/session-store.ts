const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

interface Session {
  code: string;
  slug: string;
  hostToken: string;
  currentSlide: number;
  createdAt: number;
  subscribers: Set<ReadableStreamDefaultController>;
}

const sessions = new Map<string, Session>();

function generateCode(): string {
  let code: string;
  do {
    code = Array.from({ length: CODE_LENGTH }, () =>
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join("");
  } while (sessions.has(code));
  return code;
}

function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

export function createSession(slug: string): { code: string; token: string } {
  const code = generateCode();
  const hostToken = generateToken();

  sessions.set(code, {
    code,
    slug,
    hostToken,
    currentSlide: 0,
    createdAt: Date.now(),
    subscribers: new Set(),
  });

  return { code, token: hostToken };
}

export function getSession(code: string): { slug: string; currentSlide: number } | null {
  const session = sessions.get(code.toUpperCase());
  if (!session) return null;
  return { slug: session.slug, currentSlide: session.currentSlide };
}

export function getSubscriberCount(code: string): number {
  const session = sessions.get(code.toUpperCase());
  return session ? session.subscribers.size : 0;
}

export function navigateTo(
  code: string,
  token: string,
  slide: number
): boolean {
  const session = sessions.get(code.toUpperCase());
  if (!session || session.hostToken !== token) return false;

  session.currentSlide = slide;

  const payload = `data: ${JSON.stringify({ slide, viewers: session.subscribers.size })}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(payload);

  for (const controller of session.subscribers) {
    try {
      controller.enqueue(encoded);
    } catch {
      session.subscribers.delete(controller);
    }
  }

  return true;
}

export function subscribe(
  code: string,
  controller: ReadableStreamDefaultController
): boolean {
  const session = sessions.get(code.toUpperCase());
  if (!session) return false;
  session.subscribers.add(controller);
  return true;
}

export function unsubscribe(
  code: string,
  controller: ReadableStreamDefaultController
): void {
  const session = sessions.get(code.toUpperCase());
  if (session) {
    session.subscribers.delete(controller);
  }
}

export function endSession(code: string, token: string): boolean {
  const session = sessions.get(code.toUpperCase());
  if (!session || session.hostToken !== token) return false;

  const payload = `data: ${JSON.stringify({ ended: true })}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(payload);

  for (const controller of session.subscribers) {
    try {
      controller.enqueue(encoded);
      controller.close();
    } catch {
      // already closed
    }
  }

  sessions.delete(code.toUpperCase());
  return true;
}

function cleanup() {
  const now = Date.now();
  for (const [code, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      for (const controller of session.subscribers) {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
      sessions.delete(code);
    }
  }
}

setInterval(cleanup, 60 * 1000);
