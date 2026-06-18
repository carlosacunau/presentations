#!/usr/bin/env python3
# Build the Prezi-style (impress.js) version of the workshop deck.
# Light theme + Fiba violet accent + logo. Camera path = order in STEPS.
# Images already optimized (1600x893, 16:9) in assets/diagrams/.

import html, os, re, sys

DEST = "/Users/carlosacuna/OS/presentations/fiba-ai-mentoring"
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
                cur["images"].append(dict(img=imgfile, cap=caption))
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
STEPS = []
if cover:
    STEPS.append(dict(kind="cover", title=cover["title"], eyebrow=cover["eyebrow"]))
for s in _sections:
    STEPS.append(dict(kind="section", num=s["num"], title=s["title"], sub=s["sub"]))
    for im in s["images"]:
        STEPS.append(dict(kind="image", img=im["img"], cap=im["cap"]))
if close:
    if close.get("flow"):
        STEPS.append(dict(kind="close", flow=True,
                          top=close["top"], bottom=close["bottom"]))
    else:
        STEPS.append(dict(kind="close", flow=False,
                          title=close["title"], sub=close["sub"]))

# ---- Cinematic layout engine ---------------------------------------------
# NOT a flat grid. Images are laid on a serpentine path through each section
# with VARIED rotation and VARIED on-canvas scale, so the camera twists and
# dives between beats (the real Prezi feel). Bold parameters:
#   - rotation cycles through strong tilts (camera twists between images)
#   - some images placed LARGE (camera pulls back) and some SMALL (camera dives
#     in to read them) -> the zoom itself becomes the drama
# Deterministic (no RNG): all variation is index-driven so the build is stable.

COL_DX = 2000            # base horizontal spacing
ROW_DY = 1700            # base vertical spacing between serpentine rows
COLS   = 4               # images per serpentine row
SECTION_SCALE = 3.0      # big pull-back for section openers
COVER_SCALE   = 3.0
CLOSE_SCALE   = 3.0
BLOCK_GAP = 2600         # vertical gap from end of a block to next opener

# Bold cycles. data-scale here is the camera FRAME size at that step:
#   small frame (0.6) = zoomed IN tight; large frame (1.8) = pulled back.
TILTS  = [-12, 9, -6, 14, -10, 7, -14, 11, -4, 13]   # degrees, alternating sign
FRAMES = [1.7, 0.7, 1.2, 0.6, 1.5, 0.8, 1.3, 0.65, 1.6, 0.75]  # zoom variation
# Extra positional jitter so the serpentine never looks like a grid.
JIT_X  = [120, -180, 90, -140, 160, -100]
JIT_Y  = [-110, 140, -80, 130, -160, 100]

placed = []
cover_y = -3000
y_cursor = 0
close_y = None

n = len(STEPS)
STEPS[0]["x"], STEPS[0]["y"], STEPS[0]["scale"], STEPS[0]["rotate"] = 0, cover_y, COVER_SCALE, 0
placed.append(STEPS[0])

img_counter = 0          # global, so tilt/frame cycles run across the whole deck
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
        cx = block_w / 2
        opener_y = y_cursor
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
            im["x"] = c * COL_DX + jx
            im["y"] = grid_top + r * ROW_DY + jy
            im["scale"]  = FRAMES[img_counter % len(FRAMES)]
            im["rotate"] = TILTS[img_counter % len(TILTS)]
            placed.append(im)
            img_counter += 1
        y_cursor = grid_top + (rows - 1) * ROW_DY + BLOCK_GAP
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
    base = 1180 if s["kind"] in ("image",) else 900
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
ov_scale = max(round(span / 980), round(h_span / 1750), 9)

# ---- Render steps --------------------------------------------------------
def esc(t): return t  # captions already use safe glyphs (visible text)

def attr(t):
    # attribute-safe: escape quotes/ampersands so captions with " don't break alt=""
    return html.escape(t, quote=True)

def render(s):
    k = s["kind"]
    x, y, sc = int(s["x"]), int(s["y"]), s["scale"]
    rot = s.get("rotate", 0)
    attrs = f'data-x="{x}" data-y="{y}" data-scale="{sc}" data-rotate="{rot}"'
    if k == "cover":
        return f'''
    <div class="step cover" {attrs}>
      <img class="monogram" src="assets/fiba_labs_monogram.png" alt="Fiba Labs">
      <p class="eyebrow">{s["eyebrow"]}</p>
      <h1>{s["title"]}</h1>
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
        return f'''
    <div class="step imgstep" {attrs}>
      <div class="imgcard"><img src="assets/diagrams/{s["img"]}" alt="{attr(s["cap"])}"></div>
      <p class="cap">{esc(s["cap"])}</p>
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
    .imgstep { width: 1180px; text-align: center; }
    .imgcard {
      background: #fff;
      border: 1px solid var(--accent-2);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 18px 50px rgba(40,20,90,0.10);
    }
    .imgcard img {
      display: block; width: 100%; height: auto;
      border-radius: 8px;
    }
    .cap {
      font-family: var(--font-body);
      font-size: clamp(16px, 2.0vw, 22px);
      line-height: 1.4;
      color: var(--fg);
      max-width: 1040px;
      margin: 20px auto 0;
    }
    .cover { width: 1180px; }
    .cover h1 { font-size: clamp(40px, 6.5vw, 70px); }
    .section-step { width: 900px; }
    .section-title { font-size: clamp(40px, 7vw, 72px); color: var(--accent); }
    .section-step .lead, .close .lead { color: var(--muted); }
    .close { width: 900px; text-align: center; }
    .close .monogram, .cover .monogram { margin-bottom: 28px; }
    /* two-tier flow close: human row (deep indigo) feeds AI row (electric violet) */
    .flow-close { width: 1100px; text-align: center; }
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
    @media (max-width: 820px) {
      .step, .imgstep, .cover { width: 92vw; }
      .cap { font-size: clamp(14px, 3.4vw, 18px); }
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
# steps + overview
tpl = tpl.replace("    {{STEPS}}", steps_html)
tpl = tpl.replace("{{OVERVIEW_X}}", str(int(ov_x)))
tpl = tpl.replace("{{OVERVIEW_Y}}", str(int(ov_y)))
tpl = tpl.replace("{{OVERVIEW_SCALE}}", str(int(ov_scale)))

out = os.path.join(DEST, "index.html")
open(out, "w").write(tpl)

print("WROTE", out)
print("steps:", len(placed))
print("overview: x=%d y=%d scale=%d  (span %d)" % (ov_x, ov_y, ov_scale, span))
print("remaining placeholders:", tpl.count("{{"))
