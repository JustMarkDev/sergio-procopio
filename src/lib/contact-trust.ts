/** Shared trust-anchor copy for /contact and /contatti (500+ characters each). */

export const CONTACT_NAP = {
  name: "Sergio Procopio",
  email: "info@sergioprocopio.it",
  telephone: "+393805252684",
  telephoneDisplay: "+39 3805252684",
  vat: "02470860137",
  streetAddress: "Via Genico, 2",
  url: "https://sergioprocopio.it",
  contactPath: "/contatti",
  contactAliasPath: "/contact",
} as const;

export const CONTACT_TRUST_IT = [
  "Questa è la pagina ufficiale per contattare Sergio Procopio, attore, mimo e regista teatrale con sede operativa in Italia. Usala quando una scuola, una parrocchia, un'associazione, un comune, un teatro o una famiglia vuole chiedere disponibilità, un preventivo, uno spettacolo, un laboratorio o un incontro formativo sul bullismo, sulla dipendenza da smartphone, sull'ambiente, sulla pace o sulla memoria.",
  "Rispondo personalmente alle richieste serie di programmazione. Indica periodo, luogo, tipo di pubblico e lo spettacolo che ti interessa: ti confermo disponibilità e propongo un preventivo chiaro. Telefono, email e modulo di questa pagina sono i canali ufficiali pubblicati anche su sergioprocopio.it.",
  `Riferimenti NAP (nome, indirizzo, telefono): ${CONTACT_NAP.name}, sede fiscale ${CONTACT_NAP.streetAddress}, P.IVA ${CONTACT_NAP.vat}, tel. ${CONTACT_NAP.telephoneDisplay}, email ${CONTACT_NAP.email}. Il sito canonico è ${CONTACT_NAP.url}.`,
].join("\n\n");

export const CONTACT_TRUST_EN = [
  "This is the official Contact page for Sergio Procopio, Italian actor, mime and theatre director. Use it when a school, parish, association, municipality, theatre or family needs availability, a quote, a show, a workshop or an educational meeting on bullying, phone dependence, the environment, peace or historical memory.",
  "I answer serious booking requests personally. Share the preferred dates, venue, audience and the show you have in mind: I confirm availability and send a clear quote. Phone, email and the form on this page are the official channels also published on sergioprocopio.it.",
  `NAP details (name, address, phone): ${CONTACT_NAP.name}, fiscal address ${CONTACT_NAP.streetAddress}, VAT ${CONTACT_NAP.vat}, phone ${CONTACT_NAP.telephoneDisplay}, email ${CONTACT_NAP.email}. The canonical website is ${CONTACT_NAP.url}.`,
].join("\n\n");

export const contactTrustPlainText = (locale: "it" | "en") =>
  locale === "en" ? CONTACT_TRUST_EN : CONTACT_TRUST_IT;
