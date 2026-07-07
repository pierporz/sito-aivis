import { gsap } from "gsap";

/**
 * Reveal leggero all'ingresso nel viewport, senza pin né scrub. Usato su mobile
 * (dove il pinning è assente) per far apparire il contenuto una sola volta,
 * garantendo che ogni scena resti sempre leggibile a fine animazione.
 */
export function revealOnEnter(
  trigger: Element,
  targets: gsap.TweenTarget,
  opts: { y?: number; stagger?: number; start?: string } = {}
): void {
  gsap.set(targets, { opacity: 0, y: opts.y ?? 16 });
  gsap.to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: opts.stagger ?? 0.1,
    ease: "power2.out",
    scrollTrigger: { trigger, start: opts.start ?? "top 72%" },
  });
}
