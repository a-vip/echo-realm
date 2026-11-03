import os
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_HOME = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home")
SRC_INTERIORS = os.path.join(ROOT_DIR, "assets", "Interiors_free_48x48.png")
SRC_ROOM = os.path.join(ROOT_DIR, "assets", "Room_Builder_free_48x48.png")

DEST_BASE = os.path.join(ROOT_DIR, "assets", "ingame", "environment", "interiors")

def trim_bbox(im):
    bb = im.getbbox()
    return im.crop(bb) if bb else im

def organize_interiors():
    os.makedirs(DEST_BASE, exist_ok=True)
    dirs = ["floors", "walls", "bookshelves", "tables", "chairs", "fireplaces", "carpets", "decor"]
    for d in dirs:
        os.makedirs(os.path.join(DEST_BASE, d), exist_ok=True)

    im_interiors = Image.open(SRC_INTERIORS).convert("RGBA")
    im_room = Image.open(SRC_ROOM).convert("RGBA")

    im_chimney = Image.open(os.path.join(SRC_HOME, "Chimney-Sheet.png")).convert("RGBA")
    im_carpet = Image.open(os.path.join(SRC_HOME, "Carpet-Sheet.png")).convert("RGBA")
    im_cupboard = Image.open(os.path.join(SRC_HOME, "Cupboard-Sheet.png")).convert("RGBA")
    im_living = Image.open(os.path.join(SRC_HOME, "LivingRoom1-Sheet.png")).convert("RGBA")
    im_paintings = Image.open(os.path.join(SRC_HOME, "Paintings-Sheet.png")).convert("RGBA")
    im_windows = Image.open(os.path.join(SRC_HOME, "Windows-Sheet.png")).convert("RGBA")
    im_flowers = Image.open(os.path.join(SRC_HOME, "Flowers-Sheet.png")).convert("RGBA")
    im_tiles = Image.open(os.path.join(SRC_HOME, "TilesHouse.png")).convert("RGBA")

    # 1. FLOORS
    # A) Warm hardwood parquet plank tile (48x48 from Room_Builder row 5)
    floor_wood = im_room.crop((0, 5 * 48, 48, 6 * 48))
    floor_wood.save(os.path.join(DEST_BASE, "floors", "floor_wood_plank.png"))

    # B) Blond oak parquet tile (48x48 from Room_Builder row 7)
    floor_oak = im_room.crop((0, 7 * 48, 48, 8 * 48))
    floor_oak.save(os.path.join(DEST_BASE, "floors", "floor_oak_parquet.png"))

    # C) Slate stone floor tile for Archive (48x48 from Room_Builder row 9)
    floor_stone = im_room.crop((0, 9 * 48, 48, 10 * 48))
    floor_stone.save(os.path.join(DEST_BASE, "floors", "floor_stone_slate.png"))

    # 2. WALLS
    # A) Rich wainscoted wood wall section (48x96 from Room_Builder col 0..48, row 0..2)
    wall_wood = im_room.crop((0, 0, 48, 96))
    wall_wood.save(os.path.join(DEST_BASE, "walls", "wall_wood_panel.png"))

    # B) Stone archive wall (from TilesHouse x=32..64, y=0..96)
    wall_stone = im_room.crop((96, 0, 144, 96))
    wall_stone.save(os.path.join(DEST_BASE, "walls", "wall_stone_slate.png"))

    # 3. BOOKSHELVES
    # A) Grand Library Bookcase (144x192 from Interiors_free_48x48 x=528..672, y=2496..2688)
    bookshelf_grand = trim_bbox(im_interiors.crop((528, 2496, 672, 2688)))
    bookshelf_grand.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_grand.png"))

    # B) Tall Modular Bookcase (from Cupboard-Sheet x=192..240, y=0..96)
    bookshelf_tall = trim_bbox(im_cupboard.crop((192, 0, 240, 96)))
    bookshelf_tall.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_tall.png"))

    # C) Medium Bookcase (from Cupboard-Sheet x=240..288, y=0..96)
    bookshelf_medium = trim_bbox(im_cupboard.crop((240, 0, 288, 96)))
    bookshelf_medium.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_medium.png"))

    # D) Wide Double Bookcase (96x96 from Cupboard-Sheet x=192..288, y=0..96)
    bookshelf_wide = trim_bbox(im_cupboard.crop((192, 0, 288, 96)))
    bookshelf_wide.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_wide.png"))

    # 4. TABLES & DESKS
    # A) Scholar Study Desk (from LivingRoom1 x=0, y=0, 96x96)
    desk_scholar = trim_bbox(im_living.crop((0, 0, 96, 96)))
    desk_scholar.save(os.path.join(DEST_BASE, "tables", "desk_scholar.png"))

    # B) Dining / Meeting Table (from LivingRoom1 x=96, y=0, 96x96)
    table_dining = trim_bbox(im_living.crop((96, 0, 192, 96)))
    table_dining.save(os.path.join(DEST_BASE, "tables", "table_dining.png"))

    # C) Coffee Table (from LivingRoom1 x=0, y=96, 96x96)
    table_coffee = trim_bbox(im_living.crop((0, 96, 96, 192)))
    table_coffee.save(os.path.join(DEST_BASE, "tables", "table_coffee.png"))

    # 5. CHAIRS
    # A) Study / Scholar Chair (from LivingRoom1 x=192, y=0, 96x96)
    chair_study = trim_bbox(im_living.crop((192, 0, 288, 96)))
    chair_study.save(os.path.join(DEST_BASE, "chairs", "chair_study.png"))

    # B) Armchair (from LivingRoom1 x=288, y=0, 96x96)
    chair_arm = trim_bbox(im_living.crop((288, 0, 384, 96)))
    chair_arm.save(os.path.join(DEST_BASE, "chairs", "chair_armchair.png"))

    # 6. FIREPLACES
    # A) Animated 8-frame Chimney Sheet (384x48)
    im_chimney.save(os.path.join(DEST_BASE, "fireplaces", "fireplace_anim_sheet.png"))
    # B) Static First Frame (48x48)
    frame_chimney = trim_bbox(im_chimney.crop((0, 0, 48, 48)))
    frame_chimney.save(os.path.join(DEST_BASE, "fireplaces", "fireplace_brick.png"))

    # 7. CARPETS
    # A) Full Carpet Sheet
    im_carpet.save(os.path.join(DEST_BASE, "carpets", "carpet_sheet.png"))
    # B) Ornate Center Rug (from Carpet-Sheet col 2..4: x=128..256, y=0..64)
    rug_ornate = trim_bbox(im_carpet.crop((128, 0, 256, 64)))
    rug_ornate.save(os.path.join(DEST_BASE, "carpets", "rug_ornate_large.png"))
    # C) Runner Rug (from Carpet-Sheet col 0: x=0..64, y=0..64)
    rug_runner = trim_bbox(im_carpet.crop((0, 0, 64, 64)))
    rug_runner.save(os.path.join(DEST_BASE, "carpets", "rug_runner.png"))

    # 8. DECOR
    # A) Paintings
    painting_1 = trim_bbox(im_paintings.crop((0, 0, 32, 32)))
    painting_1.save(os.path.join(DEST_BASE, "decor", "painting_landscape.png"))
    painting_2 = trim_bbox(im_paintings.crop((32, 0, 64, 32)))
    painting_2.save(os.path.join(DEST_BASE, "decor", "painting_portrait.png"))
    painting_3 = trim_bbox(im_paintings.crop((96, 0, 128, 32)))
    painting_3.save(os.path.join(DEST_BASE, "decor", "painting_classic.png"))

    # B) Windows with Curtains
    window_1 = trim_bbox(im_windows.crop((0, 0, 64, 64)))
    window_1.save(os.path.join(DEST_BASE, "decor", "window_curtain.png"))

    # C) Potted Plants / Flowers
    plant_1 = trim_bbox(im_flowers.crop((0, 0, 48, 48)))
    plant_1.save(os.path.join(DEST_BASE, "decor", "potted_plant_fern.png"))
    plant_2 = trim_bbox(im_flowers.crop((48, 0, 96, 48)))
    plant_2.save(os.path.join(DEST_BASE, "decor", "potted_plant_flowering.png"))

    print("[OK] Interior assets organized into dedicated folders!")

organize_interiors()
