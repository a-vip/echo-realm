import os
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEST_BASE = os.path.join(ROOT_DIR, "assets", "ingame", "environment", "interiors")

def process_assets():
    os.makedirs(os.path.join(DEST_BASE, "bookshelves"), exist_ok=True)
    os.makedirs(os.path.join(DEST_BASE, "tables"), exist_ok=True)
    os.makedirs(os.path.join(DEST_BASE, "walls"), exist_ok=True)
    os.makedirs(os.path.join(DEST_BASE, "floors"), exist_ok=True)
    os.makedirs(os.path.join(DEST_BASE, "cupboards"), exist_ok=True)

    # 1. CROP ALL 9 ITEMS FROM Cupboard-Sheet.png
    src_cupboards = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home", "Cupboard-Sheet.png")
    im_cup = Image.open(src_cupboards).convert("RGBA")

    # The 9 distinct items in Cupboard-Sheet:
    # 1. Small wall cabinet: (21, 18, 43, 48) - 22x30
    # 2. Sideboard double cupboard: (78, 18, 115, 48) - 37x30
    # 3. Glass display cabinet: (142, 18, 177, 48) - 35x30
    # 4. Grand bookcase/hutch: (204, 16, 244, 68) - 40x52
    # 5. Tall wardrobe cabinet: (270, 20, 306, 63) - 36x43
    # 6. Medium bookcase: (334, 29, 370, 63) - 36x34
    # 7. Narrow side cabinet: (406, 16, 426, 48) - 20x32
    # 8. Tall single bookcase with books: (470, 7, 490, 48) - 20x41
    # 9. Tall single closed cupboard: (534, 7, 554, 48) - 20x41

    def pad_to_size(cropped_img, target_w, target_h, anchor='bottom_center'):
        cw, ch = cropped_img.size
        # Scale nearest neighbor if needed to fit nicely
        scale = min(target_w / cw, target_h / ch)
        # For pixel art, prefer integer scaling if possible or upscale cleanly
        if scale >= 1.8:
            int_scale = int(scale)
            scaled = cropped_img.resize((cw * int_scale, ch * int_scale), Image.Resampling.NEAREST)
        elif scale >= 1.0:
            # Scale proportionally up to target
            target_scaled_w = int(cw * scale)
            target_scaled_h = int(ch * scale)
            scaled = cropped_img.resize((target_scaled_w, target_scaled_h), Image.Resampling.NEAREST)
        else:
            scaled = cropped_img
        
        sw, sh = scaled.size
        new_im = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
        if anchor == 'bottom_center':
            ox = (target_w - sw) // 2
            oy = target_h - sh
        else: # center
            ox = (target_w - sw) // 2
            oy = (target_h - sh) // 2
        new_im.paste(scaled, (ox, oy), scaled)
        return new_im

    # Crop definitions
    crops = {
        'cupboard_small': (im_cup.crop((21, 18, 43, 48)), 32, 32),
        'cupboard_double': (im_cup.crop((78, 18, 115, 48)), 48, 48),
        'cupboard_glass': (im_cup.crop((142, 18, 177, 48)), 48, 48),
        'bookcase_grand': (im_cup.crop((204, 16, 244, 68)), 96, 96),
        'wardrobe_tall': (im_cup.crop((270, 20, 306, 63)), 48, 64),
        'bookcase_medium': (im_cup.crop((334, 29, 370, 63)), 48, 48),
        'cupboard_narrow': (im_cup.crop((406, 16, 426, 48)), 32, 48),
        'bookcase_single': (im_cup.crop((470, 7, 490, 48)), 48, 96),
        'cupboard_tall': (im_cup.crop((534, 7, 554, 48)), 48, 96),
    }

    # Save to bookshelves directory and cupboards directory
    for name, (cr, tw, th) in crops.items():
        padded = pad_to_size(cr, tw, th)
        padded.save(os.path.join(DEST_BASE, "bookshelves", f"{name}.png"))
        padded.save(os.path.join(DEST_BASE, "cupboards", f"{name}.png"))
        print(f"Saved {name}.png ({tw}x{th})")

    # Replace legacy broken bookshelf files:
    # 1. bookshelf_grand.png (was miscut oven!) -> Replace with 96x96 grand bookcase
    crops['bookcase_grand'][0]
    grand_bookshelf = pad_to_size(im_cup.crop((204, 16, 244, 68)), 96, 96)
    grand_bookshelf.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_grand.png"))

    # 2. bookshelf_wide.png -> 96x96 composite double bookshelf (two wide shelves side by side)
    wide_bs = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    single_shelf = pad_to_size(im_cup.crop((204, 16, 244, 68)), 48, 96)
    wide_bs.paste(single_shelf, (0, 0), single_shelf)
    wide_bs.paste(single_shelf, (48, 0), single_shelf)
    wide_bs.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_wide.png"))

    # 3. bookshelf_tall.png -> 48x96 tall modular shelf with books (Item 8)
    tall_bs = pad_to_size(im_cup.crop((470, 7, 490, 48)), 48, 96)
    tall_bs.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_tall.png"))

    # 4. bookshelf_medium.png -> 48x48 medium shelf (Item 6)
    med_bs = pad_to_size(im_cup.crop((334, 29, 370, 63)), 48, 48)
    med_bs.save(os.path.join(DEST_BASE, "bookshelves", "bookshelf_medium.png"))

    # 2. AUTHENTIC SCHOLAR DESK (Replace miscut pots and pans in desk_scholar.png!)
    src_lr1 = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home", "LivingRoom1-Sheet.png")
    im_lr1 = Image.open(src_lr1).convert("RGBA")
    # Crop authentic 47x25 wooden desk
    raw_desk = im_lr1.crop((24, 22, 71, 47))
    # Pad and scale to 64x48
    scholar_desk = pad_to_size(raw_desk, 64, 48)
    # Paint an open parchment manuscript and blue ink quill on the desktop
    desk_pix = scholar_desk.load()
    # Desktop surface is roughly y: 12..28, x: 18..46
    # Let's paint an open white/gold manuscript book in the center
    book_x = 24
    book_y = 16
    for by in range(book_y, book_y + 10):
        for bx in range(book_x, book_x + 16):
            # book paper
            desk_pix[bx, by] = (254, 243, 199, 255) # parchment cream
            if bx == book_x + 8:
                desk_pix[bx, by] = (180, 83, 9, 255) # spine gutter
            elif (by == book_y or by == book_y + 9 or bx == book_x or bx == book_x + 15):
                desk_pix[bx, by] = (217, 119, 6, 255) # leather binding border
            elif by in (book_y + 3, book_y + 6) and bx not in (book_x + 7, book_x + 8, book_x + 9):
                desk_pix[bx, by] = (100, 116, 139, 255) # written text line
    # Quill pen leaning next to the manuscript
    quill_x = book_x + 18
    quill_y = book_y + 1
    for q in range(6):
        desk_pix[quill_x + q, quill_y + q] = (56, 189, 248, 255) # azure blue feather quill
    # Ink pot
    desk_pix[quill_x + 6, quill_y + 7] = (30, 41, 59, 255)
    desk_pix[quill_x + 7, quill_y + 7] = (30, 41, 59, 255)
    desk_pix[quill_x + 6, quill_y + 8] = (30, 41, 59, 255)
    desk_pix[quill_x + 7, quill_y + 8] = (30, 41, 59, 255)

    scholar_desk.save(os.path.join(DEST_BASE, "tables", "desk_scholar.png"))
    print("Saved clean scholar writing desk to tables/desk_scholar.png (64x48)")

    # 3. FIX WOOD WALL PANEL & STONE SLATE WALL
    src_th = os.path.join(ROOT_DIR, "assets", "extracted_interior", "Interior", "Home", "TilesHouse.png")
    im_th = Image.open(src_th).convert("RGBA")
    
    # Authentic clean wood wall panel from TilesHouse (32, 32, 64, 64)
    wood_wall_raw = im_th.crop((32, 32, 64, 64))
    wood_wall_32 = wood_wall_raw.resize((48, 32), Image.Resampling.NEAREST)
    wood_wall_full = Image.new("RGBA", (48, 96), (0, 0, 0, 255))
    wood_wall_full.paste(wood_wall_32, (0, 0))
    wood_wall_full.paste(wood_wall_32, (0, 32))
    wood_wall_full.paste(wood_wall_32, (0, 64))
    # Add top molding header
    for x in range(48):
        wood_wall_full.putpixel((x, 0), (68, 41, 10, 255))
        wood_wall_full.putpixel((x, 1), (93, 58, 15, 255))
        wood_wall_full.putpixel((x, 2), (176, 110, 27, 255))
    wood_wall_full.save(os.path.join(DEST_BASE, "walls", "wall_wood_panel.png"))
    print("Saved clean wood panel wall to walls/wall_wood_panel.png (48x96)")

    # Authentic stone wall from TilesHouse (128, 64, 160, 96)
    stone_wall_raw = im_th.crop((128, 64, 160, 96))
    stone_wall_32 = stone_wall_raw.resize((48, 32), Image.Resampling.NEAREST)
    stone_wall_full = Image.new("RGBA", (48, 96), (0, 0, 0, 255))
    stone_wall_full.paste(stone_wall_32, (0, 0))
    stone_wall_full.paste(stone_wall_32, (0, 32))
    stone_wall_full.paste(stone_wall_32, (0, 64))
    for x in range(48):
        stone_wall_full.putpixel((x, 0), (15, 23, 42, 255))
        stone_wall_full.putpixel((x, 1), (30, 41, 59, 255))
        stone_wall_full.putpixel((x, 2), (71, 85, 105, 255))
    stone_wall_full.save(os.path.join(DEST_BASE, "walls", "wall_stone_slate.png"))
    print("Saved clean stone slate wall to walls/wall_stone_slate.png (48x96)")

    # 4. FIX SEAMLESS FLOORS (Zero white bars!)
    # Wood parquet floor from TilesHouse (32, 128, 64, 160)
    parquet_raw = im_th.crop((32, 128, 64, 160))
    parquet_48 = parquet_raw.resize((48, 48), Image.Resampling.NEAREST)
    parquet_48.save(os.path.join(DEST_BASE, "floors", "floor_oak_parquet.png"))

    # Seamless plank floor from TilesHouse (96, 128, 128, 160)
    plank_raw = im_th.crop((96, 128, 128, 160))
    plank_48 = plank_raw.resize((48, 48), Image.Resampling.NEAREST)
    plank_48.save(os.path.join(DEST_BASE, "floors", "floor_wood_plank.png"))

    # Seamless stone floor from TilesHouse (320, 128, 352, 160)
    stone_fl_raw = im_th.crop((320, 128, 352, 160))
    stone_fl_48 = stone_fl_raw.resize((48, 48), Image.Resampling.NEAREST)
    stone_fl_48.save(os.path.join(DEST_BASE, "floors", "floor_stone_slate.png"))
    print("Saved seamless floors to floors/ (floor_wood_plank, floor_oak_parquet, floor_stone_slate)")

if __name__ == "__main__":
    process_assets()

