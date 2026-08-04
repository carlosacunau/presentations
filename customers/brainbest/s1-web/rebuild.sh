#!/bin/bash
# Copia liviana del deck para publicar en GitHub Pages.
# La copia local (s1/) NO se toca: se lee y se escribe en s1-web/.
set -e
SRC=/Users/carlosacuna/OS/presentations/customers/brainbest/s1
DST=/Users/carlosacuna/OS/presentations/customers/brainbest/s1-web

rm -rf "$DST"
mkdir -p "$DST/assets/diagrams"

# HTML, JS y logo se copian tal cual
cp "$SRC"/index.html "$SRC"/toc.html "$SRC"/glosario.html "$SRC"/impress.js "$DST"/
cp "$SRC"/assets/fiba_labs_monogram.png "$DST"/assets/

# Los PNG se reducen a paleta de 128 colores. Son dibujos de marcador sobre
# blanco, así que 128 colores es de sobra: el trazo y el sombreado no cambian.
for f in "$SRC"/assets/diagrams/*.png; do
  n=$(basename "$f")
  magick "$f" -strip -colors 128 -define png:compression-level=9 "$DST/assets/diagrams/$n"
done

echo "WEB COPY LISTA"
du -sh "$SRC" "$DST"
echo "imagenes: $(ls "$DST"/assets/diagrams/*.png | wc -l)"
