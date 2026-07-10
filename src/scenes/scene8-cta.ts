import { gsap } from "gsap";

import { qs } from "../lib/utils";
import type { SceneContext } from "../lib/utils";

const CONTACT_EMAIL = "info@citaito.it";

/**
 * SCENA 8 — CTA. Titolo, form email inline e footer. Nessun backend: alla
 * conferma apriamo il client email dell'utente con un messaggio già pronto
 * indirizzato a info@citaito.it (mailto), così la richiesta arriva in casella.
 */
export function initCta(ctx: SceneContext): void {
  const section = qs("#cta");
  const form = qs<HTMLFormElement>("[data-cta-form]");
  const input = qs<HTMLInputElement>(".cta__input", section ?? undefined);
  const note = qs("[data-cta-note]", section ?? undefined);
  if (!section || !form || !input || !note) return;

  const defaultNote = note.textContent ?? "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      input.classList.add("is-invalid");
      note.classList.remove("is-success");
      note.textContent = "Inserisci un'email valida.";
      if (!ctx.reduced) gsap.fromTo(input, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
      input.focus();
      return;
    }

    // Apre il client email con un messaggio già pronto verso info@citaito.it
    const subject = "Richiesta report — AI Visibility";
    const body =
      `Ciao,\n` +
      `vorrei sapere cosa dicono le AI del mio brand e ricevere un report di esempio.\n\n` +
      `La mia email: ${value}\n\n` +
      `—\nRichiesta inviata da citaito.it`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    input.classList.remove("is-invalid");
    note.classList.add("is-success");
    note.textContent = `Ti abbiamo aperto una mail già pronta per ${CONTACT_EMAIL} — premi invia.`;
    form.reset();
    if (!ctx.reduced) gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  });

  input.addEventListener("input", () => {
    if (!input.classList.contains("is-invalid")) return;
    input.classList.remove("is-invalid");
    note.classList.remove("is-success");
    note.textContent = defaultNote;
  });

  // Entrata leggera del blocco CTA
  if (!ctx.reduced) {
    const items = section.querySelectorAll(".cta__title, .cta__form, .cta__note");
    gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: section, start: "top 70%" },
    });
  }
}
