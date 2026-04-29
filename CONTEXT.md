# Domain Language

## Spettacolo (Show)
The central entity representing a theatrical performance.
- **Attributes**: title, description, category, technical specs.
- **State**: can be a `draft` or `active`.
- **Highlight**: indicates it should be featured on the homepage.
- **Assets**: includes a main image and a collection of gallery images.

## Galleria (Gallery)
The visual representation of all `active` shows.
- **Gallery Image**: An image belonging to a specific show, stored in a folder matching the show's ID.

## Technical Specs
A set of fields describing the requirements and credits of a show.
- **Credits**: Produzione, Regia, Cast Tecnico.
- **Requirements**: Spazio Scenico, Oscuramento, Minimo Alunni.
- **Details**: Durata, Età Consigliata, Costo.
