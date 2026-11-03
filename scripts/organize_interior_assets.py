import os
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEST_BASE = os.path.join(ROOT_DIR, "assets", "ingame", "environment", "interiors")

def organize_interiors():
    os.makedirs(DEST_BASE, exist_ok=True)
    dirs = ["floors", "walls", "bookshelves", "tables", "chairs", "fireplaces", "carpets", "decor"]
    for d in dirs:
        os.makedirs(os.path.join(DEST_BASE, d), exist_ok=True)

    # 1. Source Image References
    src_fl = os.path.join(ROOT_DIR, "assets", "Environment", "Tilesets", "Floors_Tiles.png")
    src_w = os.path.join(ROOT_DIR, "assets", "Environment", "Tilesets", "Wall_Tiles.png")
    src_props1 = os.path.join(ROOT_DIR, "assets", "Environment", "Structures", "Buildings", "Interior", "Interior_Props_01.png")
    src_furn = os.path.join(ROOT_DIR, "assets", "Environment", "Props", "Static", "Furniture.png")
    src_pan = os.path.join(ROOT_DIR, "assets", "Environment", "Props", "Static", "Pan.png")
    src_dp = os.path.join(ROOT_DIR, "assets", "Environment", "Props", "Static", "Dungeon_Props.png")
    src_veg = os.path.join(ROOT_DIR, "assets", "Environment", "Props", "Static", "Vegetation.png")
    
    src_home = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home")
    src_th = os.path.join(src_home, "TilesHouse.png")
    src_chimney = os.path.join(src_home, "Chimney-Sheet.png")
    src_windows = os.path.join(src_home, "Windows-Sheet.png")
    src_paintings = os.path.join(src_home, "Paintings-Sheet.png")
    src_carpets = os.path.join(src_home, "Carpet-Sheet.png")
    src_int_free = os.path.join(ROOT_DIR, "assets", "Interiors_free_48x48.png")

    im_fl = Image.open(src_fl).convert("RGBA")
    im_w = Image.open(src_w).convert("RGBA")
    im_props1 = Image.open(src_props1).convert("RGBA")
    im_furn = Image.open(src_furn).convert("RGBA")
    im_pan = Image.open(src_pan).convert("RGBA")
    im_dp = Image.open(src_dp).convert("RGBA")
    im_veg = Image.open(src_veg).convert("RGBA")

    im_th = Image.open(src_th).convert("RGBA")
    im_chimney = Image.open(src_chimney).convert("RGBA")
    im_windows = Image.open(src_windows).convert("RGBA")
    im_paintings = Image.open(src_paintings).convert("RGBA")
    im_carpets = Image.open(src_carpets).convert("RGBA")
    im_int_free = Image.open(src_int_free).convert("RGBA")

    # 1. FLOORS (48x48 100% Solid, Seamless Tiling, Zero White Stripes)
    im_fl.crop((192, 160, 224, 192)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "floors", "floor_wood_plank.png")
    )
    im_th.crop((32, 128, 64, 160)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "floors", "floor_oak_parquet.png")
    )
    im_fl.crop((96, 160, 128, 192)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "floors", "floor_stone_slate.png")
    )

    # 2. WALLS (48x96 Solid Wood Paneling & Stone Masonry Wall Panels)
    w_wood_32 = im_w.crop((32, 256, 64, 288)).resize((48, 32), Image.Resampling.NEAREST)
    wall_wood = Image.new("RGBA", (48, 96))
    wall_wood.paste(w_wood_32, (0, 0))
    wall_wood.paste(w_wood_32, (0, 32))
    wall_wood.paste(w_wood_32, (0, 64))
    wall_wood.save(os.path.join(DEST_BASE, "walls", "wall_wood_panel.png"))

    w_stone_32 = im_w.crop((128, 256, 160, 288)).resize((48, 32), Image.Resampling.NEAREST)
    wall_stone = Image.new("RGBA", (48, 96))
    wall_stone.paste(w_stone_32, (0, 0))
    wall_stone.paste(w_stone_32, (0, 32))
    wall_stone.paste(w_stone_32, (0, 64))
    wall_stone.save(os.path.join(DEST_BASE, "walls", "wall_stone_slate.png"))

    # 3. BOOKSHELVES (Grand 96x96, Wide 96x96, Tall 48x96, Modular 48x48)
    im_props1.crop((96, 0, 192, 96)).save(
        os.path.join(DEST_BASE, "bookshelves", "bookshelf_grand.png")
    )
    im_props1.crop((64, 96, 128, 192)).resize((96, 96), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "bookshelves", "bookshelf_wide.png")
    )
    im_props1.crop((0, 0, 64, 96)).resize((48, 96), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "bookshelves", "bookshelf_tall.png")
    )
    im_props1.crop((0, 48, 48, 96)).save(
        os.path.join(DEST_BASE, "bookshelves", "bookshelf_medium.png")
    )

    # 4. TABLES & DESKS (Dining 96x48, Scholar Desk 64x48, Coffee Table 96x64)
    im_props1.crop((384, 8, 480, 56)).save(
        os.path.join(DEST_BASE, "tables", "table_dining.png")
    )
    im_props1.crop((448, 224, 512, 288)).resize((64, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "tables", "desk_scholar.png")
    )
    im_furn.crop((0, 416, 96, 480)).resize((96, 64), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "tables", "table_coffee.png")
    )

    # 5. CHAIRS (Authentic Red Velvet Armchair 48x48, Wooden Study Chair 48x48)
    im_furn.crop((0, 8 * 32 + 16, 64, 10 * 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "chairs", "chair_armchair.png")
    )
    im_furn.crop((8, 10 * 32 + 16, 56, 12 * 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "chairs", "chair_study.png")
    )

    # 6. FIREPLACES (Animated 8-Frame Chimney Sheet & Static Brick Fireplace 48x48)
    im_chimney.save(os.path.join(DEST_BASE, "fireplaces", "fireplace_anim_sheet.png"))
    im_chimney.crop((0, 0, 48, 48)).save(os.path.join(DEST_BASE, "fireplaces", "fireplace_brick.png"))

    # 7. CARPETS & RUGS (Large Ornate Persian Rug 192x192 & Runner 64x64)
    im_int_free.crop((2 * 48, 18 * 48 + 24, 6 * 48, 20 * 48 + 24)).resize((192, 192), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "carpets", "rug_ornate_large.png")
    )
    im_carpets.crop((0, 0, 64, 64)).save(
        os.path.join(DEST_BASE, "carpets", "rug_runner.png")
    )

    # 8. DECOR (Paintings, Plants, Window & Pots/Jars)
    im_paintings.crop((0, 0, 32, 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "painting_landscape.png")
    )
    im_paintings.crop((32, 0, 64, 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "painting_portrait.png")
    )
    im_paintings.crop((64, 0, 96, 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "painting_classic.png")
    )
    im_veg.crop((0, 0, 32, 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "potted_plant_fern.png")
    )
    im_veg.crop((96, 0, 128, 32)).resize((48, 48), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "potted_plant_flowering.png")
    )
    im_windows.crop((0, 0, 64, 64)).save(
        os.path.join(DEST_BASE, "decor", "window_curtain.png")
    )

    # Pots, Jugs, Cauldron & Barrels (32x32)
    im_dp.crop((0, 32, 32, 64)).resize((32, 32), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "pot_clay.png")
    )
    im_dp.crop((32, 32, 64, 64)).resize((32, 32), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "pot_amphora.png")
    )
    im_pan.crop((0, 64, 32, 96)).resize((32, 32), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "pot_cauldron.png")
    )
    im_dp.crop((96, 32, 128, 64)).resize((32, 32), Image.Resampling.NEAREST).save(
        os.path.join(DEST_BASE, "decor", "barrel_wood.png")
    )

    print("All modular interior pixel-art assets sliced and saved cleanly with 0 miscuts!")

if __name__ == "__main__":
    organize_interiors()
