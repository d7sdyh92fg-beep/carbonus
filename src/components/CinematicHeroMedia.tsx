import {
  RefObject,
  useEffect,
  useId,
  useMemo,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import "./cinematic-hero-media.css";

type LightTrigger = "intro" | "scroll" | "hybrid";

export type CinematicHeroMediaProps = {
  /** Reference to the containing hero section. */
  targetRef: RefObject<HTMLElement | null>;
  /** Clean background image only. Do not use an image with baked-in text or form fields. */
  src: string;
  alt?: string;
  className?: string;
  lightTrigger?: LightTrigger;
  /** 0.65–1.25 is the useful range. */
  intensity?: number;
};

type LeafDefinition = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  wave: number;
  rotate: number;
  depth: "far" | "mid" | "near";
  tone: "gold" | "amber" | "rust";
};

const LEAVES: LeafDefinition[] = [
  { left: 49, delay: 0.20, duration: 8.8, size: 18, drift: 74, wave: 28, rotate: 390, depth: "far", tone: "gold" },
  { left: 57, delay: 2.10, duration: 10.8, size: 15, drift: -62, wave: 40, rotate: -330, depth: "mid", tone: "amber" },
  { left: 65, delay: 0.90, duration: 9.7, size: 22, drift: 86, wave: 54, rotate: 470, depth: "near", tone: "gold" },
  { left: 72, delay: 3.40, duration: 11.8, size: 13, drift: -48, wave: 32, rotate: -270, depth: "far", tone: "rust" },
  { left: 79, delay: 1.35, duration: 8.9, size: 17, drift: -92, wave: 46, rotate: -420, depth: "mid", tone: "amber" },
  { left: 86, delay: 4.35, duration: 10.6, size: 20, drift: 58, wave: 36, rotate: 360, depth: "near", tone: "gold" },
  { left: 93, delay: 2.80, duration: 12.2, size: 12, drift: -72, wave: 28, rotate: -310, depth: "far", tone: "rust" },
  { left: 61, delay: 5.45, duration: 9.5, size: 16, drift: 78, wave: 42, rotate: 410, depth: "mid", tone: "amber" },
];

const DUST = [
  [41, 24, 2, 0.1], [44, 31, 1, 0.7], [47, 38, 2, 1.2], [50, 28, 1, 1.9],
  [53, 43, 2, 2.6], [55, 20, 1, 3.2], [58, 34, 1, 4.0], [46, 47, 1, 4.8],
  [51, 52, 2, 5.4], [56, 56, 1, 6.1], [43, 57, 1, 6.8], [59, 47, 1, 7.5],
] as const;

function Leaf({ leaf }: { leaf: LeafDefinition }) {
  const depthScale = leaf.depth === "near" ? 1.15 : leaf.depth === "far" ? 0.78 : 1;
  const blur = leaf.depth === "near" ? 0.2 : leaf.depth === "far" ? 1.15 : 0.55;

  return (
    <motion.span
      className={`chm-leaf chm-leaf--${leaf.tone}`}
      style={{
        left: `${leaf.left}%`,
        width: leaf.size * depthScale,
        height: leaf.size * 0.62 * depthScale,
        filter: `blur(${blur}px) drop-shadow(0 5px 8px rgba(0,0,0,.28))`,
      }}
      initial={{ x: 0, y: "-12vh", rotate: -18, rotateY: 0, opacity: 0 }}
      animate={{
        x: [0, leaf.wave, leaf.drift],
        y: ["-12vh", "38vh", "112vh"],
        rotate: [-18, leaf.rotate * 0.42, leaf.rotate],
        rotateY: [0, 78, 156, 238, 315],
        opacity: [0, 0.8, 0.72, 0],
      }}
      transition={{
        duration: leaf.duration,
        delay: leaf.delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.42, 0.82, 1],
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 40" focusable="false">
        <defs>
          <linearGradient id={`leaf-${leaf.tone}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".98" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".58" />
          </linearGradient>
        </defs>
        <path d="M3 21C14 2 44 0 61 18 48 39 19 43 3 21Z" fill={`url(#leaf-${leaf.tone})`} />
        <path d="M7 22c16-2 31-3 49-3" fill="none" stroke="rgba(83,39,10,.62)" strokeWidth="1.8" />
        <path d="M26 20 16 12m19 7 11-9m-2 10 10 7M25 22 14 31" fill="none" stroke="rgba(83,39,10,.32)" strokeWidth="1.2" />
      </svg>
    </motion.span>
  );
}

export default function CinematicHeroMedia({
  targetRef,
  src,
  alt = "Carbonus automobilis prie Druskininkų viešbučio auksinės valandos šviesoje",
  className = "",
  lightTrigger = "hybrid",
  intensity = 1,
}: CinematicHeroMediaProps) {
  const reducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const hoverLight = useMotionValue(0);
  const introLight = useMotionValue(reducedMotion ? 1 : 0);

  const smoothX = useSpring(pointerX, { stiffness: 72, damping: 24, mass: 0.42 });
  const smoothY = useSpring(pointerY, { stiffness: 72, damping: 24, mass: 0.42 });
  const smoothHover = useSpring(hoverLight, { stiffness: 90, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 0.52], [1.025, 1.055]);
  const mediaY = useTransform(scrollYProgress, [0, 0.52], [0, 15]);
  const pointerMediaX = useTransform(smoothX, [-1, 1], [-3.5, 3.5]);
  const pointerMediaY = useTransform(smoothY, [-1, 1], [-2.2, 2.2]);
  const scrollLight = useTransform(scrollYProgress, [0, 0.16, 0.34], [0, 0.82, 1]);
  const scrollReflection = useTransform(scrollYProgress, [0, 0.22], [0.62, 1]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.84], [1, 0.84]);

  const lightPower = useTransform(
    [introLight, scrollLight, smoothHover],
    ([intro, scroll, hover]) => {
      const introValue = lightTrigger === "scroll" ? 0 : Number(intro);
      const scrollValue = lightTrigger === "intro" ? 0 : Number(scroll);
      return Math.min(1.15, Math.max(introValue, scrollValue * 0.92, Number(hover) * 0.92));
    },
  );

  const darkenerOpacity = useTransform(lightPower, [0, 1], [0.48, 0]);
  const haloOpacity = useTransform(lightPower, [0, 1], [0, 0.92 * intensity]);
  const coreOpacity = useTransform(lightPower, [0, 1], [0.12, 1 * intensity]);
  const reflectionOpacity = useTransform(
    [lightPower, scrollReflection],
    ([light, reflection]) => Number(light) * Number(reflection) * 0.72 * intensity,
  );

  useEffect(() => {
    if (reducedMotion) {
      introLight.set(1);
      return;
    }
    if (lightTrigger === "scroll") return;

    const controls = animate(introLight, [0, 0, 1.08, 0.94, 1], {
      duration: 2.15,
      delay: 0.55,
      times: [0, 0.34, 0.72, 0.86, 1],
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [introLight, lightTrigger, reducedMotion]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || reducedMotion) return;

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = element.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
      pointerX.set(Math.max(-1, Math.min(1, x)));
      pointerY.set(Math.max(-1, Math.min(1, y)));

      // Hovering over the vehicle region adds only a subtle intensity increase.
      const carRegion = x > 0.08 && y > -0.45 && y < 0.55;
      hoverLight.set(carRegion ? 0.78 : 0);
    };
    const leave = () => {
      pointerX.set(0);
      pointerY.set(0);
      hoverLight.set(0);
    };

    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  }, [hoverLight, pointerX, pointerY, reducedMotion, targetRef]);

  const dust = useMemo(() => DUST, []);

  return (
    <motion.div
      className={`cinematic-hero-media ${className}`.trim()}
      aria-hidden={alt ? undefined : true}
      style={{
        opacity: sceneOpacity,
        x: reducedMotion ? 0 : pointerMediaX,
        y: reducedMotion ? 0 : pointerMediaY,
      }}
    >
      <motion.svg
        className="chm-scene"
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        initial={reducedMotion ? false : { scale: 1.045 }}
        animate={{ scale: 1.025 }}
        transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ scale: reducedMotion ? 1 : mediaScale, y: reducedMotion ? 0 : mediaY }}
      >
        <defs>
          <filter id={`${uid}-blur-small`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${uid}-blur-mid`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id={`${uid}-blur-wide`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="31" />
          </filter>
          <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffc777" stopOpacity=".42" />
            <stop offset=".36" stopColor="#f7a842" stopOpacity=".18" />
            <stop offset="1" stopColor="#f7a842" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-road`} cx="50%" cy="34%" r="62%">
            <stop offset="0" stopColor="#ff3826" stopOpacity=".72" />
            <stop offset=".35" stopColor="#e61f16" stopOpacity=".36" />
            <stop offset="1" stopColor="#e61f16" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-tail`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff3c26" stopOpacity=".6" />
            <stop offset=".38" stopColor="#ff2a18" stopOpacity="1" />
            <stop offset=".72" stopColor="#ff321f" stopOpacity="1" />
            <stop offset="1" stopColor="#ff4a30" stopOpacity=".62" />
          </linearGradient>
          <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#020806" stopOpacity=".48" />
            <stop offset=".55" stopColor="#020806" stopOpacity="0" />
          </linearGradient>
        </defs>

        <image href={src} x="0" y="0" width="1672" height="941" preserveAspectRatio="xMidYMid slice" />

        {/* Light atmospheric breathing around the sun. */}
        <motion.ellipse
          cx="690"
          cy="330"
          rx="305"
          ry="270"
          fill={`url(#${uid}-sun)`}
          filter={`url(#${uid}-blur-mid)`}
          initial={reducedMotion ? false : { opacity: 0.32, scale: 0.92 }}
          animate={reducedMotion ? { opacity: 0.32 } : { opacity: [0.28, 0.52, 0.36], scale: [0.92, 1.04, 0.98] }}
          transition={{ duration: 7.2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          style={{ transformOrigin: "690px 330px", mixBlendMode: "screen" }}
        />

        {/* Locally covers the already illuminated pixels until the power-up moment. */}
        <motion.g opacity={darkenerOpacity} style={{ mixBlendMode: "multiply" }} filter={`url(#${uid}-blur-small)`}>
          <path d="M1012 493 1052 496 1074 522 1058 561 1022 552 1041 519Z" fill="#030807" />
          <path d="M1434 497 1461 501 1472 533 1463 568 1443 562 1450 525Z" fill="#030807" />
          <path d="M1062 509H1429" stroke="#030807" strokeWidth="14" strokeLinecap="round" />
          <path d="M1222 411H1297" stroke="#030807" strokeWidth="8" strokeLinecap="round" />
        </motion.g>

        {/* Wide red halo. */}
        <motion.g opacity={haloOpacity} style={{ mixBlendMode: "screen" }} filter={`url(#${uid}-blur-wide)`}>
          <path d="M1012 493 1052 496 1074 522 1058 561 1022 552 1041 519Z" fill="#ff321e" />
          <path d="M1434 497 1461 501 1472 533 1463 568 1443 562 1450 525Z" fill="#ff321e" />
          <path d="M1062 509H1429" stroke="#ff2817" strokeWidth="17" strokeLinecap="round" />
          <path d="M1222 411H1297" stroke="#ff321e" strokeWidth="8" strokeLinecap="round" />
        </motion.g>

        {/* Mid glow. */}
        <motion.g opacity={haloOpacity} style={{ mixBlendMode: "screen" }} filter={`url(#${uid}-blur-mid)`}>
          <path d="M1012 493 1052 496 1074 522 1058 561 1022 552 1041 519Z" fill="#ff321e" />
          <path d="M1434 497 1461 501 1472 533 1463 568 1443 562 1450 525Z" fill="#ff321e" />
          <path d="M1062 509H1429" stroke="#ff2817" strokeWidth="10" strokeLinecap="round" />
        </motion.g>

        {/* Crisp light core. */}
        <motion.g opacity={coreOpacity} style={{ mixBlendMode: "screen" }}>
          <path d="M1012 493 1052 496 1074 522 1058 561 1022 552 1041 519Z" fill={`url(#${uid}-tail)`} />
          <path d="M1434 497 1461 501 1472 533 1463 568 1443 562 1450 525Z" fill={`url(#${uid}-tail)`} />
          <path d="M1062 509H1429" stroke={`url(#${uid}-tail)`} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M1222 411H1297" stroke="#ff3b27" strokeWidth="3.5" strokeLinecap="round" />
        </motion.g>

        {/* Wet-road reflection. */}
        <motion.g opacity={reflectionOpacity} style={{ mixBlendMode: "screen" }} filter={`url(#${uid}-blur-wide)`}>
          <ellipse cx="1260" cy="812" rx="255" ry="84" fill={`url(#${uid}-road)`} />
          <ellipse cx="1392" cy="875" rx="145" ry="44" fill={`url(#${uid}-road)`} opacity=".52" />
        </motion.g>
      </motion.svg>

      {!reducedMotion && (
        <>
          <div className="chm-dust" aria-hidden="true">
            {dust.map(([left, top, size, delay], index) => (
              <motion.i
                key={`${left}-${top}-${index}`}
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                animate={{
                  x: [0, 4, -2, 0],
                  y: [0, -13, -26],
                  opacity: [0, 0.58, 0],
                  scale: [0.8, 1.2, 0.85],
                }}
                transition={{ duration: 5.8 + (index % 4), delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>

          <div className="chm-leaves" aria-hidden="true">
            {LEAVES.map((leaf, index) => <Leaf leaf={leaf} key={`${leaf.left}-${index}`} />)}
          </div>

          <motion.div
            className="chm-road-shimmer"
            aria-hidden="true"
            animate={{ backgroundPositionX: ["0%", "100%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      <div className="chm-vignette" aria-hidden="true" />
    </motion.div>
  );
}
