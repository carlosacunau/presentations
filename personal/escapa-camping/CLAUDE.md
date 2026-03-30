# ES CA PA — Camping Padre-Hijo SIVM 2026

## What This Is

Registration matrix for the Scuola Italiana Vittorio Montiglio parent-child camping trips. Published on GitHub Pages.

- **Live URL:** https://carlosacunau.github.io/presentations/personal/escapa-camping/
- **Source form:** https://docs.google.com/forms/d/e/1FAIpQLSe7APLCb1iD2UlELQvw8to8F_D7mPhGdc_c8v2xbp3a0JXV9Q/viewform
- **Source spreadsheet:** `1NutvWUnFoWsD0atbk9XYp02AIlxfotYGqMcweyqndSQ` (Google Sheets, accessible via acuna.carlosandres@gmail.com)

## Camps (columns, ordered by grade)

| Camp | Grade | Dates | Header Color |
|------|-------|-------|-------------|
| Esploratori | 1° Básico | 20-22 Nov | Green |
| Campeggio | 2° Básico | 06-08 Nov | Blue |
| Campisti | 4° Básico | 13-15 Nov | Orange |
| Papimono | 6° Básico | 27-29 Nov | Purple |

## Carlos's Kids

- **Isabela** — 2° Básico → Campeggio
- **Federico** — 4° Básico → Campisti

## Data Rules

1. **Kid placement:** "camping mayor" → higher grade camp, "camping menor" → lower grade camp
2. **Papimono exception:** Only camp that admits younger siblings. If parent registers for Papimono only, both kids go under Papimono
3. **Size ordering:** XS is an adult/teen letter size, LARGER than 12-14 (kids numeric). When form has both XS and 12-14, XS goes to the older kid
4. **Deduplication:** If same parent submitted multiple times, use the latest entry
5. **Sorting:** Alphabetically by parent first name
6. **Kid names:** First name only, no last names
7. **Logos:** Downloaded from the Google Form, stored in `img/`

## Sync Process

To update from the spreadsheet:

1. Read sheet: `spreadsheet_id=1NutvWUnFoWsD0atbk9XYp02AIlxfotYGqMcweyqndSQ`, range `A1:J200`
2. Process rows per rules above
3. Replace tbody in `index.html` via Python regex (between `<tbody>` and `</tbody>`)
4. Git commit + push if changes exist

A cron job can be set up to auto-sync every 30 minutes: just say "turn on the camping sync".

## Page Features

- Sticky thead (camp names freeze on scroll)
- Landscape mobile responsive (fits horizontally when phone rotated)
- Open Graph meta tags (WhatsApp link preview with banner image)
- Auto-counting footer (total kids per camp)
