"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackView } from "@/lib/track";

export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackView(pathname);
  }, [pathname]);
  return null;
}
