import { gsap } from "gsap";

import { qs, qsa, renderKpiValue } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/**
 * SCENA 6 — I numeri. I tre KPI giganti stanno sulla stessa schermata e contano
 * da 0 verso il loro valore tutti insieme (stesso impianto della scena 7 lime,
 * così il confronto "prima/dopo" è coerente).
 */
export function initNumbers(ctx: SceneContext): void {
  const section = qs("#scene-numbers");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const kpis = qsa("[data-kpi]", section ?? undefined);
  if (!section || !pin || kpis.length === 0) return;

  // Reduced e mobile: valori finali già visibili
  if (ctx.reduced || !ctx.isDesktop) {
    kpis.forEach((kpi) => renderKpiValue(kpi, readTo(kpi)));
    if (!ctx.reduced) revealOnEnter(section, kpis, { stagger: 0.12, start: "top 80%" });
    return;
  }

  gsap.set(kpis, { opacity: 0, y: 40 });
  kpis.forEach((kpi) => renderKpiValue(kpi, readFrom(kpi)));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=200%",
      pin,
      scrub: 0.6,
    },
  });

  // Entrata dei tre KPI a scalare
  tl.to(kpis, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" });
  tl.to({}, { duration: 0.2 });

  // Contano tutti insieme
  kpis.forEach((kpi) => {
    const counter = { v: readFrom(kpi) };
    tl.to(
      counter,
      {
        v: readTo(kpi),
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => renderKpiValue(kpi, counter.v),
      },
      "<0.06"
    );
  });

  tl.to({}, { duration: 0.6 }); // respiro finale
}

function readFrom(el: Element): number {
  return parseFloat((el as HTMLElement).dataset.from ?? "0");
}
function readTo(el: Element): number {
  return parseFloat((el as HTMLElement).dataset.to ?? "0");
}
