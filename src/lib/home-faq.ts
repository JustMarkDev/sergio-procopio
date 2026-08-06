export interface Faq {
  q: string;
  a: string;
}

/**
 * Fonte unica delle FAQ: alimenta sia la sezione in home sia il JSON-LD FAQPage.
 * Testo semplice senza HTML, perché finisce anche dentro JSON.stringify.
 * Ogni risposta poggia su fatti presenti in src/content/: non aggiungere
 * impegni su tempi di risposta o prezzi, che nel materiale non esistono.
 */
export const FAQ_COMMITTENTI: Faq[] = [
  {
    q: "Non vi conosco: come faccio a sapere che siete affidabili?",
    a: "Il curriculum è verificabile: Vaticano 1989 davanti a Giovanni Paolo II, i venticinque anni di carriera festeggiati nel 2006 al Piccolo Teatro Studio di Milano, quattro passaggi RAI dal 1990 al 2006, il Festival Internazionale del Clown di Milano nel 1993 e il Festival Internazionale del Riso di Bordighera nel 1996, dove sono stato il più applaudito. Ma il numero che conta per voi è un altro: oltre 1.800 rappresentazioni con I Barabba's Clown e oltre 2.000 repliche con la mia compagnia. Non è un debutto, è un repertorio rodato migliaia di volte.",
  },
  {
    q: "Il teatro comico rischia di essere volgare: ho una sala parrocchiale con famiglie e anziani.",
    a: "Vengo dai Salesiani di Arese, dove sono entrato nel 1975 a undici anni, e da più di vent'anni formo gli educatori d'oratorio sulla responsabilità. «La Valigia di S. Francesco» è liberamente ispirato alle Fonti Francescane. È teatro nato dentro l'oratorio, non teatro adattato all'oratorio.",
  },
  {
    q: "Senza parole i bambini si annoiano e gli adulti non capiscono.",
    a: "È il contrario, ed è il cuore del mestiere: mi sono formato alla scuola di Marcel Marceau e alla scuola svizzera di Pierre Bayland. Un linguaggio universale che supera le parole tiene insieme bambini, giovani, adulti e anziani nella stessa sala. La prova sul campo sono le repliche in Belgio, Francia, Germania, Spagna, Svizzera, Madagascar, Brasile e Perù: dove le parole non arrivavano, lo spettacolo ha funzionato lo stesso.",
  },
  {
    q: "È un clown: come giustifico una spesa culturale seria?",
    a: "Lo stesso repertorio va in scena da oltre vent'anni all'Università Bocconi di Milano e ha recitato al teatro Museo della Nazione in Perù davanti al Presidente della Repubblica. E i temi non sono intrattenimento: femminicidio e illegalità, naufragi e diritti umani, Prima Guerra Mondiale. La clownerie qui è la forma, non il contenuto.",
  },
  {
    q: "I ragazzi delle medie non stanno fermi un'ora. Come li tenete?",
    a: "Su questo c'è una testimonianza che non è mia: un dirigente scolastico che ha assistito a molte repliche de «La Grande Guerra e il piccolo alpino» garantisce che al termine si coglie la crescita di sensibilità del pubblico. Ai temi duri si arriva attraverso la forma comica: i ragazzi partecipano a un'avventura invece di subire una lezione.",
  },
  {
    q: "Mi serve un progetto educativo, non solo uno spettacolo.",
    a: "È già previsto. «Il Bullo» dura due ore perché al termine esco dal personaggio e racconto i miei dieci anni di collegio e le volte in cui ho dovuto scegliere. «L'uomo e il mare di plastica» comprende il dibattito con l'artista. Fuori dal palco, da oltre vent'anni tengo incontri per giovani e famiglie sui temi della crescita e corsi sulla responsabilità per gli educatori d'oratorio.",
  },
  {
    q: "Non ho un tecnico né un service, e ho paura di riempire mezza sala.",
    a: "Arrivo con la mia produzione: tutti gli spettacoli sono del Teatro Procopio e hanno lo stesso tecnico audio e luci, Giorgio Albini, indicato in ogni scheda. Non dovete coordinare fornitori. Sul pubblico, la soglia è dichiarata in modo trasparente in ogni scheda — minimo 120 spettatori — così sapete in partenza il bacino da coprire; e per i bacini più piccoli la strada già battuta è mettersi insieme fra oratorio, parrocchia e Comune.",
  },
];
