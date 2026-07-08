import { gsap } from "gsap";

import { qs } from "../lib/utils";
import type { SceneContext } from "../lib/utils";

/**
 * COVER — schermata d'apertura. Il wordmark e l'invito a scorrere salgono e
 * sfumano man mano che si entra nella prima scena, legati allo scroll. Su
 * mobile / reduced-motion la cover resta statica e scorre via nativamente.
 */
export function initCover(ctx: SceneContext): void {
  const cover = qs("#cover-intro");
  const inner = qs("[data-cover-inner]", cover ?? undefined);
  if (!cover || !inner || ctx.reduced || !ctx.isDesktop) return;

  gsap.to(inner, {
    yPercent: -18,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: cover,
      start: "top top",
      end: "bottom top",
      scrub: 0.5,
    },
  });
}
