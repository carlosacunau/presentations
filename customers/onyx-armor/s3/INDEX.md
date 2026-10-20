---
type: note
title: Onyx Mentoría S3 deck index
description: Camera path for the S3 practical GitHub repos deck (Spanish), v2
---

# Onyx Mentoría Sesión 3, Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: tres campos separados por `||`: `titular || cuerpo || cierre`.
- **Notes**: for Carlos only. Never rendered.

**Idioma:** todo el texto visible va en español (tú, neutro). Sin em-dashes.

**Versión 2 (261019):** práctica, no técnica. Un repositorio es una carpeta; GitHub sirve para
buscar herramientas con cuidado y recibir carpetas; todo se abre en Claude. Revisado por Carlos
en la página de wireframes (claude.ai artifact). La v1 técnica quedó en `INDEX_v1.md`.
Imágenes 050+ generadas con Codex image_gen; prompts en
`~/OS/customers/onyx-armor/mentoring/sessions/s3/diagram-prompts/`.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Repositorios de GitHub, simplificados | eyebrow: "Fiba Labs · AI Mentoring · Sesión 3" |

---

## Section 01: Repositorios de GitHub, simplificados
*Opener sub: "Buscar, revisar y abrir en Claude."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Repositorios de GitHub, simplificados | num 01 |
| 2 | image | 050_repo-is-a-folder.png | Un repositorio (repo) es una carpeta \|\| Tu carpeta mi-os ya es casi un repositorio: un AGENTS.md, tus contextos, tus skills. Un repositorio es eso mismo, guardado en GitHub con su historia. Todo el mundo le dice repo, para abreviar. El README es la etiqueta de la caja: te dice qué hay adentro y para qué sirve. \|\| Si sabes abrir una carpeta, sabes abrir un repo. | "Yo nunca escribo un comando de Git. Claude Code lo hace por mí." |
| 3 | image | 046_gh-public-means-internet.png | Privado o público \|\| Un repo privado solo lo ven las personas que invitas. Así te llega el repo de Onyx. Uno público lo ve todo internet, y cualquiera puede publicar ahí lo que quiera sin que nadie lo revise. \|\| Lo privado te lo comparten. Lo público lo revisas antes de usarlo. | prepara los dos casos: Rocha recibe uno privado, Julian revisa uno público |
| 4 | image | 051_read-a-repo-30s.png | Cómo leer un repo en 30 segundos \|\| 1) ¿Quién lo publica? Una persona o empresa real, con más proyectos. 2) ¿Cuándo se actualizó? Meses sin cambios es una herramienta abandonada. 3) ¿Cuánta gente lo usa? Las estrellas ayudan, pero se compran. 4) ¿Qué te pide? El README dice qué instala, qué claves pide y qué comandos corre. \|\| Cuatro preguntas antes de descargar nada. | abrir github.com/hypit-ai/hypit al lado: 23.9k estrellas, actualizado hoy, licencia "Other", pide Node, FFmpeg y claves pagas |
| 5 | image | 048_gh-not-an-app-store.png | GitHub no es una tienda de apps \|\| Nadie revisa lo que se publica. Los nombres se copian de proyectos reales, y una skill o un MCP que instales puede leer tus archivos y ejecutar comandos. Por eso no lo instalas directo. Primero se lo pasas a repo-check, que lo lee sin ejecutarlo y te da un veredicto: verde, amarillo o rojo. \|\| Primero el veredicto, después la instalación. | demo en vivo: /repo-check ComposioHQ/composio-plugin-cc (sale amarillo) |
| 6 | image | 047_gh-history-never-forgets.png | La historia no olvida \|\| Si una clave entra en un repo, borrarla después no basta: la versión vieja sigue en la historia. Y ni siquiera borrar la historia lo arregla: quien ya la vio o ya descargó el repo, la tiene. Lo que se expuso, se expuso. La única solución es cancelar la clave y crear una nueva. \|\| Clave que se filtra, clave que se cancela. | opcional: la historia de la clave de Mistral en el repo de Onyx |
| 7 | image | 052_open-in-claude.png | Ábrelo en Claude \|\| 1) En GitHub: botón verde Code, luego Download ZIP. Si es privado, primero aceptas la invitación que te llega al correo. 2) Descomprímelo en una carpeta de prueba, fuera de mi-os. 3) Abre esa carpeta en Claude y pide: "Explícame qué hace esta carpeta, qué necesita para funcionar y si ves algo riesgoso. No instales ni ejecutes nada todavía." \|\| No trabajas en GitHub. Trabajas en Claude, con la carpeta en tu computador. | Rocha: onyx-armor · Julian: Hypit |
| 8 | image | 053_copy-the-idea.png | Ingeniería inversa: copia la idea, no la instalación \|\| No todo lo que encuentras hay que instalarlo. Muchas veces basta con que Claude lo lea, te explique cómo funciona por dentro y te ayude a construir tu propia versión, más simple, en tu carpeta. Texto (skills, prompts, plantillas): Claude te escribe tu versión. El proceso de una app: lo armas por etapas, como en la Sesión 2. Código que pide claves o instala cosas: solo se lee, nunca se ejecuta. \|\| La idea la puedes usar. El código, según la licencia. | prompt: "Lee esta carpeta sin ejecutar nada. Explícame paso a paso qué entra, qué hace en cada etapa y qué sale. Después escribe ese proceso como una skill simple para mi carpeta, sin copiar su código." · Luque: anthropics/skills, skills/xlsx · Julian: Hypit por etapas |
| 9 | image | 054_check-before-install.png | Antes de instalar, revisa \|\| Sé quién lo publica. repo-check dio verde, o entiendo el amarillo. Claude lo leyó y me explicó qué hace. Lo probé en una carpeta de prueba. No le di ninguna clave sin saber para qué. \|\| Cinco revisiones, y GitHub se vuelve tu tienda de herramientas. |  |
| 10 | image | 055_my-skills.png | Mis skills, para ustedes \|\| Todo lo de hoy, aplicado a algo real: mis skills están en un repo público, las que uso en mi trabajo y con clientes. Primero se lo pasan a repo-check, también a mí: la regla vale para todo el mundo. Después descargan el ZIP y le piden a Claude que instale las que quieran. Empiecen por skill-dashboard: les arma una página con todas las skills que tienen. \|\| Revisar, instalar, y ver todo lo que tienes en un solo lugar. | github.com/carlosacunau/kit-qzlmpt00n3 · repo-check sale amarillo por ser nuevo (0 estrellas, 1 autor), el código está limpio |

---

## Close

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Planear / Diseñar / Conectar \|\| Recolectar / Interpretar / Ejecutar / Presentar | two-tier: fila humana #4C2D91, fila IA #8B5CF6 |

---

## Change log
- 261019 v2: Rehecho a pedido de Carlos: práctico en vez de técnico. Fuera el vocabulario
  (commit, push, diff), el "tú decides cuándo guardar", el texto vs binario y el arranque
  seguro de publicar. Entran: repo como carpeta, leer un repo en 30 segundos, abrirlo en
  Claude, ingeniería inversa, checklist antes de instalar y el kit de skills de Carlos.
- 261019 v1: Deck técnico desde el storyboard del 261016 (ver `INDEX_v1.md`).
