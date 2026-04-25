# Sergio Procopio - Sito Ufficiale

Benvenuti nel repository del sito ufficiale di **Sergio Procopio**, attore, clown e performer. Questo progetto è una moderna web application costruita per presentare il portfolio artistico, gli spettacoli teatrali e la carriera di Sergio Procopio.

## 🚀 Tecnologie Utilizzate

Il progetto sfrutta le ultime tecnologie nel campo del web development per garantire performance elevate, SEO ottimizzato e un'esperienza utente fluida:

- **[Astro 6](https://astro.build/)**: Framework principale per la generazione di siti statici veloci e performanti.
- **[React 19](https://react.dev/)**: Utilizzato per componenti interattivi e gestione dinamica della UI.
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Framework CSS per uno styling moderno e responsive.
- **[Framer Motion](https://www.framer.com/motion/)**: Libreria per animazioni fluide e interazioni avanzate.
- **[Lucide React](https://lucide.dev/)**: Set di icone pulite ed eleganti.
- **[TypeScript](https://www.typescriptlang.org/)**: Per un codice tipizzato, sicuro e manutenibile.
- **[Content Collections](https://docs.astro.build/en/guides/content-collections/)**: Gestione strutturata dei contenuti (spettacoli) tramite file Markdown.

## 📂 Struttura del Progetto

```text
/
├── public/              # Asset statici (favicon, ecc.)
├── src/
│   ├── assets/          # Immagini e media ottimizzati da Astro
│   ├── components/      # Componenti React e Astro
│   │   └── custom/      # Componenti specifici del design
│   ├── content/         # Contenuti dinamici (Markdown per gli spettacoli)
│   ├── layouts/         # Layout principali del sito
│   ├── lib/             # Utility e funzioni helper
│   ├── pages/           # Rotte e pagine del sito
│   └── styles/          # File CSS globali
├── astro.config.mjs     # Configurazione di Astro
└── package.json         # Dipendenze e script
```

## 🛠️ Installazione e Sviluppo

Per avviare il progetto in locale, segui questi passaggi:

1. **Clona il repository:**
   ```sh
   git clone https://github.com/tuo-username/sergioprocopio.git
   cd sergioprocopio
   ```

2. **Installa le dipendenze:**
   ```sh
   npm install
   ```

3. **Avvia il server di sviluppo:**
   ```sh
   npm run dev
   ```
   Il sito sarà accessibile all'indirizzo `http://localhost:4321`.

## 📦 Comandi Disponibili

| Comando | Descrizione |
| :--- | :--- |
| `npm run dev` | Avvia il server di sviluppo locale. |
| `npm run build` | Genera la versione statica per la produzione in `./dist/`. |
| `npm run preview` | Visualizza in anteprima la build locale. |
| `npm run astro ...` | Esegue comandi specifici della CLI di Astro. |

## 🌐 Deploy

Il progetto è configurato per il deploy automatico su **Vercel** ad ogni push sul branch principale. Include integrazioni per Vercel Analytics e Speed Insights per monitorare le performance in tempo reale.

---
Realizzato con ❤️ per Sergio Procopio.
