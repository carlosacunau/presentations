# Brainbest S1, copia liviana para publicar

**Esta carpeta es generada. No se edita a mano.**

Es la misma presentación que `../s1/`, con las imágenes reducidas para que cargue
rápido en la web. El HTML, el TOC, el glosario y el JS son copias exactas.

| | `../s1/` (local) | `s1-web/` (esta) |
|---|---|---|
| Tamaño | 47 MB | 7 MB |
| Imágenes | PNG completo | PNG a 128 colores |
| Resolución | 1536x1024 | 1536x1024 (igual) |
| Uso | presentar en vivo | publicar en GitHub Pages |

La resolución **no cambia**: lo único que se reduce es la paleta de colores. Son dibujos
de marcador sobre fondo blanco, así que 128 colores es más que suficiente y el trazo,
el sombreado y la textura se ven igual.

## Cómo regenerarla

Cada vez que cambie el deck local (`python3 ../s1/build.py`), hay que rehacer esta copia:

```bash
~/OS/presentations/customers/brainbest/s1-web/rebuild.sh
```

El script borra y rehace la carpeta completa desde `../s1/`, así que nunca queda
desincronizada. La carpeta local nunca se toca.

## Fuente de verdad

El texto sale de `../s1/INDEX.md`, que a su vez sale del scene box de
`~/OS/customers/brainbest/workshops/260802_wireframes-s1.html`.
Para cambiar un texto se edita allá y se reconstruye, nunca aquí.
