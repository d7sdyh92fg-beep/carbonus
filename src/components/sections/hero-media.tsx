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

      {/* Contrast overlays: dark from bottom + slight vignette for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(147 60% 8% / 0.55) 0%, hsl(147 60% 8% / 0.35) 40%, hsl(147 60% 8% / 0.75) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, hsl(147 60% 8% / 0) 0%, hsl(147 60% 8% / 0.35) 100%)",
        }}
      />
    </div>
  );
}
