import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { qs } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { initEraContext } from "./era";
import {
  initSerp,
  initRace,
  initShift,
  initAnswer,
  initInvisible,
  initAivis,
  initProof,
  initCta,
} from "./scenes";

/**
 * Orchestrazione della seconda pagina "Il funnel invisibile". Stessa impalcatura
 * della home (gsap.matchMedia per desktop / mobile / reduced, progress su tutta la
 * pagina), ma con lo sfondo e i colori guidati dalla variabile globale --e invece
 * che da un crossfade a tre colori.
 */
export function initFunnelOrchestrator(): void {
  const topbarFill = qs("[data-topbar-fill]");
  const reducedGlobal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Contesto d'epoca (font, wordmark, --e su mobile/reduced): una sola volta.
  initEraContext(reducedGlobal);

  const mm = gsap.matchMedia();

  mm.add(
    {
      reduced: "(prefers-reduced-motion: reduce)",
      motion: "(prefers-reduced-motion: no-preference)",
      isDesktop: "(min-width: 768px)",
    },
    (context) => {
      const conds = context.conditions as {
        reduced: boolean;
        motion: boolean;
        isDesktop: boolean;
      };
      // bg non serve qui (il colore è guidato da --e), ma teniamo il tipo condiviso.
      const ctx: SceneContext = { reduced: conds.reduced, isDesktop: conds.isDesktop, bg: null };

      // --- Progress bar orizzontale in alto (si colora da sola via --accent) ---
      if (topbarFill) {
        if (ctx.reduced) {
          gsap.set(topbarFill, { scaleX: 1 });
        } else {
          gsap.to(topbarFill, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.documentElement,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });
        }
      }

      // --- Scene, in ordine narrativo ---
      initSerp(ctx);
      initRace(ctx);
      initShift(ctx);
      initAnswer(ctx);
      initInvisible(ctx);
      initAivis(ctx);
      initProof(ctx);
      initCta(ctx);

      ScrollTrigger.refresh();
    }
  );
}
