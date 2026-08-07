export interface Ente {
  slug: string;
  label: string;
  nota: string;
}

/**
 * Tipi di committente. Gli slug compaiono negli href delle chip dell'hero
 * (`/spettacoli?ente={slug}`) e nel filtro della pagina spettacoli: non vanno
 * rinominati senza aggiornare entrambi.
 */
export const ENTI: Ente[] = [
  {
    slug: "tutti",
    label: "Tutti",
    nota: "Ogni scheda dichiara età consigliata, durata, regia e requisiti di sala.",
  },
  {
    slug: "oratori",
    label: "Oratori e parrocchie",
    nota: "Vengo dall'oratorio: da più di vent'anni tengo corsi sulla responsabilità per gli educatori. So che pubblico avete in sala.",
  },
  {
    slug: "scuole",
    label: "Scuole",
    nota: "Due titoli comprendono già il confronto con l'artista al termine dello spettacolo.",
  },
  {
    slug: "teatri",
    label: "Teatri e Comuni",
    nota: "Nel 2026 il Comune di Tornaco mi ha messo in cartellone.",
  },
  {
    slug: "alpini",
    label: "Gruppi alpini",
    nota: "La guerra resta sullo sfondo, in primo piano c'è l'uomo. Per questo tengono anche i nipoti.",
  },
  {
    slug: "feste",
    label: "Feste e sagre",
    nota: "Un'ora che tiene insieme bambini, genitori e nonni, senza bisogno di una sola parola.",
  },
];

export interface VoceCatalogo {
  tema: string;
  problema: string;
  perche: string;
  enti: string[];
}

/**
 * Ordine di presentazione in home: deliberatamente diverso da `highlight` del
 * frontmatter. Apre il titolo più richiesto da oratori e parrocchie, poi i due
 * titoli scolastici più forti.
 */
export const ORDINE_HOME: string[] = [
  "la-valigia-di-s-francesco",
  "il-bullo",
  "pino-4-0",
  "luomo-e-il-mare-di-plastica",
  "a-volte-tornano",
  "la-grande-guerra",
  "lattesa",
  "comico",
];

export const CATALOGO_HOME: Record<string, VoceCatalogo> = {
  "la-valigia-di-s-francesco": {
    tema: "Pace, semplicità e fraternità, liberamente ispirato alle Fonti Francescane.",
    problema:
      "Alla festa patronale serve un'ora che tenga insieme bambini, genitori e nonni.",
    perche:
      "Un'ora per tutte le età, senza una parola: non dovete scegliere fra i bambini e gli anziani. È il titolo che oratori e parrocchie mi chiedono di più.",
    enti: ["oratori", "teatri", "feste"],
  },
  "il-bullo": {
    tema: "Bullismo, abbandono scolastico, illegalità e femminicidio.",
    problema: "In classe è arrivato il bullismo, e la circolare non basta.",
    perche:
      "Dura due ore perché al termine esco dal personaggio e racconto i miei dieci anni di collegio e le volte in cui ho dovuto scegliere la strada giusta. Bullismo, dispersione, legalità e violenza di genere: quattro voci del PTOF con un solo fornitore e una sola pratica amministrativa.",
    enti: ["scuole"],
  },
  "pino-4-0": {
    tema: "La dipendenza dal cellulare e il valore del contatto umano reale.",
    problema:
      "I ragazzi non staccano gli occhi dal telefono, e i genitori ci chiedono di fare qualcosa.",
    perche:
      "Il cellulare raccontato con una storia comica invece della lezione frontale che i ragazzi respingono. Un'ora e un quarto: sta dentro due ore di lezione.",
    enti: ["scuole"],
  },
  "luomo-e-il-mare-di-plastica": {
    tema: "Educazione ambientale, liberamente ispirato a «Il vecchio e il mare» di Hemingway.",
    problema: "Dobbiamo parlare di ambiente senza fare l'ennesima lezione.",
    perche:
      "Educazione civica ambientale con un aggancio letterario che piace ai docenti di lettere. Il dibattito con l'artista al termine è già compreso: portate a casa spettacolo più incontro.",
    enti: ["scuole"],
  },
  "a-volte-tornano": {
    tema: "Migranti e rifugiati, diritti umani, pregiudizio.",
    problema:
      "Accoglienza e migranti: come li affrontiamo senza trasformarli in politica?",
    perche:
      "Il titolo più adulto del repertorio, per le classi superiori e per le giornate dell'accoglienza. Funziona nei percorsi con Caritas, terzo settore e assessorati alle politiche sociali.",
    enti: ["scuole", "teatri"],
  },
  "la-grande-guerra": {
    tema: "La Prima Guerra Mondiale raccontata dall'umanità di un alpino, dedicata ai ragazzi del '99.",
    problema:
      "Per il 4 novembre serve qualcosa che tenga insieme i reduci e i nipoti.",
    perche:
      "Scritto per le sezioni ANA e per le commemorazioni, ma pensato per grandi e piccini: la guerra resta sullo sfondo, in primo piano c'è l'uomo. È l'unico titolo con la testimonianza di un dirigente scolastico.",
    enti: ["alpini", "scuole", "teatri"],
  },
  lattesa: {
    tema: "Dipendenza dalla tecnologia e riscoperta del tempo, del silenzio e della comunicazione non verbale.",
    problema:
      "Vorremmo un titolo che serva sia alle classi sia alla serata per le famiglie.",
    perche:
      "Programmabile due volte: mattinata per le scuole e serata aperta alla comunità. Un solo ingaggio, due pubblici.",
    enti: ["scuole", "teatri", "oratori"],
  },
  comico: {
    tema: "Comicità pura e poesia, proprio come quelli di una volta.",
    problema: "Alla festa non serve un tema: serve un'ora che faccia ridere tutti.",
    perche:
      "Il titolo delle sagre, delle feste dell'oratorio e delle ricorrenze cittadine. L'unico dai 3 anni in su, il più trasversale del repertorio: il repertorio classico del clown e del mimo.",
    enti: ["feste", "oratori", "teatri"],
  },
};

/** Numerali italiani per il conteggio dei titoli: «Otto spettacoli», non «8 spettacoli». */
export const NUMERI_IT: Record<number, string> = {
  1: "Un",
  2: "Due",
  3: "Tre",
  4: "Quattro",
  5: "Cinque",
  6: "Sei",
  7: "Sette",
  8: "Otto",
  9: "Nove",
  10: "Dieci",
  11: "Undici",
  12: "Dodici",
};

export function numeroInLettere(n: number): string {
  return NUMERI_IT[n] ?? String(n);
}

/** Ordina gli spettacoli secondo ORDINE_HOME; i titoli non elencati finiscono in coda. */
export function ordinaPerHome<T extends { id: string }>(shows: T[]): T[] {
  return [...shows].sort((a, b) => {
    const ia = ORDINE_HOME.indexOf(a.id);
    const ib = ORDINE_HOME.indexOf(b.id);
    return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
  });
}

export function etichetteEnti(slugs: string[]): string[] {
  return slugs
    .map((slug) => ENTI.find((e) => e.slug === slug)?.label)
    .filter((label): label is string => Boolean(label));
}
