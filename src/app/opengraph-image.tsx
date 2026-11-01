import { socialImage, socialImageSize } from "@/components/SocialImage";

export const alt = "Deck Creator — prezentacje, podcasty i artykuły";
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return socialImage({ title: "Pomysły. Wykłady. Wiedza.", description: "Prezentacje, podcasty i artykuły o sztucznej inteligencji — od podstaw po budowanie agentów.", label: "PREZENTACJE / PODCASTY" });
}
