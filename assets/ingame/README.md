# Active In-Game Assets Directory (`assets/ingame/`)

This directory contains all the **currently active, applied in-game assets** for *Echo Realm: Chronicles of the Archivist*.

The assets are neatly sorted into clear subdirectories so anyone can immediately see what is in active use, inspect models, and easily try out or swap different character designs, creatures, tilesets, and props.

---

## Directory Structure

```
assets/
└── ingame/                             <-- ALL ACTIVE IN-GAME MODELS, TILES & SPRITES
    ├── characters/
    │   ├── player_male/                # Adventurer (Male) - (Red cap, blue jacket, explorer pack)
    │   │   ├── sprite.png              # 18x26 default idle South frame
    │   │   ├── grid.png                # 54x104 pure 3x4 sprite grid (South, West, East, North)
    │   │   ├── animations.png          # 216x26 assembled 12-frame horizontal strip
    │   │   └── trainer.png             # 64x64 detailed trainer dialogue portrait
    │   ├── player_female/              # Adventurer (Female)
    │   │   ├── sprite.png, grid.png, animations.png, trainer.png
    │   ├── mob_manosphere/             # Manosphere Bodybuilder Zealot (Muscular double-biceps flex)
    │   │   ├── sprite.png, grid.png, animations.png, trainer.png
    │   ├── mob_velvet/                 # Velvet Swimmer Zealot
    │   │   ├── sprite.png, grid.png, animations.png, trainer.png
    │   ├── mob_inquisitor/, mob_border/, mob_blackshirt/, mob_masked/
    │   ├── mentor_avi/, mentor_maya/, mentor_lyra/, mentor_tariq/, mentor_elena/, mentor_rowan/, mentor_kaelen/, mentor_zephyr/
    │   ├── boss_valkor/, boss_demagogue/
    │   ├── citizen_villager_m/, citizen_villager_f/, citizen_scholar/, citizen_miner/, citizen_noble/, citizen_waterfolk/
    │   └── player/, mentors/, mobs/, bosses/, citizens/, portraits/  # Backward-compatible mirrors
    │
    ├── creatures/                      # Interactive fauna & companions
    │   └── peacock/                    # Regal Peacock (Strutting fanned tail & preening folded tail)
    │       ├── peacock_folded.png      # 144x152 (3 cols x 4 rows, 48x38 px per frame - idle/preening)
    │       ├── peacock_walk.png        # 128x96 (4 cols x 4 rows, 32x24 px per frame - strutting fanned plumage)
    │       └── sprite.png              # 48x38 default idle frame
    │
    ├── environment/                    # Modular world & interior architecture
    │   ├── tilesets/
    │   │   ├── floors_tiles.png        # Authentic wood, parquet, flagstone & moss flooring
    │   │   ├── wall_tiles.png          # Brick, stone masonry & timber wall tiles
    │   │   └── dungeon_tiles.png       # Obsidian & dark slate stone tiles for Keep and Catacombs
    │   ├── props/
    │   │   ├── furniture.png           # Carved wardrobes, armoires, upholstered armchairs & beds
    │   │   ├── interior_props.png      # Tapestries, wall mirrors, reading desks, tableware & rugs
    │   │   ├── interior_walls.png      # Wainscoting panels, arched crown moldings & wall trim
    │   │   ├── dungeon_props.png       # Iron wall braziers, chains, gilded treasure urns & grates
    │   │   ├── esoteric.png            # Runic pedestals, monitoring crystals & arcane globes
    │   │   ├── workbench.png           # 64x64 artisan woodworking & crafting workbench
    │   │   ├── alchemy_station.png     # 64x64 alchemical research apparatus & potion table
    │   │   ├── bonfire.png             # Animated campsite bonfire & flickering embers
    │   │   └── furnace.png             # Smelting furnace with glowing molten coal
    │   └── interiors/
    │       ├── interiors_sheet.png     # 48x48 grand furniture and room fittings
    │       └── room_builder.png        # Architectural room framing & partition assets
    │
    ├── buildings/                      # Valid front-facing cottage architecture (7 active accessible models)
    │   ├── armory_bastion.png
    │   ├── cottage_blue_medium.png
    │   ├── cottage_brick_large.png
    │   ├── cottage_red_large.png
    │   ├── cottage_red_medium.png
    │   ├── cottage_stone_small.png
    │   └── village_inn_long.png
    └── doors/                          # Entrance door variations & portals
        └── doors_sheet.png
```

---

## How to Swap Any Character Design, Creature, or Prop

### Swapping a Character Model
1. Place your new 12-frame character sprite strip (216x26) or 3x4 grid (54x104) into `assets/ingame/characters/<character_id>/`.
2. Ensure `sprite.png`, `animations.png`, `grid.png`, and `trainer.png` are present.
3. Reload the game! The renderer automatically supports both 216x26 strips and 54x104 grids.

### Adding a New Creature (e.g. Peacock Pattern)
1. Add creature sheets under `assets/ingame/creatures/<creature_name>/`.
2. Register the sheets in `AssetManager`:
   ```javascript
   assets.registerImage('my_creature_idle', 'assets/ingame/creatures/my_creature/idle.png');
   assets.registerImage('my_creature_move', 'assets/ingame/creatures/my_creature/move.png');
   ```
3. Spawn and animate the creature in `updateCritters()` and `renderGameplay()`.
