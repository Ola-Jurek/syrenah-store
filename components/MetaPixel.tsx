"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasMarketingConsent } from "@/components/CookieBanner";
import { META_PIXEL_ID, trackMetaEvent } from "@/lib/meta-client";

export function MetaPixel() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasMarketingConsent());
    sync();
    window.addEventListener("cookies-accepted", sync);
    return () => window.removeEventListener("cookies-accepted", sync);
  }, []);

  useEffect(() => {
    if (!enabled || !META_PIXEL_ID) return;
    trackMetaEvent("PageView");
  }, [enabled, pathname]);

  return null;
}
