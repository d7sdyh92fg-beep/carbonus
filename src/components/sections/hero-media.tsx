import { useEffect, useRef, useState } from "react";
import heroPoster from "@/assets/hero-druskininkai-poster.jpg";

/**
 * HeroMedia — subtle background video with poster fallback.
 *
 * Replace the placeholder <source> URLs below with real Carbonus footage:
 *   /hero/carbonus-druskininkai.webm  (desktop, ~1920x1080, 5–7s loop, <2 MB)
 *   /hero/carbonus-druskininkai.mp4   (h264 fallback)
 *   /hero/carbonus-druskininkai-mobile.webm  (720p mobile version, <800 KB)
 *   /hero/carbonus-druskininkai-mobile.mp4
 *
 * The poster image is already in place and will be shown until the video
 * loads, or permanently for `prefers-reduced-motion` users.
 */
export function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-primary-dark">
      {/* Poster (always rendered as base layer for instant paint / LCP) */}
      <img
        src={heroPoster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1088}
        draggable={false}
      />

      {/* Optional video overlay — hidden if user prefers reduced motion */}
      {!reducedMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroPoster}
          onCanPlay={(e) => e.currentTarget.setAttribute("data-ready", "true")}
        >
          {/* TODO: replace these placeholder paths with real Carbonus footage */}
          <source
            src="/hero/carbonus-druskininkai-mobile.webm"
            type="video/webm"
            media="(max-width: 768px)"
          />
          <source
            src="/hero/carbonus-druskininkai-mobile.mp4"
            type="video/mp4"
            media="(max-width: 768px)"
          />
          <source src="/hero/carbonus-druskininkai.webm" type="video/webm" />
          <source src="/hero/carbonus-druskininkai.mp4" type="video/mp4" />
        </video>
      )}

      {/* Contrast overlays: strong left-to-right darkening so left copy is legible while the right side of the scene stays visible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(3, 24, 17, 0.88) 0%, rgba(3, 24, 17, 0.62) 48%, rgba(3, 24, 17, 0.24) 100%)",
        }}
      />
      {/* Bottom fade to protect the trust bar */}
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, rgba(3, 24, 17, 0) 0%, rgba(3, 24, 17, 0.7) 100%)",
        }}
      />

    </div>
  );
}
