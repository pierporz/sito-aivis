# CLAUDE.md — Sito scrollytelling aivis

## Cos'è

Sito one-page scrollytelling per "aivis", tool di AI Visibility Audit. Racconta una storia mentre si scorre, con scene pinnate, transizioni di sfondo e animazioni scroll-driven. Qualità di riferimento: Apple product page, Stripe, lusion.co. Non deve sembrare un template.

## Stack

- Vite + vanilla TypeScript (niente React: il sito è una pagina narrativa, non un'app)
- GSAP + ScrollTrigger per pinning e animazioni legate al progresso dello scroll
- CSS moderno (custom properties, clamp per fluid typography), niente Tailwind
- Docker: dev server con hot reload esposto su localhost

## Docker

- `Dockerfile` (node:22-alpine) + `docker-compose.yml`
- Servizio `web`: monta il progetto, `npm run dev -- --host 0.0.0.0`, porta 5173:5173
- Avvio: `docker-compose up -d` → sito su http://localhost:5173 con hot reload
- Aggiungi anche `npm run build` + preview per la versione produzione (porta 4173)

## Design system

- Dark-first: nero `#0a0a0b`, bianco sporco `#ededed`, grigi freddi per il secondario
- UN solo accento: lime `#c8f542`, usato chirurgicamente (CTA, numeri chiave, un'unica scena piena)
- Font Google: "Space Grotesk" per i titoli (tracking negativo, dimensioni enormi con clamp), "Inter" per il body, "JetBrains Mono" per dati, label tecniche e KPI
- Bordi 1px `#232326` al posto delle ombre, angoli 6-8px
- VIETATO: gradienti viola/blu, glassmorphism, emoji, iconcine tonde, copy tipo "rivoluzionario/potente"

## La storia, scena per scena

Ogni scena è full-viewport, pinnata con ScrollTrigger; le transizioni di sfondo sono crossfade fluidi legati allo scroll, mai salti.

**SCENA 1 — "La domanda"** (sfondo chiaro `#f5f5f2`, testo scuro): finestra chat minimale al centro. Legato allo scroll, il testo si digita lettera per lettera: "qual è la migliore macchina da caffè espresso?". Cursore lampeggiante.

**SCENA 2 — "La risposta"** (stesso sfondo): la chat risponde elencando 5 brand fittizi (Competitor 1…Competitor 5) che appaiono riga per riga col progresso dello scroll. Un'ultima riga resta vuota, con un cursore fermo.

**SCENA 3 — "L'assenza"** (crossfade dello sfondo verso `#0a0a0b`; la chat si rimpicciolisce e sfuma): typography gigante bianca: "Il tuo brand non c'era." Sotto, in mono lime: "E nessuno te l'ha detto."

**SCENA 4 — "Il nuovo funnel"** (nero): 10 link blu stile SERP Google si comprimono e collassano in un'unica bolla di risposta AI, animazione legata allo scroll. Testo a fianco: "Non ci sono più 10 posizioni. C'è una risposta sola. O ci sei, o non esisti."

**SCENA 5 — "La misura"** (nero, entra una griglia di punti sottilissima): appare il wordmark "aivis" in mono lowercase. Tre step numerati (01 / 02 / 03) pinnati in sequenza: "500 prompt reali d'acquisto" → "eseguiti su ChatGPT, Gemini e Claude, più volte" → "ogni risposta analizzata: chi viene citato, chi viene consigliato, chi viene ignorato".

**SCENA 6 — "I numeri"** (nero): KPI giganti in mono che contano da 0 quando entrano nel viewport, uno per schermata:
- "44%" — share of voice: quante volte le AI ti citano
- "3,5" — posizione media: quando ti citano, sei terzo o quarto
- "9 su 50" — le domande in cui non esisti proprio

**SCENA 7 — "Il dopo"** (crossfade verso lime `#c8f542` pieno, testo nero — unico momento di colore del sito): gli stessi KPI si ri-animano verso i valori migliorati: 44→83%, 3,5→1,7, 9→2. Frase: "Questo è quello che succede quando sai dove intervenire."

**SCENA 8 — CTA** (ritorno al nero): "Scopri cosa dicono le AI del tuo brand." + form email inline (solo UI, nessun backend) + nota "Report di esempio in 48h". Footer una riga: aivis · un prodotto Orion Primis · privacy.

Elementi trasversali: progress indicator verticale sottile sul lato destro; navbar minimale che appare dopo la scena 3 (wordmark + CTA lime).

## Vincoli tecnici

- 60fps: animare solo transform e opacity; will-change usato con parsimonia
- Scroll nativo: NIENTE scroll-hijacking, la rotella non va intercettata
- `prefers-reduced-motion`: fallback completo con scene statiche visibili senza animazioni
- Mobile (<768px): scene semplificate, pinning ridotto o assente, typography fluida, tutto leggibile
- Lighthouse: performance e accessibilità ≥ 90; contrasto testo conforme
- Tutto il copy in italiano
- Codice organizzato: una directory `src/scenes/` con un modulo per scena, orchestrazione ScrollTrigger centralizzata

## Ordine di sviluppo

1. Setup Vite + TypeScript + GSAP + Docker (verifica hot reload su localhost:5173)
2. Layout scene statiche con design system completo (senza animazioni)
3. Pinning e crossfade di sfondo tra scene
4. Scena 1-2 (chat typing + risposta progressiva)
5. Scene 3-4 (assenza + collasso SERP)
6. Scene 5-7 (step, contatori KPI, transizione lime)
7. Scena 8, progress indicator, navbar
8. prefers-reduced-motion, mobile, rifinitura performance

Testa ogni fase nel browser prima di passare alla successiva.
