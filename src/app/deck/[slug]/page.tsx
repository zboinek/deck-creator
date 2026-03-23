import { notFound } from "next/navigation";
import { Suspense } from "react";
import { loadDeck } from "@/lib/deck-loader";
import { DeckPresentation } from "@/components/DeckPresentation";

interface DeckPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { slug } = await params;
  const deck = await loadDeck(slug);

  if (!deck || deck.slides.length === 0) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: "var(--surface-inverse)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Loading deck&hellip;
        </div>
      }
    >
      <DeckPresentation meta={deck.meta} slides={deck.slides} slug={slug} />
    </Suspense>
  );
}
