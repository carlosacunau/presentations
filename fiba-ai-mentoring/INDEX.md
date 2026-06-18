# Infinite-Canvas Teaching Presentation: Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`. Section openers are big pull-back beats; images are cards the camera dives into.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: the on-screen text under the image (or the title for cover/section/close).
- **Notes**: for Carlos only. Never rendered. Source paths, to-dos, reminders.

**Segments = sections.** Each `## Section` block is independently buildable.
`build full` renders everything; `build prompting` renders just that section as a standalone mini-deck.

**Logo:** persistent brand watermark, bottom-left, bumped bigger and less transparent (see build config).

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Understanding AI, and how to work with it | eyebrow: "Fiba Labs · AI Mentoring" |

---

## Section 01: File Formats
*Opener sub: "Every file is the same three steps."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | File Formats | num 01 |
| 2 | image | 1_txt.jpg | Every file is the same 3 steps: raw bytes, a processor, then what you see | |
| 3 | image | 4_csv.jpg | .csv: a table as plain text, one row per line | |
| 4 | image | 5_docx.jpg | .docx: a zipped bundle of files in disguise | |
| 5 | image | 6_xlsx.jpg | .xlsx: same trick as docx, but for spreadsheets | |
| 6 | image | 7_pdf.jpg | .pdf: a snapshot for printing, hard for software to read back | |
| 7 | image | 3_html.jpg | .html: a page your browser renders | |
| 8 | image | 3b_html-data.jpg | Two ways an HTML file gets its numbers: baked-in (rebuilt on a schedule) vs live fetch | |
| 9 | image | 3c_cowork-artifacts.jpg | A Cowork Artifact is just an .html file Claude builds for you, and lives in Claude Cowork where it's always updated | |
| 10 | image | 15_json.jpg | .json: data with every value carrying its type (the format machines read) | **NEW** · source: diagrams/workshops/file-formats/15_json.png |
| 11 | image | 16_py.jpg | .py: plain text that runs. Code takes inputs, computes, and shows a result | **NEW** · source: diagrams/workshops/file-formats/16_py.png |
| 12 | image | 2_md.jpg | .md: plain text with light formatting. The language Claude prefers | gateway into the special .md files that follow |
| 13 | image | 8_md-overview.jpg | One format, many jobs: instructions, memory, rules, skills | |
| 14 | image | 14_md-readme.jpg | README.md: the front door of any project, the short intro | |
| 15 | image | 9_md-claude.jpg | CLAUDE.md: the standing instructions for a project | |
| 16 | image | 10_md-agents.jpg | AGENTS.md: same file, tool-agnostic name | |
| 17 | image | 11_md-memory.jpg | MEMORY.md: what the agent remembers across sessions | |
| 18 | image | 12_md-rules.jpg | rules.md: the hard constraints | |
| 19 | image | 13_md-skill.jpg | A skill is just a markdown file with instructions | |
| 20 | image | 13b_md-skill-structure.jpg | ...plus the folder around it | |

*Order: plain text first (txt, csv, docx, xlsx, pdf), then HTML group, then json and py, then `.md`. `.md` is placed LAST of the standalone formats so it flows straight into the special .md files (overview, README, CLAUDE, ...) with no detour. Move any row to re-choreograph.*

---

## Section 02: Prompting
*Opener sub: "Stop memorizing frameworks. Ask AI to write the prompt."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Prompting | num 02 |
| 2 | image | prompt-good-vs-bad.jpg | Same task, better ask: an unstructured prompt gives a vague answer; a structured one (role, goal, example) gives a complete one | **NEW** · source: diagrams/workshops/prompting/prompt-good-vs-bad.png · needs downsize to jpg |
| 3 | image | ai-writes-your-prompt.jpg | Don't memorize frameworks: tell AI what you need and why, and it writes the prompt you paste into a new chat | **NEW** · source: diagrams/workshops/prompting/ai-writes-your-prompt.png · needs downsize to jpg |

---

## Section 03: Authentication
*Opener sub: "How software proves who it is."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Authentication | num 03 (was 04; moved before APIs & MCPs) |
| 2 | image | 17_token.jpg | "Token" is an overused word: an AI token is a chunk of text the model reads; an auth token is a secret key that proves who you are | **NEW** · bridge into auth · source: diagrams/workshops/ai-concepts/tokens.png |
| 3 | image | auth-methods-how-each-works.jpg | API keys vs tokens vs OAuth: what each actually does | |
| 4 | image | auth-methods-comparison-flow.jpg | When to use which, and why OAuth is the safe default | |

---

## Section 04: APIs & MCPs
*Opener sub: "One standard box solves the tangle."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | APIs & MCPs | num 04 (was 03; now the closing teaching section) |
| 2 | image | 01_api-restaurant-analogy-v2.jpg | An API is the waiter: you order from a menu, the kitchen stays hidden | |
| 3 | image | 02_mcp-analogy-scene1-api.jpg | Every app speaks its own API, a different waiter per restaurant | |
| 4 | image | 03_mcp-analogy-scene2-coding-assistants.jpg | N tools by M assistants = a tangle of custom connections | |
| 5 | image | 06_mcp-analogy-scene3-mcp.jpg | MCP is the standard box for AI: one protocol, plug any tool into any assistant | |
| 6 | image | 04_mcp-analogy-container1-breakbulk.jpg | Why it works, before shipping containers: every cargo loaded by hand, every port different | |
| 7 | image | 05_mcp-analogy-container2-era.jpg | The container standardized the box: any crane, any ship, any port. MCP did that for tools | |

---

## Close

Two-tier flow card. Top row = the human steps (deep indigo), bottom row = the AI steps (electric violet). No labels, no sub-line; narrated live. Words come from [[teaching-flow]] in the corpus.

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Plan / Design / Connect \|\| Collect / Interpret / Execute / Display | two-tier: split on `\|\|`, top row indigo #4C2D91, bottom row violet #8B5CF6, slash-separated steps |

---

## Change log
- 260618: Index created from working build.py STEPS list. Added File Formats rows 11-12 (JSON, Python) and new Section 02 Prompting. Renumbered APIs to 03, Auth to 04. Nothing built yet; table is for review.
- 260618: Moved HTML group (3_html, 3b_html-data, 3c_cowork-artifacts) to after PDF, right before MD. New File Formats flow: txt, csv, docx, xlsx, pdf, html, md, json, py, then md-roles.
- 260618: Moved JSON and PY before MD so `.md` is the last standalone format and flows seamlessly into the special .md files. Flow now: txt, csv, docx, xlsx, pdf, html, json, py, md, then md-roles.
- 260618: Renamed deck to fiba-ai-mentoring (infinite teaching canvas). Cover eyebrow "Systems Literacy" -> "AI Mentoring". Swapped section order: Authentication now 03, APIs & MCPs now 04 (APIs & MCPs is the closing teaching section). Added token slide (17_token.jpg) as the opener card of Authentication, bridging "AI token vs auth token". Section flow now: File Formats, Prompting, Authentication, APIs & MCPs, then two-tier flow close.
