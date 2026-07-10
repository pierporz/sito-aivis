import { gsap } from "gsap";

import { qs, qsa } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 4 — Il nuovo funnel, in due fasi legate allo scroll:
 *  1. appaiono insieme i 10 link SERP (righe azzurre/grigie) e la dicitura
 *     "Non ci sono più 10 posizioni.";
 *  2. i risultati Google si dissolvono e, al loro posto, emergono l'etichetta
 *     "chatgpt", la bolla di risposta AI e la dicitura "C'è una risposta sola.
 *     O ci sei, o non esisti." — una transizione netta, senza effetti gimmick.
 */
export function initFunnel(ctx: SceneContext): void {
  const section = qs("#scene-funnel");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const copy = qs("[data-funnel-copy]", section ?? undefined);
  const serpItems = qsa("[data-serp-item]", section ?? undefined);
  const serpCopy = qs("[data-funnel-serp-copy]", section ?? undefined);
  const bubble = qs("[data-bubble]", section ?? undefined);
  const bubbleCopy = qs("[data-funnel-bubble-copy]", section ?? undefined);
  const bubbleLines = qsa("[data-funnel-bubble-copy] > *", section ?? undefined);
  const googleLabel = qs("[data-engine-google]", section ?? undefined);
  const aiLabel = qs("[data-engine-ai]", section ?? undefined);
  if (!section || !pin || !bubble || serpItems.length === 0) return;

  // Reduced e mobile: stato leggibile con tutti i testi + la bolla già formata
  if (ctx.reduced || !ctx.isDesktop) {
    gsap.set(serpItems, { opacity: 0 });
    gsap.set(bubble, { opacity: 1, scale: 1 });
    gsap.set(aiLabel, { opacity: 1 });
    gsap.set([serpCopy, bubbleCopy], { opacity: 1, y: 0 });
    if (!ctx.reduced) {
      revealOnEnter(section, bubble, { y: 12 });
      revealOnEnter(section, [serpCopy, ...bubbleLines], { stagger: 0.12 });
    }
    return;
  }

  // Sovrappone i due gruppi di copy così si alternano nello stesso punto
  copy?.classList.add("is-stacked");

  gsap.set(serpItems, { opacity: 0, y: 10 });
  gsap.set([serpCopy, googleLabel], { opacity: 0, y: 16 });
  gsap.set(bubble, { opacity: 0, scale: 0.96, y: 12 });
  gsap.set(bubbleLines, { opacity: 0, y: 16 });
  // aiLabel è centrata via transform CSS: animiamo solo l'opacità
  gsap.set(aiLabel, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=240%",
      pin,
      scrub: 0.6,
    },
  });

  // Fase 1 — etichetta "google", SERP e "Non ci sono più 10 posizioni" insieme
  tl.to(googleLabel, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
  tl.to(serpItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power2.out" }, "<");
  tl.to(serpCopy, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "<");
  tl.to({}, { duration: 0.9 }); // respiro sui risultati

  // Fase 2 — i risultati si dissolvono dall'alto verso il basso, resta il vuoto
  tl.to(serpItems, {
    opacity: 0,
    y: -8,
    duration: 0.5,
    stagger: { each: 0.05, from: "start" },
    ease: "power2.in",
  });
  tl.to([serpCopy, googleLabel], { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, "<");

  // Fase 3 — emergono etichetta "chatgpt", bolla di risposta e dicitura
  tl.to(aiLabel, { opacity: 1, duration: 0.5, ease: "power3.out" }, "+=0.1");
  tl.to(bubble, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<");
  tl.to(bubbleLines, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: "power3.out" }, "<0.15");

  tl.to({}, { duration: 0.6 });
}
