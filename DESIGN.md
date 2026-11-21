# DESIGN.md – Studio Dentistico Ceraldi

Direzione: **il linguaggio di Instagram portato sul web**. Blu profondo come colore di marca, arancione come accento vivo, azzurro chiarissimo come respiro, titoli serif robusti e testo sans pulito. Foto vere, cornice "a fiore" ondulata come motivo grafico riconoscibile, piccoli ornamenti linea-punto arancioni. Moderno per precisione e movimento, non per effetti.

Solo tema chiaro.

## Colore

| Token | Valore | Ruolo |
|---|---|---|
| `--blue-900` | `#1f3763` | testo titoli su chiaro, footer |
| `--blue-800` | `#2c4a80` | **colore di marca**: fasce piene, bottone primario (bianco sopra 8.8:1) |
| `--blue-500` | `#4d8ac8` | blu del logo: grafiche, icone, numeri grandi. Mai testo piccolo (3.6:1) |
| `--blue-100` | `#e3ebfe` | superfici tinte, chip, giorno corrente |
| `--blue-50` | `#f5f8ff` | sezioni alternate |
| `--orange-500` | `#ec7442` | **accento**: ornamenti, cornici, sottolineature, puntini. Solo decorativo (2.9:1) |
| `--orange-400` | `#f28a5c` | testo arancione grande sul blu (3.6:1 su `--blue-800`) |
| `--orange-700` | `#c4541f` | testo/link arancione e bottone accento con testo bianco (4.5:1) |
| `--ink` | `#16202c` | testo principale |
| `--ink-2` | `#5d6b80` | testo secondario (≥5:1) |
| `--line` | `#d9e2f2` | bordi |
| `--paper` | `#ffffff` | sfondo |
| `--ok` | `#1f7a4d` | "aperto ora" |

Regola: per ogni schermata un solo elemento arancione forte.

## Tipografia (self-hosted)

- Titoli: **Source Serif 4** 600/700 (eco del serif dei post). Corsivo per la parola-accento nei titoli, come lo script dei post
- Testo e UI: **Figtree** 400/500/600/700 (eco del sans geometrico dei post)

| Token | Size / lh | Uso |
|---|---|---|
| `--fs-xs` | 13 / 18 | etichette maiuscole (tracking .08em) |
| `--fs-sm` | 15 / 24 | note, footer |
| `--fs-base` | 17 / 28 | testo |
| `--fs-lg` | 20 / 30 | lead |
| `--fs-h3` | 24 / 30 | titoli card |
| `--fs-h2` | clamp(32px, 4.2vw, 52px) / 1.08 | sezioni |
| `--fs-h1` | clamp(42px, 7vw, 88px) / 1.0 | apertura |

Righe max `64ch`.

## Spaziatura

Scala 4px: `4 8 12 16 24 32 48 64 96 128 160`. Padding sezioni `clamp(72px, 11vw, 160px)`. Contenuto `1240px`, margini `clamp(20px, 5vw, 56px)`.

## Forma e profondità

- Raggi: `--r-sm 10px`, `--r-md 20px`, `--r-lg 32px` (foto grandi), `--r-pill 999px`
- Cornice a fiore: `clip-path` / maschera SVG con bordo ondulato (12 lobi) per ritratti e foto rotonde
- Un'ombra: `0 1px 2px rgb(31 55 99 / .08), 0 16px 40px -12px rgb(31 55 99 / .18)` solo su elementi sospesi

## Componenti

- **Bottone primario**: pill `--blue-800`, testo bianco 600; hover più scuro; press `scale(.97)`; focus ring 3px `--orange-500` offset 3px
- **Bottone accento**: pill `--orange-700`, testo bianco (un solo uso per schermata: "Chiama")
- **Bottone secondario**: pill bordo `--line`, testo `--blue-900`
- **Titoli di sezione**: nessuna etichetta sopra il titolo; sotto, una lineetta arancione di 56px
- **Header**: sticky, bianco traslucido solo dopo lo scroll; mobile menu a schermo intero
- **Barra azioni mobile** (<768px): fissa in basso dopo l'apertura, "Chiama" + "Prenota"
- **Richiesta appuntamento**: modulo che compone il messaggio e apre WhatsApp; nessun dato salvato
- **Trattamenti**: elenco tipografico a righe con nome serif e descrizione che si apre al clic (`<details>`), senza numeri né card identiche
- **Orari**: tabella con giorno corrente evidenziato e stato aperto/chiuso calcolato
- **Mappa**: facciata statica, Google Maps caricato solo al clic

## Movimento (regole Emil Kowalski)

- Solo `transform` e `opacity`; easing `cubic-bezier(.23,1,.32,1)` (ease-out forte) per entrate, durate 200–450ms
- Bottoni: press `scale(.97)` 120ms; hover solo con `@media (hover:hover)`
- Entrata dell'apertura una volta al caricamento (titolo a parole, foto con `clip-path` che si apre)
- Immagini che si rivelano con `clip-path: inset()` all'ingresso nel viewport, una volta
- Niente parallax sul testo, niente fade su ogni sezione
- `prefers-reduced-motion`: tutto fermo e visibile

## Immagini e icone

- Foto vere dello studio; ritratti nella cornice a fiore
- Icone lineari stile Lucide, stroke 1.75, inline SVG
- Nessuna emoji, nessun 3D stock
