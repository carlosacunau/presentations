---
type: note
title: Onyx Mentoría S3 deck index
description: Camera path for the S3 GitHub-without-fear mini-deck (Spanish)
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

**Fuente:** storyboard `~/OS/diagrams/workshops/github-basics/261016_github-lesson-storyboard.md`
(Sección 10 del deck AI Mentoring), adaptado al grupo de Onyx. Imágenes 040+ generadas
con Codex image_gen, estilo whiteboard-marker, prompts en
`~/OS/customers/onyx-armor/mentoring/sessions/s3/diagram-prompts/`.

**Ritmo:** la S3 es práctica. Este deck es la única teoría del día: 8 a 10 minutos y
después manos a la obra (Bloque GitHub en el guion). La fila de rama y pull request
(044 del storyboard) se sacó; queda en el glosario.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | GitHub sin miedo | eyebrow: "Fiba Labs · AI Mentoring · Sesión 3" |

---

## Section 01: GitHub sin miedo
*Opener sub: "Un Drive para tus carpetas, con máquina del tiempo incluida."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | GitHub sin miedo | num 01 |
| 2 | image | 040_gh-you-already-know.png | Ya usas control de versiones \|\| Informe_v1, Informe_FINAL, Informe_FINAL_FINAL: ese es el problema. En Excel o en Google Sheets no lo haces, porque el historial de versiones guarda cada estado anterior, muestra quién cambió qué y te deja restaurar cualquiera. Git es exactamente esa idea, pensada para carpetas completas. \|\| Si alguna vez abriste el historial de versiones, ya entiendes Git. | Luque vive en Excel: Archivo, Información, Historial de versiones |
| 3 | image | 041_gh-git-vs-github.png | Git es el historial, GitHub es el Drive \|\| Git es el programa que guarda el historial. Vive en tu computador y funciona sin internet. GitHub es la página donde esa carpeta vive en línea: con respaldo, para compartirla y a la mano desde cualquier computador. Es la misma diferencia que hay entre un archivo en tu portátil y su copia en Drive o en OneDrive. \|\| Git guarda la historia, GitHub la guarda en línea. | rápida |
| 4 | image | 042_gh-vocabulary-map.png | El diccionario: tu hoja de cálculo a la izquierda, Git a la derecha \|\| Una carpeta con historial es un repositorio (repo). Una versión guardada con nombre es un commit. El panel del historial es el log. Lo resaltado en verde y rojo es un diff. "Restaurar esta versión" es un revert. Subir a la nube es un push y traer lo último es un pull. Descargar la carpeta completa, con toda su historia, es un clone. \|\| Ocho palabras, y cada una es algo que ya haces en tu hoja de cálculo. | LA diapositiva clave, despacio · el glosario completo está en glosario.html |
| 5 | image | 043_gh-you-decide-when.png | La gran diferencia: tú decides cuándo guardar \|\| Google Sheets guarda una versión cada pocos segundos sin preguntarte. Git solo guarda cuando tú se lo pides, y cada versión lleva una nota corta de qué cambió y por qué. "Agregué los precios de marzo" es una buena nota; "cosas" no lo es. Esa es la gracia: una historia limpia de pasos con sentido, en vez de miles de autoguardados. \|\| Un commit es una versión a la que le pusiste nombre a propósito. |  |
| 6 | image | 045_gh-text-vs-binary.png | Tus instrucciones sí, tus datos no \|\| Cambia una línea en un .md y GitHub te muestra exactamente esa línea, en rojo y en verde. Cambia una celda en un .xlsx y solo puede decirte "este archivo cambió". Por eso a GitHub suben tus instrucciones (el AGENTS.md, los contextos, las skills), que son texto. Tus Excel, tus PDF y los datos de tus clientes se quedan en tu computador y en tu respaldo de siempre. \|\| A GitHub sube cómo trabajas. Tus datos se quedan en casa. | puente al hands-on: el .gitignore de hoy deja entrar solo texto · Julian: nada de clientes del bufete |
| 7 | image | 046_gh-public-means-internet.png | Público es todo internet \|\| Un repo público lo ve todo el mundo, no solo quien tenga el link: queda indexado y los bots lo leen en minutos. Privado es lo seguro: solo lo ven las personas que tú invitas. Crea todos tus repos como privados, a menos que tengas una razón clara para publicar. \|\| Si dudas, privado. | SEGURIDAD 1 |
| 8 | image | 047_gh-history-never-forgets.png | La historia no olvida \|\| Lo mismo que te salva te puede exponer. Si una contraseña o una clave de API entra en un commit, borrar el archivo después no la quita, porque la versión vieja sigue en la historia y cualquiera que vea el repo la puede abrir. Las claves van en un archivo .env, y el .env va en el .gitignore, la lista de "nunca subir". Si una clave se filtra, cancélala y crea una nueva. En 2025 se filtraron 28,6 millones de claves nuevas en GitHub público, y los commits hechos con Claude Code las filtraron a casi el doble de la tasa normal (GitGuardian, 2026). \|\| Nunca subas una clave. Si se te escapa una, cancélala: borrarla no basta. | SEGURIDAD 2 · la más importante, despacio · prueba del extraño en voz alta: "¿me importaría que un extraño leyera este archivo?" |
| 9 | image | 048_gh-not-an-app-store.png | GitHub no es una tienda de apps \|\| Nadie revisa lo que se publica ahí. Las estrellas se compran, los nombres se copian de proyectos reales, y una skill, un plugin o un MCP que instales puede leer tus archivos y ejecutar comandos. Antes de instalar algo de GitHub, mira quién está detrás, léelo antes de correrlo y pruébalo primero en una carpeta de prueba. Eso es lo que hace por ti la skill repo-check. \|\| Lee antes de instalar. Primero el veredicto, después la carpeta de prueba. | SEGURIDAD 3 · amarra con lo de los MCP con caballo de Troya de la S2 · demo en vivo: /repo-check ComposioHQ/composio-plugin-cc (sale amarillo: hooks en cada prompt) |
| 10 | image | 049_gh-safe-start.png | Tu arranque seguro \|\| 1) Cuenta de GitHub con verificación en dos pasos. 2) Todo repo privado por defecto. 3) Un .gitignore con el .env adentro antes del primer push. 4) Claude puede hacer los commits, pero cada push lo apruebas tú. 5) Revisa cualquier repo antes de instalarlo. \|\| Cinco hábitos, y GitHub deja de dar miedo. | cierre de la teoría · de aquí, directo al Bloque GitHub del doc compartido |

---

## Close

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Planear / Diseñar / Conectar \|\| Recolectar / Interpretar / Ejecutar / Presentar | two-tier: fila humana #4C2D91, fila IA #8B5CF6 |

---

## Change log
- 261019: Deck creado para la Sesión 3 de Onyx: la lección de GitHub prometida. Sale del
  storyboard del 261016 (Sección 10 del deck AI Mentoring), en español, sin la fila de
  rama y pull request, y con la diapositiva de texto vs binario convertida en la regla
  del hands-on (instrucciones sí, datos no).
