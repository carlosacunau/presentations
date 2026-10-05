# Onyx Mentoría Sesión 1, Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: tres campos separados por `||`: `titular || cuerpo || cierre`. El titular
  va en negrita, el cuerpo en gris y el cierre en verde.
- **Notes**: for Carlos only. Never rendered. Los minutos son de la grabación de la S1.

**Idioma:** todo el texto visible va en español. "AI Mentoring" se mantiene en inglés.
Sin em-dashes en ningún texto.

**Qué es este deck (rehecho 261005):** la Sesión 1 tal como se dictó el 260921, sacada de
la grabación (`~/OS/customers/onyx-armor/mentoring/sessions/s1/260921_s1-transcript.md`).
El orden es el de la sesión, las captions dicen lo que se dijo, y lo que se enseñó en vivo
sin diapositiva ahora tiene una (imágenes 042 a 052). Lo que no se alcanzó a mostrar
(ventana de contexto, Cómo conducirlo, Criterio y seguridad) se movió al deck de la
Sesión 2. La versión anterior está en `INDEX_v1.md`.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Entendiendo la IA, y cómo trabajar con ella | eyebrow: "Fiba Labs · AI Mentoring · Sesión 1" |

---

## Section 01: El punto de partida
*Opener sub: "Las bases son las mismas, pero la IA aumentó cada parte del proceso."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | El punto de partida | num 01 |
| 2 | image | 001_s1-universal-loop.png | Todo funciona igual, y aquí está el salto \|\| Cualquier app hace lo mismo: se conecta a los datos, los interpreta, los modifica y los entrega en una capa de presentación. Ese ciclo siempre existió. Lo que cambió con la IA es cada etapa: hoy no necesitas aprender a conectarte, solo saber qué conector necesitas y pedírselo a cualquier IA. Y la presentación ya no es una tabla: es un tablero, una página, una presentación. \|\| El ciclo es el de siempre; la IA aumentó cada etapa. | 0:21 |
| 3 | image | 002_s1-chat-to-skills.png | De chat suelto a skills \|\| Un chat no tiene memoria: cada mensaje reenvía la conversación completa, y o se pierde o terminas con 30.000 conversaciones. Por eso una tarea por chat. Después vinieron los Gems, los Custom GPTs y los Proyectos (instrucciones más archivos, pero estáticos). Y ahora las carpetas y las skills: instrucciones MÁS herramientas, empaquetadas para reusar. \|\| Una skill le enseña a Claude a hacer las cosas como a ti te gustan, cada vez. | 1:41 a 7:21 |
| 4 | image | 003_s1-llm-landscape.png | El mapa de los modelos \|\| Claude tiene nombres poéticos: Haiku, Sonnet, Opus y Fable, de menor a mayor (más grande es más capaz, más caro y a veces más lento). ChatGPT tiene su propia escalera: Luna, Terra, Sol y Astra. Lo que aprendes hoy sirve en cualquiera: carpetas, archivos MD, skills y conectores migran contigo. \|\| No te casas con un proveedor: construyes formas de trabajar portables. | 7:23 |
| 5 | image | 004_s1-agent-vs-skill.png | El agente es un cerebro intercambiable \|\| El agente es quien trabaja; la skill es la receta que le entregas. Todos los agentes leen las mismas skills y los mismos archivos, así que el cerebro se puede cambiar: la misma skill en Haiku sale más rápido, en Fable sale con mejor análisis. Y un modelo puede llamar a otro: Claude le pide a Codex que revise, o Fable le pasa una revisión a Sonnet. \|\| Las skills son tuyas: se las das a cualquier agente. | 12:22 · demo en vivo antes (9:22): una skill editó esta diapositiva para agregar Astra |
| 6 | image | 048_s1-folder-rules-banana.png | La memoria vive en la carpeta, no en el agente \|\| Una carpeta por empresa, por área o por proyecto, y adentro un AGENTS.md con las reglas. Cualquier agente que trabaje ahí las sigue. La prueba: una regla que diga "empieza siempre diciendo banana". Si la dice, leyó la carpeta. \|\| Cada chat nuevo en esa carpeta se comporta igual, porque las reglas no viven en el chat. | 15:46 a 22:41 · y la demo de la piña (2:15) |
| 7 | image | 005_s1-three-pillars.png | Los tres pilares \|\| Carpetas: aquí VIVEN tus datos y tu contexto. Conectores: por aquí ENTRAN los datos que viven en otras apps (correo, calendario, planillas, tu ERP). Skills: el trabajo que se hace sobre esos datos, capturado una vez y mejorado con el tiempo. \|\| Dónde vive tu material, por dónde entra, y qué trabajo se hace con él. | 22:41 |

---

## Section 02: Tipos de archivo
*Opener sub: "Todos los formatos funcionan de la misma manera."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tipos de archivo | num 02 |
| 2 | image | 006_s1-file-anatomy.png | Todos los formatos funcionan de la misma manera \|\| Bytes, un procesador, y cómo se ven en pantalla. Ojo: la IA crea todo en .md por defecto; si lo quieres en Word, PDF o Google Doc, pídele que lo convierta. \|\| Algunos son más fáciles de procesar, otros se ven mejor, y otros la IA los entiende mejor. | ext: .TXT · 24:47 |
| 3 | image | 007_s1-file-csv.png | .csv: una tabla como texto plano \|\| Enter es una fila nueva, la coma es una columna nueva. Excel la abre como tabla y la IA la lee directo. Pero es solo la tabla: sin notas, sin colores. \|\| El formato más fácil para pasarle datos tabulares a la IA. | ext: .CSV |
| 4 | image | 008_s1-file-docx.png | .docx: un paquete disfrazado \|\| Abierto en un bloc de notas es ilegible: necesita un procesador (Word) que lo interprete. Por dentro es un ZIP con el texto, los estilos y las imágenes por separado. \|\| La vista limpia depende del procesador. | ext: .DOCX |
| 5 | image | 009_s1-file-xlsx.png | .xlsx: el mismo truco, para planillas \|\| Un archivo comprimido con las hojas, las fórmulas, las tablas dinámicas, los filtros y las macros. \|\| Tu planilla es más "desarmable" de lo que parece, y la IA sabe desarmarla. | ext: .XLSX |
| 6 | image | 010_s1-file-pdf.png | .pdf: una foto para imprimir \|\| Hecho para verse igual en todas partes. Perfecto para humanos, difícil de leer de vuelta para el software: los datos quedan congelados en la foto. \|\| Por eso sacar datos de un PDF cuesta más que de un Excel o un CSV. | ext: .PDF |
| 7 | image | 011_s1-file-html.png | .html: la página que tu navegador dibuja \|\| Texto con etiquetas que abren y cierran, y el navegador lo convierte en lo que ves. Es la nueva capa de presentación: en vez de compartir un Google Sheet, publicas un tablero con filtros (los pagos del campamento, el tablero de skills). Basta con pedir "hazme un HTML de esta información". \|\| Toda página web es un archivo de texto que algo dibujó. | ext: .HTML · 28:15 |
| 8 | image | 012_s1-file-artifact.png | Un Artefacto (artifact) es un .html que vive dentro de Claude \|\| Tableros, calculadoras, reportes interactivos que Claude arma para ti. Se comparten con un link. No se actualizan solos: le pides que lo actualice, o lo programas. \|\| Cuando veas "Artifact", piensa: una página web hecha a tu medida. | ext: ARTIFACT · 29:40 y 2:30 |
| 9 | image | 013_s1-file-json.png | .json: el formato en el que viajan los datos entre apps \|\| Como una base de datos de paso: guarda los datos con su etiqueta antes de presentarlos. n8n y los conectores trabajan así. Solo necesitas saber qué es, no escribirlo. \|\| Cada valor viaja con su etiqueta, y por eso el software no tiene que adivinar. | ext: .JSON |
| 10 | image | 014_s1-file-py.png | .py: texto plano que se ejecuta \|\| La IA no es matemática: recalcula cada vez. Si le preguntas lo mismo 30 veces, te da 30 respuestas distintas. Un script de Python con la misma entrada 30 veces da el mismo resultado 30 veces. Por eso las skills usan mucho Python para los pasos que tienen que salir exactos. \|\| Si Claude "escribió un script", es para que ese paso no dependa de la suerte. | ext: .PY · 32:36 |

---

## Section 03: La familia MD
*Opener sub: "El idioma de las instrucciones."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | La familia MD | num 03 |
| 2 | image | 015_s1-md-format.png | MD: el idioma de las instrucciones \|\| Texto plano con formato liviano: # para títulos, - para listas, tablas y bloques de código que cualquier visor muestra bien. Es el formato que la IA prefiere para leer y escribir. \|\| Un formato impulsado por la IA. | ext: .MD |
| 3 | image | 016_s1-md-overview.png | Un formato, muchos roles \|\| El mismo tipo de archivo cumple trabajos distintos según su nombre: CLAUDE.md, AGENTS.md, memory.md, rules.md, SKILL.md. \|\| Aprendes UN formato y con eso manejas todas las piezas de tu agente. | ext: .MD |
| 4 | image | 017_s1-md-claude-agents.png | CLAUDE.md y AGENTS.md: el mismo trabajo \|\| Cada herramienta tenía su propio archivo de reglas (Gemini.md, el de Cursor, CLAUDE.md) hasta que AGENTS.md quedó como el estándar. Claude ya lo lee. Si tienes los dos, el CLAUDE.md es una sola línea que apunta al AGENTS.md: un solo archivo real. \|\| Escribe tus reglas en AGENTS.md y te sirven en cualquier herramienta. | ext: AGENTS.md · 36:53 · prometí probar borrar el CLAUDE.md: se respondió en la S2 |
| 5 | image | 018_s1-md-skill.png | SKILL.md: la receta del trabajo repetible \|\| Una skill es una carpeta con nombre propio, y adentro un SKILL.md. Su descripción dice para qué sirve, no el proceso completo. Las skills viven en carpetas ocultas de tu usuario: nunca vas a tener que ir a buscarlas. \|\| La construyes una vez y después la llamas por su nombre, o con /. | ext: SKILL.md · 39:58 |
| 6 | image | 019_s1-md-skill-structure.png | ...más la carpeta que la rodea \|\| El SKILL.md más lo que necesita para trabajar: scripts, plantillas, ejemplos. Ejemplo: la skill de pagos del campamento. Le mando la foto de un pago, digo "Campello", y corre un script que registra a la persona y regenera el tablero HTML. \|\| Una skill se puede copiar, compartir y versionar como cualquier carpeta. | ext: SKILL.md · campello-pagos |

---

## Section 04: Prompting
*Opener sub: "No tienes que aprender prompting."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Prompting | num 04 |
| 2 | image | 020_s1-prompt-loose-vs-structured.png | La misma tarea, diferente forma de pedirla → resultados completamente diferentes \|\| "Analiza estos exámenes" contra "actúa como un médico, revisa estos exámenes y dime...": el segundo da una respuesta mucho mejor. \|\| La calidad de la respuesta se decide antes de enviar. | 43:37 |
| 3 | image | 021_s1-prompt-frameworks.png | Hay decenas de fórmulas para escribir prompts \|\| SMART, RISEN, CLEAR, CO-STAR (la que yo uso): cada una es una receta con siglas. Todas apuntan a lo mismo: decir con claridad qué quieres, con qué material y bajo qué restricciones. \|\| Hace un año había que aprenderlas. Hoy ya no. | 46:14 |
| 4 | image | 022_s1-ai-writes-your-prompt.png | Que la IA escriba tu prompt \|\| Dile qué necesitas, en qué formato y cuál es el resultado final, y pídele que escriba el prompt (por ejemplo "usa CO-STAR"). Después lo pegas en una conversación NUEVA. Hasta el ChatGPT gratis lo hace. \|\| Es lo que hicimos con Blockbuster: el mismo pedido, dos prompts, dos resultados. | 47:31 · Blockbuster en vivo 45:22 a 52:36 |

---

## Section 05: Modelos y rutinas
*Opener sub: "Qué modelo usar, y tu primera idea de skill."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Modelos y rutinas | num 05 |
| 2 | image | 042_s2-model-choice.png | Modelo, esfuerzo y plan \|\| Plan de 20 dólares: Sonnet alcanza y sobra. Plan de 100 o más: Opus por defecto. Fable solo para revisiones profundas: se renueva cada semana y puede usar hasta la mitad de tu cuota. El esfuerzo (effort) en alto; el máximo es para quemar plata. Y usa siempre las versiones más nuevas. \|\| Opus para trabajar, Fable para auditar, Sonnet cuando cuidas la cuota. | 52:37 a 58:44 |
| 3 | image | 044_s2-routine-to-skill.png | Tu rutina, convertida en skill \|\| Rocha graba sus reuniones con Otter y le pide resúmenes a Claude, pero cada uno sale distinto. Eso es una skill: conecta Otter, detecta el cliente, y aplica el formato de ese cliente. Y si algo sale mal, le dices "corrige esto en la skill" y la próxima vez sale bien. \|\| Si lo haces cada semana y lo explicas cada vez, es una skill esperando. | 58:44 a 1:05 · se construye en la S2 |

---

## Section 06: Tokens y planes
*Opener sub: "Todo lo que entra y sale se mide en tokens."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tokens y planes | num 06 |
| 2 | image | 023_s1-tokenization.png | Un token es un pedazo de texto \|\| Unas 3 o 4 letras por pieza: "hola, ¿cómo estás?" son 16 tokens, y una coma es un token. Todo se mide y se cobra así, imágenes incluidas, y cada modelo tiene su tokenizador. Por millón de tokens (entrada / salida): Fable 10 / 50 dólares, Opus 5 / 25, Haiku cinco veces más barato que Opus. \|\| La plataforma de Onyx corre por API y cuesta unos 4 dólares al mes. | 1:05:21 · demo: platform.openai.com/tokenizer |
| 3 | image | 049_s1-subscription-vs-api.png | Suscripción o API \|\| La suscripción es como pagar el gas del invierno por adelantado: precio fijo, para tu trabajo en tu computador. La API es el medidor de luz: pagas por token, y es lo que usan las plataformas (Onyx usa OpenRouter, un revendedor de modelos: Mistral para leer y Sonnet para identificar). Lo que no se puede: meter tu suscripción en un servidor prendido 24/7 con 30 cuentas de correo. \|\| Mis 30 días a precio de API serían 3.300 dólares. Pago 100. | 1:08:41 a 1:16:02 · Rocha se perdió aquí, repasar |
| 4 | image | 024_s1-five-hour-window.png | El uso viene en ventanas de tiempo \|\| Tu plan incluye una cuota que se renueva cada 5 horas. Si la quemas de golpe, esperas a que la ventana se renueve. Fable además tiene su propio límite semanal. \|\| Tu consumo se mide en tokens, y esos tokens vienen por ventanas. | 1:16:06 · aquí se dijo "la próxima vez vemos cómo manejar el contexto" |

---

## Section 07: APIs y MCP
*Opener sub: "Qué pasa por debajo cuando aprietas conectar."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | APIs y MCP | num 07 |
| 2 | image | 035_s2-api-waiter.png | La API es el mesero \|\| Tú le dices al mesero "quiero un pollo con champiñones, el menú del 15", y el mesero sabe exactamente qué pedirle a la cocina. Nunca entras a la cocina. La cocina es la aplicación; el mesero es la API. \|\| Así habla un software con otro: pedidos definidos, respuestas definidas. | 1:16:30 |
| 3 | image | 036_s2-assistant-per-restaurant.png | La IA aprende el menú de cada cocina \|\| La IA es un robotcito que aprende las APIs: la del correo, la del calendario, la de Sheets. Para una app nueva le dices "lee la documentación de esa API y conéctate". Pero cada cocina sigue teniendo su propio mesero y su propio idioma. \|\| Más rápido, pero sigue siendo un menú por cocina. |  |
| 4 | image | 037_s2-mcp-waiter.png | MCP: el mismo uniforme en todas las cocinas \|\| Un MCP expone herramientas ya listas, así el robot no tiene que leer cada manual. Pero solo puedes hacer lo que el MCP expone: si no está ahí, no se puede. Y si te falta, puedes construir el tuyo. \|\| Cuando aprietas "conectar", esto es lo que pasa por debajo. | 1:18:59 |
| 5 | image | 038_s2-container-breakbulk.png | Antes del contenedor \|\| El correo son cajas, el calendario son bolsas, Sheets son paquetes. Para cargar las tres en mi barco tenía que leer los tres manuales de cómo acomodar cada una. \|\| Sin caja estándar, cada conexión es artesanal. |  |
| 6 | image | 039_s2-container-era.png | El contenedor no reemplazó la carga, la envolvió \|\| Una sola caja estándar y cualquier grúa, barco o puerto puede manejarla. La carga de adentro no cambió. La API tampoco desapareció: quedó envuelta en algo estándar. \|\| La fábrica empaca una vez y el mundo entero sabe manejarlo. |  |
| 7 | image | 047_s1-native-vs-composio.png | Conector nativo o Composio \|\| El conector nativo de Microsoft trae 7 herramientas (buscar un mensaje, ver el calendario, buscar correos) y no puede enviar un correo. Composio, por un solo conector, trae 287 acciones para Outlook y 158 para Teams, más de 1.500 apps (Odoo y HubSpot incluidos), y varias cuentas de la misma app. Es a los conectores lo que OpenRouter es a los modelos. \|\| Tres formas de conectar: el directorio de Claude (ahí está MyCase), un intermediario como Composio, o la URL de un MCP. | 1:20:49 a 1:31:17 · MyCase conectado en vivo · crear cuenta de Composio quedó pendiente |

---

## Section 08: Skills, no proyectos
*Opener sub: "La pregunta que más se repitió."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Skills, no proyectos | num 08 |
| 2 | image | 050_s1-project-vs-skill.png | Un proyecto es estático; una skill evoluciona \|\| Mi proyecto de resúmenes de YouTube en ChatGPT tenía instrucciones y archivos fijos. Como skill, tiene 7 formas de sacar la transcripción, revisa duplicados, guarda el resumen y lo suma a mi base de conocimiento (247 videos). Cada vez que falla, la corrijo y queda mejor. En Cowork hasta puedes grabar tu pantalla explicando un proceso y convertirlo en skill. \|\| Chat = una conversación. Proyecto o Gem = un chat con instrucciones fijas. Skill = un proceso completo que llamas por nombre. | 1:32:56 · pregunta de Luque |

---

## Section 09: La práctica
*Opener sub: "Lo que hicimos."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | La práctica | num 09 |
| 2 | image | 051_s1-practice-recap.png | Cuatro ejercicios, una sola historia \|\| Blockbuster: el mismo informe con un pedido suelto y con un prompt escrito por la IA. Meridian Gear: una empresa inventada que Claude no conoce, así que todo sale de los archivos, y los tres encontraron la contradicción (el acta dice 8 meses de pérdidas, la planilla muestra 11). La skill demo-tablero: ventas arriba, margen abajo, y después corrió sola en Harbor. La tarea: la entrevista para tu carpeta. \|\| Dos veces el mismo método. Eso es lo que se guarda en una skill. | 1:40 a 3:35 |
| 3 | image | 052_s1-code-vs-cowork.png | Code es Cowork con más libertad \|\| Cowork trabaja en una carpeta a la vez, y sus skills quedan dentro de Cowork. Code trabaja sobre todo tu espacio y lee las reglas hacia arriba: las globales, las del espacio, las del proyecto. Lo que ya funciona en Cowork (las tareas programadas) no hay que migrarlo. \|\| Si se te pierden las reglas o fallan las conexiones, usa la pestaña Code. | 2:05:58 a 2:14:31 |

---

## Close

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Planear / Diseñar / Conectar \|\| Recolectar / Interpretar / Ejecutar / Presentar | two-tier: fila humana #4C2D91, fila IA #8B5CF6 |

---

## Change log
- 261005: **Rehecho desde la grabación de la S1.** Orden y captions según lo que se dijo
  (mapa minuto a minuto hecho sobre el transcript). Nuevas: 048 (reglas de carpeta,
  banana), 049 (suscripción o API), 047 (nativo o Composio), 050 (proyecto o skill),
  051 (resumen de la práctica), 052 (Code o Cowork); 042 y 044 se comparten con la S2.
  Salieron al deck de la S2: 004b (la carpeta es el mapa, ICM, se agregó después de la
  sesión y es el tema de la S2), 025 y 026 (contexto, diferido en vivo), y toda la
  antigua divisoria "Sesión 2" con sus secciones (Cómo conducirlo, Criterio y
  seguridad). APIs y MCP se quedó: sí se dictó en la S1 (1:16 a 1:31).
  Versión anterior: `INDEX_v1.md`.
- 260925: Copia de la plantilla para Onyx con la diapositiva ICM (commit 1c11e7f).
- 260803 y antes: historia de la plantilla de Brainbest (ver `INDEX_v1.md`).
