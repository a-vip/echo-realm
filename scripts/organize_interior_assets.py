import os
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_HOME = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home")
SRC_INTERIORS = os.path.join(ROOT_DIR, "assets", "Interiors_free_48x48.png")
SRC_ROOM = os.path.join(ROOT_DIR, "assets", "Room_Builder_free_48x48.png")
SRC_PROPS = os.path.join(ROOT_DIR, "assets", "Environment", "Structures", "Buildings", "Interior", "Interior_Props_01.png")
SRC_WALLS = os.path.join(ROOT_DIR, "assets", "Environment", "Structures", "Buildings", "Interior", "Interior_Walls_01.png")

DEST_BASE = os.path.join(ROOT_DIR, "assets", "ingame", "environment", "interiors")

def organize_interiors():
    os.makedirs(DEST_BASE, exist_ok=True)
    dirs = ["floors", "walls", "bookshelves", "tables", "chairs", "fireplaces", "carpets", "decor"]
    for d in dirs:
        os.makedirs(os.path.join(DEST_BASE, d), exist_ok=True)

    im_int = Image.open(SRC_INTERIORS).convert("RGBA")
    im_room = Image.open(SRC_ROOM).convert("RGBA")
    im_props = Image.open(SRC_PROPS).convert("RGBA")
    im_chimney = Image.open(os.path.join(SRC_HOME, "Chimney-Sheet.png")).convert("RGBA")
    im_win = Image.open(os.path.join(SRC_HOME, "Windows-Sheet.png")).convert("RGBA")

    # 1. FLOORS (48x48 clean solid tiles)
    im_room.crop((0, 5 * 48, 48, 6 * 48)).save(os.path.join(DEST_BASE, "floors", "floor_wood_plank.png"))
    im_room.crop((0, 7 * 48, 48, 8 * 48)).save(os.path.join(DEST_BASE, "floors", "floor_oak_parquet.png"))
    im_room.crop((0, 9 * 48, 48, 10 * 48)).save(os.path.join(DEST_BASE, "floors", "floor_stone_slate.png"))

    # 2. WALLS (48x96 completely solid wood paneling & stone masonry)
    im_room.crop((3 * 48, 1 * 48, 4 * 48, 3 * 48)).save(os.path.join(DEST_BASE, "walls", "wall_wood_panel.png"))
    im_room.crop((9 * 48, 1 * 48, 10 * 48, 3 * 48)).save(os.path.join(DEST_BASE, "walls", "wall_stone_slate.png"))

    # 3. BOOKSHELVES (Modern and classic high-res bookshelves)
    im_int.crop((6 * 48, 50 * 48, 8 * 48, 52 * 48)).save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_grand.png"))  # 96x96
    im_int.crop((8 * 48, 50 * 48, 10 * 48, 52 * 48)).save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_wide.png"))   # 96x96
    im_int.crop((10 * 48, 50 * 48, 11 * 48, 52 * 48)).save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_tall.png"))  # 48x96
    im_int.crop((10 * 48, 51 * 48, 11 * 48, 52 * 48)).save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_medium.png"))# 48x48

    # 4. TABLES & DESKS (96x48 dining table & 64x48 scholar desk)
    im_int.crop((6 * 48, 11 * 48, 8 * 48, 12 * 48)).save(os.path.join(DEST_BASE, "tables", "table_dining.png"))
    im_props.crop((448, 192, 512, 240)).save(os.path.join(DEST_BASE, "tables", "desk_scholar.png"))
    im_int.crop((4 * 48, 18 * 48, 6 * 48, 19 * 48 + 24)).save(os.path.join(DEST_BASE, "tables", "table_coffee.png"))

    # 5. CHAIRS & SEATING (48x48 armchairs & dining chairs)
    im_int.crop((6 * 48, 16 * 48, 7 * 48, 17 * 48)).save(os.path.join(DEST_BASE, "chairs", "chair_armchair.png"))
    im_int.crop((11 * 48, 10 * 48, 12 * 48, 11 * 48)).save(os.path.join(DEST_BASE, "chairs", "chair_study.png"))

    # 6. FIREPLACES (Animated 8-frame chimney sheet & static brick fireplace)
    im_chimney.save(os.path.join(DEST_BASE, "fireplaces", "fireplace_anim_sheet.png"))
    im_chimney.crop((0, 0, 48, 48)).save(os.path.join(DEST_BASE, "fireplaces", "fireplace_brick.png"))

    # 7. CARPETS
    im_int.crop((12 * 48, 18 * 48, 16 * 48, 22 * 48)).save(os.path.join(DEST_BASE, "carpets", "rug_ornate_large.png"))

    # 8. DECOR
    im_int.crop((2 * 48, 56 * 48, 3 * 48, 57 * 48)).save(os.path.join(DEST_BASE, "decor", "potted_plant_fern.png"))
    im_int.crop((3 * 48, 56 * 48, 4 * 48, 57 * 48)).save(os.path.join(DEST_BASE, "decor", "potted_plant_flowering.png"))
    im_int.crop((8 * 48, 56 * 48, 9 * 48, 57 * 48)).save(os.path.join(DEST_BASE, "decor", "painting_landscape.png"))
    im_int.crop((9 * 48, 56 * 48, 10 * 48, 57 * 48)).save(os.path.join(DEST_BASE, "decor", "painting_portrait.png"))
    im_int.crop((14 * 48, 56 * 48, 15 * 48, 57 * 48)).save(os.path.join(DEST_BASE, "decor", "painting_classic.png"))
    im_win.crop((0, 0, 64, 64)).save(os.path.join(DEST_BASE, "decor", "window_curtain.png"))

    print("Successfully organized high-res interior assets into modular directories.")

if __name__ == "__main__":
    organize_interiors()
