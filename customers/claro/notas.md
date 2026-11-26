---
type: note
---

# Notas por lámina (se muestran bajo cada lámina en presentacion/)

Fuente: la charla en vivo del 26 de noviembre de 2026. Una sección `## N` por lámina; `build-web-from-pptx.py` las inserta en el visor.

## 1
Charla de Carlos Acuña (Fiba Labs) en Claro Empresas Day, 26 de noviembre de 2026. En Fiba Labs nos dedicamos a hacerle la vida más fácil a las personas con mentoría, capacitación, acompañamiento e implementaciones a la medida.

## 2
Empezamos con una historia de cómo las máquinas nos hacen la vida más fácil. Hacia 1800, en Lyon, Francia, las telas de seda con diseños de flores se tejían entre dos personas, y un solo error en una pasada dañaba toda la tela. Joseph Marie Jacquard lo automatizó con tarjetas perforadas que decidían por dónde pasaba cada hilo: quizás el primer programa de la historia. Hace 60 años, los primeros computadores todavía se programaban con tarjetas perforadas.

## 3
En los ochenta llegó el computador personal, pero programarlo exigía especialistas. Después vino Windows, más visual, y luego herramientas donde solo mueves cajas mientras el código trabaja por detrás. El salto de hoy: le dices a la máquina lo que quieres.

## 4
Antes, una idea significaba buscar un desarrollador y esperar meses. Hoy le explicas tu idea a un agente de IA, él escribe el código, tú revisas el resultado y le pides los cambios hasta que quede a tu medida.

## 5
El flujo de la información sigue siendo el mismo: conectar las fuentes, extraer, analizar y presentar. Lo que hizo la IA fue mejorar cada etapa: conectarse es más fácil, extraer es más rápido, para analizar tienes un asistente y presentar dio un salto enorme. Tú diriges y revisas.

## 6
Primera parte: los conceptos.

## 7
Antes de seguir, seguridad. Nunca pongas contraseñas, claves del banco ni datos sensibles de clientes en un chat: el riesgo casi siempre es humano, y quien entra a tu sesión ve todo tu historial. Usa las apps oficiales y desconfía de las "IA gratis" desconocidas. Y verifica: la IA está hecha para entregar un resultado, así que a veces inventa con total seguridad. Revisa cifras, nombres, fechas y leyes, y pídele que te muestre de dónde sacó la información.

## 8
¿Quién ya usa IA? ¿Quién paga por una? ¿A quién le ayudó en su día a día? ¿Y en su negocio? Las manos van bajando. La IA trajo palabras nuevas: LLM, agente, contexto, código, skill, token, prompt, API y MCP. La prueba: ¿podrías explicárselas a un niño de 8 años?

## 9
LLM viene del inglés Large Language Model: modelo grande de lenguaje. Son los conocidos ChatGPT, Claude, Gemini y Grok. Aprendieron con enormes cantidades de texto a leer y escribir; hoy son multimodales: ven imágenes, leen documentos, escuchan, hablan y algunos crean imágenes. El nombre se quedó, aunque hoy hacen mucho más.

## 10
Cada empresa tiene una escalera de modelos y los nombra a su manera: Claude va de Haiku a Fable, ChatGPT se fue por los astros y Google por la tabla periódica. El número es la versión, y no todos van en la misma. Más grande es más capaz, pero también cuesta más. Además puedes elegir cuánto piensa (bajo, medio o alto): para una decisión simple, bajo funciona perfecto.

## 11
Un token es la representación de otra cosa, como la ficha de un casino representa dinero. Es la forma en que la IA lee: "compré una bicicleta el lunes" le llega partido en tokens, que pueden ser una palabra, una coma o una tilde (en promedio unas cuatro letras). También es la unidad de cobro, como el kilowatt de la luz o el litro de combustible: un modelo más grande cuesta más por token. Pagas con una suscripción con límites que se renuevan, o por uso.

## 12
Si dices "nos vemos en el banco" sin contexto, el otro no sabe si hablas del banco de la plata o del banco de la plaza. Con la IA es igual: quiénes son tus clientes y cómo escribes es la base del resultado. La ventana de contexto es cuánto puedes conversar en un chat antes de que se maree: recuerda bien el principio y el final, pero en el medio patina. Buena práctica: un chat, una tarea. Si se alarga, pide un resumen y empieza un chat nuevo con él.

## 13
Agente viene de agencia: la capacidad de resolver problemas. Se entrena, reconoce patrones y predice lo que viene. Lo agéntico es que, si encuentra un obstáculo, busca otro camino hasta llegar al objetivo. Por eso conviene darle el objetivo, no el camino.

## 14
Una API es la forma en que una aplicación pide, envía y lee información de un servidor. Cada vez que presionas "enviar correo", una API lleva el pedido al servidor y este responde "listo". Es como el mesero: tú pides el plato número 3, él se lo pasa a la cocina y la cocina sabe la receta.

## 15
Antes, cada aparato tenía su propio conector, hasta que llegó el USB: un solo conector para todo. MCP (Model Context Protocol) es el USB de la IA, un estándar para conectarla a tus aplicaciones. Con 3 IA y 4 aplicaciones necesitas 12 conexiones; con MCP, 7. Y la diferencia crece: con 8 aplicaciones serían 24 contra 11.

## 16
Cómo pides cambia el resultado. "Hazme un informe sobre Blockbuster" te trae la historia de la empresa. "Un informe de una página sobre por qué quebró Blockbuster, para un directorio que evalúa invertir, con lecciones y no historia" te trae lo que necesitas: rol, contexto, tarea y formato. No hace falta memorizar fórmulas de prompts: pídele a la IA que te escriba el prompt y pégalo en un chat nuevo.

## 17
Los skills son la forma de enseñarle a la IA tus procesos. Como en Matrix: se conecta y de un momento a otro "ya sabe kung-fu". Le muestras una vez cómo cotizas, la conectas a tus datos y aprende a cotizar igual cada vez.

## 18
Preparé 32 skills en 8 carpetas: finanzas, ventas, marketing, operaciones y más. Por ejemplo, uno que ya conoce la Ley 21.719 de protección de datos, o uno para preparar postulaciones a Sercotec o Corfo. Los pides con el código QR del final.

## 19
Segunda parte: el panorama actual.

## 20
Los grandes fabricantes son OpenAI, Google, Anthropic, Microsoft, xAI y Meta. Cada uno trae sus modelos, su agente y sus herramientas. En rojo, la tendencia del momento: los asistentes personales, que siguen trabajando por ti aunque cierres la app.

## 21
Cada IA viene conectada de fábrica a su ecosistema. Si trabajas con Microsoft, Copilot se conecta con Outlook, Teams y Excel; Gemini, con Gmail, Drive, NotebookLM y YouTube. Muse, de Meta, vive en WhatsApp, Instagram y Facebook y es gratis, aunque todavía no llega a Chile. Grok se conecta con X, Cursor y hasta con un Tesla.

## 22
¿Cuánto tardó cada tecnología en llegar a un millón de usuarios? El teléfono, 23 años; el celular, 4 años; Instagram, dos meses y medio; ChatGPT, 5 días. Y en 2026 la IA ya tiene 1 billón de usuarios. En cuatro años pasamos de ChatGPT 3.5 (noviembre de 2022) a modelos que piensan antes de responder, agentes que escriben código y asistentes personales. El momento de subirse es ahora.

## 23
Herramientas para tareas específicas: automatizar (n8n, Make, Zapier), audio, voz y video (HeyGen, ElevenLabs y otras; la voz del video final es un clon de la mía), investigar y estudiar (Perplexity, NotebookLM) y OpenRouter para usar todos los modelos pagando por uso. Primero tu contexto; después, una herramienta a la vez.

## 24
Tercera parte: contexto y arquitectura.

## 25
Un ejemplo: un cliente pregunta "¿puedo dejar un abono?". Sin contexto, la IA le habla de abono para plantas. Conectada a tus datos, sabe que trabajas con abonos en dinero y responde con tu política: reservas con el 30% y pagas el resto al retirar. La diferencia es el contexto: tus carpetas y tus datos.

## 26
El agente sabe mucho de todo, pero no te conoce a ti, ni tu negocio, ni tus clientes. Trátalo como a un empleado nuevo: el primer día no le pides tres presentaciones, primero le das la información y el contexto correctos.

## 27
Cuando presionas Enter, tu mensaje viaja a un centro de datos (Amazon, Google, Microsoft, Oracle o el de xAI). Ahí se procesa, pero esos centros no tienen memoria: con cada mensaje viaja la conversación completa, ida y vuelta. Por eso decir "gracias" no es gratis: se procesa todo de nuevo. El contexto lo pones tú, desde tu lado.

## 28
Como los modelos no tienen memoria, los fabricantes fueron agregándola por pasos: el chat suelto, los GPT personalizados y los Gems, los proyectos y los skills, y con las apps de escritorio, carpetas reales de tu computador. Cada paso es más memoria y mejor uso de tu contexto. El último: la arquitectura de contexto. Si usas GPT personalizados: OpenAI los retira el 11 de diciembre de 2026 y los reemplaza por plugins; para algo simple, un proyecto de ChatGPT también sirve.

## 29
Arma una carpeta con lo que la IA debe saber de tu negocio: quién eres, tus productos, tus precios, tus clientes y tu tono para que escriba como tú. La conectas a cualquier IA: el escritorio es tuyo y le puedes conectar cualquier "cerebro" sin perder nada.

## 30
La arquitectura de contexto es tu empresa replicada en carpetas, como un edificio. Cada carpeta tiene un mapa en la entrada e instrucciones propias: con el cliente A eres más formal, con el B más cercano. Abres un chat en la carpeta del área y no necesita cargar todo el contexto de la empresa. El cerebro se cambia; la estructura se queda.

## 31
Resumen: el LLM es el cerebro, el token es la unidad de medida, el prompt es cómo le pides, el contexto es lo que le permite saber de qué hablamos, los skills son tus procesos, y las API y el MCP son la forma de conectarlo todo.

## 32
Cuarta parte: casos prácticos.

## 33
Seis casos que puedes probar hoy. Una pista: el que repitas cada semana, conviértelo en un skill.

## 34
Pídele que analice mensajes que ya escribiste y que arme un archivo con tu tono y tus reglas. Cuando tenga que responder un WhatsApp o un correo, lo consulta y responde como tú o como tu marca.

## 35
Si la IA ya sabe qué hace tu negocio y qué tipo de publicaciones haces, con una sola foto te escribe la publicación o la descripción del producto.

## 36
Todos usamos Excel, pero sacar conclusiones de una planilla (tablas dinámicas, cruces) es difícil. Pásasela a la IA y pregúntale directamente, por ejemplo, qué se vendió más.

## 37
Le pasas el contrato largo y le pides los puntos clave y las banderas rojas. Igual hay que revisarlo, porque el humano sigue siendo fundamental, pero ya no lees 80 páginas: vas directo a los puntos que te importan.

## 38
Diseña tu plantilla de cotización (la IA también te ayuda), guárdala en tus carpetas y, con los datos de cada cliente, la IA arma la cotización.

## 39
En la calle o en una reunión, le hablas y le pides una lista de tareas o un resumen, y tienes un documento ordenado con lo que se habló.

## 40
Bono: antes, cuando algo fallaba, había que buscar en internet o leer el manual. Ahora tomas una captura de pantalla, se la pegas a la IA y le pides la solución. Si está conectada a tu computador, incluso puede resolverlo por ti.

## 41
Los siguientes pasos. Todo empieza en el mundo real: ordena tus procesos y busca dónde está el mayor impacto (la IA te ayuda a encontrar los cuellos de botella). Arma tus carpetas de contexto, baja una de las aplicaciones de escritorio y empieza a usarla.

## 42
¿Preguntas? Escanea el código QR y te comparto la presentación y los 32 skills. ¡Gracias!
