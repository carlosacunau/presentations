# AI Mentoring Example, Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: the on-screen text under the image. On `image` rows it is **three fields
  separated by `||`**, exactly the same as the gallery scene box:
  `headline || body || takeaway`. The headline is bold, the body is gray,
  and the takeaway is green (same as the gallery). If a row has a single field,
  it renders as a single line.
- **Notes**: for Carlos only. Never rendered.

**Language:** all visible text is in English. "AI Mentoring" is the service name.
No em-dashes anywhere.

**Image source:** `~/OS/presentations/fiba-ai-mentoring/assets/diagrams/marker/`
(26 marker slides, generated 260802-260803). The captions come from the scene box in
`~/OS/customers/brainbest/workshops/260802_wireframes-s1.html`, which is the source of truth
for the text.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Understanding AI, and how to work with it | eyebrow: "Fiba Labs · AI Mentoring" |

---

## Section 01: The starting point
*Opener sub: "The fundamentals are the same, but AI has amplified every part of the process."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | The starting point | num 01 |
| 2 | image | 001_s1-universal-loop.png | Everything works the same way, and here is the leap \|\| Any AI, app or SaaS does the same thing: it accesses data, interprets it, takes an action and produces a result. That loop has always existed. What AI changes is each stage: connecting to data is now easy (it used to take custom integrations), interpreting and acting took a huge leap (it understands language, documents and context, not just numbers), and the result can have far more impact: not a raw table but a report, a presentation, a decision ready for review. \|\| The loop is the same as always, but AI has dramatically amplified every stage, and that is why the leap has been a "quantum" one. | beat 1 |
| 3 | image | 002_s1-chat-to-skills.png | From loose chat to skills \|\| Simple chat → custom instructions (Custom GPTs, Gems and Projects are the same thing with different names) → folders as context (the AI works on YOUR files, not from scratch) → skills: instructions PLUS tools, packaged for reuse. \|\| You build a skill once and run it as many times as you need, even on a schedule. | beat 2 |
| 4 | image | 003_s1-llm-landscape.png | The map of models \|\| Three companies, three brands, and inside each brand a ladder of models: the small ones are fast and light, the big ones are more capable. What you learn today works in any of them: folders, MD files, skills and connectors move with you if you ever switch providers. \|\| You don't marry a provider: you build ways of working that are portable. | beat 3 |
| 5 | image | 004_s1-agent-vs-skill.png | Agent vs skill \|\| The agent is the one doing the work; the skill is the recipe you hand it so the work comes out just as well every time. \|\| The skills are yours: you can give them to any agent. | beat 3 |
| 6 | image | 005_s1-three-pillars.png | The three pillars \|\| Folders: this is where your data and your context LIVE: the files you work with and what the AI produces along the way; you pick up earlier work instead of starting from zero. Connectors: this is how data that lives in other apps COMES IN (email, calendar, spreadsheets, your ERP): each app publishes its data and the connector brings it to your AI. Skills: repeatable work, captured once and improved over time. \|\| These three are the structure: where your material lives, how data enters the system and what work runs on that data. | beat 4 |

---

## Section 02: File types
*Opener sub: "Every format works the same way."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | File types | num 02 |
| 2 | image | 006_s1-file-anatomy.png | Every format works the same way \|\| Bytes, a processor, and how they look on screen. \|\| Some are easier to process, some display better and others are easier for the AI to understand. | ext: .TXT |
| 3 | image | 007_s1-file-csv.png | .csv: a table as plain text \|\| One row per line, columns separated by commas. Excel opens it as a table and the AI reads it directly, no frills. \|\| The easiest format for giving tabular data to the AI. | ext: .CSV |
| 4 | image | 008_s1-file-docx.png | .docx: a package in disguise \|\| Unreadable bytes, a processor (Word) that interprets them, and the clean document you see. Inside it is a ZIP of XML: text, styles and images stored separately. \|\| Opened without Word it is garbage; the clean view depends on the processor. | ext: .DOCX |
| 5 | image | 009_s1-file-xlsx.png | .xlsx: the same trick, for spreadsheets \|\| Same three steps: the bytes, a processor (Excel), and the spreadsheet you see. Inside, a ZIP with the sheets, the formulas and the formatting. \|\| Your spreadsheet is easier to "take apart" than it looks, and the AI knows how to take it apart. | ext: .XLSX |
| 6 | image | 010_s1-file-pdf.png | .pdf: a photo for printing \|\| Made to look the same everywhere. Perfect for humans, hard for software to read back: the data is frozen in the photo. \|\| That is why getting data out of a PDF takes more work than out of an Excel file or a CSV. | ext: .PDF |
| 7 | image | 011_s1-file-html.png | .html: the page your browser draws \|\| Text with tags that the browser turns into what you see: headings, boxes, colors, buttons. \|\| Every web page is a text file that something drew. | ext: .HTML |
| 8 | image | 012_s1-file-artifact.png | An Artifact is an .html file that Claude builds and maintains \|\| Dashboards, calculators, interactive reports: .html pages that Claude puts together for you and that live inside Cowork, always up to date. \|\| When you see "Artifact", think: a web page made to fit me. | ext: ARTIFACT |
| 9 | image | 013_s1-file-json.png | .json: the format data travels in between apps \|\| The format machines commonly use to pass structured information to each other. When a connector brings data from another app, it will probably come like this. \|\| Each value travels with its label and its type, so the software doesn't have to guess. | ext: .JSON |
| 10 | image | 014_s1-file-py.png | .py: plain text that runs \|\| It takes inputs, calculates and shows a result. You are not going to program: the AI writes and runs this code for you when the task needs it. \|\| If you see that Claude "wrote a script", it is probably a .py file that a "compiler" runs. | ext: .PY |

---

## Section 03: The MD family
*Opener sub: "The language of instructions."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | The MD family | num 03 |
| 2 | image | 015_s1-md-format.png | MD: the language of instructions \|\| Plain text with light formatting: simple symbols (# for headings, - for lists) that any tool displays well. It is the format the AI prefers for reading and writing instructions. \|\| The .md format is the one the AI reads most easily, and it often uses it as an "intermediate" step to read or present files. | ext: .MD |
| 3 | image | 016_s1-md-overview.png | One format, many roles \|\| The same type of file does different jobs depending on its name: standing instructions, memory between sessions, hard rules, work recipes. \|\| You learn ONE format and with it you handle every piece of your agent. | ext: .MD |
| 4 | image | 017_s1-md-claude-agents.png | CLAUDE.md and AGENTS.md: the same file \|\| The standing instructions for a folder or project: rules and context the AI loads in every session. CLAUDE.md is the name Claude reads; AGENTS.md is the tool-agnostic name other tools read. If you need both, you link one to the other: one real file, two names. \|\| Never two copies: one real file and a link, so they never get out of sync. | ext: CLAUDE.md |
| 5 | image | 018_s1-md-skill.png | SKILL.md: the recipe for repeatable work \|\| A skill is an instructions file with its own name. You build it once and then call it by name every time that work comes up. \|\| This is what we are going to build together in the second hour. | ext: SKILL.md |
| 6 | image | 019_s1-md-skill-structure.png | ...plus the folder around it \|\| The skill is the recipe plus what it needs to do the work: templates, examples, supporting files. All together in a folder named after the skill. \|\| A skill can be copied, shared and versioned like any folder. | ext: SKILL.md |

---

## Section 04: Prompting
*Opener sub: "You don't have to learn prompting."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Prompting | num 04 |
| 2 | image | 020_s1-prompt-loose-vs-structured.png | The same task, asked a different way → completely different results \|\| A loose prompt gets a vague answer. A structured one (role, goal, example) gets a complete answer. \|\| The quality of the answer is decided before you hit send. | beat 6 |
| 3 | image | 021_s1-prompt-frameworks.png | There are dozens of formulas for writing prompts \|\| Each one is a recipe with its own acronym: CLEAR (context, logic, expectations, action, restriction) works for detailed requests; SMART, the one you already know from management, for measurable results; RISEN for strategic tasks; CREATE for exploring ideas; FOCUS for getting to the point; IDEA for iterating and refining. They all aim at the same thing: saying clearly what you want, with what material and under what constraints. \|\| You used to have to learn this, but now you don't... |  |
| 4 | image | 022_s1-ai-writes-your-prompt.png | Let the AI write your prompt \|\| Don't memorize frameworks: tell the AI what you need and what it's for, and ask it to write the prompt. Then paste it into a new conversation. \|\| This is the first exercise of the hands-on part. | beat 6 · sets up hands-on #2 |

---

## Section 05: Tokens and context
*Opener sub: "Everything that goes in and comes out is measured in tokens."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tokens and context | num 05 |
| 2 | image | 023_s1-tokenization.png | A token is a piece of text \|\| You write a sentence, and the model cuts it into pieces: short words stay whole, long ones get split (roughly 4 characters per piece). Then it reads those pieces in order and predicts the next one. Everything you send and everything you get back is measured in those pieces, even inside a plan with usage included. "Token" is an overused word and that is why it confuses people: an AI token is a piece of text (this one); an authentication token is a secret key that proves who you are when you log into a system; a crypto or arcade token is a unit of value or a physical coin. Same word, three different worlds. \|\| Here a token is always a piece of text, and everything that goes in and comes out is measured in it. Live demo: platform.openai.com/tokenizer | beat 7 |
| 3 | image | 024_s1-five-hour-window.png | Usage comes in time windows \|\| Your plan is not unlimited and it doesn't charge per message: it includes a quota that resets every so many hours. If you burn through it all at the start of the day, you have to wait for the window to reset. If you spread your usage out, it lasts without you having to think about it. And if you hit the limit this week, it is not your fault: it is exactly the material we are going to optimize in Session 2. \|\| Your usage is measured in tokens, and those tokens come in windows. | beat 7 · TIME limit |
| 4 | image | 025_s1-context-two-senses.png | The same word, two meanings \|\| Up to now we have used "context" to talk about the material you give it: the files, the folders, the CLAUDE.md, everything you pass along so it understands your work. That meaning doesn't change. But there is a second meaning we haven't touched yet: capacity, how much fits in a conversation before it starts to fail. It is the same word seen from another angle: one is about what you give it, the other is about how much it can hold. \|\| Context is material and it is also capacity. What comes next is capacity. | beat 7 · hinge slide |
| 5 | image | 026_s1-context-window.png | The context window, and its two sides \|\| Every conversation has a maximum size. Opus handles a million tokens, which is huge. But the number is not the goal: I cut off at around 500 thousand, because even if the window can handle it, the conversation can degrade before it fills up. It starts losing details, repeating itself, forgetting what you said at the beginning.The second side is that context accumulates. Every message resends everything before it, so a long conversation costs more on each turn than on the one before, and long messages speed that up. Two different consequences of the same thing: one affects the quality of the answer, the other affects your usage. In Session 2 we will see how to optimize it; for now it is enough to know that endless conversations cost you on both sides. \|\| One task per conversation, and close it before it gets heavy. | beat 7 · end of block |

---

## Section 06: Session 2
*Opener sub: "The second half: how to drive it, judgment, and what happens underneath."*

*Divider. Everything above is Session 1 and can be delivered on its own; Session 2
starts here. It stays in the same deck on purpose, because S2 picks up material
from S1 (the model ladder, tokens) and closes by pointing back to what they did
with Composio in Session 1.*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Session 2 | num 06 |

---

## Section 07: How to drive it
*Opener sub: "First how to handle it, then how much it uses."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | How to drive it | num 07 |
| 2 | image | 027_s2-tips-drive-it.png | Four ways to handle it better \|\| These four phrases change the result more than any prompt trick: 1) "interview me before you write this" (a vague idea turns into a good brief); 2) "if you don't understand something, stop and ask me" (it stops guessing); 3) "you make the technical decisions and tell me what you decided and why" (you don't need to know technology, you just need to see the decision); 4) "make me the plan first, don't execute anything yet" (Cowork has no plan mode, but asking for it works just as well). \|\| Asking it to ask questions and to plan before acting saves you half the corrections. | S2 |
| 3 | image | 028_s2-resend-cost.png | Every turn resends everything \|\| With every new message, the whole conversation travels to the model again. The longer it is, the more each following turn uses. \|\| Long conversations don't just lose quality: they cost more. | S2 |
| 4 | image | 029_s2-idle-gap.png | If you stepped away, don't go back to the same chat \|\| You left the conversation open, went to a meeting, or you're picking it up the next day. During that pause, whatever was cached expires, so your first message when you come back resends the whole conversation at full price and burns through your quota faster. The fix is simple: before you leave, or as soon as you come back, ask for a summary of the progress and continue in a new conversation with that summary as the starting point. \|\| Going back to an old conversation is expensive. Going back to a summary is more efficient, and it lets you pick up where you left off more cleanly. | S2 |
| 5 | image | 030_s2-cowork-no-compact.png | Cowork doesn't compact \|\| Cowork doesn't summarize the conversation for you when it fills up: the quality just drops. The routine: ask for a summary of the progress, open a new conversation and paste the summary in as the starting point. \|\| You can ask for the summary to be saved to a file, or ask it for a prompt with the summary so you can pick up again. | S2 |
| 6 | image | 031_s2-one-convo-per-task.png | One task per conversation \|\| Mixing tasks in one chat contaminates the context for all of them. Keeping them separate keeps each conversation light, sharp and cheap. \|\| New task, new conversation | S2 |

---

## Section 08: Judgment and security
*Opener sub: "Where you need to be involved."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Judgment and security | num 08 |
| 2 | image | 032_s2-eighty-percent.png | Aim for 80, you finish it \|\| When you are creating a one-off piece (a report, an email, a proposal), the AI gets you to 80% in minutes. That last 20% (judgment, nuance, the final decision) is yours, and that is where your value is. \|\| AI amplifies your skills, it doesn't replace you | S2 |
| 3 | image | 033_s2-review-gate.png | Automate the chain, keep the gate \|\| When the work repeats, almost all of it can run on its own: reading the files, processing them, drafting the result. That is 90-95% of the work. What stays out is not "the rest", it is one point: the approval before the step that can't be undone (sending, publishing, paying). \|\| The "Human in the Loop" (HITL) concept: you need to stay in the loop, or chain, to make the important decisions. | S2 |
| 4 | image | 034_s2-security.png | The conversation is not the risk; access is \|\| Sending an Excel file to Claude doesn't publish it anywhere. The real risk is poorly managed access: keys stored in open places, folders or tools shared without control. \|\| The discipline is managing access, not avoiding the tool. | S2 |

---

## Section 09: APIs and MCP
*Opener sub: "What happens underneath when you click connect."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | APIs and MCP | num 09 |
| 2 | image | 035_s2-api-waiter.png | The API is the waiter \|\| You order from the menu, the waiter takes the order to the kitchen and brings you the dish. You never go into the kitchen. That is how one piece of software talks to another: defined requests, defined responses, and the inside stays hidden. \|\| And there are only four kinds of request: read, create, update, delete. | S2 |
| 3 | image | 036_s2-assistant-per-restaurant.png | The assistant learns, but each kitchen still has its own waiter \|\| An assistant that understands APIs saves you from writing the manual: it learns each restaurant's menu and sets up the connection for you much faster. What doesn't change is that each restaurant still has its own waiter, with its own language. Learning one doesn't help you with the next. \|\| Faster to write, but you are still learning one menu per kitchen. | S2 |
| 4 | image | 037_s2-mcp-waiter.png | The same uniform in every kitchen \|\| MCP didn't eliminate the middlemen or merge the tools: each tool still publishes its own entry point. What changed is that now they all publish it the same way. They are the same three waiters from the previous slide, wearing the same uniform and speaking a single language; the kitchens inside are still completely different. That is why the assistant learns one language instead of three, and can even walk into a kitchen that didn't exist when it was built. \|\| When you click "connect" in Cowork, this is what happens underneath. It is what you did with Composio in Session 1. | S2 |
| 5 | image | 038_s2-container-breakbulk.png | Before the container \|\| Every factory packed its own way: crates, bundles, sacks. Every port had to learn each factory's manual and everything was loaded by hand, piece by piece. Slow, expensive and different everywhere. \|\| Without a standard box, every connection is handmade. | S2 |
| 6 | image | 039_s2-container-era.png | The container didn't replace the cargo, it wrapped it \|\| One standard box, and any crane, any ship and any port can handle it. The cargo inside didn't change: it is still the same. The API didn't disappear either, it got wrapped in something standard. \|\| The factory packs once and the whole world knows how to handle it. | S2 |

---

## Close

Two-tier flow. Top row = the human steps (indigo), bottom row = the AI steps
(violet). No labels, no sub-line: narrated live. It is the same loop as
slide 001, now as the close.

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Plan / Design / Connect \|\| Collect / Interpret / Execute / Present | two-tier: split on `\|\|`, human row #4C2D91, AI row #8B5CF6 |

---

## Change log
- 260803 (c): **Session 2 was added to the same deck** (13 slides, 027-039), as
  sections 07-09 behind a "Session 2" divider (section 06). The full deck now
  has 9 sections. S1 can still be delivered on its own: it ends at section 05
  and you don't advance to the divider. Text from the scene box in
  `~/OS/customers/brainbest/workshops/260802_wireframes-s2.html`.
  Also: new optional `ext:` field in the Notes column, which paints the extension
  (.DOCX, .JSON, ...) as a large title ABOVE the image. Added after
  delivering S1: in the room, the file types block wasn't readable. No image
  was regenerated.
- 260803 (b): The captions on `image` slides went from a single line (just the
  takeaway) to the **three full fields** from the gallery scene box, separated by `||`:
  headline, body and takeaway. The gallery is still the source of truth for the text.
  The TOC and each image's `alt` use only the headline, so the list stays short.
  Also: the Section 01 subtitle changed to "The fundamentals are the same, but AI
  has amplified every part of the process".
- 260803: Index created for the Session 1 deck. 26 marker images in 5 sections.
  Cover and close in Spanish; "AI Mentoring" kept in English as the service name.
  Close = 7-step flow (Plan/Design/Connect for the humans, Collect/Interpret/Execute/Present
  for the AI). Note: Carlos wrote "Connectar", corrected to "Conectar" (correct spelling).
