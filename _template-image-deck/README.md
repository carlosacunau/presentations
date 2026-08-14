# Plantilla: deck de imágenes (impress.js)

**Esto es una plantilla, no un deck en uso.** Es una copia exacta y funcional de
Brainbest Sesión 1 (39 diagramas, dictada el 260814), que es la versión ya
probada en sala. Está entera a propósito: se abre y se ve cómo queda el
resultado final, en vez de tener que imaginarlo desde un esqueleto vacío.

El `_` del nombre la mantiene arriba en el listado y fuera del sitio publicado.

## Verla

**Doble clic en `index.html`.** No hace falta servidor: todo es relativo y va
vendorizado (impress.js incluido, sin CDN), así que abre directo desde el
archivo. Es a propósito, para poder pasarle la carpeta a un cliente y que le
funcione sin instalar nada.

```bash
open ~/OS/presentations/_template-image-deck/index.html
```

- `index.html` el deck (flechas para navegar, `O` vista general, `?` ayuda)
- `toc.html` el índice, un link por diapositiva, se regenera en cada build
- `glosario.html` el glosario, opcional (si se borra, el índice no lo lista)

Lo único que pide servidor es medir con herramientas de navegador automatizadas
(Playwright bloquea `file://`). Para mirarlo con los ojos, el archivo alcanza.

## Usarla para un deck nuevo

```bash
cp -r ~/OS/presentations/_template-image-deck ~/OS/presentations/<deck-nuevo>
cd ~/OS/presentations/<deck-nuevo>
```

Después:

1. **Reemplazar los diagramas** en `assets/diagrams/`
2. **Reescribir `INDEX.md`**: cada fila de tabla es una diapositiva y el orden
   de las filas ES el recorrido de la cámara. La columna caption lleva tres
   campos separados por `||`: `titular || cuerpo || cierre`
3. **Ajustar la marca** en `build.py` (`BRAND_*`), si es otro cliente
4. **Borrar o reescribir `glosario.html`**
5. `python3 build.py`

Las rutas salen de dónde está `build.py`, así que la copia se construye sobre
sí misma. Cada cliente debería tener su propia copia: es lo que le da su link.

## Lo que NO hay que romper

**No usar vh/vw en las tarjetas de imagen.** impress.js no reacomoda el
contenido: declara un lienzo de 1920x1080 y le aplica UNA escala uniforme. Una
medida en vh se calcula contra la ventana real y después se multiplica otra vez
por esa escala, así que el diseño cambia de proporción según el tamaño de la
ventana y ningún valor es correcto. Todo va en píxeles de escenario. (Los pasos
de portada, sección y cierre sí usan vw, y está bien: son texto suelto sin
composición ajustada.)

**No variar data-scale en las tarjetas de imagen.** No controla solo el viaje de
cámara, también decide de qué tamaño se ve el CONTENIDO. Con un ciclo de zoom,
la misma imagen se veía de 360 a 873px según la tarjeta. Van todas en
`IMG_FRAME = 1.0` y el movimiento lo dan la posición y la inclinación.

**Si se suben los TILTS, subir también el espaciado.** Una tarjeta de 1920x1080
inclinada 14 grados ocupa 2124x1512. Con poco espacio se pisan en la vista
general.

## Perillas (todas en la cabecera de build.py)

| Qué | Dónde |
|-----|-------|
| Marca | `BRAND_NAME`, `BRAND_LOGO`, `BRAND_COLORS` |
| Alto del dibujo | `--img-h` (710px) |
| Tamaños de texto | `--body-size` 24, `--take-size` 29, `--head-size` 40 |
| Ancho del texto | `--text-w` (1560px) |
| Aire entre tarjetas | `COL_DX`, `ROW_DY`, `BLOCK_GAP` |
| Desorden | `TILTS`, `JIT_X`, `JIT_Y` |
| Bloques por banda | `BLOCKS_PER_ROW` |

Si el bloque no entra en el alto útil **no se recorta**: se escala entero
(`--shrink`, lo calcula el JS), así todas las proporciones quedan intactas.

Para reajustar la composición sin pelear con impress está `_lab-pillars.html`:
una sola diapositiva con sliders en vivo.

## Al terminar un deck

El build imprime el ratio w/h de la vista general. **Apuntar cerca de 1.78**
(16:9); más bajo deja franjas vacías a los lados al hacer zoom out.

Al medir en el navegador, esperar a que la transición termine (más de 950ms):
midiendo antes salen números transitorios que parecen bugs y no lo son.

Si se está midiendo con un servidor local y parece que sirve una versión vieja,
agregar `?v=2` a la URL. Abriendo el archivo directo no pasa: basta recargar.

## Nota sobre las imágenes

Son las de `s1-web/` (paleta reducida, 9.4M en total). Las full-res del deck
original pesan 69M y no tiene sentido arrastrarlas en una plantilla. Los
diagramas son 1536x1024, o sea 3:2, no 16:9. **La proporción no es
obligatoria**: el build lee el tamaño real de cada archivo y el alto es lo que
manda, así que pueden convivir proporciones distintas en el mismo deck.

## Créditos

impress.js (MIT), Bartek Szopka.
