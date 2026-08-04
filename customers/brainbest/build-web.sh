#!/bin/bash
# Genera la copia liviana publicable (s1-web/) desde el deck local (s1/).
#
# VIVE FUERA de s1-web/ a propósito: el script hace `rm -rf` de esa carpeta, así
# que cuando vivía adentro se borraba a sí mismo en cada corrida (pasó el 260803).
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/s1"
DST="$HERE/s1-web"

rm -rf "$DST"
mkdir -p "$DST/assets/diagrams"

cp "$SRC"/index.html "$SRC"/toc.html "$SRC"/glosario.html "$SRC"/impress.js "$DST"/
cp "$SRC"/assets/fiba_labs_monogram.png "$DST"/assets/
cp "$HERE"/WEB-README.md "$DST"/README.md 2>/dev/null || true

# 64 colores: son dibujos de marcador sobre blanco, así que la paleta baja no se
# nota y pesa ~25% menos que a 128. La RESOLUCIÓN no se toca (1536x1024): el deck
# permite acercarse a una diapositiva y ahí sí se notaría.
for f in "$SRC"/assets/diagrams/*.png; do
  n=$(basename "$f")
  magick "$f" -strip -colors 64 -define png:compression-level=9 "$DST/assets/diagrams/$n"
done

echo "WEB COPY LISTA"
du -sh "$SRC" "$DST"
echo "imagenes: $(ls "$DST"/assets/diagrams/*.png | wc -l)"
