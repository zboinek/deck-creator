import { notFound } from "next/navigation";
import { connection } from "next/server";
import { loadArticle } from "@/lib/article-loader";
import { socialImage, socialImageSize } from "@/components/SocialImage";

export const alt = "Podcast i artykuł — Deck Creator";
export const size = socialImageSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const article = await loadArticle((await params).slug);
  if (!article) notFound();
  return socialImage({ title: article.meta.title, description: article.meta.description || "Posłuchaj podcastu i przeczytaj artykuł.", label: `${article.meta.series || "PODCAST"} / AUDIO + ARTYKUŁ` });
}
