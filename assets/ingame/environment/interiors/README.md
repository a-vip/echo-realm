# In-Game Interior Asset Directory & Modular Prop Catalog

This directory contains categorized, modular, authentic 32-bit pixel-art interior tiles and props for building interiors (cottages, taverns, libraries, towers, and keeps).

All assets are standardized, pixel-aligned, transparent PNGs ready for placement or replacement.

---

## Directory Structure

```
assets/ingame/environment/interiors/
├── floors/
│   ├── floor_wood_plank.png        # Seamless warm hardwood planks (48x48)
│   ├── floor_oak_parquet.png       # Seamless blond oak parquet (48x48)
│   └── floor_stone_slate.png       # Seamless dark arcane slate tiles (48x48)
├── walls/
│   ├── wall_wood_panel.png         # Wainscoted wood wall with crown & baseboard (48x96)
│   └── wall_stone_slate.png        # Arcane masonry stone wall (48x96)
├── bookshelves/
│   ├── bookshelf_grand.png         # Grand library double bookcase with leather-bound tomes (144x192)
│   ├── bookshelf_wide.png          # Wide double-tier wooden bookcase (96x64)
│   ├── bookshelf_tall.png          # Tall modular study bookcase (48x96)
│   └── bookshelf_medium.png        # Medium library shelf (48x64)
├── tables/
│   ├── desk_scholar.png            # Scholar study desk with drawers (48x32)
│   ├── table_dining.png            # Long wooden tavern / dining table (64x32)
│   └── table_coffee.png            # Low study / living room coffee table (48x24)
├── chairs/
│   ├── chair_armchair.png          # Comfortable cushioned armchair (32x32)
│   └── chair_study.png             # High-backed wooden scholar chair (24x36)
├── fireplaces/
│   ├── fireplace_anim_sheet.png    # 8-Frame animated burning hearth (384x48, 48x48 per frame)
│   └── fireplace_brick.png         # Static brick hearth with mantle (48x48)
├── carpets/
│   ├── rug_ornate_large.png        # Ornate woven crimson area rug with golden fringe (128x64)
│   ├── rug_runner.png              # Hallway runner rug (64x64)
│   └── carpet_sheet.png            # Master sheet of assorted carpets (320x64)
└── decor/
    ├── painting_landscape.png      # Gold-framed mountain landscape painting (24x20)
    ├── painting_portrait.png       # Gold-framed portrait painting (24x20)
    ├── painting_classic.png        # Framed classical art painting (24x24)
    ├── window_curtain.png          # Arched glass window with curtain (48x48)
    ├── potted_plant_fern.png       # Terracotta potted fern (32x48)
    └── potted_plant_flowering.png  # Potted flowering houseplant (32x32)
```

---

## How to Swap or Add New Interior Assets
1. **Drop-in Replacement**: Simply overwrite any file in the relevant subfolder (keeping the name), and the game engine will automatically use the new sprite on the next reload.
2. **Adding New Props**:
   - Save your PNG in the appropriate folder (e.g., `decor/grandfather_clock.png`).
   - Register it in `AssetManager` (`index.html`):
     ```javascript
     assets.registerImage('clock_grandfather', 'assets/ingame/environment/interiors/decor/grandfather_clock.png');
     ```
   - Draw it in `renderInterior()` or `renderGrandArchiveTowerInterior()` using:
     ```javascript
     assets.drawImage(ctx, 'clock_grandfather', x, y, width, height);
     ```

