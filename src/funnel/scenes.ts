import { gsap } from "gsap";

import { qs, qsa, formatIt } from "../lib/utils";
import type { SceneContext } from "../lib/utils";
import { revealOnEnter } from "../lib/reveal";

/* Le scene condividono lo stesso impianto della home: su desktop una timeline
   pinnata e scrubata dallo scroll; su mobile/reduced uno stato statico leggibile
   (con reveal leggero solo se le animazioni sono ammesse). */

const SERP_QUERY = "migliore macchina da caffè espresso";

/* ---------------------------------------------------------------------------
   SCENA 1 — 2005: la SERP. La query si digita nel campo, poi compaiono i dieci
   risultati e la didascalia in Georgia italic.
   ------------------------------------------------------------------------- */
export function initSerp(ctx: SceneContext): void {
  const section = qs("#s-serp");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const field = qs<HTMLInputElement>("[data-serp-query]", section ?? undefined);
  const results = qsa("[data-result]", section ?? undefined);
  const stats = qs("[data-serp-stats]", section ?? undefined);
  const caption = qs("[data-serp-caption]", section ?? undefined);
  if (!section || !pin || !field || results.length === 0) return;

  if (ctx.reduced || !ctx.isDesktop) {
    field.value = SERP_QUERY;
    gsap.set([...results, stats, caption], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [stats, ...results], { stagger: 0.06, start: "top 78%" });
    return;
  }

  gsap.set([stats, ...results], { opacity: 0, y: 10 });
  gsap.set(caption, { opacity: 0, y: 16 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=260%", pin, scrub: 0.6, anticipatePin: 1 },
  });

  // Digitazione della query carattere per carattere
  const state = { chars: 0 };
  tl.to(state, {
    chars: SERP_QUERY.length,
    duration: 2,
    ease: "none",
    onUpdate: () => {
      field.value = SERP_QUERY.slice(0, Math.round(state.chars));
    },
  });
  tl.to(stats, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "+=0.2");
  tl.to(results, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" }, "-=0.1");
  tl.to(caption, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "+=0.3");
  tl.to({}, { duration: 0.5 });
}

/* ---------------------------------------------------------------------------
   SCENA 2 — La gara. I dieci link si evidenziano uno a uno, la barra di CTR si
   riempie e la percentuale conta. Poi la didascalia sulla SEO.
   ------------------------------------------------------------------------- */
export function initRace(ctx: SceneContext): void {
  const section = qs("#s-race");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const rows = qsa<HTMLElement>("[data-race-row]", section ?? undefined);
  const caption = qs("[data-race-caption]", section ?? undefined);
  if (!section || !pin || rows.length === 0) return;

  const ctrOf = (row: HTMLElement) => parseFloat(row.style.getPropertyValue("--ctr") || "0");
  const setBar = (row: HTMLElement, v: number) => row.style.setProperty("--bar", String(v));
  const numEl = (row: HTMLElement) => qs("[data-race-num]", row);

  if (ctx.reduced || !ctx.isDesktop) {
    rows.forEach((row) => {
      setBar(row, 1);
      row.classList.add("is-active");
    });
    gsap.set(caption, { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, rows, { stagger: 0.06, start: "top 78%" });
    return;
  }

  gsap.set(rows, { opacity: 0, x: -14 });
  gsap.set(caption, { opacity: 0, y: 16 });
  rows.forEach((row) => setBar(row, 0));

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=300%", pin, scrub: 0.6 },
  });

  rows.forEach((row) => {
    const target = ctrOf(row);
    const counter = { v: 0 };
    tl.to(row, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", onStart: () => row.classList.add("is-active") });
    tl.to(row, { "--bar": 1, duration: 0.5, ease: "power2.out" }, "<");
    tl.to(
      counter,
      {
        v: target,
        duration: 0.5,
        ease: "power1.out",
        onUpdate: () => {
          const el = numEl(row);
          if (el) el.textContent = `${Math.round(counter.v)}%`;
        },
      },
      "<"
    );
  });

  tl.to(caption, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "+=0.3");
  tl.to({}, { duration: 0.4 });
}

/* ---------------------------------------------------------------------------
   SCENA 3 — Qualcosa cambia. Qui avviene il morphing d'epoca: --e va da 0 a 1
   (sfondo, inchiostro, accento, raggi). I dieci link si fondono al centro e
   svaniscono mentre emerge la frase narrativa.
   ------------------------------------------------------------------------- */
export function initShift(ctx: SceneContext): void {
  const section = qs("#s-shift");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const links = qsa<HTMLElement>("[data-shift-link]", section ?? undefined);
  const text = qs("[data-shift-text]", section ?? undefined);
  const root = document.documentElement;
  if (!section || !pin || links.length === 0 || !text) return;

  if (ctx.reduced || !ctx.isDesktop) {
    // --e è già portata a 1 dall'osservatore d'epoca su mobile/reduced.
    gsap.set(links, { opacity: 0.12 });
    gsap.set(text, { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, text, { y: 20, start: "top 72%" });
    return;
  }

  gsap.set(text, { opacity: 0, y: 24, scale: 0.96 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=260%", pin, scrub: 0.6 },
  });

  // Il morphing d'epoca, scrubato per tutta la scena
  const eProxy = { v: 0 };
  tl.to(
    eProxy,
    {
      v: 1,
      ease: "none",
      duration: 6,
      onUpdate: () => root.style.setProperty("--e", eProxy.v.toFixed(3)),
    },
    0
  );

  // I link collassano verso il centro, sfocano e si fondono
  tl.to(
    links,
    {
      y: (i) => (links.length / 2 - i) * -18 + 0,
      opacity: 0,
      filter: "blur(6px)",
      scale: 0.9,
      duration: 3,
      stagger: { each: 0.08, from: "edges" },
      ease: "power2.in",
    },
    0.6
  );

  // Emerge la frase (una risposta sola)
  tl.to(text, { opacity: 1, y: 0, scale: 1, duration: 2, ease: "power3.out" }, 2.4);
  tl.to({}, { duration: 0.6 });
}

/* La risposta AI, come sequenza di frammenti: i tre brand (brand: true) diventano
   terracotta man mano che vengono "digitati". Il testo pieno concatenato deve
   combaciare col fallback in funnel.html dentro [data-answer-typed]. */
const ANSWER_TOKENS: ReadonlyArray<readonly [string, boolean]> = [
  ["Per un buon espresso in casa, tre nomi che vale davvero la pena considerare: ", false],
  ["Lelit", true],
  [", ", false],
  ["Rancilio", true],
  [" e ", false],
  ["Gaggia", true],
  [". Offrono il miglior equilibrio tra qualità in tazza, affidabilità nel tempo e prezzo.", false],
];
const ANSWER_LEN = ANSWER_TOKENS.reduce((s, [t]) => s + t.length, 0);

/** Ricostruisce l'HTML della risposta mostrando solo i primi `n` caratteri. */
function renderAnswer(n: number): string {
  let left = Math.round(n);
  let html = "";
  for (const [text, brand] of ANSWER_TOKENS) {
    if (left <= 0) break;
    const slice = text.slice(0, left);
    left -= slice.length;
    html += brand ? `<mark>${slice}</mark>` : slice;
  }
  return html;
}

/* ---------------------------------------------------------------------------
   SCENA 4 — 2026: la risposta. Una sola bolla conversazionale su avorio. Il testo
   appare come se l'AI lo stesse scrivendo in diretta: la bolla entra vuota con il
   cursore, poi la risposta si digita carattere per carattere (legata allo scroll)
   e i tre brand si accendono in terracotta man mano. Poi la didascalia Newsreader.
   ------------------------------------------------------------------------- */
export function initAnswer(ctx: SceneContext): void {
  const section = qs("#s-answer");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const bubble = qs("[data-answer-bubble]", section ?? undefined);
  const typed = qs("[data-answer-typed]", section ?? undefined);
  const caret = qs("[data-answer-caret]", section ?? undefined);
  const caption = qs("[data-answer-caption]", section ?? undefined);
  if (!section || !pin || !bubble || !typed) return;

  if (ctx.reduced || !ctx.isDesktop) {
    // Fallback: testo pieno già nel DOM. Il cursore lampeggia a fine risposta
    // (nascosto del tutto in reduced-motion via CSS).
    gsap.set([bubble, caption], { opacity: 1, y: 0 });
    if (!ctx.reduced) {
      revealOnEnter(section, bubble, { y: 24, start: "top 75%" });
      revealOnEnter(section, caption, { y: 20, start: "top 60%" });
    }
    return;
  }

  typed.innerHTML = ""; // si parte dalla bolla vuota, la risposta arriva scrollando
  gsap.set(bubble, { opacity: 0, y: 40, scale: 0.94 });
  gsap.set(caret, { opacity: 0 });
  gsap.set(caption, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=240%", pin, scrub: 0.6 },
  });

  // La bolla entra vuota, con il cursore già pronto a scrivere
  tl.to(bubble, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.2);
  tl.to(caret, { opacity: 1, duration: 0.25, ease: "none" }, "-=0.2");
  tl.to({}, { duration: 0.35 }); // breve attesa: l'AI "pensa"

  // Digitazione carattere per carattere
  const state = { n: 0 };
  tl.to(state, {
    n: ANSWER_LEN,
    duration: 3,
    ease: "none",
    onUpdate: () => {
      typed.innerHTML = renderAnswer(state.n);
    },
  });

  tl.to({}, { duration: 0.5 }); // il cursore resta a lampeggiare sulla risposta
  tl.to(caption, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "+=0.1");
  tl.to({}, { duration: 0.6 });
}

/* ---------------------------------------------------------------------------
   SCENA 5 — L'invisibile. Tre domande, tre risposte, e in nessuna compare il tuo
   brand: al suo posto uno spazio tratteggiato terracotta.
   ------------------------------------------------------------------------- */
export function initInvisible(ctx: SceneContext): void {
  const section = qs("#s-invisible");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const cards = qsa("[data-miniq]", section ?? undefined);
  const slots = qsa("[data-slot]", section ?? undefined);
  const caption = qs("[data-invisible-caption]", section ?? undefined);
  if (!section || !pin || cards.length === 0) return;

  if (ctx.reduced || !ctx.isDesktop) {
    gsap.set([...cards, caption], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [...cards, caption], { stagger: 0.12, start: "top 78%" });
    return;
  }

  gsap.set(cards, { opacity: 0, y: 30 });
  gsap.set(slots, { opacity: 0, scale: 0.8 });
  gsap.set(caption, { opacity: 0, y: 24 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=220%", pin, scrub: 0.6 },
  });

  cards.forEach((card, i) => {
    tl.to(card, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, i === 0 ? 0 : "+=0.35");
    const slot = slots[i];
    if (slot) tl.to(slot, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, "-=0.25");
  });
  tl.to(caption, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "+=0.3");
  tl.to({}, { duration: 0.5 });
}

/* ---------------------------------------------------------------------------
   SCENA 6 — aivis. Tre passaggi che scorrono in orizzontale mentre si scende;
   in ognuno una tabella dati con le righe che si popolano.
   ------------------------------------------------------------------------- */
export function initAivis(ctx: SceneContext): void {
  const section = qs("#s-aivis");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const mark = qs("[data-aivis-mark]", section ?? undefined);
  const track = qs("[data-aivis-track]", section ?? undefined);
  const passes = qsa("[data-pass]", section ?? undefined);
  const dots = qsa("[data-aivis-dots] .aivis__dot", section ?? undefined);
  if (!section || !pin || !track || passes.length === 0) return;

  const rowsOf = (pass: Element) => qsa("[data-drow]", pass);
  const activateDot = (i: number) => dots.forEach((d, di) => d.classList.toggle("is-active", di === i));

  if (ctx.reduced || !ctx.isDesktop) {
    gsap.set([mark, ...passes], { opacity: 1, y: 0 });
    passes.forEach((p) => gsap.set(rowsOf(p), { opacity: 1, x: 0 }));
    if (!ctx.reduced) {
      revealOnEnter(section, mark, { y: 20, start: "top 80%" });
      passes.forEach((p) => revealOnEnter(p, rowsOf(p), { stagger: 0.1, start: "top 82%" }));
    }
    return;
  }

  gsap.set(mark, { opacity: 0, y: 24 });
  passes.forEach((p) => gsap.set(rowsOf(p), { opacity: 0, x: 20 }));
  activateDot(0);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=320%", pin, scrub: 0.6 },
  });

  tl.to(mark, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });

  // Passaggio 1: popola la tabella
  tl.to(rowsOf(passes[0]), { opacity: 1, x: 0, duration: 0.5, stagger: 0.18, ease: "power2.out" }, "+=0.1");
  tl.to({}, { duration: 0.6 });

  // → Passaggio 2
  tl.to(track, { xPercent: -33.333, duration: 0.9, ease: "power2.inOut", onStart: () => activateDot(1), onReverseComplete: () => activateDot(0) });
  tl.to(rowsOf(passes[1]), { opacity: 1, x: 0, duration: 0.5, stagger: 0.18, ease: "power2.out" }, "-=0.2");
  tl.to({}, { duration: 0.6 });

  // → Passaggio 3
  tl.to(track, { xPercent: -66.666, duration: 0.9, ease: "power2.inOut", onStart: () => activateDot(2), onReverseComplete: () => activateDot(1) });
  tl.to(rowsOf(passes[2]), { opacity: 1, x: 0, duration: 0.5, stagger: 0.18, ease: "power2.out" }, "-=0.2");
  tl.to({}, { duration: 0.6 });
}

/* ---------------------------------------------------------------------------
   SCENA 7 — La prova. Due colonne prima/dopo con i contatori che risalgono verso
   i valori migliorati.
   ------------------------------------------------------------------------- */
export function initProof(ctx: SceneContext): void {
  const section = qs("#s-proof");
  const pin = qs<HTMLElement>("[data-pin]", section ?? undefined);
  const metrics = qsa("[data-metric]", section ?? undefined);
  const counts = qsa<HTMLElement>("[data-count]", section ?? undefined);
  const caption = qs("[data-proof-caption]", section ?? undefined);
  if (!section || !pin || metrics.length === 0) return;

  if (ctx.reduced || !ctx.isDesktop) {
    counts.forEach((el) => writeCount(el, num(el, "to")));
    gsap.set([...metrics, caption], { opacity: 1, y: 0 });
    if (!ctx.reduced) revealOnEnter(section, [...metrics, caption], { stagger: 0.12, start: "top 80%" });
    return;
  }

  gsap.set(metrics, { opacity: 0, y: 30 });
  gsap.set(caption, { opacity: 0, y: 24 });
  counts.forEach((el) => writeCount(el, num(el, "from")));

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=220%", pin, scrub: 0.6 },
  });

  tl.to(metrics, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" });
  tl.to({}, { duration: 0.2 });
  counts.forEach((el) => {
    const counter = { v: num(el, "from") };
    tl.to(
      counter,
      { v: num(el, "to"), duration: 1.2, ease: "power2.out", onUpdate: () => writeCount(el, counter.v) },
      "<0.05"
    );
  });
  tl.to(caption, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "+=0.2");
  tl.to({}, { duration: 0.5 });
}

/* ---------------------------------------------------------------------------
   SCENA 8 — CTA. Form email inline (solo UI, nessun backend) con validazione.
   ------------------------------------------------------------------------- */
export function initCta(ctx: SceneContext): void {
  const section = qs("#cta");
  const form = qs<HTMLFormElement>("[data-cta-form]", section ?? undefined);
  const input = qs<HTMLInputElement>(".cta2026__input", section ?? undefined);
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

    input.classList.remove("is-invalid");
    note.classList.add("is-success");
    note.textContent = "Fatto. Ti mandiamo un report di esempio entro 48h.";
    form.reset();
    if (!ctx.reduced) gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  });

  input.addEventListener("input", () => {
    if (!input.classList.contains("is-invalid")) return;
    input.classList.remove("is-invalid");
    note.classList.remove("is-success");
    note.textContent = defaultNote;
  });

  if (!ctx.reduced) {
    const items = section.querySelectorAll(".cta2026__title, .cta2026__form, .cta2026__note");
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

/* --- Helper contatori (scena 7): scrive valore + eventuale suffisso testuale --- */
function num(el: Element, key: "from" | "to"): number {
  return parseFloat((el as HTMLElement).dataset[key] ?? "0");
}
function writeCount(el: Element, value: number): void {
  const h = el as HTMLElement;
  const decimals = parseInt(h.dataset.decimals ?? "0", 10);
  const suffix = h.dataset.suffix ?? "";
  const n = formatIt(value, decimals);
  if (/[a-z]/i.test(suffix)) {
    h.innerHTML = `${n}<span class="kpi__unit">${suffix.trim()}</span>`;
  } else {
    h.textContent = n + suffix;
  }
}
