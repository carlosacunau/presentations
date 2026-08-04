# Brainbest Sesión 1, Master Index

This table **is** the camera path. The build script reads it top to bottom and lays
every row on the infinite plane in this order. To re-choreograph, reorder rows.

**How to read it**
- **#**: order on the camera path (within its section).
- **Kind**: `cover` | `section` | `image` | `close`.
- **Image file**: filename inside `assets/diagrams/`. Blank for cover/section/close.
- **Caption**: el texto en pantalla bajo la imagen. En las filas `image` son **tres campos
  separados por `||`**, exactamente los mismos del scene box de la galería:
  `titular || cuerpo || cierre`. El titular va en negrita, el cuerpo en gris,
  y el cierre en verde (igual que la galería). Si una fila trae un solo campo,
  se renderiza como una sola línea.
- **Notes**: for Carlos only. Never rendered.

**Idioma:** todo el texto visible va en español. "AI Mentoring" se mantiene en inglés
(es el nombre del servicio, no se traduce). Nunca se dice "card" en español: se dice
diapositiva. Sin em-dashes en ningún texto.

**Fuente de las imágenes:** `~/OS/presentations/fiba-ai-mentoring/assets/diagrams/marker/`
(26 diapositivas marker, generadas 260802-260803). Las captions salen del scene box de
`~/OS/customers/brainbest/workshops/260802_wireframes-s1.html`, que es la fuente de verdad
del texto.

---

## Cover

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | cover | (none) | Entendiendo la IA, y cómo trabajar con ella | eyebrow: "Fiba Labs · AI Mentoring" |

---

## Section 01: El punto de partida
*Opener sub: "Las bases son las mismas, pero la IA aumentó cada parte del proceso."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | El punto de partida | num 01 |
| 2 | image | 001_s1-universal-loop.png | Todo funciona igual, y aquí está el salto \|\| Cualquier IA, app o SaaS hace lo mismo: accede a datos, los interpreta, ejecuta una acción y produce un resultado. Ese ciclo siempre existió. Lo que cambia con la IA es cada etapa: conectarse a los datos ahora es fácil (antes eran integraciones a medida), interpretar y actuar dieron un salto enorme (entiende lenguaje, documentos y contexto, no solo números), y el resultado puede ser mucho más impactante: no una tabla en bruto sino un informe, una presentación, una decisión lista para revisar. \|\| El ciclo es el de siempre; pero la IA aumentó drásticamente cada etapa, y por eso el salto ha sido "cuántico". | beat 1 |
| 3 | image | 002_s1-chat-to-skills.png | De chat suelto a skills \|\| Chat simple → instrucciones custom (Custom GPTs, Gems y Projects son lo mismo con distinto nombre) → carpetas como contexto (la IA trabaja sobre TUS archivos, no desde cero) → skills: instrucciones MÁS herramientas, empaquetadas para reusar. \|\| Un skill se construye una vez y se ejecuta cuantas veces sea necesario, incluso de manera programada. | beat 2 |
| 4 | image | 003_s1-llm-landscape.png | El mapa de los modelos \|\| Tres empresas, tres marcas, y dentro de cada marca una escalera de modelos: los pequeños son rápidos y ligeros, los grandes son más capaces. Lo que aprendes hoy sirve en cualquiera: carpetas, archivos MD, skills y conectores migran contigo si algún día cambias de proveedor. \|\| No te casas con un proveedor: construyes formas de trabajar portables. | beat 3 |
| 5 | image | 004_s1-agent-vs-skill.png | Agente vs skill \|\| El agente es quien trabaja; el skill es la receta que le entregas para que ese trabajo salga igual de bien todas las veces. \|\| Los skills son tuyos: se los das a cualquier agente. | beat 3 |
| 6 | image | 005_s1-three-pillars.png | Los tres pilares \|\| Carpetas: aquí VIVEN tus datos y tu contexto: los archivos con los que trabajas y lo que la IA va produciendo; retomas trabajo anterior en vez de partir de cero. Conectores: por aquí ENTRAN los datos que viven en otras apps (correo, calendario, planillas, tu ERP): cada app publica sus datos y el conector se los trae a tu IA. Skills: trabajo repetible, capturado una vez y mejorado con el tiempo. \|\| Estos tres son la estructura: dónde vive tu material, por dónde entran los datos al sistema y qué trabajo se ejecuta sobre los datos. | beat 4 |

---

## Section 02: Tipos de archivo
*Opener sub: "Todos los formatos funcionan de la misma manera."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tipos de archivo | num 02 |
| 2 | image | 006_s1-file-anatomy.png | Todos los formatos funcionan de la misma manera \|\| Bytes, procesador, y cómo se ven en pantalla. \|\| Algunos son más fáciles de procesar, algunos se visualizan mejor y otros son más fáciles de entender para la IA. | ext: .TXT |
| 3 | image | 007_s1-file-csv.png | .csv: una tabla como texto plano \|\| Una fila por línea, columnas separadas por comas. Excel la abre como tabla y la IA la lee directo, sin adornos. \|\| El formato más fácil para pasarle datos tabulares a la IA. | ext: .CSV |
| 4 | image | 008_s1-file-docx.png | .docx: un paquete disfrazado \|\| Bytes ilegibles, un procesador (Word) que los interpreta, y el documento limpio que ves. Por dentro es un ZIP de XML: texto, estilos e imágenes por separado. \|\| Abrirlo sin Word es basura; la vista limpia depende del procesador. | ext: .DOCX |
| 5 | image | 009_s1-file-xlsx.png | .xlsx: el mismo truco, para planillas \|\| Mismos tres pasos: los bytes, un procesador (Excel), y la planilla que ves. Por dentro, un ZIP con las hojas, las fórmulas y los formatos. \|\| Tu planilla es más "desarmable" de lo que parece, y la IA sabe desarmarla. | ext: .XLSX |
| 6 | image | 010_s1-file-pdf.png | .pdf: una foto para imprimir \|\| Hecho para verse igual en todas partes. Perfecto para humanos, difícil de leer de vuelta para el software: los datos quedan congelados en la foto. \|\| Por eso sacar datos de un PDF cuesta más que de un Excel o un CSV. | ext: .PDF |
| 7 | image | 011_s1-file-html.png | .html: la página que tu navegador dibuja \|\| Texto con etiquetas que el navegador convierte en lo que ves: títulos, cajas, colores, botones. \|\| Toda página web es un archivo de texto que algo dibujó. | ext: .HTML |
| 8 | image | 012_s1-file-artifact.png | Un Artefacto (artifact) es un .html que Claude construye y mantiene \|\| Dashboards, calculadoras, reportes interactivos: páginas .html que Claude arma para ti y viven dentro de Cowork, siempre actualizadas. \|\| Cuando veas "Artifact", piensa: una página web hecha a mi medida. | ext: ARTIFACT |
| 9 | image | 013_s1-file-json.png | .json: el formato en el que viajan los datos entre apps \|\| El formato que las máquinas comúnmente usan para pasar información estructurada entre sí. Cuando un conector traiga datos de otra app, probablemente vendrán así. \|\| Cada valor viaja con su etiqueta y su tipo, y por eso el software no tiene que adivinar. | ext: .JSON |
| 10 | image | 014_s1-file-py.png | .py: texto plano que se ejecuta \|\| Toma entradas, calcula y muestra un resultado. Tú no vas a programar: la IA escribe y ejecuta este código por ti cuando la tarea lo necesita. \|\| Si ves que Claude "escribió un script", probablemente es un archivo .py que ejecuta un "compilador". | ext: .PY |

---

## Section 03: La familia MD
*Opener sub: "El idioma de las instrucciones."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | La familia MD | num 03 |
| 2 | image | 015_s1-md-format.png | MD: el idioma de las instrucciones \|\| Texto plano con formato liviano: símbolos simples (# para títulos, - para listas) que cualquier herramienta muestra bien. Es el formato que la IA prefiere para leer y escribir instrucciones. \|\| El formato .md es el que la IA lee más fácil, muchas veces lo utiliza como "intermedio" para leer o presentar archivos. | ext: .MD |
| 3 | image | 016_s1-md-overview.png | Un formato, muchos roles \|\| El mismo tipo de archivo cumple trabajos distintos según su nombre: instrucciones permanentes, memoria entre sesiones, reglas duras, recetas de trabajo. \|\| Aprendes UN formato y con eso manejas todas las piezas de tu agente. | ext: .MD |
| 4 | image | 017_s1-md-claude-agents.png | CLAUDE.md y AGENTS.md: el mismo archivo \|\| Las instrucciones permanentes de una carpeta o proyecto: reglas y contexto que la IA carga en cada sesión. CLAUDE.md es el nombre que lee Claude; AGENTS.md es el nombre agnóstico que leen otras herramientas. Si necesitas ambos, se enlaza uno al otro: un solo archivo real, dos nombres. \|\| Nunca dos copias: un archivo real y un enlace, así nunca se desincronizan. | ext: CLAUDE.md |
| 5 | image | 018_s1-md-skill.png | SKILL.md: la receta del trabajo repetible \|\| Un skill es un archivo de instrucciones con nombre propio. Lo construyes una vez y después lo llamas por su nombre cada vez que toque ese trabajo. \|\| Esto es lo que vamos a construir juntos en la segunda hora. | ext: SKILL.md |
| 6 | image | 019_s1-md-skill-structure.png | ...más la carpeta que lo rodea \|\| El skill es la receta más lo que necesita para trabajar: plantillas, ejemplos, archivos de apoyo. Todo junto en una carpeta con el nombre del skill. \|\| Un skill se puede copiar, compartir y versionar como cualquier carpeta. | ext: SKILL.md |

---

## Section 04: Prompting
*Opener sub: "No tienes que aprender prompting."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Prompting | num 04 |
| 2 | image | 020_s1-prompt-loose-vs-structured.png | La misma tarea, diferente forma de pedirla → resultados completamente diferentes \|\| Un prompt suelto da una respuesta vaga. Uno estructurado (rol, objetivo, ejemplo) da una respuesta completa. \|\| La calidad de la respuesta se decide antes de enviar. | beat 6 |
| 3 | image | 021_s1-prompt-frameworks.png | Hay decenas de fórmulas para escribir prompts \|\| Cada una es una receta con sus siglas: CLEAR (contexto, lógica, expectativas, acción, restricción) sirve para pedidos detallados; SMART, la que ya conoces de gestión, para resultados medibles; RISEN para tareas estratégicas; CREATE para explorar ideas; FOCUS para ir al grano; IDEA para iterar y refinar. Todas apuntan a lo mismo: decir con claridad qué quieres, con qué material y bajo qué restricciones. \|\| Antes había que aprender esto, pero ahora no es necesario... |  |
| 4 | image | 022_s1-ai-writes-your-prompt.png | Que la IA escriba tu prompt \|\| No memorices frameworks: dile a la IA qué necesitas y para qué, y pídele que escriba el prompt. Luego lo pegas en una conversación nueva. \|\| Este es el primer ejercicio de la parte práctica. | beat 6 · monta el hands-on #2 |

---

## Section 05: Tokens y contexto
*Opener sub: "Todo lo que entra y sale se mide en tokens."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Tokens y contexto | num 05 |
| 2 | image | 023_s1-tokenization.png | Un token es un pedazo de texto \|\| Escribes una frase, el modelo la corta en piezas: las palabras cortas quedan enteras, las largas se parten (aproximadamente 4 caracteres por pieza). Después lee esas piezas en orden y predice la siguiente. Todo lo que envías y todo lo que recibes se mide en esas piezas, incluso dentro de un plan con uso incluido."Token" es una palabra sobreusada y por eso confunde: el token de IA es un pedazo de texto (este); el token de autenticación es una clave secreta que prueba quién eres al entrar a un sistema; el token de cripto o de arcade es una unidad de valor o una ficha física. Misma palabra, tres mundos distintos. \|\| Aquí un token es siempre un pedazo de texto, y todo lo que entra y sale se mide en eso.Demo en vivo: platform.openai.com/tokenizer | beat 7 |
| 3 | image | 024_s1-five-hour-window.png | El uso viene en ventanas de tiempo \|\| Tu plan no es ilimitado ni se cobra por mensaje: incluye una cuota que se renueva cada cierto número de horas. Si la quemas de golpe al empezar el día, te toca esperar a que la ventana se renueve. Con uso repartido, te alcanza sin que lo pienses. Y si tocas el límite esta semana, no es una falla tuya: es exactamente el material que vamos a optimizar en la Sesión 2. \|\| Tu consumo se mide en tokens, y esos tokens vienen por ventanas. | beat 7 · límite de TIEMPO |
| 4 | image | 025_s1-context-two-senses.png | La misma palabra, dos sentidos \|\| Hasta aquí usamos "contexto" para hablar del material que le das: los archivos, las carpetas, el CLAUDE.md, todo lo que le pasas para que entienda tu trabajo. Ese sentido no cambia. Pero hay un segundo sentido que todavía no hemos tocado: la capacidad, cuánto le cabe a una conversación antes de que empiece a fallar. Es la misma palabra vista desde otro ángulo: uno habla de qué le das, el otro de cuánto aguanta. \|\| Contexto es material y también es capacidad. Lo que sigue es la capacidad. | beat 7 · diapositiva bisagra |
| 5 | image | 026_s1-context-window.png | La ventana de contexto, y sus dos caras \|\| Cada conversación tiene un tamaño máximo. Opus maneja un millón de tokens, que es enorme. Pero el número no es la meta: yo corto alrededor de los 500 mil, porque aunque la ventana lo soporte, la conversación se puede degradar antes de llenarse. Empieza a perder detalles, a repetirse, a olvidar lo que dijiste al principio.La segunda cara es que el contexto se acumula. Cada mensaje reenvía todo lo anterior, así que una conversación larga cuesta más en cada turno que en el anterior, y los mensajes largos aceleran eso. Dos consecuencias distintas de lo mismo: una afecta la calidad de la respuesta, la otra afecta tu consumo. En la Sesión 2 vemos cómo optimizarlo; por ahora basta con saber que las conversaciones eternas te cobran por los dos lados. \|\| Una tarea por conversación, y ciérrala antes de que se ponga pesada. | beat 7 · cierre del bloque |

---

## Section 06: Sesión 2
*Opener sub: "La segunda mitad: cómo conducirlo, criterio y qué pasa por debajo."*

*Divisoria. Todo lo anterior es la Sesión 1 y se puede dictar sola; desde aquí
empieza la Sesión 2. Se mantiene en el mismo deck a propósito, porque la S2
retoma material de la S1 (la escalera de modelos, tokens) y cierra apuntando a
lo que hicieron con Composio en la Sesión 1.*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Sesión 2 | num 06 |

---

## Section 07: Cómo conducirlo
*Opener sub: "Primero cómo se maneja, después cuánto consume."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Cómo conducirlo | num 07 |
| 2 | image | 027_s2-tips-drive-it.png | Cuatro formas de manejarlo mejor \|\| Estas cuatro frases cambian el resultado más que cualquier truco de prompt: 1) "entrevístame antes de escribir esto" (de una idea vaga sale un buen brief); 2) "si algo no lo entiendes, para y pregúntame" (deja de adivinar); 3) "toma tú las decisiones técnicas y dime qué decidiste y por qué" (no necesitas saber de tecnología, solo ver la decisión); 4) "primero hazme el plan, no ejecutes nada todavía" (Cowork no tiene modo plan, pero pedirlo funciona igual). \|\| Pedirle que pregunte y que planee antes de actuar te ahorra la mitad de las correcciones. | S2 |
| 3 | image | 028_s2-resend-cost.png | Cada turno reenvía todo \|\| En cada mensaje nuevo, la conversación completa viaja de nuevo al modelo. Mientras más larga, más consumo por cada turno siguiente. \|\| Conversaciones largas no solo pierden calidad: gastan más. | S2 |
| 4 | image | 029_s2-idle-gap.png | Si te fuiste, no retomes el mismo chat \|\| Dejaste la conversación abierta, saliste a una reunión o la retomas al día siguiente. En esa pausa se vence lo que estaba guardado en caché, así que tu primer mensaje al volver reenvía toda la conversación a precio lleno y te quema cuota más rápido. La salida es simple: antes de irte, o apenas vuelvas, pide un resumen de lo avanzado y sigue en una conversación nueva con ese resumen como punto de partida. \|\| Volver a una conversación vieja es caro. Volver a un resumen es más eficiente, y te permite retomar mejor. | S2 |
| 5 | image | 030_s2-cowork-no-compact.png | Cowork no compacta \|\| Cowork no resume la conversación por ti cuando se llena: la calidad simplemente cae. El ritual: pide un resumen de lo avanzado, abre una conversación nueva y pega el resumen como punto de partida. \|\| Puedes pedir que el resumen se guarde en un archivo o puedes pedirle un prompt con el resumen para retomar. | S2 |
| 6 | image | 031_s2-one-convo-per-task.png | Una tarea por conversación \|\| Mezclar tareas en un chat contamina el contexto de todas. Separarlas mantiene cada conversación liviana, nítida y barata. \|\| Nueva tarea, nueva conversación | S2 |

---

## Section 08: Criterio y seguridad
*Opener sub: "Dónde tienes que estar tú."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | Criterio y seguridad | num 08 |
| 2 | image | 032_s2-eighty-percent.png | Apunta al 80, tú cierras \|\| Cuando estás creando algo puntual (un informe, un correo, una propuesta), la IA te deja en el 80% en minutos. Ese último 20% (criterio, matices, la decisión final) es tuyo, y ahí está tu valor. \|\| La IA potencia tus habilidades, no te reemplaza | S2 |
| 3 | image | 033_s2-review-gate.png | Automatiza la cadena, deja la compuerta \|\| Cuando el trabajo se repite, casi todo puede correr solo: leer los archivos, procesarlos, redactar el resultado. Eso es un 90-95% del trabajo. Lo que queda afuera no es "el resto", es un punto: la aprobación antes del paso que no se puede deshacer (enviar, publicar, pagar). \|\| El concepto "Human in the Loop" (HITL): debes permanecer en el loop, o cadena, para tomar las decisiones importantes. | S2 |
| 4 | image | 034_s2-security.png | La conversación no es el riesgo; el acceso sí \|\| Enviar un Excel a Claude no lo publica en ningún lado. El riesgo real es el acceso mal manejado: claves guardadas en lugares abiertos, carpetas o herramientas compartidas sin control. \|\| La disciplina es administrar el acceso, no evitar la herramienta. | S2 |

---

## Section 09: APIs y MCP
*Opener sub: "Qué pasa por debajo cuando aprietas conectar."*

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | section | (none) | APIs y MCP | num 09 |
| 2 | image | 035_s2-api-waiter.png | La API es el mesero \|\| Tú pides del menú, el mesero lleva el pedido a la cocina y te trae el plato. Nunca entras a la cocina. Así habla un software con otro: pedidos definidos, respuestas definidas, y el interior queda oculto. \|\| Y hay solo cuatro tipos de pedido: leer, crear, actualizar, borrar. | S2 |
| 3 | image | 036_s2-assistant-per-restaurant.png | El asistente aprende, pero el mesero sigue siendo de cada cocina \|\| Un asistente que entiende de APIs te ahorra escribir el manual: aprende el menú de cada restaurante y te arma la conexión mucho más rápido. Lo que no cambia es que cada restaurante sigue teniendo su propio mesero, con su propio idioma. Aprender uno no te sirve para el siguiente. \|\| Más rápido de escribir, pero sigues aprendiendo un menú por cocina. | S2 |
| 4 | image | 037_s2-mcp-waiter.png | El mismo uniforme en todas las cocinas \|\| MCP no eliminó a los intermediarios ni fusionó las herramientas: cada herramienta sigue publicando su propia entrada. Lo que cambió es que ahora todas la publican igual. Son los mismos tres meseros de la diapositiva anterior, con el mismo uniforme y hablando un solo idioma; las cocinas por dentro siguen siendo completamente distintas. Por eso el asistente aprende un idioma en vez de tres, y puede entrar incluso a una cocina que no existía cuando lo construyeron. \|\| Cuando en Cowork aprietas "conectar", esto es lo que pasa por debajo. Es lo que hicieron con Composio en la Sesión 1. | S2 |
| 5 | image | 038_s2-container-breakbulk.png | Antes del contenedor \|\| Cada fábrica empacaba a su manera: cajones, bultos, sacos. Cada puerto tenía que aprender el manual de cada fábrica y todo se cargaba a mano, pieza por pieza. Lento, caro y distinto en cada lugar. \|\| Sin caja estándar, cada conexión es artesanal. | S2 |
| 6 | image | 039_s2-container-era.png | El contenedor no reemplazó la carga, la envolvió \|\| Una sola caja estándar y cualquier grúa, cualquier barco y cualquier puerto pueden manejarla. La carga de adentro no cambió: sigue siendo la misma. La API tampoco desapareció, quedó envuelta en algo estándar. \|\| La fábrica empaca una vez y el mundo entero sabe manejarlo. | S2 |

---

## Close

Two-tier flow. Fila superior = los pasos humanos (indigo), fila inferior = los pasos de la
IA (violeta). Sin labels, sin sub-línea: se narra en vivo. Es el mismo ciclo de la
diapositiva 001, ahora como cierre.

| # | Kind | Image file | Caption | Notes |
|---|------|-----------|---------|-------|
| 1 | close | (none) | Planear / Diseñar / Conectar \|\| Recolectar / Interpretar / Ejecutar / Presentar | two-tier: split on `\|\|`, fila humana #4C2D91, fila IA #8B5CF6 |

---

## Change log
- 260803 (c): **Se agregó la Sesión 2 al mismo deck** (13 diapositivas, 027-039), como
  secciones 07-09 detrás de una divisoria "Sesión 2" (sección 06). El deck completo
  queda en 9 secciones. La S1 se sigue pudiendo dictar sola: se termina en la sección 05
  y no se avanza a la divisoria. Texto desde el scene box de
  `~/OS/customers/brainbest/workshops/260802_wireframes-s2.html`.
  También: nuevo campo opcional `ext:` en la columna Notes, que pinta la extensión
  (.DOCX, .JSON, ...) como título grande ARRIBA de la imagen. Se agregó después de
  dictar la S1: en sala el bloque de tipos de archivo no se leía. No se regeneró
  ninguna imagen.
- 260803 (b): Las captions de las diapositivas `image` pasaron de una sola línea (solo el
  cierre) a los **tres campos completos** del scene box de la galería, separados por `||`:
  titular, cuerpo y cierre. La galería sigue siendo la fuente de verdad del texto.
  El TOC y el `alt` de cada imagen usan solo el titular, para que la lista siga corta.
  También: el subtítulo de la Sección 01 pasó a "Las bases son las mismas, pero la IA
  aumentó cada parte del proceso".
- 260803: Index creado para el deck de Brainbest Sesión 1. 26 imágenes marker en 5 secciones.
  Cover y close en español; "AI Mentoring" se mantiene en inglés como nombre del servicio.
  Close = flujo de 7 pasos (Planear/Diseñar/Conectar humanos, Recolectar/Interpretar/Ejecutar/Presentar
  de la IA). Nota: Carlos escribió "Connectar", se corrigió a "Conectar" (ortografía correcta).
