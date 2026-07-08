import { gsap } from "gsap";

import { qs, qsa } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 5 — La misura. Appare il wordmark "citAIto" con la sua descrizione e i tre
 * step numerati (01 / 02 / 03) si "accendono" in sequenza. La trama di punti di
 * sfondo è globale (vedi .dotfield), attiva su tutte le scene scure.
 */
export function initMeasure(ctx: SceneContext): void {
  const section = qs("#scene-measure");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const wordmark = qs("[data-measure-wordmark]", section ?? undefined);
  const steps = qsa("[data-step]", section ?? undefined);
  if (!section || !pin || !wordmark || steps.length === 0) return;

  // Reduced e mobile: testi già visibili (mobile con reveal leggero)
  if (ctx.reduced || !ctx.isDesktop) {
    gsap.set([wordmark, ...steps], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [wordmark, ...steps], { stagger: 0.1 });
    return;
  }

  gsap.set(wordmark, { opacity: 0, y: 24 });
  gsap.set(steps, { opacity: 0.15, y: 20 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=260%",
      pin,
      scrub: 0.6,
    },
  });

  tl.to(wordmark, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });

  // Ogni step si "accende" in sequenza
  steps.forEach((step) => {
    tl.to(step, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.35");
  });

  tl.to({}, { duration: 0.5 });
}
