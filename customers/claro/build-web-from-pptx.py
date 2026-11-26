"""Build the published Claro deck (presentacion/) from the FINAL PPTX, one image per click.

Replaces build-web.sh (which built from the old impress.js draft) since the 261125 FINAL
deck lives in Google Slides / PPTX. Click reveals are honoured: each slide becomes one
frame per click state, so overlapping images never show stacked.

Run with a Python that has lxml, plus soffice, pdftoppm and magick on PATH:
    python3 -I build-web-from-pptx.py <FINAL.pptx>
It deletes and recreates presentacion/. Frames in extra-frames/ (sNN_*.webp) are appended to slide NN;
_anim files are animated WebPs the viewer restarts on every visit.
"""
import json, shutil, subprocess, sys, tempfile, zipfile
from pathlib import Path
from lxml import etree

P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS = {"p": P}
HERE = Path(__file__).resolve().parent
DST = HERE / "presentacion"
WIDTH = 2400


def slide_names(z):
    names = [n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
    return sorted(names, key=lambda n: int(n[len("ppt/slides/slide"):-4]))


def click_states(root):
    """Hidden-shape sets: [initial state, after click 1, after click 2, ...]."""
    seq = root.find(".//p:timing//p:cTn[@nodeType='mainSeq']/p:childTnLst", NS)
    if seq is None:
        return [set()]
    steps = []  # (is_click, [(class, spid)])
    for par in seq.findall("p:par", NS):
        cond = par.find("p:cTn/p:stCondLst/p:cond", NS)
        is_click = cond is not None and cond.get("delay") == "indefinite"
        effects = []
        for ctn in par.iter(f"{{{P}}}cTn"):
            cls = ctn.get("presetClass")
            if cls in ("entr", "exit"):
                for tgt in ctn.iter(f"{{{P}}}spTgt"):
                    effects.append((cls, tgt.get("spid")))
                    break
        steps.append((is_click, effects))
    hidden, first = set(), {}
    for _, effects in steps:
        for cls, spid in effects:
            first.setdefault(spid, cls)
    hidden = {s for s, c in first.items() if c == "entr"}
    states = [set(hidden)]
    for is_click, effects in steps:
        if is_click:
            states.append(set(states[-1]))
        for cls, spid in effects:
            (states[-1].discard if cls == "entr" else states[-1].add)(spid)
    return states


def render_state(xml, hidden):
    root = etree.fromstring(xml)
    for t in root.findall("p:timing", NS):
        root.remove(t)
    for spid in hidden:
        for c in root.findall(f".//p:cSld//p:cNvPr[@id='{spid}']", NS):
            shape = c.getparent().getparent()
            shape.getparent().remove(shape)
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def main(src):
    src = Path(src)
    with zipfile.ZipFile(src) as z:
        names = slide_names(z)
        xml = {n: z.read(n) for n in names}
        states = [click_states(etree.fromstring(xml[n])) for n in names]
        rounds = max(len(s) for s in states)
        tmp = Path(tempfile.mkdtemp())
        if DST.exists():
            shutil.rmtree(DST)
        (DST / "frames").mkdir(parents=True)
        frames = [[] for _ in names]
        for k in range(rounds):
            deck = tmp / f"round{k:02d}.pptx"
            with zipfile.ZipFile(deck, "w", zipfile.ZIP_DEFLATED) as out:
                for item in z.infolist():
                    data = z.read(item.filename)
                    if item.filename in xml:
                        i = names.index(item.filename)
                        data = render_state(xml[item.filename], states[i][min(k, len(states[i]) - 1)])
                    out.writestr(item.filename, data)
            subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(tmp), str(deck)],
                           check=True, capture_output=True)
            pdf = deck.with_suffix(".pdf")
            for i, st in enumerate(states):
                if k >= len(st):
                    continue
                png = tmp / f"s{i+1:02d}_{k:02d}"
                subprocess.run(["pdftoppm", "-png", "-singlefile", "-f", str(i + 1), "-l", str(i + 1),
                                "-scale-to-x", str(WIDTH), "-scale-to-y", "-1", str(pdf), str(png)], check=True)
                name = f"s{i+1:02d}_{k:02d}.webp"
                subprocess.run(["magick", f"{png}.png", "-strip", "-quality", "82", str(DST / "frames" / name)],
                               check=True)
                frames[i].append(f"frames/{name}")
            print(f"round {k + 1}/{rounds} done", flush=True)
        shutil.rmtree(tmp)
    for extra in sorted((HERE / "extra-frames").glob("s*_*.webp")):  # hand-made frames, e.g. s10_03_anim.webp
        shutil.copy(extra, DST / "frames" / extra.name)
        frames[int(extra.name[1:3]) - 1].append(f"frames/{extra.name}")
    html = (HERE / "presentacion-viewer.html").read_text().replace("__FRAMES__", json.dumps(frames))
    (DST / "index.html").write_text(html)
    (DST / "README.md").write_text(
        "# Claro Empresas Day: published copy\n\nGenerated by `../build-web-from-pptx.py` from the FINAL PPTX "
        f"(`{src.name}`). Never edit by hand.\n")
    print(f"slides {len(frames)}, frames {sum(map(len, frames))}")


if __name__ == "__main__":
    main(sys.argv[1])
