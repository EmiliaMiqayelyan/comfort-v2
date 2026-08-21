"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { useUiStore } from "@/stores";
import { BrandLogo } from "@/components/atoms/brand-logo";

export function LoadingScreen() {
  const { loadingScreen, setLoadingScreen } = useUiStore();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setLoadingScreen(false), reduceMotion ? 200 : 1400);
    return () => clearTimeout(t);
  }, [reduceMotion, setLoadingScreen]);

  if (!loadingScreen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-comfort-ink text-comfort-sand"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => undefined}
    >
      <div className="text-center">
        <motion.div
          className="mx-auto mb-6"
          animate={reduceMotion ? undefined : { scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <BrandLogo heightClassName="h-20" className="mx-auto" />
        </motion.div>
        <div className="mx-auto mt-8 h-px w-40 overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-accent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
