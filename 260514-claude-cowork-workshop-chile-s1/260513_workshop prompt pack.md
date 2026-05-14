Building the workshop prompt pack for Chile Cowork Session 1 (tomorrow, 2026-05-14). 5 attendees, in-person, hands-on.

CONTEXT FILES (read these first):
- /Users/carlosacuna/OS/customers/entrepreneurs/workshops/chile-business-owners/cohort-1/INTAKE-ANALYSIS.md (who they are, what they need)
- /Users/carlosacuna/OS/customers/entrepreneurs/workshops/chile-business-owners/cohort-1/COWORK-CAPABILITIES.md (canonical capability map)
- /Users/carlosacuna/OS/customers/entrepreneurs/workshops/chile-business-owners/cohort-1/SESSION-BRIEF.md (session plan)
- /Users/carlosacuna/OS/customers/entrepreneurs/workshops/chile-business-owners/cohort-1/jose-miguel-valenzuela/ (and 4 other attendee folders) — attendee-specific context

DELIVERABLE: A single markdown doc — the workshop prompt pack — that I'll paste into a Notion page. Attendees get the Notion link at the start of hands-on. Each prompt goes in a code block so they can copy-paste into their own Claude Cowork.

OUTPUT FORMAT: One markdown file, sequential, with H2 headers per stage and prompts inside ``` code blocks. I walk them through stage by stage. Save to:
/Users/carlosacuna/OS/customers/entrepreneurs/workshops/chile-business-owners/cohort-1/260514_WORKSHOP-PROMPT-PACK.md

STAGES TO COVER (in order):
1. **Init** — first message to fresh Claude Cowork. Set up the carpeta/folder, create about-me/ subfolder with about-me.md, voice.md, preferences.md, memory.md.
2. **Security guardrails** — preferences.md content (never email without confirm, ask before deleting, sandbox boundaries, etc.). Prompt to have Claude write this for them.
3. **Read emails** — Gmail or Outlook connector. Prompt to read inbox and summarize.
4. **Get files** — Drive or OneDrive connector. Prompt to find and read a specific document.
5. **Build first Skill** — capture a routine they do 10x/week. Prompt to have Claude create the skill (SKILL.md with frontmatter).
6. **Routines (scheduled skills)** — set up a recurring task. Prompt to schedule the skill they just built.
7. **MCP** — connect one MCP. Pick the most universal (Notion, since 2/5 use it, or Drive since universal). Prompt to install + test.
8. **Dispatch** — send Cowork output somewhere (email draft, message, file). Prompt with a concrete example.

they are getting informatino from several places + systems, I need to be able to consolidate this into a local database.. it could be sheets or sqlite or airtable


PER STAGE, INCLUDE:
- One-line description of what they're doing
- The exact prompt (in a ``` block)
- Expected output (1–2 lines so they know if it worked)
- Common failure mode + fix (1 line)

CRITICAL RULES:
- Spanish: Colombian neutral / Bogotano. Triple defense is active (memory + ~/.claude/CLAUDE.md rule + PreToolUse hook on Write/Edit).
- NEVER use voseo, chilenismos, peninsularismos, or em-dashes.
- Reply to me in English. The prompt pack itself is in Spanish (attendees are Chilean PYME owners).
- Tone: clear, direct, no jargon. They're business owners, not engineers.

Before writing, propose the structure as a TOC and let me approve. Then write the full doc.
