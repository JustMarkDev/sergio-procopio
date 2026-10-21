/**
 * Trust-anchor copy for agent-readable markdown and structured data (JSON-LD).
 * It powers agent markdown/SEO only and must not be rendered as visible HTML.
 */

import { SITE_URL } from "../consts";

export const CONTACT_NAP = {
  name: "Sergio Procopio",
  email: "info@sergioprocopio.it",
  telephone: "+393805252684",
  telephoneDisplay: "+39 3805252684",
  url: SITE_URL,
  contactPath: "/contatti",
  contactAliasPath: "/contact",
} as const;

export const CONTACT_TRUST_IT = [
  "Questa è la pagina ufficiale per contattare Sergio Procopio, attore, mimo e regista teatrale con sede operativa in Italia. Usala quando una scuola, una parrocchia, un'associazione, un comune, un teatro o una famiglia vuole chiedere disponibilità, un preventivo, uno spettacolo, un laboratorio o un incontro formativo sul bullismo, sulla dipendenza da smartphone, sull'ambiente, sulla pace o sulla memoria.",
  "Rispondo personalmente alle richieste serie di programmazione. Indica periodo, luogo, tipo di pubblico e lo spettacolo che ti interessa: ti confermo disponibilità e propongo un preventivo chiaro. Telefono, email e modulo di questa pagina sono i canali ufficiali pubblicati anche su sergioprocopio.it.",
  `Riferimenti (nome, telefono, email): ${CONTACT_NAP.name}, tel. ${CONTACT_NAP.telephoneDisplay}, email ${CONTACT_NAP.email}. Il sito canonico è ${CONTACT_NAP.url}.`,
].join("\n\n");

export const CONTACT_TRUST_EN = [
  "This is the official Contact page for Sergio Procopio, Italian actor, mime and theatre director. Use it when a school, parish, association, municipality, theatre or family needs availability, a quote, a show, a workshop or an educational meeting on bullying, phone dependence, the environment, peace or historical memory.",
  "I answer serious booking requests personally. Share the preferred dates, venue, audience and the show you have in mind: I confirm availability and send a clear quote. Phone, email and the form on this page are the official channels also published on sergioprocopio.it.",
  `Contact details (name, phone, email): ${CONTACT_NAP.name}, phone ${CONTACT_NAP.telephoneDisplay}, email ${CONTACT_NAP.email}. The canonical website is ${CONTACT_NAP.url}.`,
].join("\n\n");

// The booking steps shown on the contact page and repeated in its Markdown copy.
export const CONTACT_STEPS = {
  it: [
    {
      title: "Scrivimi",
      description: "Raccontami il periodo, il luogo e il pubblico che vorresti coinvolgere.",
    },
    {
      title: "Ti rispondo io",
      description: "Verifichiamo la disponibilità e definiamo una proposta con un preventivo.",
    },
    {
      title: "Confermiamo la data",
      description: "Accordiamo i dettagli tecnici per portare lo spettacolo da te.",
    },
  ],
  en: [
    {
      title: "Write to me",
      description: "Tell me the period, the venue and the audience you want to involve.",
    },
    { title: "I reply", description: "We check availability and define a proposal with a quote." },
    {
      title: "We confirm the date",
      description: "We agree the technical details so the show can come to you.",
    },
  ],
} as const;
