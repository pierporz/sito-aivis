# CLAUDE.md — Sito scrollytelling aivis

## Cos'è

Sito one-page scrollytelling per "aivis", tool di AI Visibility Audit. Racconta una storia mentre si scorre, con scene pinnate, transizioni di sfondo e animazioni scroll-driven. Qualità di riferimento: Apple product page, Stripe, lusion.co. Non deve sembrare un template.

**Stato: costruito e in produzione.** Live su Cloudflare Pages → https://sito-aivis.pages.dev

## Stack

- Vite + vanilla TypeScript (niente React: il sito è una pagina narrativa, non un'app)
- GSAP + ScrollTrigger per pinning e animazioni legate al progresso dello scroll
- CSS moderno (custom properties, clamp per fluid typography), niente Tailwind
- Docker: dev server con hot reload esposto su localhost

## Sviluppo locale (Docker)

- `Dockerfile` (node:22-alpine) + `docker-compose.yml`
- Servizio `web`: monta il progetto, `npm run dev -- --host 0.0.0.0`, porta 5173:5173 con hot reload (polling)
- Avvio: `docker-compose up -d` → http://localhost:5173
- Produzione in locale: `docker-compose --profile prod up preview` (build + preview su porta 4173)
- Senza Docker: `npm install`, poi `npm run dev` / `npm run build` / `npm run preview`

## Deploy (GitHub → Cloudflare Pages)

- Repo: **github.com/pierporz/sito-aivis** (privato), remote SSH `git@github.com:pierporz/sito-aivis.git`, branch `main`
- Cloudflare Pages collegato al repo, **auto-deploy a ogni push su `main`**
- Build settings: build command `npm run build`, output directory `dist`, Node `22` (fissato da `.node-version`)
- Pubblicare aggiornamenti: `git add -A && git commit -m "..." && git push`

## Design system

- Dark-first: nero `#0a0a0b`, bianco sporco `#ededed`, grigi freddi per il secondario
- UN solo accento: lime `#c8f542`, usato chirurgicamente (CTA, numeri chiave, l'unica scena piena)
- Font Google: "Space Grotesk" (titoli, tracking negativo, dimensioni enormi con clamp), "Inter" (body), "JetBrains Mono" (dati, label tecniche, KPI, wordmark)
- Bordi 1px `#232326` al posto delle ombre, angoli 6-8px
- VIETATO: gradienti viola/blu, glassmorphism, emoji, iconcine tonde, copy tipo "rivoluzionario/potente"
- Tutti i token in `src/styles/tokens.css` (colori come var `--c-*` e `BG` in `src/lib/utils.ts`)

## Architettura del codice

- `index.html` — tutte le scene come `<section data-scene>`; layer globali (`.bg-layer`, `.dotfield`, `.cursor-glow`), navbar, progress
- `src/main.ts` — entry: registra GSAP, avvia l'orchestratore dopo `document.fonts.ready`, refresh su `load`
- `src/lib/`
  - `scrollOrchestrator.ts` — orchestrazione centrale; `gsap.matchMedia` per desktop / mobile / `reduced`; progress bar; avvia ogni scena
  - `context.ts` — `IntersectionObserver`: rileva la scena centrata e imposta il contesto `ctx-light/dark/lime` sul body (contrasto di navbar e progress, comparsa navbar; **su mobile guida anche lo sfondo**)
  - `pointerFx.ts` — spotlight lime che segue il cursore (aggiorna `--mx/--my` su `.cursor-glow`, solo desktop, no reduced)
  - `reveal.ts` — `revealOnEnter`: reveal semplice all'ingresso, usato su mobile (niente pin/scrub)
  - `utils.ts` — `qs/qsa`, colori `BG`, `formatIt` (numeri IT), `renderKpiValue`, tipo `SceneContext`
- `src/scenes/` — un modulo per scena: `scene1-question`, `scene3-absence`, `scene4-funnel`, `scene5-measure`, `scene6-numbers`, `scene7-after`, `scene8-cta` (la scena 2 è fusa nella 1)
- `src/styles/` — `tokens.css`, `base.css` (layout/navbar/progress/contesti), `scenes.css` (stili per scena)

Sfondo globale: un unico `.bg-layer` fisso il cui colore cross-fade tra le scene. **I crossfade sono animati DENTRO le timeline pinnate** delle scene 3 (→nero) e 7 (→lime→nero), non con trigger separati — così le posizioni restano corrette col pinning. Su mobile (niente pin) il colore è guidato da `context.ts`.

## La storia, scena per scena (com'è costruita)

Ogni scena è full-viewport, pinnata con ScrollTrigger; transizioni fluide legate allo scroll, mai salti.

**SCENA 1+2 — "La domanda / la risposta"** (`#scene-question`, sfondo chiaro `#f5f5f2`): una sola finestra chat pinnata, con sopra il wordmark **"chatgpt"** (nome di AI generica). Legato allo scroll: la domanda "qual è la migliore macchina da caffè espresso?" si digita lettera per lettera, poi appaiono 5 competitor fittizi riga per riga e una 6ª riga resta vuota col cursore. Sullo sfondo, frammenti di prompt reali fluttuano con parallasse. In uscita chat + wordmark sfumano.

**SCENA 3 — "L'assenza"** (crossfade a `#0a0a0b`): typography gigante allineata a sinistra "Il tuo brand non c'era." e, in basso a destra, in mono lime, "E nessuno te l'ha detto."

**SCENA 4 — "Il nuovo funnel"** (nero), in due fasi: (1) etichetta **● google** + 10 righe SERP azzurre/grigie + "Non ci sono più 10 posizioni." appaiono insieme; (2) spariscono insieme e al loro posto emergono etichetta **● chatgpt** + la bolla di risposta AI + "C'è una risposta sola. O ci sei, o non esisti."

**SCENA 5 — "La misura"** (nero): due colonne — a sinistra il wordmark "aivis" con una riga di descrizione, a destra i tre step numerati (01/02/03) che si "accendono" in sequenza.

**SCENA 6 — "I numeri"** (nero): i tre KPI giganti in mono sulla **stessa schermata**, che contano da 0 **tutti insieme**: "44%" (share of voice), "3,5" (posizione media), "9 su 50" (domande in cui non esisti).

**SCENA 7 — "Il dopo"** (crossfade verso lime `#c8f542` pieno, testo nero — unico colore del sito): **prima** appare la frase "Questo è quello che succede quando sai dove intervenire.", **poi** i numeri risalgono verso i valori migliorati (44→83%, 3,5→1,7, 9→2). Etichetta **● aivis** sopra i numeri. In uscita il contenuto sfuma e lo sfondo torna nero.

**SCENA 8 — CTA** (nero): "Scopri cosa dicono le AI del tuo brand." + form email inline (solo UI, validazione client, nessun backend) + nota "Report di esempio in 48h". Footer: aivis · un prodotto Orion Primis · privacy.

**Elementi trasversali:** trama di punti (`.dotfield`) su tutte le scene scure; spotlight lime che segue il cursore; progress indicator verticale a destra; navbar minimale (wordmark "aivis" + CTA lime) che appare dalla scena 3, con contrasto invertito sulla scena lime.

## Vincoli tecnici

- 60fps: animare solo transform e opacity; will-change con parsimonia
- Scroll nativo: NIENTE scroll-hijacking (la rotella non va intercettata)
- `prefers-reduced-motion`: fallback completo con scene statiche, tutto leggibile, ogni scena col proprio sfondo (crossfade globale disattivato)
- Mobile (<768px): niente pin; le scene usano `revealOnEnter`; layout in colonna singola; typography fluida
- Lighthouse: performance e accessibilità ≥ 90; contrasto conforme
- Tutto il copy in italiano
- Codice organizzato: `src/scenes/` un modulo per scena, orchestrazione ScrollTrigger centralizzata in `src/lib/`

## Note per modifiche future

- I KPI leggono `data-from` / `data-to` / `data-decimals` / `data-suffix` dall'HTML; `renderKpiValue` formatta e rende i suffissi testuali (es. "su 50") come unità più piccola
- Le scene 6 e 7 condividono lo stesso impianto a 3 colonne (coerenza "prima/dopo")
- Verifica ogni modifica nel browser prima di considerarla chiusa (le animazioni sono scroll-driven)
