import { qs } from "./utils";

/**
 * Cookie banner minimale. Il sito usa solo cookie tecnici, quindi il banner è
 * puramente informativo: appare finché l'utente non conferma, poi la scelta
 * resta in localStorage e non ricompare più.
 */
const STORAGE_KEY = "citaito-cookie-ok";

export function initCookieBanner(): void {
  const banner = qs<HTMLElement>("[data-cookie]");
  const accept = qs<HTMLElement>("[data-cookie-accept]");
  if (!banner || !accept) return;

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage non disponibile (es. modalità privata): mostriamo comunque
  }
  if (stored === "1") return;

  banner.hidden = false;
  // Doppio rAF: garantisce la transizione d'ingresso dopo il primo paint
  requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add("is-visible")));

  accept.addEventListener("click", () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* no-op */
    }
    banner.classList.remove("is-visible");
    banner.addEventListener("transitionend", () => (banner.hidden = true), { once: true });
  });
}
