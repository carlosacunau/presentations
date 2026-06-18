#!/usr/bin/env python3
# Build the Prezi-style (impress.js) version of the workshop deck.
# Light theme + Fiba violet accent + logo. Camera path = order in STEPS.
# Images already optimized (1600x893, 16:9) in assets/diagrams/.

import html, os

DEST = "/Users/carlosacuna/OS/presentations/workshop-file-formats-apis-auth-prezi"
TEMPLATE = "/Users/carlosacuna/OS/.claude/skills/prezi-deck/assets/template.html"

# ---- Camera path (from the approved order table) -------------------------
# kind: cover | section | image | overview
# Section openers are big "pull-back" beats; images are normal-scale cards.
STEPS = [
    dict(kind="cover", title="How your files, tools,<br>and logins actually work",
         eyebrow="Fiba Labs · Systems Literacy"),

    # ---------- SECTION 1: FILE FORMATS ----------
    dict(kind="section", num="01", title="File Formats",
         sub="Every file is the same three steps."),
    dict(kind="image", img="1_txt.jpg", cap="Every file is the same 3 steps: raw bytes, a processor, then what you see"),
    dict(kind="image", img="3_html.jpg", cap=".html: a page your browser renders"),
    dict(kind="image", img="3b_html-data.jpg", cap="Two ways an HTML file gets its numbers: baked-in (rebuilt on a schedule) vs live fetch"),
    dict(kind="image", img="3c_cowork-artifacts.jpg", cap="A Cowork Artifact is just an .html file Claude builds for you, and lives in Claude Cowork where it's always updated"),
    dict(kind="image", img="4_csv.jpg", cap=".csv: a table as plain text, one row per line"),
    dict(kind="image", img="5_docx.jpg", cap=".docx: a zipped bundle of files in disguise"),
    dict(kind="image", img="6_xlsx.jpg", cap=".xlsx: same trick as docx, but for spreadsheets"),
    dict(kind="image", img="7_pdf.jpg", cap=".pdf: a snapshot for printing, hard for software to read back"),
    dict(kind="image", img="2_md.jpg", cap=".md: plain text with light formatting. The language Claude prefers"),
    dict(kind="image", img="8_md-overview.jpg", cap="One format, many jobs: instructions, memory, rules, skills"),
    dict(kind="image", img="14_md-readme.jpg", cap="README.md: the front door of any project, the short intro"),
    dict(kind="image", img="9_md-claude.jpg", cap="CLAUDE.md: the standing instructions for a project"),
    dict(kind="image", img="10_md-agents.jpg", cap="AGENTS.md: same file, tool-agnostic name"),
    dict(kind="image", img="11_md-memory.jpg", cap="MEMORY.md: what the agent remembers across sessions"),
    dict(kind="image", img="12_md-rules.jpg", cap="rules.md: the hard constraints"),
    dict(kind="image", img="13_md-skill.jpg", cap="A skill is just a markdown file with instructions"),
    dict(kind="image", img="13b_md-skill-structure.jpg", cap="...plus the folder around it"),

    # ---------- SECTION 2: APIs & MCPs ----------
    dict(kind="section", num="02", title="APIs &amp; MCPs",
         sub="One standard box solves the tangle."),
    dict(kind="image", img="01_api-restaurant-analogy-v2.jpg", cap="An API is the waiter: you order from a menu, the kitchen stays hidden"),
    dict(kind="image", img="02_mcp-analogy-scene1-api.jpg", cap="Every app speaks its own API, a different waiter per restaurant"),
    dict(kind="image", img="03_mcp-analogy-scene2-coding-assistants.jpg", cap="N tools by M assistants = a tangle of custom connections"),
    dict(kind="image", img="06_mcp-analogy-scene3-mcp.jpg", cap="MCP is the standard box for AI: one protocol, plug any tool into any assistant"),
    dict(kind="image", img="04_mcp-analogy-container1-breakbulk.jpg", cap="Why it works, before shipping containers: every cargo loaded by hand, every port different"),
    dict(kind="image", img="05_mcp-analogy-container2-era.jpg", cap="The container standardized the box: any crane, any ship, any port. MCP did that for tools"),

    # ---------- SECTION 3: AUTH ----------
    dict(kind="section", num="03", title="Authentication",
         sub="How software proves who it is."),
    dict(kind="image", img="auth-methods-how-each-works.jpg", cap="API keys vs tokens vs OAuth: what each actually does"),
    dict(kind="image", img="auth-methods-comparison-flow.jpg", cap="When to use which, and why OAuth is the safe default"),

    dict(kind="close", title="Files. Tools. Trust.", sub="That's the stack."),
]

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
def esc(t): return t  # captions already use safe glyphs

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
      <div class="imgcard"><img src="assets/diagrams/{s["img"]}" alt="{esc(s["cap"])}"></div>
      <p class="cap">{esc(s["cap"])}</p>
    </div>'''
    if k == "close":
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
    /* smaller logo as a chapter mark on section title cards */
    .monogram--sm { width: clamp(48px, 6vw, 64px); margin-bottom: 18px; }
    /* persistent brand watermark: fixed to the viewport, OUTSIDE the impress
       canvas, so it stays put while the camera flies. Subtle, bottom-left. */
    .brand-watermark {
      position: fixed;
      bottom: 18px; left: 20px;
      z-index: 5;
      display: flex; align-items: center; gap: 8px;
      opacity: 0.5;
      pointer-events: none;
      font-family: var(--font-head);
      font-size: 13px; letter-spacing: 0.04em;
      color: var(--muted);
    }
    .brand-watermark img { width: 28px; height: auto; display: block; }
    @media (max-width: 820px) {
      .step, .imgstep, .cover { width: 92vw; }
      .cap { font-size: clamp(14px, 3.4vw, 18px); }
      .brand-watermark { font-size: 11px; bottom: 10px; left: 12px; }
      .brand-watermark img { width: 22px; }
    }
"""

tpl = open(TEMPLATE).read()
tpl = tpl.replace("{{DECK_TITLE}}", "File Formats, APIs &amp; MCPs, Auth Methods")
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
