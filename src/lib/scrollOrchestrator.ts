import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { qs, BG } from "./utils";
import type { SceneContext } from "./utils";
import { initContext } from "./context";
import { initPointerFx } from "./pointerFx";

import { initQuestionAnswer } from "../scenes/scene1-question";
import { initAbsence } from "../scenes/scene3-absence";
import { initFunnel } from "../scenes/scene4-funnel";
import { initMeasure } from "../scenes/scene5-measure";
import { initNumbers } from "../scenes/scene6-numbers";
import { initAfter } from "../scenes/scene7-after";
import { initCta } from "../scenes/scene8-cta";

/**
 * Orchestrazione centrale: sfondo globale, contesto (navbar + progress) e
 * inizializzazione di ogni scena. Usa gsap.matchMedia per adattare pinning e
 * animazioni a desktop / mobile / prefers-reduced-motion, con cleanup automatico.
 */
export function initOrchestrator(): void {
  const bg = qs("[data-bg]");
  const progressFill = qs("[data-progress-fill]");

  const reducedGlobal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Contesto navbar/progress: gestito una sola volta via IntersectionObserver,
  // indipendente dal breakpoint (posizioni sempre corrette anche col pinning).
  initContext(reducedGlobal);
  initPointerFx();

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
      const ctx: SceneContext = { reduced: conds.reduced, isDesktop: conds.isDesktop, bg };

      // Lo sfondo globale parte chiaro; il crossfade tra scene è animato dentro
      // le timeline pinnate di scena 3 (→nero) e scena 7 (→lime→nero), così le
      // posizioni restano corrette anche col pinning.
      if (!ctx.reduced && bg) {
        gsap.set(bg, { backgroundColor: BG.light });
      }

      // --- Progress indicator: riempimento sull'intera pagina ---
      if (progressFill) {
        if (ctx.reduced) {
          gsap.set(progressFill, { scaleY: 1 });
        } else {
          gsap.to(progressFill, {
            scaleY: 1,
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

      // --- Scene ---
      initQuestionAnswer(ctx);
      initAbsence(ctx);
      initFunnel(ctx);
      initMeasure(ctx);
      initNumbers(ctx);
      initAfter(ctx);
      initCta(ctx);

      ScrollTrigger.refresh();
    }
  );
}
