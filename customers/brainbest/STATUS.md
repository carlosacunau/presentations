# STATUS, Brainbest deck legibility (S1)
Updated: 260814 17:45

## Where we are

Session 1 did not read in the room: Spanish captions at 17px grey under diagrams
with large high-contrast English words, so the audience read the English.
Translating the 39 images was dropped (two image sets is expensive) and the
composition was fixed instead.

Carlos tuned the composition in a single-slide lab (`s1/_lab-pillars.html`) and
approved the values. He also approved the zoom. Step 3, positioning, is still
open, and there is one live bug (see Next).

## The correct mental model (this is what took the longest to see)

impress.js does NOT reflow content. The deck declares a 1920x1080 reference
canvas (`data-width`/`data-height`) and computes ONE uniform scale,
min(windowH/1080, windowW/1920), applied as a single transform. Slides never
reflow: the whole thing scales, letterboxing if needed.

Consequence: vh/vw units DO NOT work here. They measure against the real window
and then get multiplied again by the impress scale, so the design changes
proportion with window size. Everything goes in stage pixels. All the earlier
vh/vw-based CSS was the underlying bug.

Second layer, the one that broke the fit: each step ALSO carried its own camera
scale (`FRAMES = [1.7, 0.7, 1.2, 0.6, ...]`, the Prezi push-in and pull-back).
`data-scale` does not only control the camera travel, it also decides how large
the content ends up on screen, so the same 710px image rendered at a different
size on every card and the lab composition only held on scale-1 cards.

Compensating with the inverse (`base = 1/frame`) was tried and is WRONG: it
double-corrects. Resolved by setting every image card to `IMG_FRAME = 1.0`
(Carlos's call, option A). All 39 now render exactly like the lab. The movement
comes from position (serpentine + jitter) and tilt instead of zoom. Section
openers and the close keep their large scale: the zoom jump there is wanted, and
they carry no diagram to distort.

## Values approved by Carlos (from the lab)

    --img-h: 710px      --gap: 8px        --head-size: 40px
    --body-size: 24px   --take-size: 29px --text-w: 1560px
    --pad-x: 90px       --pad-y: 54px     --head-tracking: 0.100em
    heading UPPERCASE (via CSS, not in INDEX.md)
    body justified + hyphens:auto (requires lang="es")

Carlos's rule: **do not trim anything, scale smaller if needed.** That is why
`.fitbox` scales the WHOLE block instead of shrinking individual elements.

## Done

- Lab values transplanted into `s1/build.py`, in stage pixels
- `.fitbox` wraps the content; `--shrink` scales the entire block
- Removed the `.longtext`/`.xlongtext` tiers: they shrank type on exactly the
  cards with the MOST text, backwards from what a room needs
- `lang="es"` (without it `hyphens:auto` does nothing and justify opens rivers)
- The 820px media query no longer touches `.imgstep` (it remixed vw/vh)
- Intrinsic `width`/`height` on the images (all 39 are 1536x1024) so the first
  fit measurement does not run before the PNGs decode
- **Every image card at `data-scale` 1.0.** Section openers and close keep 3.0
- Canvas relaid out: blocks in a 3-wide grid (`BLOCKS_PER_ROW`) instead of one
  stacked column, which was making the canvas twice as tall as wide.
  COLS 4, COL_DX 3000, ROW_DY 2000, BLOCK_GAP 2600. Overview ratio w/h 1.60
  (was 0.47), close to the 1.78 of a 16:9 screen
- Spacing sized off the real footprint: a 1920x1080 card tilted 14 degrees
  occupies 2124x1512, plus jitter. The old ROW_DY of 900 made rows overlap
- `footprint()` fixed to 1920 for image steps (it still said 1180, so the
  overview under-measured and cards collided)

## Verified (1920x1080, active step, after the transition settles)

- All 39 cards: image between 631 and 710px, spread of 79px (was 497)
- Nothing clipped on any card
- The remaining variation is the intended behaviour: cards with more text scale
  down a little to fit, per Carlos's "do not trim, scale smaller" rule. Longest
  card (5.4, 752 chars) 634px; shortest at the full 710px
- Overview: zero overlapping pairs, nothing offscreen, fills 92% of the width
  and 67% of the height
- `s1-web/` rebuilt (9.4M, 39 images)

**Gotcha that cost hours:** the browser served a STALE `index.html` and every
measurement pointed at a bug that no longer existed in the file. Always confirm
freshness first (read `data-scale` off a known step, or add a `?v=N` to the
URL). Also: `python3 build.py` must run from `s1/`, `cd` drift silently writes
somewhere else.

## Ayuda colapsable (260814, último cambio)

La barra de teclas iba fija abajo a la derecha y siempre visible. En el MacBook
de 14" (1512x982) se pisaba con el cierre de la diapositiva. En el monitor de
23" y en el ultrawide de 34" no pasaba: impress escala el escenario de 1080
hasta que el contenido toca el borde de abajo, y en pantallas cortas eso cae
justo donde estaban la barra y la marca de agua.

Reemplazada por un botón (?) abajo a la derecha, discreto (opacidad 0.45, sólido
al pasar el mouse), que abre un panel. Abre y cierra con el botón o con la tecla
`?`; cierra con Escape, con un clic afuera o al cambiar de diapositiva. Con el
panel abierto la marca de agua se apaga. Debajo de 1000px de alto, marca y botón
se achican y se van a la esquina. Además hay una guarda en JS que mide de verdad
y aparta cualquiera de los dos si el texto de esa tarjeta se acerca a menos de
14px (el botón nunca baja de 0.12 de opacidad ni deja de ser clickeable).

Verificado sin solapamientos en las 39 tarjetas en: 1512x982 (el que fallaba),
1920x1080, 3440x1440 y 1024x768. La guarda no tuvo que activarse en ninguna: el
CSS solo ya alcanza, queda de red de seguridad.

Detalle que confundió al medir: durante la transición aparecen solapamientos que
NO son reales. Hay que esperar a que termine (más de 950ms) antes de medir.

## Next

- Paso 3 terminado. Falta que Carlos mire el recorrido completo y diga si el
  scatter le gusta (`#/overview`, o recorrer con flechas).
- Ajustes finos posibles si lo quiere distinto: `COL_DX` / `ROW_DY` (aire entre
  tarjetas), `BLOCKS_PER_ROW` (cuántos bloques por banda), `TILTS` (inclinación),
  `JIT_X` / `JIT_Y` (desorden). Todo en la cabecera de build.py.
- Pendiente viejo, sin decidir: si el mobile importa. El deck está pensado para
  proyectar, no para teléfono.

## Blocked / waiting on

- Nothing external. Carlos approved composition and zoom.

## Key decisions

- Do NOT translate the 39 marker images. The room problem was unreadable
  Spanish, not the presence of English. Also avoids maintaining two sets.
- Fix CSS, never regenerate images. Reversible, no drift.
- Flatten every image card to data-scale 1.0 (option A, Carlos 260814). The
  Prezi feel comes from position, tilt and travel, not from zoom variation.
  Trying to keep the zoom AND normalise the size does not work: impress already
  cancels data-scale when focusing a step, so compensating corrects twice.
- Do not trim: scaling the whole block preserves every proportion.
- Technical labels (SKILL.md, JSON, PDF, MCP, API) would have stayed English
  anyway: 83 of 403 labels.

## Files that matter

- `s1/build.py`, all the CSS lives here. Edit this, NEVER `s1/index.html`
- `s1/_lab-pillars.html`, the single-slide lab with sliders. Use it to retune
  without fighting impress
- `s1/INDEX.md`, camera path and caption text (title, body, takeaway)
- `build-web.sh`, regenerates `s1-web/`. Run after every build.py change
- `scratchpad/fitmath.py`, validates the fit math with no browser
- Translation review artifact, if ever revisited:
  https://claude.ai/code/artifact/b0df7d5c-4fa9-4fe4-a6bf-fd81207dd31d
