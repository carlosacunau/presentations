#!/usr/bin/env python3
# Build the Prezi-style (impress.js) version of the workshop deck.
# Light theme + Fiba violet accent + logo. Camera path = order in STEPS.
# Diagramas en assets/diagrams/: 39 PNG de 1536x1024 (proporción 3:2, la que
# entrega image_gen de Codex). NO son 16:9, a pesar de que la pantalla sí lo es.
# El alto lo fija --img-h y el ancho sale de la proporción del archivo, así que
# cambiar de proporción no rompe nada: solo cambia cuánto ancho ocupa el dibujo.

import html, os, re, sys

DEST = "/Users/carlosacuna/OS/presentations/customers/brainbest/s1"
TEMPLATE = "/Users/carlosacuna/OS/.claude/skills/prezi-deck/assets/template.html"
INDEX = os.path.join(DEST, "INDEX.md")

# ---- Camera path comes from INDEX.md -------------------------------------
# INDEX.md is the source of truth: each ## block is a section, each table row
# is a step. The build reads it top to bottom; reorder rows to re-choreograph.
# kind: cover | section | image | close
#
# Segments = sections. Pass a section name (matched case-insensitively against
# the section title) to build just that block as a standalone mini-deck:
#   python3 build.py                 -> full deck
#   python3 build.py prompting       -> just the Prompting section (+ cover/close)
#   python3 build.py "file formats"  -> just File Formats

def parse_index(path):
    """Parse INDEX.md into (cover, sections, close).

    sections = [ {title, num, sub, images:[{img,cap}]} ]
    cover/close = {title, eyebrow|sub} or None.
    """
    cover, close = None, None
    sections = []
    cur = None            # current section dict
    pending_sub = None    # sub captured from the *Opener sub:* line
    mode = None           # which block heading we're under: cover|section|close

    def cells(line):
        # split a markdown table row into trimmed cells, respecting \| escapes
        body = line.strip().strip("|")
        parts = re.split(r"(?<!\\)\|", body)          # split on unescaped pipes only
        return [p.replace("\\|", "|").strip() for p in parts]  # then unescape

    for raw in open(path, encoding="utf-8"):
        line = raw.rstrip("\n")

        # block headings
        m = re.match(r"##\s+(.*)", line)
        if m:
            heading = m.group(1).strip()
            low = heading.lower()
            if low == "cover":
                mode = "cover"; cur = None
            elif low == "close":
                mode = "close"; cur = None
            elif low.startswith("section"):
                # "Section 01: File Formats"
                mode = "section"
                title = heading.split(":", 1)[1].strip() if ":" in heading else heading
                num_m = re.search(r"section\s+(\w+)", low)
                cur = dict(title=title, num=(num_m.group(1) if num_m else ""),
                           sub="", images=[])
                sections.append(cur)
            else:
                mode = None; cur = None
            pending_sub = None
            continue

        # opener sub line: *Opener sub: "..."*
        sm = re.match(r"\*Opener sub:\s*\"?(.*?)\"?\*\s*$", line)
        if sm and cur is not None:
            cur["sub"] = sm.group(1).strip()
            continue

        # table rows (skip header + separator rows)
        if line.startswith("|") and "|" in line[1:]:
            c = cells(line)
            if len(c) < 4:
                continue
            if c[0].lower() in ("#", "") and c[1].lower() == "kind":
                continue  # header row
            if set(c[0]) <= set("-: "):
                continue  # separator row
            kind = c[1].lower()
            imgfile = c[2].strip()
            caption = c[3].strip()
            if imgfile.lower() in ("(none)", "none", "-", "—", ""):
                imgfile = ""

            if kind == "cover":
                # eyebrow lives in Notes: 'eyebrow: "..."'
                note = c[4] if len(c) > 4 else ""
                eb = re.search(r'eyebrow:\s*"?([^"|]+)"?', note)
                cover = dict(title=caption, eyebrow=(eb.group(1).strip() if eb else ""))
            elif kind == "close":
                note = c[4] if len(c) > 4 else ""
                # Two-tier flow close: caption is "top steps || bottom steps",
                # each tier slash-separated. Rendered as two colored rows.
                if "||" in caption:
                    top, bottom = caption.split("||", 1)
                    close = dict(
                        flow=True,
                        top=[s.strip() for s in top.split("/") if s.strip()],
                        bottom=[s.strip() for s in bottom.split("/") if s.strip()],
                    )
                else:
                    sb = re.search(r'sub:\s*"([^"]+)"', note)
                    close = dict(flow=False, title=caption,
                                 sub=(sb.group(1).strip() if sb else ""))
            elif kind == "section":
                # the title in the row is redundant with the heading; keep heading's
                pass
            elif kind == "image" and cur is not None and imgfile:
                # La caption trae los tres campos del scene box de la galería,
                # separados por "||": titular || cuerpo || cierre. Si vienen menos
                # campos, los que falten quedan vacíos y no se renderizan.
                parts = [p.strip() for p in caption.split("||")]
                head = parts[0] if parts else ""
                body = parts[1] if len(parts) > 1 else ""
                take = parts[2] if len(parts) > 2 else ""
                # Título de extensión OPCIONAL, arriba de la imagen. Se escribe en
                # la columna Notes como `ext: .DOCX`. Existe porque en sala el
                # bloque de tipos de archivo no se leía: la extensión venía solo
                # dibujada dentro de la imagen, chica. Esto NO toca las imágenes.
                ex = re.search(r'\bext:\s*([^\s|,;]+)', (c[4] if len(c) > 4 else ""), re.I)
                cur["images"].append(dict(img=imgfile, cap=head,
                                          body=body, take=take,
                                          ext=(ex.group(1).strip() if ex else "")))
    return cover, sections, close


# Optional segment filter (build just one section)
SEGMENT = " ".join(sys.argv[1:]).strip().lower() or None

cover, _sections, close = parse_index(INDEX)
if SEGMENT and SEGMENT not in ("full", "all"):
    kept = [s for s in _sections if SEGMENT in s["title"].lower()]
    if not kept:
        print(f"No section matches '{SEGMENT}'. Available:",
              ", ".join(s["title"] for s in _sections))
        sys.exit(1)
    _sections = kept

# Flatten parsed structure back into the flat STEPS list the layout engine expects.
# Each step gets a STABLE, readable id used for deep-links and the TOC:
#   home            = cover
#   1, 2, 3...      = section openers (whole number = the section)
#   1.1, 1.2 ...    = the slides inside section 1
#   thank-you       = close
# overview is appended later by the template (DOM-last), so the loop runs
# home -> 1 -> 1.1 ... -> thank-you -> overview -> (wraps) home.
STEPS = []
if cover:
    STEPS.append(dict(kind="cover", sid="home",
                      title=cover["title"], eyebrow=cover["eyebrow"]))
for si, s in enumerate(_sections, start=1):
    STEPS.append(dict(kind="section", sid=str(si),
                      num=s["num"], title=s["title"], sub=s["sub"]))
    for ii, im in enumerate(s["images"], start=1):
        STEPS.append(dict(kind="image", sid=f"{si}.{ii}",
                          img=im["img"], cap=im["cap"],
                          body=im.get("body", ""), take=im.get("take", ""),
                          ext=im.get("ext", "")))
if close:
    if close.get("flow"):
        STEPS.append(dict(kind="close", sid="thank-you", flow=True,
                          top=close["top"], bottom=close["bottom"]))
    else:
        STEPS.append(dict(kind="close", sid="thank-you", flow=False,
                          title=close["title"], sub=close["sub"]))

# ---- Cinematic layout engine ---------------------------------------------
# NOT a flat grid. Images are laid on a serpentine path through each section
# with VARIED rotation and VARIED on-canvas scale, so the camera twists and
# dives between beats (the real Prezi feel). Bold parameters:
#   - rotation cycles through strong tilts (camera twists between images)
#   - some images placed LARGE (camera pulls back) and some SMALL (camera dives
#     in to read them) -> the zoom itself becomes the drama
# Deterministic (no RNG): all variation is index-driven so the build is stable.

# Layout aspect: the deck is navigated one slide at a time, so these only shape
# the OVERVIEW "view". Goal = a balanced, landscape-ish bounding box (closer to
# the 16:9 screen) instead of a tall narrow column with big empty side margins.
# Levers: more columns + wider COL_DX widen the canvas; smaller ROW_DY/BLOCK_GAP
# shorten it. Vertical stacking is kept (Carlos wants to use vertical space too).
# 260814: la vista general seguía saliendo casi 3 veces más alta que ancha
# (ratio 0.36), así que al hacer zoom out quedaban esos márgenes vacíos enormes
# a los lados. El span vertical lo domina la suma de las 9 secciones, no el
# ancho de cada banda. Arreglo: bandas más anchas (7 columnas, COL_DX mayor) y
# apilado vertical más apretado (ROW_DY y BLOCK_GAP menores). Objetivo: ratio
# w/h cerca de 1.0, que es lo que llena una pantalla 16:9.
# Espaciado recalculado (260814) al pasar todas las tarjetas a escala 1.0. Antes
# las tarjetas medían 1180 de ancho y venían a escalas de 0.6 a 1.7; ahora son
# 1920x1080 fijas. Inclinadas 14 grados, la caja que ocupan es 2124x1512, y el
# jitter suma +-320 en X y +-300 en Y. Con ROW_DY en 900 las filas se pisaban.
# Estos valores dejan un pasillo de aire entre tarjeta y tarjeta.
COL_DX = 3000            # 2124 (caja inclinada) + 640 (jitter) + aire
ROW_DY = 2000            # 1512 (caja inclinada) + jitter + aire
COLS   = 4               # imágenes por fila dentro de cada bloque
SECTION_SCALE = 3.0      # big pull-back for section openers
COVER_SCALE   = 3.0
CLOSE_SCALE   = 3.0
BLOCK_GAP = 2600         # aire entre el final de un bloque y la siguiente apertura

# Inclinaciones, para que la cámara llegue torcida a cada tarjeta.
TILTS  = [-12, 9, -6, 14, -10, 7, -14, 11, -4, 13]   # grados, signo alternado

# IMG_FRAME fijo en 1.0 (260814, decisión de Carlos).
#
# Antes acá había un ciclo de zoom por tarjeta (1.7, 0.7, 1.2, 0.6, ...) para el
# efecto Prezi de entrar y salir. El problema: data-scale no cambia solo el
# viaje de cámara, también decide a qué tamaño queda el contenido en pantalla.
# Con el ciclo, la misma imagen de 710px se veía distinta en cada tarjeta (hasta
# 360px en las de frame 1.7), o sea que la composición que Carlos ajustó en el
# lab solo valía para las tarjetas de escala 1. Se probó compensar con la
# inversa y sale peor: impress ya anula data-scale al enfocar el paso, así que
# corrige dos veces.
#
# Con todas las tarjetas de imagen en 1.0, las 39 se ven EXACTAMENTE como el
# lab. El movimiento sigue estando: viene de la posición (serpentina + jitter) y
# de la inclinación, no del zoom. Las aperturas de sección y el cierre SÍ
# conservan su escala grande (SECTION_SCALE / CLOSE_SCALE): ahí el salto de zoom
# es deseable, marca el cambio de bloque, y no llevan diagrama que se deforme.
IMG_FRAME = 1.0

# Jitter posicional, para que la serpentina no se lea como una grilla. Se abrió
# el rango (antes 120/180) ahora que el zoom no aporta variedad: el recorrido lo
# tiene que dar la posición.
JIT_X  = [220, -320, 170, -260, 300, -190]
JIT_Y  = [-210, 260, -160, 240, -300, 190]

placed = []
cover_y = -3000
y_cursor = 0
close_y = None

n = len(STEPS)
STEPS[0]["x"], STEPS[0]["y"], STEPS[0]["scale"], STEPS[0]["rotate"] = 0, cover_y, COVER_SCALE, 0
placed.append(STEPS[0])

img_counter = 0          # global, so tilt/frame cycles run across the whole deck

# Los bloques se acomodan en una malla de BLOCKS_PER_ROW de ancho, no en una
# sola columna (260814). Antes las 9 secciones se apilaban una debajo de otra,
# así que el lienzo salía casi el doble de alto que de ancho (ratio 0.47) y al
# hacer zoom out quedaban márgenes vacíos enormes a los lados. Repartiéndolos en
# 3 columnas el lienzo se acerca a 16:9, que es lo que llena la pantalla en la
# vista general.
BLOCKS_PER_ROW = 3
block_index = 0
band_h = 0               # alto del bloque más alto de la banda actual
band_top = 0             # y donde empieza la banda actual

i = 1
while i < n:
    s = STEPS[i]
    if s["kind"] == "section":
        block_imgs = []
        j = i + 1
        while j < n and STEPS[j]["kind"] == "image":
            block_imgs.append(STEPS[j]); j += 1
        rows = (len(block_imgs) + COLS - 1) // COLS
        block_w = (min(COLS, max(1, len(block_imgs))) - 1) * COL_DX

        bcol = block_index % BLOCKS_PER_ROW
        if bcol == 0 and block_index > 0:
            # Arranca banda nueva: baja lo que midió la más alta de la anterior.
            band_top += band_h + BLOCK_GAP
            band_h = 0
        # Ancho fijo por columna de bloques, para que las bandas queden alineadas
        # y no se pisen aunque un bloque tenga más imágenes que otro.
        block_x0 = bcol * (COLS * COL_DX + BLOCK_GAP)
        opener_y = band_top

        cx = block_x0 + block_w / 2
        s["x"], s["y"], s["scale"], s["rotate"] = cx, opener_y, SECTION_SCALE, 0
        placed.append(s)
        grid_top = opener_y + ROW_DY
        for idx, im in enumerate(block_imgs):
            r = idx // COLS
            c = idx % COLS
            # serpentine: even rows L->R, odd rows R->L (camera snakes, no jump-back)
            if r % 2 == 1:
                c = (COLS - 1) - c
            jx = JIT_X[img_counter % len(JIT_X)]
            jy = JIT_Y[img_counter % len(JIT_Y)]
            im["x"] = block_x0 + c * COL_DX + jx
            im["y"] = grid_top + r * ROW_DY + jy
            im["scale"]  = IMG_FRAME
            im["rotate"] = TILTS[img_counter % len(TILTS)]
            placed.append(im)
            img_counter += 1
        this_h = (grid_top + (rows - 1) * ROW_DY) - opener_y
        band_h = max(band_h, this_h)
        block_index += 1
        # y_cursor sigue apuntando al fondo de todo lo colocado, que es lo que
        # usan el cierre y la vista general.
        y_cursor = band_top + band_h + BLOCK_GAP
        i = j
    elif s["kind"] == "close":
        close_y = y_cursor
        s["x"], s["y"], s["scale"], s["rotate"] = 0, close_y, CLOSE_SCALE, 0
        placed.append(s)
        i += 1
    else:
        i += 1

# Overview frames the whole canvas. Account for the on-canvas footprint of each
# step: a step's plane size ≈ step_width * data-scale, so large-frame images
# (1.7) sprawl wider. Use extents padded by that footprint.
def footprint(s):
    # Las tarjetas de imagen miden 1920 de ancho (el escenario completo), no los
    # 1180 de antes: se ensanchó al pasar la composición a píxeles de escenario.
    # Con 1180 la vista general calculaba de menos y las tarjetas se pisaban.
    base = 1920 if s["kind"] in ("image",) else 900
    return base * s["scale"] * 0.5
xs = [s["x"] for s in placed]
ys = [s["y"] for s in placed]
left   = min(s["x"] - footprint(s) for s in placed)
right  = max(s["x"] + footprint(s) for s in placed)
top    = min(s["y"] - footprint(s) for s in placed)
bottom = max(s["y"] + footprint(s) for s in placed)
span   = bottom - top
h_span = right - left
ov_x = (left + right) / 2
ov_y = (top + bottom) / 2
# 16:9 frame: fit whichever is binding (vertical / 1080 vs horizontal / 1920).
# TIGHTNESS < 1.0 pulls the overview camera closer (accepts slight border clip).
# 0.78 estaba calibrado para el lienzo alto y angosto de antes, donde el recorte
# caía en margen vacío. Con el lienzo ancho (260814) ese mismo recorte se comía
# tarjetas de los bordes, así que sube a 0.97: entra todo, sin margen desperdiciado.
OVERVIEW_TIGHTNESS = 0.97
ov_scale = max(round(span / 1080 * OVERVIEW_TIGHTNESS),
               round(h_span / 1920 * OVERVIEW_TIGHTNESS), 9)

# ---- Render steps --------------------------------------------------------
def esc(t): return t  # captions already use safe glyphs (visible text)

def attr(t):
    # attribute-safe: escape quotes/ampersands so captions with " don't break alt=""
    return html.escape(t, quote=True)

def render(s):
    k = s["kind"]
    x, y, sc = int(s["x"]), int(s["y"]), s["scale"]
    rot = s.get("rotate", 0)
    sid = s.get("sid", "")
    idattr = f'id="{sid}" ' if sid else ""
    attrs = f'{idattr}data-x="{x}" data-y="{y}" data-scale="{sc}" data-rotate="{rot}"'
    if k == "cover":
        # Subtle one-line teaser of the closing two-tier flow:
        # human steps (indigo) then AI steps (violet), arrow-separated.
        human = ["Planear", "Dise&ntilde;ar", "Conectar"]
        ai = ["Recolectar", "Interpretar", "Ejecutar", "Presentar"]
        sep = '<span class="cf-sep">&rarr;</span>'
        cover_flow = sep.join(
            [f'<span class="cf-h">{w}</span>' for w in human] +
            [f'<span class="cf-a">{w}</span>' for w in ai])
        return f'''
    <div class="step cover" {attrs}>
      <img class="monogram" src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <p class="eyebrow">{s["eyebrow"]}</p>
      <h1>{s["title"]}</h1>
      <p class="cover-flow">{cover_flow}</p>
    </div>'''
    if k == "section":
        return f'''
    <div class="step section-step" {attrs}>
      <img class="monogram monogram--sm" src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <p class="eyebrow">{s["num"]}</p>
      <h2 class="section-title">{s["title"]}</h2>
      <p class="lead">{s["sub"]}</p>
    </div>'''
    if k == "image":
        # Tres campos, igual que el scene box de la galería: titular, cuerpo y
        # cierre. Los que vengan vacíos simplemente no se pintan.
        blocks = [f'<p class="cap cap-head">{esc(s["cap"])}</p>']
        if s.get("body"):
            blocks.append(f'<p class="cap cap-body">{esc(s["body"])}</p>')
        if s.get("take"):
            blocks.append(f'<p class="cap cap-take">{esc(s["take"])}</p>')
        scene = "\n      ".join(blocks)
        ext = f'<p class="ext-title">{esc(s["ext"])}</p>\n      ' if s.get("ext") else ""
        # Las diapositivas con mucho texto llevan una clase extra para que el
        # CSS les baje un escalón el tamaño y el alto de imagen. Sin esto, una
        # sola tarjeta larga obligaba a achicar las 39.
        _blen = len(s.get("body") or "")
        long_cls = " longtext xlongtext" if _blen > 600 else (" longtext" if _blen > 330 else "")
        # .fitbox envuelve TODO el contenido para que el ajuste al alto sea una
        # sola escala sobre el bloque entero, en vez de achicar elementos
        # sueltos. Ver el comentario de --shrink en el CSS.
        #
        # width/height explícitos: los 39 diagramas son 1536x1024. Sin esos
        # atributos, el navegador no conoce la proporción hasta que decodifica
        # el PNG y la primera medición del ajuste sale mal (reserva de más), con
        # lo cual quedaban tarjetas a media escala. Con la proporción declarada,
        # la primera pasada ya mide bien y no depende de eventos posteriores.
        return f'''
    <div class="step imgstep{long_cls}" {attrs}>
      <div class="fitbox">
      {ext}<div class="imgcard"><img src="assets/diagrams/{s["img"]}" alt="{attr(s["cap"])}" width="1536" height="1024"></div>
      {scene}
      </div>
    </div>'''
    if k == "close":
        if s.get("flow"):
            top = '<span class="flow-sep">&rarr;</span>'.join(
                f'<span class="flow-step">{w}</span>' for w in s["top"])
            bottom = '<span class="flow-sep">&rarr;</span>'.join(
                f'<span class="flow-step">{w}</span>' for w in s["bottom"])
            return f'''
    <div class="step close flow-close" {attrs}>
      <img class="monogram monogram--sm" src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <div class="flow-row flow-human">{top}</div>
      <div class="flow-arrow">&darr;</div>
      <div class="flow-row flow-ai">{bottom}</div>
    </div>'''
        return f'''
    <div class="step close" {attrs}>
      <img class="monogram" src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <h2 class="section-title">{s["title"]}</h2>
      <p class="lead">{s["sub"]}</p>
    </div>'''
    return ""

steps_html = "\n".join(render(s) for s in placed)

# ---- Theme + extra CSS for image cards (light, fiba violet) --------------
THEME = """:root {
      --accent:    #8B5CF6;
      --accent-2:  #C9BEEA;
      --bg:        #F7F6FB;
      --fg:        #1A1A1A;
      --muted:     #6b6b75;
      --font-head: 'Space Grotesk', 'Inter', sans-serif;
      --font-body: 'Inter', sans-serif;
      --grid-rgba: rgba(139,92,246,0.05);
    }"""

EXTRA_CSS = """
    /* ---- Prezi image deck (light) ---- */
    .step { width: 1180px; padding: 24px; }
    /* ===== ESCENARIO FIJO (260814, reescrito) ==============================
       Cómo funciona esto en realidad, que es lo que hacía fallar todo lo
       anterior: impress.js NO reacomoda el contenido. El deck declara un
       lienzo de referencia de 1920x1080 (data-width / data-height) y calcula
       UNA escala uniforme, min(altoVentana/1080, anchoVentana/1920), que
       aplica como un solo transform a todo el canvas. La diapositiva nunca
       reflowea: se agranda o se achica entera, con bandas negras si hace falta.

       Consecuencia: las unidades vh/vw acá NO sirven. Se miden contra la
       ventana real y después se multiplican otra vez por la escala de impress,
       o sea que el mismo diseño cambia de proporción según el tamaño de la
       ventana, que es justo lo que no queremos. Todo lo de abajo va en píxeles
       del escenario. Se compone una vez contra 1920x1080 y de la escala se
       encarga impress. Números validados en _lab-pillars.html. */
    .imgstep {
      --img-h:     710px;   /* alto del dibujo */
      --gap:         8px;   /* dibujo a titular */
      --head-size:  40px;
      --body-size:  24px;
      --take-size:  29px;
      --text-w:   1560px;   /* medida de la columna de texto */
      --head-tracking: 0.100em;
      --pad-y:      54px;   /* margen arriba/abajo dentro del escenario */

      width: 1920px;
      padding: 0 90px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap);
    }
    /* Si la composición no entra en el alto útil, NO se recorta ni se achica un
       elemento suelto: se escala el BLOQUE ENTERO, así las proporciones que
       eligió Carlos (dibujo vs texto, tamaños relativos, tracking) quedan
       intactas. El factor lo calcula el script del final y lo deja en --shrink
       por diapositiva. Sin JS el valor es 1 y no pasa nada raro: simplemente no
       se achica. */
    .imgstep .fitbox {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap);
      width: 100%;
      transform: scale(var(--shrink, 1));
      transform-origin: center center;
    }
    .imgcard {
      background: #fff;
      border: 1px solid var(--accent-2);
      border-radius: 14px;
      padding: 12px;
      box-shadow: 0 18px 50px rgba(40,20,90,0.10);
      flex: none;
    }
    /* El alto manda y el ancho sale solo. Al revés (ancho fijo, alto auto) el
       dibujo cambiaba de alto según su proporción y cada tarjeta se sentaba a
       una altura distinta. */
    .imgcard img {
      display: block;
      height: var(--img-h);
      width: auto;
      border-radius: 8px;
    }
    .cap {
      font-family: var(--font-body);
      line-height: 1.2;
      color: var(--fg);
      margin: 0;
    }
    /* Los tres campos del scene box, con la misma jerarquía visual que la
       galería: titular fuerte, cuerpo, cierre en verde. */
    .imgstep .cap { max-width: var(--text-w); text-align: center; }
    .imgstep .cap-head {
      font-family: var(--font-head);
      font-size: var(--head-size);
      font-weight: 700;
      line-height: 1.15;
      /* Mayúsculas por CSS, no en el texto: INDEX.md sigue guardando el titular
         en capitalización normal, así que volver atrás es cambiar una línea y
         no 39 filas de la tabla. El tracking extra hace falta porque en
         mayúsculas las letras se ven apretadas al tamaño de display. */
      text-transform: uppercase;
      letter-spacing: var(--head-tracking);
    }
    .cap-head { font-weight: 700; }
    /* Título de extensión, ARRIBA de la imagen. Agregado 260803 después de
       dictar la Sesión 1: en sala el bloque de tipos de archivo no se leía,
       porque la extensión venía solo dibujada dentro de la imagen y chica.
       Va en monoespaciada para que se lea como nombre de archivo. */
    .ext-title {
      margin: 0 0 10px;
      font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: clamp(30px, 4.4vw, 58px);
      font-weight: 600;
      line-height: 1;
      letter-spacing: .02em;
      color: var(--accent, #4C2D91);
      text-align: center;
    }
    /* El cuerpo va alineado a la izquierda: son párrafos de varias líneas y
       centrados se vuelven difíciles de seguir. El titular y el cierre sí van
       centrados, porque son de una o dos líneas. */
    /* Tamaños subidos 260814: en la Sesión 1 de Brainbest el cuerpo no se leía
       desde el fondo de la sala. Antes topaba en 17px y en gris (--muted), o
       sea que el texto que carga la explicación era el más chico y el más
       claro de la diapositiva, y el público terminaba leyendo las etiquetas en
       inglés de la imagen. Ahora escala con el ancho (2.6vw) hasta 34px y usa
       el color de cuerpo, no el gris. Misma lógica que .ext-title (260803). */
    .imgstep .cap-body {
      margin-top: 14px;
      font-size: var(--body-size);
      line-height: 1.38;
      color: var(--fg);
      /* Justificado con guionado. En español, justificar sin partir palabras
         abre huecos enormes entre palabras, porque las palabras son largas. El
         lang="es" del <html> es lo que le dice al navegador con qué reglas
         partir, así que sin eso el hyphens: auto no hace nada. La última línea
         va a la izquierda para que no quede estirada. text-wrap: pretty se
         saca a propósito: pelea con justify. */
      text-align: justify;
      text-align-last: left;
      hyphens: auto;
      -webkit-hyphens: auto;
    }
    /* Los escalones .longtext / .xlongtext se eliminaron (260814). Bajaban el
       tamaño de letra de las tarjetas más cargadas, o sea que justo las
       diapositivas con MÁS que leer traían la letra MÁS chica, al revés de lo
       que hace falta en sala. Ahora el ajuste lo hace --shrink escalando el
       bloque entero: se mantiene la jerarquía y no se recorta nada. El build
       sigue emitiendo las clases porque sirven para inspeccionar. */
    /* 820px: en las diapositivas más altas el cierre baja hasta el borde
       inferior, y más ancho que esto se cruzaba con las teclas de ayuda
       (el .hint fijo abajo a la derecha). */
    /* El cierre es la frase que la gente se lleva, así que va más grande que
       el cuerpo, no más chico. Verde más oscuro para que aguante proyector con
       luz ambiente. El ancho sube a 1100px: sigue lejos del .hint de abajo a
       la derecha, que era el motivo del tope de 820px. */
    .imgstep .cap-take {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 2px dashed #86efac;
      font-size: var(--take-size);
      font-weight: 700;
      line-height: 1.3;
      color: #12703a;              /* verde: el cierre, igual que la galería */
    }
    .cap-take {
      margin-top: 12px;
      max-width: min(96%, 106vh);
      font-size: clamp(17px, 1.6vw, 23px);
      font-weight: 700;
      line-height: 1.35;
      color: #12703a;
      border-top: 2px dashed #86efac;
      padding-top: 11px;
    }
    .cover { width: 1180px; }
    .cover h1 { font-size: clamp(40px, 6.5vw, 70px); }
    .section-step { width: 900px; }
    .section-title { font-size: clamp(40px, 7vw, 72px); color: var(--accent); }
    .section-step .lead, .close .lead { color: var(--muted); }
    .close { width: 900px; text-align: center; }
    .close .monogram, .cover .monogram { margin-bottom: 28px; }
    /* two-tier flow close: human row (deep indigo) feeds AI row (electric violet) */
    /* 1400px, no 1100: las palabras en español son más largas que las inglesas
       (Recolectar/Interpretar/Ejecutar/Presentar) y a 1100px la fila de la IA
       se partía, dejando una flecha colgando al final del renglón. */
    .flow-close { width: 1400px; text-align: center; }
    .flow-close .monogram--sm { margin-bottom: 30px; }
    .flow-row {
      font-family: var(--font-head);
      font-weight: 700;
      font-size: clamp(30px, 4.4vw, 52px);
      line-height: 1.2;
      display: flex; flex-wrap: wrap; justify-content: center;
      align-items: center; gap: 0.5em;
    }
    .flow-human { color: #4C2D91; }   /* Deep Indigo: the human steps */
    .flow-ai    { color: #8B5CF6; }   /* Electric Violet: the AI steps */
    .flow-sep   { opacity: 0.55; font-weight: 400; }

    /* Cover teaser: subtle one-line preview of the closing flow. Same two
       colors (human indigo -> AI violet), small and quiet under the title. */
    .cover-flow {
      margin-top: 18px;
      font-family: var(--font-head);
      font-weight: 500;
      font-size: clamp(13px, 1.5vw, 17px);
      letter-spacing: 0.04em;
      display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em;
      opacity: 0.6;
    }
    .cover-flow .cf-h   { color: #4C2D91; }   /* human steps */
    .cover-flow .cf-a   { color: #8B5CF6; }   /* AI steps */
    .cover-flow .cf-sep { color: var(--muted); font-weight: 400; }
    .flow-arrow {
      font-size: clamp(28px, 3.4vw, 40px);
      color: var(--muted);
      margin: 0.35em 0;
      line-height: 1;
    }
    /* smaller logo as a chapter mark on section title cards */
    .monogram--sm { width: clamp(48px, 6vw, 64px); margin-bottom: 18px; }
    /* persistent brand watermark: fixed to the viewport, OUTSIDE the impress
       canvas, so it stays put while the camera flies. Subtle, bottom-left. */
    .brand-watermark {
      position: fixed;
      bottom: 20px; left: 24px;
      z-index: 5;
      display: flex; align-items: center; gap: 10px;
      opacity: 0.82;
      pointer-events: none;
      font-family: var(--font-head);
      font-size: 16px; letter-spacing: 0.04em;
      color: var(--muted);
    }
    .brand-watermark img { width: 44px; height: auto; display: block; }

    /* ---- Ayuda colapsable (260814) --------------------------------------
       La barra de teclas iba fija abajo a la derecha y SIEMPRE visible. En
       pantallas cortas (MacBook de 14", 1512x982) se pisaba con el cierre de
       la diapositiva: impress escala el escenario de 1080 hasta que el
       contenido toca el borde de abajo, justo donde estaba la barra. En
       monitores anchos no pasaba, por eso se veía bien en 23" y 34".
       Además la ayuda no tiene por qué estar en pantalla toda la
       presentación: es de consulta.

       Ahora es un botón discreto (?) que abre un panel. La marca de agua se
       queda, pero se esconde con el panel abierto para que no se amontonen. */
    .hint { display: none !important; }   /* la barra vieja del template */

    .navhelp-btn {
      position: fixed;
      bottom: 18px; right: 20px;
      z-index: 60;
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 1px solid var(--accent-2);
      background: rgba(255,255,255,0.86);
      color: var(--accent, #8B5CF6);
      font-family: var(--font-head); font-size: 16px; font-weight: 700;
      line-height: 1; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 10px rgba(40,20,90,0.12);
      opacity: 0.45;
      transition: opacity .18s ease, transform .18s ease;
      -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
    }
    /* Casi transparente mientras no se usa, sólido al pasar el mouse: en sala
       no distrae, y sigue estando cuando alguien lo busca. */
    /* !important porque el JS anti-choque baja la opacidad por estilo inline
       cuando el texto de la diapositiva llega a la esquina. Al pasar el mouse
       (o al llegar con el teclado) el botón tiene que volver a verse sí o sí,
       si no queda un control invisible imposible de encontrar. */
    .navhelp-btn:hover, .navhelp-btn:focus-visible { opacity: 1 !important; transform: scale(1.06); }
    .navhelp-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    .navhelp-panel {
      position: fixed;
      bottom: 62px; right: 20px;
      z-index: 60;
      background: rgba(255,255,255,0.96);
      border: 1px solid var(--accent-2);
      border-radius: 10px;
      padding: 14px 16px;
      box-shadow: 0 10px 34px rgba(40,20,90,0.18);
      font-family: var(--font-body); font-size: 13px; color: var(--fg);
      -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
      display: grid; gap: 8px;
      opacity: 0; visibility: hidden; transform: translateY(6px);
      transition: opacity .18s ease, transform .18s ease, visibility .18s;
    }
    .navhelp-panel[data-open="true"] { opacity: 1; visibility: visible; transform: none; }
    .navhelp-row { display: flex; align-items: center; gap: 9px; white-space: nowrap; }
    .navhelp-panel kbd {
      background: rgba(139,92,246,0.14);
      border: 1px solid var(--accent-2);
      border-radius: 4px;
      padding: 2px 7px;
      font-family: var(--font-body); font-size: 12px; color: var(--fg);
      min-width: 20px; text-align: center;
    }
    /* Con el panel abierto la marca de agua se apaga: en pantallas cortas los
       dos elementos quedaban a la misma altura. */
    body[data-help="open"] .brand-watermark { opacity: 0; }
    .brand-watermark { transition: opacity .18s ease; }

    /* Pantallas CORTAS (MacBook de 14", 1512x982, y cualquier laptop parecida).
       Acá está el choque real: impress escala el escenario de 1080 hasta que el
       contenido toca el borde de abajo, y el cierre de la diapositiva aterriza
       justo donde va la marca de agua. En monitores altos (1080 y más) sobra
       aire y no pasa, por eso se veía bien en el de 23" y en el ultrawide.
       Debajo de 1000px de alto la marca se corre a la esquina y se hace más
       chica y más tenue, para que la diapositiva mande. El botón de ayuda
       también se achica. Nada de esto toca la composición: son elementos fijos,
       fuera del canvas de impress. */
    @media (max-height: 1000px) {
      .brand-watermark {
        bottom: 8px; left: 10px;
        font-size: 12px; gap: 6px;
        opacity: 0.34;
      }
      .brand-watermark img { width: 26px; }
      .navhelp-btn { width: 28px; height: 28px; font-size: 14px; bottom: 10px; right: 12px; }
      .navhelp-panel { bottom: 46px; right: 12px; }
    }
    /* OJO: este bloque NO debe tocar .imgstep. Las tarjetas de imagen se
       componen en píxeles del escenario de 1920x1080 y de encogerlas se
       encarga impress con su escala uniforme; meterle acá vw/vh vuelve a
       mezclar los dos sistemas de medida, que es el bug que se arregló el
       260814. Los selectores de abajo se acotan a propósito a los pasos que NO
       son de imagen. */
    @media (max-width: 820px) {
      .step:not(.imgstep), .cover { width: 92vw; }
      .step:not(.imgstep) .cap { font-size: clamp(17px, 3.6vw, 22px); }
      .step:not(.imgstep) .cap-body { font-size: clamp(15px, 3.0vw, 19px); }
      .step:not(.imgstep) .cap-take { font-size: clamp(16px, 3.2vw, 20px); }
      .brand-watermark { font-size: 13px; bottom: 12px; left: 14px; }
      .brand-watermark img { width: 34px; }
    }
"""

tpl = open(TEMPLATE).read()
# Browser-tab title = the cover caption (single source of truth: INDEX.md cover row).
deck_title = html.escape(cover["title"]) if cover and cover.get("title") else "Fiba Labs deck"
tpl = tpl.replace("{{DECK_TITLE}}", deck_title)
# swap theme :root
import re
tpl = re.sub(r":root \{.*?\n    \}", THEME, tpl, count=1, flags=re.S)
# inject extra css before closing </style>
tpl = tpl.replace("  </style>", EXTRA_CSS + "\n  </style>")
# persistent brand watermark (fixed element, outside the impress canvas)
WATERMARK = '''  <div class="brand-watermark">
    <img src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
    <span>fiba labs</span>
  </div>
'''
tpl = tpl.replace("  <div class=\"hint\">", WATERMARK + "\n  <div class=\"hint\">")

# Ayuda colapsable. Reemplaza a la barra de teclas siempre visible del template
# (que se oculta por CSS). El panel arranca cerrado; se abre con el botón o con
# la tecla "?" y se cierra con Escape, con el botón o haciendo clic afuera.
NAVHELP = '''  <button class="navhelp-btn" id="navhelp-btn" type="button"
          aria-label="Atajos de teclado" aria-expanded="false"
          aria-controls="navhelp-panel">?</button>
  <div class="navhelp-panel" id="navhelp-panel" data-open="false" role="dialog"
       aria-label="Atajos de teclado">
    <div class="navhelp-row"><kbd>&rarr;</kbd> <span>siguiente</span></div>
    <div class="navhelp-row"><kbd>&larr;</kbd> <span>atr&aacute;s</span></div>
    <div class="navhelp-row"><kbd>Space</kbd> <span>avanzar</span></div>
    <div class="navhelp-row"><kbd>O</kbd> <span>vista general</span></div>
    <div class="navhelp-row"><kbd>?</kbd> <span>esta ayuda</span></div>
  </div>
'''
tpl = tpl.replace("  <script src=\"impress.js\"></script>",
                  NAVHELP + "\n  <script src=\"impress.js\"></script>")

NAVHELP_JS = """
<script>
(function () {
  var btn   = document.getElementById('navhelp-btn');
  var panel = document.getElementById('navhelp-panel');
  if (!btn || !panel) return;

  function setOpen(open) {
    panel.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // El atributo en body es lo que apaga la marca de agua desde el CSS.
    document.body.setAttribute('data-help', open ? 'open' : 'closed');
  }
  function isOpen() { return panel.getAttribute('data-open') === 'true'; }

  btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!isOpen()); });

  document.addEventListener('keydown', function (e) {
    // "?" abre y cierra. Escape solo cierra.
    if (e.key === '?') { e.preventDefault(); setOpen(!isOpen()); return; }
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); setOpen(false); }
  });

  // Clic afuera cierra. Adentro del panel no, para poder leerlo tranquilo.
  document.addEventListener('click', function (e) {
    if (isOpen() && !panel.contains(e.target)) setOpen(false);
  });

  // Al cambiar de diapositiva se cierra: la ayuda es de consulta, no algo que
  // deba quedar puesto mientras se presenta. stepenter se dispara SOBRE EL
  // PASO y no burbujea, así que hay que engancharlo paso por paso; en document
  // no llega. El hashchange cubre además la navegación por URL.
  document.querySelectorAll('.step').forEach(function (st) {
    st.addEventListener('impress:stepenter', function () { setOpen(false); });
  });
  window.addEventListener('hashchange', function () { setOpen(false); });

  setOpen(false);

  // Guarda anti-choque. El CSS ya achica y corre la marca en pantallas cortas,
  // pero el alto de la diapositiva depende del texto de cada tarjeta, así que
  // en algunas el cierre igual llega a la esquina. Acá se mide de verdad: si el
  // texto se acerca a menos de 14px de la marca, la marca se apaga en esa
  // tarjeta. Es lo mismo que hace el panel de ayuda al abrirse, pero
  // automático y por diapositiva.
  var wm = document.querySelector('.brand-watermark');
  function dodgeWatermark(step) {
    // El paso llega por parámetro desde stepenter. Buscar '.step.active' acá
    // no servía: en ese momento impress todavía no movió la clase, así que la
    // guarda medía la diapositiva ANTERIOR y nunca se activaba.
    var active = step || document.querySelector('.step.active');
    if (!active) return;
    var text = active.querySelector('.cap-take') || active.querySelector('.cap-body');
    var PAD = 14;
    // Los DOS elementos fijos se apartan, no solo la marca. En pantallas
    // anchas (ultrawide de 34") la escala de impress es mucho mayor y la
    // diapositiva llega a las dos esquinas de abajo, así que el botón de ayuda
    // choca tanto como la marca.
    [wm, btn].forEach(function (el) {
      if (!el) return;
      if (!text) { el.style.opacity = ''; return; }
      var t = text.getBoundingClientRect(), r = el.getBoundingClientRect();
      var hits = t.right + PAD > r.left && t.left - PAD < r.right &&
                 t.bottom + PAD > r.top && t.top - PAD < r.bottom;
      if (el === btn) {
        // El botón nunca desaparece del todo: se vuelve casi transparente pero
        // sigue ahí y clickeable, porque es el único acceso a la ayuda.
        el.style.opacity = hits ? '0.12' : '';
      } else {
        el.style.opacity = hits ? '0' : '';
      }
    });
  }
  document.querySelectorAll('.step').forEach(function (st) {
    st.addEventListener('impress:stepenter', function () {
      // Dos pasadas: una inmediata para que no se vea el choque durante la
      // transición, y otra al terminar, cuando las medidas ya son las finales.
      dodgeWatermark(st);
      setTimeout(function () { dodgeWatermark(st); }, 950);
    });
  });
  window.addEventListener('resize', function () { dodgeWatermark(); });
  window.addEventListener('load', function () { dodgeWatermark(); });
  setTimeout(function () { dodgeWatermark(); }, 400);
})();
</script>
"""
tpl = tpl.replace("</body>", NAVHELP_JS + "</body>")
# steps + overview
tpl = tpl.replace("    {{STEPS}}", steps_html)
tpl = tpl.replace("{{OVERVIEW_X}}", str(int(ov_x)))
tpl = tpl.replace("{{OVERVIEW_Y}}", str(int(ov_y)))
tpl = tpl.replace("{{OVERVIEW_SCALE}}", str(int(ov_scale)))

# ---- Localización al español ---------------------------------------------
# La plantilla compartida (skills/prezi-deck/assets/template.html) está en inglés y la
# usan otros decks, así que NO se toca. Se traduce aquí, sobre el HTML ya construido.
tpl = tpl.replace(
    "<kbd>&rarr;</kbd> next &nbsp; <kbd>&larr;</kbd> back &nbsp; "
    "<kbd>Space</kbd> advance &nbsp; <kbd>O</kbd> overview",
    "<kbd>&rarr;</kbd> siguiente &nbsp; <kbd>&larr;</kbd> atr&aacute;s &nbsp; "
    "<kbd>Space</kbd> avanzar &nbsp; <kbd>O</kbd> vista general")

# El idioma del documento no es cosmético: hyphens: auto en .cap-body necesita
# saber con qué reglas partir las palabras, y sin lang="es" el navegador aplica
# las de inglés o directamente no parte. Sin guionado, el texto justificado en
# español abre huecos enormes entre palabras.
tpl = tpl.replace('<html lang="en">', '<html lang="es">')

# ---- Ajuste al alto del escenario ----------------------------------------
# Escala el bloque entero de cada diapositiva cuando no entra en 1080 menos los
# márgenes. NO recorta ni achica elementos sueltos: mantiene intactas todas las
# proporciones de la composición. Corre una vez al cargar, después de las
# fuentes (que cambian el alto del texto al llegar) y en cada resize, porque el
# guionado puede repartir distinto y cambiar el número de líneas.
FITSCRIPT = """
<script>
(function () {
  // Sin argumento mide las 39; con un paso mide solo ese (lo que usa
  // stepenter). La cuenta es exactamente la misma en los dos casos.
  function fitSteps(only) {
    var list = only ? [only] : document.querySelectorAll('.imgstep');
    Array.prototype.forEach.call(list, function (step) {
      var box = step.querySelector('.fitbox');
      if (!box) return;
      var padY = parseFloat(getComputedStyle(step).getPropertyValue('--pad-y')) || 0;
      var avail = 1080 - 2 * padY;
      // NO hay que compensar data-scale, y esto costó entenderlo. Cada paso
      // tiene su escala de cámara (FRAMES, 0.6 a 1.7), pero impress la ANULA al
      // enfocar el paso: hace zoom del lienzo por 1/data-scale, justamente para
      // que el paso activo llene la pantalla. O sea que el contenido NUNCA se
      // dibuja a la escala de cámara y no hay nada que compensar. data-scale
      // controla el VIAJE (cuánto entra y sale la cámara en la transición), no
      // el tamaño final del contenido.
      //
      // Meter un factor 1/frame acá corregía dos veces: las tarjetas de frame
      // alto salían a media escala (frame 1.5 daba 400px de imagen en vez de
      // 710) y el error crecía con el frame. Se probó midiendo: sacando ese
      // factor, la 3.1 pasa de 339px a 645px de imagen y el bloque cae exacto
      // en los 972 de alto útil.
      //
      // Medir SIEMPRE en limpio. Esto es lo delicado de toda la rutina: si se
      // mide con una escala ya puesta, cada pasada compone sobre la anterior y
      // el factor se desbarranca (aparecían 0.42 en tarjetas de 95 caracteres,
      // que entran de sobra). Se saca el transform, se fuerza reflow leyendo
      // offsetHeight, y recién ahí se mide.
      //
      // offsetHeight, NO getBoundingClientRect: el paso vive dentro del canvas
      // de impress, que le aplica su propia escala y otra por paso según esté
      // activo. getBoundingClientRect las incluye todas; offsetHeight es de
      // layout, así que ningún transform lo toca y ya viene en píxeles del
      // escenario.
      box.style.removeProperty('--shrink');
      box.style.transform = 'none';
      var natural = box.offsetHeight;   // lectura = reflow forzado
      box.style.removeProperty('transform');
      // Un solo factor: si el bloque no entra en el alto útil, se escala
      // entero hasta que entre. Si entra, queda en 1 y se ve tal cual se
      // compuso en el lab.
      box.style.setProperty('--shrink', natural > avail ? (avail / natural).toFixed(4) : 1);
    });
  }
  // Cuándo medir. La primera pasada NO puede ser la única: al cargar, los PNG
  // todavía no decodificaron y, sin alto intrínseco, el navegador reserva de
  // más. Ese factor equivocado quedaba pegado y había tarjetas a media escala
  // (3.1 y 9.5 quedaban en 342 y 402px en vez de 710).
  //
  // El disparador que de verdad arregla el caso es stepenter: cuando la
  // tarjeta se vuelve la activa ya está todo cargado y medido, así que ahí el
  // número sale bien aunque las pasadas anteriores se hayan equivocado. Se
  // recalcula SOLO ese paso, que es barato y evita tocar los otros 38 en plena
  // transición.
  function fitOne(step) {
    if (step && step.classList.contains('imgstep')) fitSteps(step);
  }
  // impress dispatcha stepenter SOBRE EL PASO y el evento no burbujea, así que
  // escucharlo en document no sirve (fue exactamente el bug: el listener nunca
  // corría y las tarjetas se quedaban con el factor de la primera pasada, la
  // que mide antes de que decodifiquen los PNG). Se engancha paso por paso.
  document.querySelectorAll('.imgstep').forEach(function (step) {
    step.addEventListener('impress:stepenter', function () { fitOne(step); });
  });
  // Red de seguridad, por si alguna imagen llega tarde estando ya parado en la
  // tarjeta (caché frío, red lenta).
  document.querySelectorAll('.imgstep img').forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) return;
    var again = function () { fitOne(img.closest('.imgstep')); };
    img.addEventListener('load', again);
    img.addEventListener('error', again);
  });
  window.addEventListener('resize', function () { fitSteps(); });
  // Las fuentes cambian el alto del texto cuando llegan, así que hay que
  // volver a medir todo.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitSteps(); });
  window.addEventListener('load', function () { fitSteps(); });
  fitSteps();
})();
</script>
"""
tpl = tpl.replace("</body>", FITSCRIPT + "</body>")

out = os.path.join(DEST, "index.html")
open(out, "w").write(tpl)

# ---- Companion table of contents (toc.html) ------------------------------
# Regenerated on every build, so it never drifts from the deck. Sections are
# headings; every slide is a clickable link that opens the deck in a NEW TAB at
# that slide's stable id (home / 1 / 1.1 / ... / thank-you). Mirrors INDEX.md.
def toc_html():
    rows = []
    rows.append('<li class="toc-home"><a href="index.html#/home" target="_blank" '
                'rel="noopener">Inicio</a><span class="toc-sub">'
                f'{attr(cover["title"]) if cover else ""}</span></li>')
    for si, s in enumerate(_sections, start=1):
        rows.append(f'<li class="toc-section"><a href="index.html#/{si}" '
                    f'target="_blank" rel="noopener"><span class="toc-num">{si}</span>'
                    f'{attr(s["title"])}</a></li>')
        for ii, im in enumerate(s["images"], start=1):
            sid = f"{si}.{ii}"
            rows.append(f'<li class="toc-slide"><a href="index.html#/{sid}" '
                        f'target="_blank" rel="noopener"><span class="toc-num">{sid}'
                        f'</span>{attr(im["cap"])}</a></li>')
    if close:
        rows.append('<li class="toc-section toc-end"><a href="index.html#/thank-you" '
                    'target="_blank" rel="noopener"><span class="toc-num">&#9733;</span>'
                    'Cierre</a></li>')
    rows.append('<li class="toc-section"><a href="index.html#/overview" '
                'target="_blank" rel="noopener"><span class="toc-num">&#9633;</span>'
                'Vista general (todo el lienzo)</a></li>')
    rows.append('<li class="toc-section"><a href="glosario.html" '
                'target="_blank" rel="noopener"><span class="toc-num">&#9776;</span>'
                'Glosario (103 t&eacute;rminos)</a></li>')
    deck_title = attr(cover["title"]) if cover else "Presentation"
    items = "\n      ".join(rows)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contenidos &middot; {deck_title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {{ --accent:#8B5CF6; --indigo:#4C2D91; --bg:#F7F6FB; --fg:#1A1A1A; --muted:#6b6b75; }}
    html,body {{ margin:0; background:var(--bg); color:var(--fg);
      font-family:'Inter',sans-serif; }}
    .wrap {{ max-width:820px; margin:0 auto; padding:56px 28px 80px; }}
    header {{ display:flex; align-items:center; gap:14px; margin-bottom:8px; }}
    header img {{ width:44px; height:auto; }}
    h1 {{ font-family:'Space Grotesk',sans-serif; font-size:30px; margin:0; }}
    .eyebrow {{ color:var(--accent); font-size:13px; letter-spacing:.06em;
      text-transform:uppercase; margin:0 0 28px; }}
    ul {{ list-style:none; padding:0; margin:0; }}
    li a {{ display:flex; align-items:baseline; gap:12px; text-decoration:none;
      color:var(--fg); padding:7px 10px; border-radius:8px; }}
    li a:hover {{ background:#ece9f7; color:var(--indigo); }}
    .toc-num {{ font-family:'Space Grotesk',sans-serif; color:var(--accent);
      min-width:46px; font-weight:500; }}
    .toc-home a {{ font-family:'Space Grotesk',sans-serif; font-weight:700;
      font-size:19px; }}
    .toc-home .toc-sub {{ display:block; color:var(--muted); font-size:13px;
      padding:0 10px 6px 10px; }}
    .toc-section {{ margin-top:18px; }}
    .toc-section a {{ font-family:'Space Grotesk',sans-serif; font-weight:700;
      font-size:20px; color:var(--indigo); }}
    .toc-slide a {{ font-size:15px; color:#333; }}
    .toc-slide .toc-num {{ color:var(--muted); font-weight:400; }}
    .hint {{ margin-top:40px; color:var(--muted); font-size:13px; }}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <img src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <div>
        <p class="eyebrow">{attr(cover["eyebrow"]) if cover else "Fiba Labs"}</p>
        <h1>{deck_title}</h1>
      </div>
    </header>
    <ul>
      {items}
    </ul>
    <p class="hint">Cada enlace abre la presentaci&oacute;n en una pesta&ntilde;a nueva, en esa diapositiva.</p>
  </div>
</body>
</html>'''

toc_out = os.path.join(DEST, "toc.html")
open(toc_out, "w").write(toc_html())

print("WROTE", out)
print("WROTE", toc_out)
print("steps:", len(placed))
print("overview: x=%d y=%d scale=%d  (v-span %d, h-span %d, ratio w/h %.2f)" % (
    ov_x, ov_y, ov_scale, span, h_span, h_span / span))
print("remaining placeholders:", tpl.count("{{"))
