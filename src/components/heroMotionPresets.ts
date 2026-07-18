import type { Variants } from "framer-motion";

export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.13,
    },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroBooking: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.987 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.92,
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
