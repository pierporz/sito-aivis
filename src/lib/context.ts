import { gsap } from "gsap";

import { qs, qsa, BG } from "./utils";

type Ctx = "light" | "dark" | "lime";

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
const bgColor = (name: Ctx): string => (name === "light" ? BG.light : name === "lime" ? BG.lime : BG.dark);

/**
 * Gestisce il "contesto" visivo corrente (chiaro / scuro / lime) in base alla
 * scena centrata nel viewport, tramite IntersectionObserver — posizioni sempre
 * corrette anche col pinning e funzionante con prefers-reduced-motion.
 *
 * Il contesto guida il contrasto di navbar e progress indicator (via classi
 * .ctx-* sul body). La navbar è sempre visibile (vedi base.css): qui ne regoliamo
 * solo i colori tramite le classi .ctx-*.
 */
export function initContext(reduced: boolean): void {
  const bg = qs("[data-bg]");
  const sections = qsa("[data-scene]");
  if (sections.length === 0) return;

  let current: Ctx | null = null;

  const apply = (section: Element) => {
    const name: Ctx = section.classList.contains("scene--light")
      ? "light"
      : section.classList.contains("scene--lime")
        ? "lime"
        : "dark";
    if (name === current) return;
    current = name;

    document.body.classList.remove("ctx-light", "ctx-dark", "ctx-lime");
    document.body.classList.add("ctx-" + name);

    // Su mobile il pinning è assente e le timeline di scena non girano: qui
    // guidiamo lo sfondo con un crossfade temporizzato. Su desktop lo sfondo è
    // già animato (scrubbed) dentro le timeline pinnate, quindi non lo tocchiamo.
    if (bg && !reduced && isMobile()) {
      gsap.to(bg, { backgroundColor: bgColor(name), duration: 0.5, ease: "none", overwrite: true });
    }
  };

  const obs = new IntersectionObserver(
    (entries) => {
      // La scena "attiva" è quella che attraversa il centro del viewport
      const active = entries.find((e) => e.isIntersecting);
      if (active) apply(active.target);
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}
