import { gsap } from "gsap";

import { qs, BG } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 3 — L'assenza. Su fondo (ormai) nero, entra la typography gigante
 * "Il tuo brand non c'era." e sotto, in mono lime, "E nessuno te l'ha detto."
 */
export function initAbsence(ctx: SceneContext): void {
  const section = qs("#scene-absence");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const title = qs("[data-absence-title]");
  const sub = qs("[data-absence-sub]");
  if (!section || !pin || !title || !sub) return;

  // Reduced e mobile: stato finale leggibile (mobile con reveal leggero)
  if (ctx.reduced || !ctx.isDesktop) {
    gsap.set([title, sub], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [title, sub], { stagger: 0.12 });
    return;
  }

  gsap.set(title, { opacity: 0, y: 40 });
  gsap.set(sub, { opacity: 0, y: 20 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=140%",
      pin,
      scrub: 0.6,
    },
  });

  // Crossfade dello sfondo chiaro → nero, sincronizzato con l'entrata del titolo
  if (ctx.bg) {
    tl.to(ctx.bg, { backgroundColor: BG.dark, duration: 1, ease: "none" }, 0);
  }

  tl.to(title, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.15)
    .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
    .to({}, { duration: 0.6 });
}
