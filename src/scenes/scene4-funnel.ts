import { gsap } from "gsap";

import { qs, qsa } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 4 — Il nuovo funnel, in due fasi legate allo scroll:
 *  1. appaiono insieme i 10 link SERP (righe azzurre/grigie) e la dicitura
 *     "Non ci sono più 10 posizioni.";
 *  2. i risultati Google si CONGELANO in una lastra di vetro che poi si spacca:
 *     le schegge partono verso l'esterno e, dietro, emergono la bolla di risposta
 *     AI e la dicitura "C'è una risposta sola. O ci sei, o non esisti.".
 */
export function initFunnel(ctx: SceneContext): void {
  const section = qs("#scene-funnel");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const stage = qs<HTMLElement>("[data-funnel-stage]", section ?? undefined);
  const copy = qs("[data-funnel-copy]", section ?? undefined);
  const serpItems = qsa("[data-serp-item]", section ?? undefined);
  const serpCopy = qs("[data-funnel-serp-copy]", section ?? undefined);
  const bubble = qs("[data-bubble]", section ?? undefined);
  const bubbleCopy = qs("[data-funnel-bubble-copy]", section ?? undefined);
  const bubbleLines = qsa("[data-funnel-bubble-copy] > *", section ?? undefined);
  const googleLabel = qs("[data-engine-google]", section ?? undefined);
  const aiLabel = qs("[data-engine-ai]", section ?? undefined);
  if (!section || !pin || !stage || !bubble || serpItems.length === 0) return;

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

  // Genera le schegge di vetro sopra i risultati (solo desktop, movimento pieno)
  const { shards, flash } = buildShatter(stage);

  // Sovrappone i due gruppi di copy così si alternano nello stesso punto
  copy?.classList.add("is-stacked");

  gsap.set(serpItems, { opacity: 0, y: 10 });
  gsap.set([serpCopy, googleLabel], { opacity: 0, y: 16 });
  gsap.set(bubble, { opacity: 0, scale: 0.7 });
  gsap.set(bubbleLines, { opacity: 0, y: 16 });
  // aiLabel è centrata via transform CSS: animiamo solo l'opacità
  gsap.set(aiLabel, { opacity: 0 });
  // Le schegge partono invisibili, ancora "assemblate" nella loro posizione
  gsap.set(shards, { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 });
  gsap.set(flash, { opacity: 0 });

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
  tl.to({}, { duration: 0.8 }); // respiro sui risultati

  // Fase 2a — i risultati si congelano dietro una lastra di vetro (le schegge
  // appaiono ancora unite, i link svaniscono sotto)
  tl.to(shards, {
    opacity: 0.92,
    duration: 0.25,
    stagger: { each: 0.008, from: "center" },
  });
  tl.to(serpItems, { opacity: 0, duration: 0.3, ease: "power1.in" }, "<0.05");
  tl.to([serpCopy, googleLabel], { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, "<");

  // Fase 2b — l'impatto: flash secco e le schegge partono verso l'esterno
  tl.to(flash, { opacity: 1, duration: 0.06, ease: "power2.out" });
  tl.to(flash, { opacity: 0, duration: 0.35, ease: "power2.in" });
  tl.to(
    shards,
    {
      x: (_i, t) => Number((t as HTMLElement).dataset.dx),
      y: (_i, t) => Number((t as HTMLElement).dataset.dy),
      rotate: (_i, t) => Number((t as HTMLElement).dataset.rot),
      opacity: 0,
      scale: 0.55,
      duration: 1.0,
      ease: "power3.out",
      stagger: { each: 0.006, from: "center" },
    },
    "<0.02",
  );

  // Fase 3 — dietro il vetro che vola via emergono etichetta "chatgpt", bolla e dicitura
  tl.to(aiLabel, { opacity: 1, duration: 0.5, ease: "power3.out" }, "<0.15");
  tl.to(bubble, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, "<");
  tl.to(bubbleLines, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: "power3.out" }, "<0.1");

  tl.to({}, { duration: 0.6 });
}

/**
 * Costruisce la "lastra" di vetro sopra lo stage: una griglia di celle, ognuna
 * spezzata in due triangoli (clip-path). Ogni scheggia riceve una direzione di
 * fuga radiale (dal centro verso il proprio baricentro) più un po' di gravità e
 * rotazione, memorizzate in data-attribute per la timeline scrubbata.
 */
function buildShatter(stage: HTMLElement): { shards: HTMLElement[]; flash: HTMLElement } {
  const container = document.createElement("div");
  container.className = "shatter";
  container.setAttribute("aria-hidden", "true");

  const flash = document.createElement("span");
  flash.className = "shatter__flash";
  container.appendChild(flash);

  const cols = 3;
  const rows = 4;
  const rect = stage.getBoundingClientRect();
  const diag = Math.hypot(rect.width, rect.height) || 480;
  const jitter = () => Math.random() - 0.5;

  const shards: HTMLElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = (c / cols) * 100;
      const top = (r / rows) * 100;
      const w = 100 / cols;
      const h = 100 / rows;
      // Due triangoli complementari per cella → tassellano la lastra
      const tris = [
        { clip: "polygon(0 0, 100% 0, 0 100%)", cx: 0.3, cy: 0.3 },
        { clip: "polygon(100% 0, 100% 100%, 0 100%)", cx: 0.66, cy: 0.66 },
      ];
      for (const t of tris) {
        const el = document.createElement("span");
        el.className = "shatter__shard";
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;
        el.style.width = `${w}%`;
        el.style.height = `${h}%`;
        el.style.clipPath = t.clip;

        // Frazione (0..1) del baricentro della scheggia sullo stage
        const fx = (left + w * t.cx) / 100;
        const fy = (top + h * t.cy) / 100;
        const dirX = fx - 0.5;
        const dirY = fy - 0.5;
        const dist = diag * (1.1 + Math.random() * 0.8);
        const dx = dirX * dist + jitter() * diag * 0.35;
        const dy = dirY * dist + jitter() * diag * 0.35 + diag * 0.15; // gravità
        el.dataset.dx = dx.toFixed(1);
        el.dataset.dy = dy.toFixed(1);
        el.dataset.rot = (jitter() * 180).toFixed(1);

        container.appendChild(el);
        shards.push(el);
      }
    }
  }

  stage.appendChild(container);
  return { shards, flash };
}
