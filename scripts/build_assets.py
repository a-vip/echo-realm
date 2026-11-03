#!/usr/bin/env python3
"""
Echo Realm - Deterministic Asset Pipeline & Character Sheet Builder
===================================================================
Extracts, slices, validates, and organizes all character sprite sheets (216x26, 12 frames of 18x26),
3x4 directional grids (54x104), static preview sprites (18x26), 64x64 dialogue portraits,
creature sheets (Peacock folded & fanned walk), and environment tilesets.

Standard 12-Frame Strip Layout (216x26, frameW=18, frameH=26):
  - Cols 0, 1, 2:  South (Down)  -> [walk_step1, idle, walk_step2]
  - Cols 3, 4, 5:  East  (Right) -> [walk_step1, idle, walk_step2]
  - Cols 6, 7, 8:  West  (Left)  -> [walk_step1, idle, walk_step2]
  - Cols 9, 10, 11: North (Up)   -> [walk_step1, idle, walk_step2]
"""

import io
import os
import shutil
import subprocess
import zipfile
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(ROOT_DIR, "assets")
INGAME_CHARS_DIR = os.path.join(ASSETS_DIR, "ingame", "characters")
PORTRAITS_DIR = os.path.join(INGAME_CHARS_DIR, "portraits")
PLAYER_DIR = os.path.join(INGAME_CHARS_DIR, "player")
MOBS_DIR = os.path.join(INGAME_CHARS_DIR, "mobs")
BOSSES_DIR = os.path.join(INGAME_CHARS_DIR, "bosses")
PEACOCK_DIR = os.path.join(ASSETS_DIR, "ingame", "creatures", "peacock")
TILESETS_DIR = os.path.join(ASSETS_DIR, "ingame", "environment", "tilesets")
PROPS_DIR = os.path.join(ASSETS_DIR, "ingame", "environment", "props")

for d in [PORTRAITS_DIR, PLAYER_DIR, MOBS_DIR, BOSSES_DIR, PEACOCK_DIR, TILESETS_DIR, PROPS_DIR]:
    os.makedirs(d, exist_ok=True)


def strip_to_grid(strip_216x26):
    """Converts a 216x26 12-frame strip (S, E, W, N) into a 54x104 3x4 grid (S, W, E, N)."""
    grid = Image.new("RGBA", (54, 104), (0, 0, 0, 0))
    south = strip_216x26.crop((0, 0, 54, 26))
    east = strip_216x26.crop((54, 0, 108, 26))
    west = strip_216x26.crop((108, 0, 162, 26))
    north = strip_216x26.crop((162, 0, 216, 26))
    grid.paste(south, (0, 0))
    grid.paste(west, (0, 26))
    grid.paste(east, (0, 52))
    grid.paste(north, (0, 78))
    return grid


def save_character_bundle(char_id, strip_216x26, portrait_64x64, legacy_rel_path, portrait_filename):
    """Saves a character's assets into both its dedicated folder and legacy paths."""
    assert strip_216x26.size == (216, 26), f"{char_id} strip must be 216x26, got {strip_216x26.size}"
    assert portrait_64x64.size == (64, 64), f"{char_id} portrait must be 64x64, got {portrait_64x64.size}"

    # 1. Dedicated folder: assets/ingame/characters/<char_id>/{animations,grid,sprite,trainer}.png
    ded_dir = os.path.join(INGAME_CHARS_DIR, char_id)
    os.makedirs(ded_dir, exist_ok=True)
    grid = strip_to_grid(strip_216x26)
    idle_sprite = strip_216x26.crop((18, 0, 36, 26))  # Col 1 = South Idle

    strip_216x26.save(os.path.join(ded_dir, "animations.png"))
    grid.save(os.path.join(ded_dir, "grid.png"))
    idle_sprite.save(os.path.join(ded_dir, "sprite.png"))
    portrait_64x64.save(os.path.join(ded_dir, "trainer.png"))

    # 2. Active sheet path & portrait path
    legacy_full = os.path.join(INGAME_CHARS_DIR, legacy_rel_path)
    os.makedirs(os.path.dirname(legacy_full), exist_ok=True)
    strip_216x26.save(legacy_full)

    port_full = os.path.join(PORTRAITS_DIR, portrait_filename)
    portrait_64x64.save(port_full)
    print(f"[OK] Built {char_id:18s} -> {legacy_rel_path} (216x26) & {portrait_filename} (64x64)")


def make_centered_portrait(im_single_char, scale_factor=None, size=64):
    """Creates a clean 64x64 portrait from a SINGLE isolated character frame."""
    bbox = im_single_char.getbbox()
    trimmed = im_single_char.crop(bbox) if bbox else im_single_char
    tw, th = trimmed.size

    if scale_factor is not None:
        nw = max(1, int(round(tw * scale_factor)))
        nh = max(1, int(round(th * scale_factor)))
    else:
        scale = min((size - 8) / tw, (size - 8) / th)
        nw = max(1, int(round(tw * scale)))
        nh = max(1, int(round(th * scale)))

    resized = trimmed.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - nw) // 2
    oy = (size - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas


def build_player_male():
    """Builds standing Heroic Adventurer in Blue Tunic (Townspeople idx 0)."""
    with zipfile.ZipFile(os.path.join(ASSETS_DIR, "Townspeople.zip")) as z:
        anim = Image.open(io.BytesIO(z.read("Townspeople_Animations.png"))).convert("RGBA")
        trainers = Image.open(io.BytesIO(z.read("Townspeople_Trainers.png"))).convert("RGBA")

    idx = 0  # Row 0, Col 0: Protagonist Heroic Adventurer in Blue Tunic
    col, row = idx % 4, idx // 4
    base_x, base_y = col * 54, row * 104
    grid = anim.crop((base_x, base_y, base_x + 54, base_y + 104))

    south = grid.crop((0, 0, 54, 26))
    west = grid.crop((0, 26, 54, 52))
    east = grid.crop((0, 52, 54, 78))
    north = grid.crop((0, 78, 54, 104))

    strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
    strip.paste(south, (0, 0))
    strip.paste(east, (54, 0))
    strip.paste(west, (108, 0))
    strip.paste(north, (162, 0))

    portrait = trainers.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64))
    save_character_bundle("player_male", strip, portrait, "player/player_male.png", "portrait_player_m.png")


def build_cleric_inquisitor():
    """
    Slices Roleworld Cleric (Purity Inquisitor) from 96x30 strips.
    Each strip has 6 frames of 16x30 (96 / 6 = 16px wide).
    Vertical character bounds are y=4..30 (26px tall), fitting 18x26 at 1:1 native pixel scale!
    """
    prefix = "ROLEWORLD CLERIC FREE/MC/Cleric Walking/ROLEWORLD_SKIN PALE_CLERIC WALK"
    with zipfile.ZipFile(os.path.join(ASSETS_DIR, "ROLEWORLD CLERIC FREE.zip")) as z:
        im_s = Image.open(io.BytesIO(z.read(f"{prefix} FRONT.png"))).convert("RGBA")
        im_n = Image.open(io.BytesIO(z.read(f"{prefix} BACK.png"))).convert("RGBA")
        im_w = Image.open(io.BytesIO(z.read(f"{prefix} LEFT.png"))).convert("RGBA")
        im_e = Image.open(io.BytesIO(z.read(f"{prefix} RIGHT.png"))).convert("RGBA")

    def extract_cleric_frame(sheet, frame_idx):
        # True cell width is 16px (0..16, 16..32, 32..48, 48..64, 64..80, 80..96)
        raw_16x26 = sheet.crop((frame_idx * 16, 4, (frame_idx + 1) * 16, 30))
        cell_18x26 = Image.new("RGBA", (18, 26), (0, 0, 0, 0))
        cell_18x26.paste(raw_16x26, (1, 0), raw_16x26)
        return cell_18x26

    # Frame 0 = left step, Frame 1 = neutral/idle, Frame 3 = right step
    frames_12 = [
        extract_cleric_frame(im_s, 0), extract_cleric_frame(im_s, 1), extract_cleric_frame(im_s, 3),  # South
        extract_cleric_frame(im_e, 0), extract_cleric_frame(im_e, 1), extract_cleric_frame(im_e, 3),  # East
        extract_cleric_frame(im_w, 0), extract_cleric_frame(im_w, 1), extract_cleric_frame(im_w, 3),  # West
        extract_cleric_frame(im_n, 0), extract_cleric_frame(im_n, 1), extract_cleric_frame(im_n, 3),  # North
    ]

    strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
    for i, f in enumerate(frames_12):
        strip.paste(f, (i * 18, 0), f)

    # Single front idle frame (16x26) scaled cleanly by 2x (32x52) for 64x64 portrait
    single_front = im_s.crop((1 * 16, 4, 2 * 16, 30))
    portrait = make_centered_portrait(single_front, scale_factor=2.2)
    save_character_bundle("mob_inquisitor", strip, portrait, "mobs/mob_inquisitor.png", "portrait_mob_inquisitor.png")


def build_dog_and_cat():
    """
    Slices Paws & Whiskers Dog and Cat sheets (512x64).
    True grid is 16 columns x 2 rows of 32x32 cells (NOT 64x64!).
      - Row 0: Idle animations (Cols 0-3 South, Cols 4-7 East, Cols 8-11 North, Cols 12-15 West)
      - Row 1: Walk animations (Cols 0-3 South, Cols 4-7 East, Cols 8-11 North, Cols 12-15 West)
    Each animal fits inside an 18x26 crop window (x=7..25, y=2..28) at 1:1 native pixel scale!
    """
    configs = [
        ("player_dog", "Paws & Whiskers - Isometric Dogs Pack (Free).zip", "GoldenRetriever_spritesheet_free.png", "player/dog.png", "portrait_dog.png"),
        ("player_cat", "Paws & Whiskers - Isometric Cats Pack (Free).zip", "Cat_1_spritesheet_free.png", "player/cat.png", "portrait_cat.png"),
    ]
    for char_id, zip_name, png_name, out_rel, port_name in configs:
        with zipfile.ZipFile(os.path.join(ASSETS_DIR, zip_name)) as z:
            sheet = Image.open(io.BytesIO(z.read(png_name))).convert("RGBA")

        def cell_18x26(row, col):
            # Crop 18x26 window directly from the single 32x32 cell at 1:1 pixel ratio
            x0 = col * 32 + 7
            y0 = row * 32 + 2
            return sheet.crop((x0, y0, x0 + 18, y0 + 26))

        frames_12 = [
            cell_18x26(1, 1), cell_18x26(0, 0), cell_18x26(1, 3),    # South (walk1, idle, walk2)
            cell_18x26(1, 5), cell_18x26(0, 4), cell_18x26(1, 7),    # East
            cell_18x26(1, 13), cell_18x26(0, 12), cell_18x26(1, 15), # West
            cell_18x26(1, 9), cell_18x26(0, 8), cell_18x26(1, 11),   # North
        ]

        strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
        for i, f in enumerate(frames_12):
            strip.paste(f, (i * 18, 0), f)

        # Single 32x32 front idle cell (row 0, col 0) scaled 2.8x for crisp single-animal portrait
        single_32x32 = sheet.crop((0, 0, 32, 32))
        portrait = make_centered_portrait(single_32x32, scale_factor=2.8)
        save_character_bundle(char_id, strip, portrait, out_rel, port_name)


def build_astronaut():
    """
    Slices Astronaut Player.png (256x160):
      - Row 0 (y=18..50): South (Down)
      - Row 1 (y=66..98): East (Right) -> flipped for West (Left)
      - Row 2 (y=114..146): North (Up)
    Uses opposite full-stride walk columns (Col 2 = left stride, Col 0 = idle, Col 6 = right stride)
    with a uniform fixed crop box (x=7..25, y=1..32) so scale never jumps between frames.
    """
    staging = os.path.join(ASSETS_DIR, "staging_astro")
    os.makedirs(staging, exist_ok=True)
    subprocess.run(["tar", "-xf", os.path.join(ASSETS_DIR, "Astronaut Player.rar"), "-C", staging], check=True)
    im = Image.open(os.path.join(staging, "Astronaut Player", "Astronaut Player.png")).convert("RGBA")

    def astro_cell(ry, col, flip_x=False):
        raw = im.crop((col * 32 + 7, ry + 1, col * 32 + 25, ry + 32))  # 18x31 uniform box
        if flip_x:
            raw = raw.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        return raw.resize((18, 26), Image.Resampling.NEAREST)

    frames_12 = [
        astro_cell(18, 2), astro_cell(18, 0), astro_cell(18, 6),                 # South
        astro_cell(66, 2), astro_cell(66, 0), astro_cell(66, 6),                 # East
        astro_cell(66, 2, True), astro_cell(66, 0, True), astro_cell(66, 6, True), # West
        astro_cell(114, 2), astro_cell(114, 0), astro_cell(114, 6),              # North
    ]

    strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
    for i, f in enumerate(frames_12):
        strip.paste(f, (i * 18, 0), f)

    front_idle_32 = im.crop((0, 18, 32, 50))
    portrait = make_centered_portrait(front_idle_32, scale_factor=1.8)
    save_character_bundle("player_astronaut", strip, portrait, "player/astronaut.png", "portrait_astronaut.png")
    shutil.rmtree(staging, ignore_errors=True)


def build_lugia_and_ho_oh():
    """
    Slices Pokemon HGSS 192x32 follower strips (6 frames of 32x32):
      - Frame 0: South (Wings Up), Frame 1: South (Wings Down)
      - Frame 2: West  (Wings Up), Frame 3: West  (Wings Down)
      - East:    Frames 2 & 3 flipped horizontally
      - Frame 4: North (Wings Up), Frame 5: North (Wings Down)
    Uses a uniform 32x32 -> 18x24 scaling box per frame so wings flap smoothly without body shifting.
    """
    birds = [
        ("player_lugia", "lugia_reakain_transparent.png", "player/lugia.png", "portrait_lugia.png"),
        ("player_ho_oh", "ho_oh_reakain_transparent.png", "player/ho_oh.png", "portrait_ho_oh.png"),
    ]
    for char_id, src_file, out_rel, port_name in birds:
        im = Image.open(os.path.join(ASSETS_DIR, src_file)).convert("RGBA")
        raw_frames = [im.crop((i * 32, 0, (i + 1) * 32, 32)) for i in range(6)]

        def fit_bird(frame_32, flip_x=False):
            src = frame_32.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if flip_x else frame_32
            # Uniform 30x30 center crop scaled to 18x22 and centered in 18x26
            cropped = src.crop((1, 1, 31, 31))
            scaled = cropped.resize((18, 22), Image.Resampling.NEAREST)
            cell = Image.new("RGBA", (18, 26), (0, 0, 0, 0))
            cell.paste(scaled, (0, 2), scaled)
            return cell

        frames_12 = [
            fit_bird(raw_frames[1]), fit_bird(raw_frames[0]), fit_bird(raw_frames[1]),                # South
            fit_bird(raw_frames[3], True), fit_bird(raw_frames[2], True), fit_bird(raw_frames[3], True), # East
            fit_bird(raw_frames[3]), fit_bird(raw_frames[2]), fit_bird(raw_frames[3]),                # West
            fit_bird(raw_frames[5]), fit_bird(raw_frames[4]), fit_bird(raw_frames[5]),                # North
        ]

        strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
        for i, f in enumerate(frames_12):
            strip.paste(f, (i * 18, 0), f)

        portrait = make_centered_portrait(raw_frames[0], scale_factor=1.9)
        save_character_bundle(char_id, strip, portrait, out_rel, port_name)


def build_clown_demagogue():
    """
    Slices Clown_Sprite.png (736x32, 23 frames of 32x32) for Sovereign Demagogue final boss.
    Each frame's character sits inside x=7..25, y=1..27 (exact 18x26 native 1:1 pixel window!).
    """
    im = Image.open(os.path.join(ASSETS_DIR, "Clown_Sprite.png")).convert("RGBA")

    def clown_cell(frame_idx, flip_x=False):
        cell = im.crop((frame_idx * 32 + 7, 1, frame_idx * 32 + 25, 27))  # 18x26 native 1:1
        if flip_x:
            cell = cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        return cell

    frames_12 = [
        clown_cell(1), clown_cell(0), clown_cell(3),                # South
        clown_cell(5), clown_cell(4), clown_cell(7),                # East
        clown_cell(5, True), clown_cell(4, True), clown_cell(7, True), # West
        clown_cell(6), clown_cell(2), clown_cell(8),                # North
    ]

    strip = Image.new("RGBA", (216, 26), (0, 0, 0, 0))
    for i, f in enumerate(frames_12):
        strip.paste(f, (i * 18, 0), f)

    portrait = make_centered_portrait(clown_cell(0), scale_factor=2.2)
    save_character_bundle("boss_demagogue", strip, portrait, "bosses/boss_demagogue.png", "portrait_boss_demagogue.png")


def build_peacock_assets():
    """
    Copies Peacock sheets and creates a clean 36x38 single-bird static preview sprite:
      - Peacock-folded-tail-Sheet.png: 144x152 (4 cols x 4 rows of 36x38)
      - Peacock-walk-Sheet.png:        128x96  (4 cols x 4 rows of 32x24)
    """
    folded = Image.open(os.path.join(ASSETS_DIR, "Peacock-folded-tail-Sheet.png")).convert("RGBA")
    walk = Image.open(os.path.join(ASSETS_DIR, "Peacock-walk-Sheet.png")).convert("RGBA")

    folded.save(os.path.join(PEACOCK_DIR, "peacock_folded.png"))
    walk.save(os.path.join(PEACOCK_DIR, "peacock_walk.png"))

    # Single bird cell is 36x38 (col 0, row 0), NOT 48x38!
    single_peacock = folded.crop((0, 0, 36, 38))
    single_peacock.save(os.path.join(PEACOCK_DIR, "sprite.png"))
    print(f"[OK] Built peacock assets -> folded {folded.size}, walk {walk.size}, single sprite {single_peacock.size}")


if __name__ == "__main__":
    build_player_male()
    build_cleric_inquisitor()
    build_dog_and_cat()
    build_astronaut()
    build_lugia_and_ho_oh()
    build_clown_demagogue()
    build_peacock_assets()
    print("All assets built and verified successfully!")

