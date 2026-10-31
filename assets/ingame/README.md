# Active In-Game Assets Directory (`assets/ingame/`)

This directory contains all the **currently active, applied in-game assets** for *Echo Realm: Chronicles of the Archivist*.

The assets are neatly sorted into clear subdirectories so anyone can immediately see what is in active use, inspect models, and easily try out or swap different character designs and buildings.

---

## Directory Structure

```
assets/
├── ingame/                     <-- ALL ACTIVE IN-GAME MODELS & SPRITES
│   ├── characters/
│   │   ├── player/             # Player character walk & idle sheets (216x26, 12 frames, 4 directions)
│   │   │   ├── player_male.png
│   │   │   └── player_female.png
│   │   ├── mentors/            # Regional mentor NPC sheets (216x26, 12 frames, 4 directions)
│   │   │   ├── mentor_avi.png       # Professor Avi (Scientist)
│   │   │   ├── mentor_maya.png      # Commander Maya (Officer/Ranger)
│   │   │   ├── mentor_lyra.png      # Bridgekeeper Lyra (Riverfolk)
│   │   │   ├── mentor_tariq.png     # Comrade Tariq (Miner Foreman)
│   │   │   ├── mentor_elena.png     # Elena Vance (Aristocrat)
│   │   │   ├── mentor_rowan.png     # Ranger Rowan (Park Ranger)
│   │   │   ├── mentor_kaelen.png    # Kaelen (Cyber Engineer)
│   │   │   └── mentor_zephyr.png    # Elder Zephyr (Distinguished Sage)
│   │   ├── citizens/           # Sector factions & roaming citizens
│   │   │   ├── citizen_villager_m.png
│   │   │   ├── citizen_villager_f.png
│   │   │   ├── citizen_scholar.png
│   │   │   ├── citizen_miner.png
│   │   │   ├── citizen_noble.png
│   │   │   └── citizen_waterfolk.png
│   │   └── portraits/          # 64x64 high-detail close-up trainer dialogue portraits
│   │       ├── portrait_player_m.png
│   │       ├── portrait_player_f.png
│   │       ├── portrait_avi.png
│   │       ├── portrait_maya.png
│   │       ├── portrait_lyra.png
│   │       ├── portrait_tariq.png
│   │       ├── portrait_elena.png
│   │       ├── portrait_rowan.png
│   │       ├── portrait_kaelen.png
│   │       ├── portrait_zephyr.png
│   │       ├── portrait_boss_valkor.png
│   │       └── portrait_boss_demagogue.png
│   ├── buildings/              # Sliced standalone building sprites from terribleCOTTAGES.png
│   │   ├── archive_sanctuary_tower.png
│   │   ├── archive_library_large.png
│   │   ├── cottage_red_medium.png
│   │   ├── cottage_red_large.png
│   │   ├── cottage_blue_medium.png
│   │   ├── cottage_stone_small.png
│   │   ├── cottage_wood_medium.png
│   │   ├── cottage_brick_large.png
│   │   ├── village_inn_long.png
│   │   ├── armory_bastion.png
│   │   ├── hermitage_lodge.png
│   │   ├── manor_grand.png
│   │   ├── temple_shrine.png
│   │   └── keep_citadel_fortress.png
│   └── creatures/              # Flying aquatic critters & companions
└── staging/                    # Trial appearances pool & raw full sheets
```

---

## How to Swap Any Character Design or Building in Seconds

### Swapping a Character Model
1. Place your new 12-frame character sprite strip (216x26) into `assets/ingame/characters/...`
2. Open `index.html` and look for `NPC_SPRITE_REGISTRY`.
3. Update the `src` property (or `sheet` ID) for the desired character:
   ```javascript
   avi: {
       id: 'mentor_avi',
       sheet: 'char_mentor_avi',
       src: 'assets/ingame/characters/mentors/my_new_avi.png',
       portrait: 'assets/ingame/characters/portraits/my_new_avi_portrait.png',
       frameW: 18, frameH: 26, scale: 2.2, footOffsetY: 26
   }
   ```
4. Save and reload the game! The new model is instantly active with all 4 directional animations, walk cycles, and dialogue portrait.

### Swapping a Building Sprite
1. Drop your PNG image into `assets/ingame/buildings/`.
2. Register the image in `AssetManager` in `index.html`:
   ```javascript
   assets.registerImage('my_building_key', 'assets/ingame/buildings/my_building.png');
   ```
3. Set `spriteKey: 'my_building_key'` on any building in `MAPS`!
