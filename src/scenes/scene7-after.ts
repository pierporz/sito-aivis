import { gsap } from "gsap";

import { qs, qsa, renderKpiValue, BG } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 7 — Il dopo. Su fondo lime pieno (unico momento di colore del sito):
 * appare prima la frase "Questo è quello che succede quando sai dove
 * intervenire.", poi i KPI risalgono verso i valori migliorati (44→83, 3,5→1,7,
 * 9→2). In uscita il contenuto sfuma e lo sfondo torna nero per la CTA.
 */
export function initAfter(ctx: SceneContext): void {
  const section = qs("#scene-after");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const kpis = qsa("[data-kpi-after]", section ?? undefined);
  const line = qs("[data-after-line]", section ?? undefined);
  const brand = qs("[data-after-brand]", section ?? undefined);
  if (!section || !pin || kpis.length === 0) return;

  // Reduced e mobile: valori già migliorati e frase visibile
  if (ctx.reduced || !ctx.isDesktop) {
    kpis.forEach((kpi) => renderKpiValue(kpi, num(kpi, "to")));
    gsap.set([line, brand], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [line, brand, ...kpis], { stagger: 0.12, start: "top 80%" });
    return;
  }

  gsap.set([line, brand], { opacity: 0, y: 24 });
  kpis.forEach((kpi) => renderKpiValue(kpi, num(kpi, "from")));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=200%",
      pin,
      scrub: 0.6,
    },
  });

  // Crossfade nero → lime all'ingresso (unico momento di colore pieno)
  if (ctx.bg) {
    tl.to(ctx.bg, { backgroundColor: BG.lime, duration: 0.8, ease: "none" }, 0);
  }

  // Prima appare la frase...
  tl.to(line, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.3);
  tl.to({}, { duration: 0.5 }); // respiro

  // ...poi appare l'etichetta "citAIto" e i numeri risalgono tutti insieme
  tl.to(brand, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
  kpis.forEach((kpi) => {
    const counter = { v: num(kpi, "from") };
    tl.to(
      counter,
      {
        v: num(kpi, "to"),
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => renderKpiValue(kpi, counter.v),
      },
      "<0.08"
    );
  });

  tl.to({}, { duration: 0.7 }); // respiro sul lime pieno

  // Uscita: il contenuto sfuma e lo sfondo torna nero, pronto per la CTA
  const exitTargets = [...kpis, line, brand].filter(Boolean) as Element[];
  tl.to(exitTargets, { opacity: 0, y: -24, duration: 0.6, ease: "power2.in" });
  if (ctx.bg) {
    tl.to(ctx.bg, { backgroundColor: BG.dark, duration: 0.6, ease: "none" }, "<");
  }
}

function num(el: Element, key: "from" | "to"): number {
  return parseFloat((el as HTMLElement).dataset[key] ?? "0");
}
