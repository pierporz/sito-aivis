import { qs } from "./utils";

/**
 * Spotlight lime che segue il cursore: aggiorna --mx/--my sul layer .cursor-glow.
 * Attivo solo su dispositivi con puntatore fine (desktop) e senza reduced-motion.
 * Usa un rAF per throttlare gli aggiornamenti e restare a 60fps.
 */
export function initPointerFx(): void {
  const glow = qs("[data-cursor-glow]");
  if (!glow) return;

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduced) return;

  let x = -100;
  let y = -100;
  let raf = 0;

  const paint = () => {
    raf = 0;
    glow.style.setProperty("--mx", `${x}px`);
    glow.style.setProperty("--my", `${y}px`);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    },
    { passive: true }
  );
}
