# Contribuire

Grazie per il contributo. Per modifiche al codice o ai contenuti:

1. Crea un fork della repository e clona il tuo fork.
2. Installa le dipendenze con `bun install`.
3. Crea un branch descrittivo, ad esempio `aggiorna-biografia`.
4. Sviluppa e verifica le modifiche con `bun run dev`.
5. Prima della Pull Request esegui:

   ```sh
   bun run check
   bun run build
   ```

6. Crea un commit breve e descrittivo, fai push del branch e apri una Pull Request verso `main`.

## Modifiche ai contenuti

- Spettacoli: `src/content/spettacoli/`
- Eventi: `src/content/eventi/`
- Biografia e pagine editoriali: `src/content/pages/`

Mantieni il frontmatter Markdown coerente con lo schema in `src/content.config.ts`. Per modifiche visive, descrivi la modifica nella Pull Request e includi screenshot quando utile.

Non inserire segreti nel repository: la variabile `RESEND_API_KEY` va configurata solo nell'ambiente locale o su Vercel.
