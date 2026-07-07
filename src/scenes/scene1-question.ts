import { gsap } from "gsap";

import { qs, qsa } from "../lib/utils";
import type { SceneContext } from "../lib/utils";

const QUESTION = "qual è la migliore macchina da caffè espresso?";

/**
 * SCENA 1 (la domanda) + SCENA 2 (la risposta) — condividono la stessa finestra
 * chat pinnata. Legato allo scroll: la domanda si digita lettera per lettera,
 * poi i 5 competitor appaiono riga per riga, infine una riga resta vuota.
 */
export function initQuestionAnswer(ctx: SceneContext): void {
  const section = qs("#scene-question");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const typed = qs("[data-typed]");
  const chat = qs("[data-chat]");
  const brand = qs("[data-question-brand]");
  const prompts = qs("[data-prompts]");
  const items = qsa("[data-answer-item], [data-answer-empty]");
  if (!section || !pin || !typed || !chat) return;

  // Stato finale statico per reduced-motion o mobile senza pin
  if (ctx.reduced || !ctx.isDesktop) {
    typed.textContent = QUESTION;
    gsap.set(items, { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnScroll(section);
    return;
  }

  gsap.set(items, { opacity: 0, y: 6 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=320%",
      pin,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });

  // Parallasse: il campo di prompt sfila verso l'alto per tutta la scena, mentre
  // i singoli frammenti continuano la loro deriva (animazione CSS sui figli)
  if (prompts) {
    tl.to(prompts, { yPercent: -14, ease: "none", duration: 8 }, 0);
  }

  // Fase 1 — digitazione carattere per carattere
  const state = { chars: 0 };
  tl.to(state, {
    chars: QUESTION.length,
    duration: 3,
    ease: "none",
    onUpdate: () => {
      typed.textContent = QUESTION.slice(0, Math.round(state.chars));
    },
  });

  // Breve pausa "di riflessione"
  tl.to({}, { duration: 0.5 });

  // Fase 2 — i competitor appaiono uno alla volta
  tl.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: 0.5,
    ease: "power2.out",
  });

  // Uscita: la chat si rimpicciolisce e sfuma verso la scena dell'assenza,
  // insieme al wordmark e ai frammenti di prompt
  tl.to(chat, { scale: 0.9, opacity: 0.12, duration: 1, ease: "power2.in" }, "+=0.6");
  if (brand) tl.to(brand, { opacity: 0, y: -12, duration: 1, ease: "power2.in" }, "<");
  if (prompts) tl.to(prompts, { opacity: 0, duration: 0.8, ease: "power2.in" }, "<");
}

/** Su mobile: rivela i competitor quando la chat entra nel viewport, senza pin. */
function revealOnScroll(section: Element): void {
  const items = qsa("[data-answer-item], [data-answer-empty]", section);
  gsap.set(items, { opacity: 0, y: 8 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: { trigger: section, start: "top 55%" },
  });
}
