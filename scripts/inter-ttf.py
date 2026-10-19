"""Static Inter instances, one per script subset, for scripts/build-glyphs.mjs.

MapLibre draws labels from SDF glyph PBFs, and the generator needs static
fonts. Fontsource ships Inter as variable woff2 files split by script; each is
pinned here to the weights the style uses. Every subset is kept, not just
latin: generating from the latin file alone is what dropped Ł, ő and the
Vietnamese letters from the labels ("Łódź" rendered as "ód").

  .tools/pyenv/bin/python scripts/inter-ttf.py
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SRC = "node_modules/@fontsource-variable/inter/files"
OUT = ".tools/inter"
SUBSETS = ["latin", "latin-ext", "vietnamese", "cyrillic", "cyrillic-ext", "greek", "greek-ext"]
FACES = [("Regular", "normal", 400), ("Medium", "normal", 500), ("Italic", "italic", 400)]

os.makedirs(OUT, exist_ok=True)
for face, style, weight in FACES:
    for subset in SUBSETS:
        src = f"{SRC}/inter-{subset}-wght-{style}.woff2"
        font = TTFont(src)
        axes = {"wght": weight}
        if "opsz" in [a.axisTag for a in font["fvar"].axes]:
            axes["opsz"] = 14
        instantiateVariableFont(font, axes, inplace=True)
        font.flavor = None
        font.save(f"{OUT}/Inter-{face}-{subset}.ttf")
    print(f"Inter {face}: {len(SUBSETS)} subsets")
