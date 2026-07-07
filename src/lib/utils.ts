/** Colori dello sfondo globale, condivisi tra orchestratore e scene. */
export const BG = {
  light: "#f5f5f2",
  dark: "#0a0a0b",
  lime: "#c8f542",
} as const;

/** Condizioni di rendering passate a ogni scena dall'orchestratore. */
export interface SceneContext {
  /** true se l'utente ha chiesto meno animazioni: le scene mostrano lo stato finale statico. */
  reduced: boolean;
  /** true su viewport desktop (>=768px): abilita pinning e timeline scrub. */
  isDesktop: boolean;
  /** Layer di sfondo globale: le scene ne animano il colore dentro la loro timeline pinnata. */
  bg: HTMLElement | null;
}

export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);

export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

/** Formatta un numero in stile italiano (virgola decimale), con eventuali decimali fissi. */
export const formatIt = (value: number, decimals = 0): string => {
  const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return rounded.replace(".", ",");
};

/**
 * Scrive il valore di un KPI leggendo data-decimals / data-suffix dall'elemento.
 * I suffissi testuali (es. "su 50") diventano un'unità più piccola per non
 * mandare a capo il numero; il "%" resta attaccato alla stessa dimensione.
 */
export const renderKpiValue = (kpi: Element, value: number): void => {
  const el = kpi as HTMLElement;
  const decimals = parseInt(el.dataset.decimals ?? "0", 10);
  const suffix = el.dataset.suffix ?? "";
  const valueEl = qs("[data-kpi-value]", kpi);
  if (!valueEl) return;

  const num = formatIt(value, decimals);
  if (/[a-z]/i.test(suffix)) {
    valueEl.innerHTML = `<span class="kpi__num">${num}</span><span class="kpi__unit">${suffix.trim()}</span>`;
  } else {
    valueEl.textContent = num + suffix;
  }
};
