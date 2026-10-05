# Onyx Mentoría Sesión 2, Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: tres campos separados por `||`: `titular || cuerpo || cierre`.
- **Notes**: for Carlos only. Never rendered.

**Idioma:** todo el texto visible va en español (tú, neutro). Sin em-dashes.

**Fuente:** guion `~/OS/customers/onyx-armor/mentoring/sessions/s2/`. Imágenes 040+ son
nuevas (Codex image_gen, estilo whiteboard-marker, prompts en
`sessions/s2/diagram-prompts/`). El resto se copió del deck de la Sesión 1.

**Ritmo:** la Sesión 1 gastó 1h40 en teoría. Esta no pasa de 20 minutos antes de la
práctica. Las filas marcadas `rápida` se pasan en menos de un minuto.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Conducirla bien, y tu carpeta de verdad | eyebrow: "Fiba Labs · AI Mentoring · Sesión 2" |

---

## Section 01: Lo que quedó pendiente
*Opener sub: "Lo que prometí en la Sesión 1."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Lo que quedó pendiente | num 01 |
| 2 | image | 017_s1-md-claude-agents.png | Probado: AGENTS.md solo, sin CLAUDE.md \|\| En la Sesión 1 quedé de borrar el CLAUDE.md y ver si Claude seguía las reglas. Lo probé con la regla de la piña: en una carpeta que solo tiene AGENTS.md, Claude Code la cumple igual. En una carpeta sin ningún archivo de reglas, no. \|\| Ya no necesitas los dos archivos. AGENTS.md alcanza, y además lo leen otras herramientas. | probado 261005 con Claude Code 2.1.289 · rápida |
| 3 | image | 047_s1-native-vs-composio.png | Composio: un solo conector para cientos de apps \|\| En la Sesión 1 lo vimos: el conector nativo de Microsoft trae 7 herramientas y no puede enviar un correo; por Composio, Outlook trae 287 acciones, y hay más de 1.500 apps (Odoo incluido). Quedó pendiente crear la cuenta juntos. \|\| Si sobra tiempo al final, lo conectamos hoy. Si no, uno a uno en la semana. | Bloque 3 · rápida |

---

## Section 02: Manejar el contexto
*Opener sub: "La próxima vez vemos cómo manejar el contexto. Esta es la próxima vez."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Manejar el contexto | num 02 |
| 2 | image | 025_s1-context-two-senses.png | La misma palabra, dos sentidos \|\| En la Sesión 1 usamos "contexto" para hablar del material que le das: los archivos, las carpetas, el AGENTS.md, todo lo que le pasas para que entienda tu trabajo. Ese sentido no cambia. Pero tiene un segundo sentido: la capacidad, cuánto le cabe a una conversación antes de que empiece a fallar. Uno habla de qué le das, el otro de cuánto aguanta. \|\| Contexto es material y también es capacidad. Hoy toca la capacidad. | diapositiva bisagra · quedó sin mostrar en la S1 · rápida |
| 3 | image | 026_s1-context-window.png | La ventana de contexto, y sus dos caras \|\| Cada conversación tiene un tamaño máximo. Opus maneja un millón de tokens, pero el número no es la meta: la conversación se puede degradar antes de llenarse (pierde detalles, se repite, olvida lo del principio). Y el contexto se acumula: cada mensaje reenvía todo lo anterior, así que una conversación larga cuesta más en cada turno. \|\| Las conversaciones eternas te cobran por los dos lados: calidad y consumo. | quedó sin mostrar en la S1 (era la 5.4) |
| 4 | image | 028_s2-resend-cost.png | Cada turno reenvía todo \|\| En cada mensaje nuevo, la conversación completa viaja de nuevo al modelo. Mientras más larga, más consumo por cada turno siguiente. \|\| Conversaciones largas no solo pierden calidad: gastan más. | rápida |
| 5 | image | 029_s2-idle-gap.png | Si te fuiste, no retomes el mismo chat \|\| Dejaste la conversación abierta, saliste a una reunión o la retomas al día siguiente. En esa pausa se vence lo que estaba guardado en caché, así que tu primer mensaje al volver reenvía toda la conversación a precio lleno. La salida: pide un resumen de lo avanzado y sigue en una conversación nueva con ese resumen. \|\| Volver a una conversación vieja es caro. Volver a un resumen es más eficiente. |  |
| 6 | image | 031_s2-one-convo-per-task.png | Una tarea por conversación \|\| Mezclar tareas en un chat contamina el contexto de todas. Separarlas mantiene cada conversación liviana, nítida y barata. \|\| Nueva tarea, nueva conversación. | rápida |
| 7 | image | 045_s2-code-commands.png | En Code, tres comandos hacen el trabajo \|\| /clear empieza limpio para una tarea nueva. /compact resume la conversación y sigue desde el resumen, sin perder el hilo (Code también lo hace solo cuando se llena). /context te muestra qué tan llena está y qué la está llenando. \|\| Cowork no compacta; en Code es un comando. | Rocha usa Cowork para tareas programadas: ahí el ritual del resumen sigue valiendo |
| 8 | image | 027_s2-tips-drive-it.png | Cuatro frases que cambian el resultado \|\| 1) "Entrevístame antes de escribir esto" (de una idea vaga sale un buen brief). 2) "Si algo no lo entiendes, para y pregúntame" (deja de adivinar). 3) "Toma tú las decisiones técnicas y dime qué decidiste y por qué". 4) "Primero hazme el plan, no ejecutes nada todavía" (en Code también existe el modo plan, con Shift+Tab). \|\| Pedirle que pregunte y que planee antes de actuar te ahorra la mitad de las correcciones. |  |

---

## Section 03: Qué modelo usar
*Opener sub: "Uno para cada trabajo, y uno que revise al otro."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Qué modelo usar | num 03 |
| 2 | image | 042_s2-model-choice.png | Una escalera, no un modelo para todo \|\| Haiku es rápido y liviano. Sonnet es el del día a día, y en el plan de 20 dólares es el que más rinde. Opus es el modelo por defecto si tienes el plan de 100 o más. Fable es para revisiones profundas, no para todo: consume mucho y tiene su propio límite. Y el esfuerzo (effort) déjalo en alto. \|\| Opus para trabajar, Fable para auditar, Sonnet cuando estás cuidando la cuota. | Rocha usa Opus para todo; Luque preguntó cuál usar |
| 3 | image | 043_s2-model-review.png | Un modelo revisa al otro \|\| Lo que quedé de mostrar: un modelo hace el trabajo y le pide a otro (Sonnet, o Codex de OpenAI) que lo revise con ojos frescos. El revisor no vio cómo se hizo, así que encuentra lo que el primero da por hecho. \|\| Pídelo así: "cuando termines, lanza un subagente con Sonnet que revise esto, y corrige lo que encuentre". | demo en vivo si hay tiempo |

---

## Section 04: Tu carpeta de verdad
*Opener sub: "Del mapa a la carpeta: los pasos 3 y 4."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tu carpeta de verdad | num 04 |
| 2 | image | 046_s2-icm-steps.png | Dónde quedamos y qué sigue \|\| La tarea los llevó hasta el mapa: la entrevista y una página con todo lo que manejan. Hoy van los dos pasos que faltan: proponer la carpeta en papel y revisarla juntos, y después construirla y conectar la primera área. \|\| Primero el dibujo, después la mudanza. Corregir un dibujo es gratis. | pack construir-mi-os |
| 3 | image | 004b_s1-folder-is-the-map.png | La carpeta es el mapa \|\| Un archivo de entrada (AGENTS.md) dice para qué es el trabajo, y las carpetas numeradas llevan el orden. El agente no adivina dónde buscar: camina la estructura. Una carpeta, un trabajo. \|\| La estructura es la ruta: ordenas carpetas y cambias lo que el agente hace. |  |

---

## Close

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Planear / Diseñar / Conectar \|\| Recolectar / Interpretar / Ejecutar / Presentar | two-tier: fila humana #4C2D91, fila IA #8B5CF6 |

---

## Change log
- 261005 (e): Se agregó "La misma palabra, dos sentidos" (025) como bisagra al abrir la sección 02.
- 261005 (d): Se sacó la sección Tu rutina se vuelve skill (044). El Bloque 2 se hace sin deck.
- 261005 (c): Se sacó la sección Criterio y seguridad para que la teoría sea más corta. Las secciones se renumeran.
- 261005 (b): Se sacó la diapositiva del cinturón (instrucciones personalizadas, 040): son de Cowork y ya trabajan en Code. La sección 02 pasa a llamarse Criterio y seguridad.
- 261005: Deck creado para la Sesión 2 de Onyx. Toma lo que la S1 dejó sin mostrar
  (ventana de contexto, Cómo conducirlo, Criterio y seguridad) y lo que quedó prometido
  (AGENTS.md sin CLAUDE.md, Composio, un modelo que revisa a otro), más las dos partes
  nuevas de la práctica: la carpeta de verdad (ICM pasos 3 y 4) y la skill de rutina.
