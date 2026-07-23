# Sergio Procopio - Sito Ufficiale

Repository del sito ufficiale di Sergio Procopio, attore, clown e performer. Il sito presenta biografia, spettacoli, galleria, calendario eventi e modulo contatti.

Il progetto è costruito con Astro 6, React islands, Tailwind CSS 4 e content collections Markdown.

## Stack

| Area | Tecnologia |
| :--- | :--- |
| Framework | Astro 6 |
| UI interattiva | React 19 |
| Styling | Tailwind CSS 4 tramite `@tailwindcss/vite` |
| Animazioni | Framer Motion |
| Contenuti | Astro Content Collections |
| Email contatti | Astro Actions + Resend |
| Deploy | Vercel con sitemap, Analytics e Speed Insights |

## Requisiti

- Node.js `>=22.12.0`
- Bun
- Variabile ambiente `RESEND_API_KEY` per il modulo contatti

## Avvio Locale

```sh
git clone https://github.com/JustMarkDev/sergioprocopio.git
cd sergioprocopio
bun install
bun run dev
```

Il server di sviluppo parte su `http://localhost:4321`.

Per testare l'invio email in locale, crea un file `.env.local` con:

```env
RESEND_API_KEY=...
```

## Comandi

| Comando | Descrizione |
| :--- | :--- |
| `bun run dev` | Avvia il server Astro locale. |
| `bun run build` | Genera la build di produzione in `dist/`. |
| `bun run preview` | Serve localmente la build generata. |
| `bun run check` | Controlla tipi Astro, contenuti e route. |

## Struttura

```text
/
|-- public/                  # File statici serviti senza trasformazioni
|-- src/
|   |-- actions/             # Server actions, incluso invio contatti con Resend
|   |-- assets/              # Immagini ottimizzate da Astro
|   |-- components/          # Componenti Astro e React condivisi
|   |   `-- custom/          # Componenti specifici del sito
|   |-- content/             # Contenuti Markdown validati da schema
|   |   |-- eventi/          # Eventi del calendario
|   |   |-- pages/           # Contenuti editoriali di pagine statiche
|   |   `-- spettacoli/      # Schede spettacolo
|   |-- layouts/             # Layout di pagina
|   |-- lib/                 # Helper riutilizzabili
|   |-- pages/               # Route Astro
|   `-- styles/              # Stili globali e tema Tailwind v4
|-- astro.config.mjs         # Configurazione Astro, Vercel, sitemap e sicurezza
|-- package.json             # Script e dipendenze
`-- bun.lock                 # Lockfile Bun
```

## Route Principali

| Route | Fonte contenuto |
| :--- | :--- |
| `/` | Homepage con hero, spettacoli in evidenza e contatti |
| `/biografia` | `src/content/pages/biografia.md` |
| `/spettacoli` | Lista da `src/content/spettacoli/*.md` |
| `/spettacoli/[slug]` | Pagina dettaglio generata dal nome file Markdown |
| `/galleria` | Immagini collegate agli spettacoli pubblicati |
| `/calendario` | Eventi da `src/content/eventi/**/*.md` |
| `/privacy-policy` | Pagina privacy |

## Gestione Contenuti

Gli schemi sono definiti in `src/content.config.ts`. Dopo modifiche ai contenuti, esegui `bun run check`.

### Spettacoli

Aggiungi o modifica file Markdown in `src/content/spettacoli/`. Lo slug pubblico è il nome del file, ad esempio `pino-4-0.md` genera `/spettacoli/pino-4-0`.

Frontmatter principale:

```yaml
---
title: "Titolo spettacolo"
description: "Descrizione breve per anteprime e SEO."
category: "teatro"
image: "../../assets/spettacoli/nome-cartella/copertina.jpg"
galleryImages:
  - "../../assets/spettacoli/nome-cartella/foto-1.jpg"
durata: "1h 10m"
regia: "Nome regista"
eta: "6+"
produzione: "Produzione"
tecnico: "Scheda tecnica"
requisiti: "Requisiti di scena"
highlight: false
draft: false
---
```

`highlight: true` dà priorità allo spettacolo nella homepage. `draft: true` lo esclude dalle pagine pubbliche.

### Eventi

Aggiungi eventi in `src/content/eventi/`.

```yaml
---
title: "Titolo evento"
spettacolo: "Nome spettacolo"
date: 2026-10-12
time: "21:00"
venue: "Nome teatro"
city: "Città"
address: "Via di esempio, 1"
isPublic: true
draft: false
---
```

Il calendario mostra solo eventi con `isPublic: true` e `draft: false`. Gli eventi futuri e passati vengono separati automaticamente in pagina. Il link Google Maps viene generato da `address` e `city`.

### Biografia e Pagine Editoriali

I contenuti editoriali vivono in `src/content/pages/`. La pagina biografia usa `src/content/pages/biografia.md`.

## Contatti Email

Il modulo in `src/components/custom/ContactForm.tsx` invia i dati tramite `actions.sendContactEmail` in `src/actions/index.ts`.

- La validazione server-side è gestita con Zod.
- L'invio email usa Resend.
- La chiave `RESEND_API_KEY` deve essere configurata in locale e su Vercel.
- Il mittente configurato è `sito@contatti.sergioprocopio.it` e il destinatario è `info@sergioprocopio.it`.

## Stili

Gli stili globali sono in `src/styles/globals.css`. Questo progetto usa Tailwind CSS v4, quindi tema, font, utility custom e keyframes vanno configurati con `@theme` e CSS moderno, non con `tailwind.config.js`.

Font principali:

- `Inter` per il sans-serif
- `Playfair Display` per titoli e serif

## Verifica Prima del Deploy

```sh
bun run check
bun run build
```

Per modifiche visive, controlla manualmente homepage, pagine spettacolo, galleria, calendario e modulo contatti con `bun run dev`.

## Deploy

Il sito è configurato per Vercel in `astro.config.mjs` con:

- `site: "https://sergioprocopio.it"`
- adapter `@astrojs/vercel`
- sitemap Astro
- Vercel Web Analytics
- domini consentiti per `sergioprocopio.it`, `sergioprocopio.com` e `localhost`
