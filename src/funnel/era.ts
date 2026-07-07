import { gsap } from "gsap";

import { qs, qsa } from "../lib/utils";

/** Le tre "epoche" tipografiche del corpo, in base alla scena centrata. */
type Era = "past" | "shift" | "now";

/** A quale classe d'epoca appartiene ogni scena (guida la famiglia di font). */
const ERA_BY_NAME: Record<string, Era> = {
  intro: "past",
  serp: "past",
  race: "past",
  shift: "shift",
  answer: "now",
  invisible: "now",
  aivis: "now",
  proof: "now",
  cta: "now",
};

/** Da quale scena in poi compare il wordmark "aivis" fisso. */
const MARK_FROM = new Set(["aivis", "proof", "cta"]);

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

/**
 * Contesto d'epoca: un IntersectionObserver individua la scena centrata e
 *  - imposta la classe `era-*` sul <body> (switch di famiglia tipografica);
 *  - mostra/nasconde il wordmark fisso;
 *  - su mobile e reduced-motion, dove il pinning è assente, guida direttamente
 *    la variabile globale --e (il morphing 2005→2026) leggendo data-era.
 *
 * Su desktop con animazioni attive, --e è invece scrubata dallo scroll dentro la
 * timeline pinnata della scena 3, così le posizioni restano corrette col pinning.
 */
export function initEraContext(reduced: boolean): void {
  const body = document.body;
  const mark = qs("[data-mark]");
  const root = document.documentElement;
  const sections = qsa("[data-scene]");
  if (sections.length === 0) return;

  const driveEHere = reduced || isMobile();
  let current: Element | null = null;

  const apply = (section: Element) => {
    if (section === current) return;
    current = section;

    const name = (section as HTMLElement).dataset.name ?? "";
    const era = ERA_BY_NAME[name] ?? "now";

    body.classList.remove("era-past", "era-shift", "era-now");
    body.classList.add("era-" + era);

    if (mark) mark.classList.toggle("is-visible", MARK_FROM.has(name));

    // Solo dove non c'è il pin: portiamo --e al valore d'epoca della scena.
    if (driveEHere) {
      const target = (section as HTMLElement).dataset.era === "1" ? 1 : 0;
      if (reduced) {
        root.style.setProperty("--e", String(target));
      } else {
        gsap.to(root, {
          "--e": target,
          duration: 0.6,
          ease: "none",
          overwrite: true,
          onUpdate: () => {
            /* gsap scrive --e come stringa numerica: nulla da fare qui */
          },
        });
      }
    }
  };

  const obs = new IntersectionObserver(
    (entries) => {
      const active = entries.find((e) => e.isIntersecting);
      if (active) apply(active.target);
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}
