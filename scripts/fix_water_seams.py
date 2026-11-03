import io
import os
import zipfile
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(ROOT_DIR, "assets")

# 1. Update water_animation.png to be 100% seamlessly wrapping horizontally and vertically
def make_seamless_water():
    water_path = os.path.join(ASSETS_DIR, "ingame", "environment", "tilesets", "water_animation.png")
    im = Image.open(water_path).convert("RGBA")
    w, h = im.size # 80x16 (5 frames of 16x16)
    base_color = (40, 204, 223, 255)
    highlight = (43, 234, 242, 255)

    # For each 16x16 frame, ensure col 0 matches col 15, and row 0 matches row 15
    for f in range(5):
        fx = f * 16
        for y in range(16):
            p0 = im.getpixel((fx, y))
            p15 = im.getpixel((fx + 15, y))
            # If one is highlight and one is base, blend or wrap to make smooth
            if p0 != p15:
                # If highlight on left, extend highlight to right or vice versa
                if p0 == highlight and p15 == base_color:
                    im.putpixel((fx + 15, y), highlight)
                elif p15 == highlight and p0 == base_color:
                    im.putpixel((fx, y), highlight)
        for x in range(16):
            p_top = im.getpixel((fx + x, 0))
            p_bot = im.getpixel((fx + x, 15))
            if p_top != p_bot:
                if p_top == highlight and p_bot == base_color:
                    im.putpixel((fx + x, 15), highlight)
                elif p_bot == highlight and p_top == base_color:
                    im.putpixel((fx + x, 0), highlight)

    im.save(water_path)
    print(f"[OK] Seamless water saved to {water_path}")

make_seamless_water()
