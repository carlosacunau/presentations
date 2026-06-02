"""
Display-layer name normalization for ESCAPA camping/payment views.

Title-cases parent names from the raw Google Form Sheet without touching the
source data. Handles Spanish/Italian particles (de, la, del, di, van...) and
preserves accents. Used at RENDER time only — payments.json and the Sheet stay
raw.

NOTE: an identical copy lives in
  ~/OS/presentations/personal/escapa-camping/namecase.py
Keep the two in sync. (The presentations repo runs sync.py in GitHub Actions
where ~/OS/personal/ does not exist, so the helper cannot be a shared import.)
"""

# Particles that stay lowercase when they are NOT the first word of the name.
_PARTICLES = {
    "de", "del", "la", "las", "los", "y", "e",
    "da", "di", "della", "delle", "van", "von", "der", "den",
}


def name_case(name):
    """'FELIPE LAVAGNINO' -> 'Felipe Lavagnino';
       'jose ignacio suazo córdova' -> 'Jose Ignacio Suazo Córdova'.
    Particles lowercase unless first word. Accents preserved. Initials
    like 'C.' are upper-cased. Already-mixed-case names are normalized too."""
    if not name:
        return name
    words = name.split()
    out = []
    for i, w in enumerate(words):
        low = w.lower()
        # Single-letter initials, optionally with a dot: "c." -> "C."
        if len(w.replace(".", "")) == 1:
            out.append(w.upper())
        elif i > 0 and low.strip(".") in _PARTICLES:
            out.append(low)
        else:
            out.append(low[:1].upper() + low[1:])
    return " ".join(out)
