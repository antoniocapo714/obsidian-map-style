"""Turns the sprite sheets in assets/sprites/ to greyscale, in place.

Protomaps' POI icons are coloured: cyan shops, green parks, pink theatres. On a
map whose colour is reserved for data they were the only colour that was not
data. Each pixel keeps its luminance and its alpha, so an icon reads exactly as
bright as before, only without hue. Run after scripts/fetch-assets.mjs.

    python3 scripts/grey-sprites.py
"""
from pathlib import Path

from PIL import Image

for path in sorted(Path("assets/sprites").glob("*.png")):
    image = Image.open(path).convert("RGBA")
    grey = image.convert("L")  # ITU-R 601 luma
    out = Image.merge("RGBA", (grey, grey, grey, image.getchannel("A")))
    out.save(path, optimize=True)
    print(f"{path}: {image.size[0]}x{image.size[1]}, greyscale")
