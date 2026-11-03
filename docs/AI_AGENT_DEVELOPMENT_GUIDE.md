# Echo Realm — AI Agent & Developer Extensibility Guide

This guide documents the modular architecture, asset pipeline, and exact registries in **Echo Realm** (`index.html` + `scripts/build_assets.py`) so that any AI agent or developer can cleanly add, swap, or modify **character models, playable heroes, NPCs, hostile mobs, bosses, ambient creatures, buildings, interiors, terrain/environment tiles, questlines, and loot**.

---

## 1. Character Models, Sprites, Animations & Portraits

### 1.1 Standard 4-File Character Bundle Convention
Every playable hero, friendly NPC, hostile mob, and boss has its own self-contained folder under `assets/ingame/characters/<entity_id>/` containing four standardized files:
1. **`animations.png` (`216x26` px)** — 12-frame horizontal strip (`12 cols × 1 row`, each frame `18x26` px):
   - **Frames `0, 1, 2`**: South (Down) — `[Left Stride, Idle Center, Right Stride]`
   - **Frames `3, 4, 5`**: West (Left) — `[Left Stride, Idle Center, Right Stride]`
   - **Frames `6, 7, 8`**: East (Right) — `[Left Stride, Idle Center, Right Stride]`
   - **Frames `9, 10, 11`**: North (Up) — `[Left Stride, Idle Center, Right Stride]`
2. **`grid.png` (`54x104` px)** — The same 12 frames arranged in a `3 cols × 4 rows` (`18x26` per cell) visual inspection grid (Row 0 = South, Row 1 = West, Row 2 = East, Row 3 = North).
3. **`sprite.png` (`18x26` px)** — Default standing South idle frame (Frame `1`).
4. **`trainer.png` (`64x64` px)** — High-detail dialogue talking-head / trainer portrait with transparent background.

Copies of the active runtime strip (`216x26`) and portrait (`64x64`) are also synced to:
- `assets/ingame/characters/<spriteKey>.png`
- `assets/ingame/characters/portraits/<portraitKey>.png`

### 1.2 Automated Asset Pipeline (`scripts/build_assets.py`)
Never slice sprite sheets with ad-hoc or guessed cell dimensions. Always run or extend `scripts/build_assets.py`:
```powershell
cd c:\AI_Workspace\Obsidian\Avi\echo-realm
python scripts/build_assets.py
```
**Verified Source Sheet Frame Dimensions in `scripts/build_assets.py`**:
| Entity / Pack | Source Dimensions | Cell Grid | Frame Size | Notes |
|---|---|---|---|---|
| **Modern Pop (`TownsPeople`, `WaterNPCs`, `Miners`, `Forest`, `Lab`, ` Caveman`)** | `248x320` (`_Animations`) | `3 cols × 4 rows` per block (`4 chars/col × 3 cols = 12 chars/sheet`) | `16x24` (`dx=17, dy=26`) | Paired with `64x64` trainer portrait at `x + 56`. |
| **Roleworld Cleric (`mob_inquisitor`)** | `96x30` per strip | `6 cols × 1 row` | `16x30` (`y=4..30` → `16x26` 1:1 native) | Uses `Cleric_Walk_Front/Left/Right/Back` and `Cleric_Idle_Front`. |
| **Paws & Whiskers (`player_dog`, `player_cat`)** | `512x64` | `16 cols × 2 rows` | `32x32` (fits `18x26` 1:1 native) | Row 0 = Idle, Row 1 = Walk. Cols `0..3` S, `4..7` E, `8..11` N, `12..15` W. |
| **Astronaut (`player_astronaut`)** | `256x128` | `8 cols × 4 rows` | `32x32` | Uniform fixed crop box across all frames; uses Col 2 (L), Col 0 (Idle), Col 6 (R). |
| **Lugia & Ho-Oh (`player_lugia`, `player_ho_oh`)** | `192x32` | `6 cols × 1 row` | `32x32` | Frames `0,1` = South, `2,3` = West, horizontally flipped `2,3` = East, `4,5` = North. |
| **Clown (`boss_demagogue`)** | `192x160` | `6 cols × 5 rows` | `32x32` (`x=7..25, y=1..27` → `18x26` 1:1) | Row 0 = Idle, Row 1 = South, Row 2 = East (flip for West), Row 3 = North. |

### 1.3 Registering a New Character or Playable Hero in `index.html`
1. **Asset Manifest (`loadAllAssets` in `index.html`)**:
   - Add `{ key: 'char_<id>', src: 'assets/ingame/players/<folder>/animations.png' }` and `{ key: 'portrait_<id>', src: 'assets/ingame/players/<folder>/trainer.png' }`.
2. **`CHAR_DEDICATED_IDS` & `NPC_SPRITE_REGISTRY`**:
   - Add `'char_<id>'` to `CHAR_DEDICATED_IDS` so `drawCharacterSprite()` renders it as a `216x26` 12-frame strip (`18x26` per frame).
   - Add `<key>: { sheet: 'char_<id>', portrait: 'portrait_<id>', idx: 0 }` to `NPC_SPRITE_REGISTRY`.
3. **Playable Fighter Roster (`ROSTER_PROFILES` & `#rosterSelectGrid`)**:
   - Add an entry in `ROSTER_PROFILES` (`gender`, `characterKey`, `title`, `badge`, `desc`, `hp`, `speed`, `defaultName`) and a matching button in `#rosterSelectGrid` (`onclick="selectCharacterRoster('<key>')"`).

---

## 2. Ambient Creatures & Wildlife (e.g. Peacock, Squirrel, Chicken)

### 2.1 Creature Sprite Sheet Layouts
- **`peacock_folded` (`assets/ingame/creatures/peacock/peacock_folded.png`, `144x152` px)**:
  - **Grid**: `4 cols × 4 rows` of **`36x38` px** per frame.
  - **Columns (Directions)**: Col `0` = South, Col `1` = East, Col `2` = North, Col `3` = West.
  - **Rows (`0..3`)**: 4 idle animation frames (head bob & folded plumage shimmer).
- **`peacock_walk` (`assets/ingame/creatures/peacock/peacock_walk.png`, `128x96` px)**:
  - **Grid**: `4 cols × 4 rows` of **`32x24` px** per frame.
  - **Columns (Directions)**: Col `0` = West, Col `1` = South, Col `2` = North, Col `3` = East.
  - **Rows (`0..3`)**: 4 strutting walk animation frames with fanned iridescent tail feathers.

### 2.2 Where to Add or Configure Creatures
- **Spawning (`spawnMapCritters()` in `index.html`)**: Controls which zones spawn which creature types (e.g., `peacock` spawns exclusively in `currentMapIndex === 2`, the Sunlit Glade Sanctuary).
- **AI & Movement (`updateCritters(dt)`)**: Handles `idle`, `walk`, and `flee` states, collision avoidance, and `animTimer`.
- **Rendering (`renderGameplay()`)**: Renders each critter sorted by Y-depth (`baseY`). Multi-directional sheet creatures like `peacock` select their directional column (`col`) and animate `row = Math.floor(c.animTimer * speed) % 4` before the generic single-frame horizontal flip.

---

## 3. Hostile Mobs, Bosses & Socratic Duels

- **Mob Archetypes (`FACTION_MOBS` & `NPC_SPRITE_REGISTRY`)**:
  - `manosphere` → `mob_manosphere` (Bodybuilder sprite + flexing trainer portrait)
  - `femosphere` → `mob_femosphere` (Bikini swimmer sprite + trainer portrait)
  - `doomer` → `mob_doomer`
  - `inquisitor` → `mob_inquisitor` (Roleworld Cleric sprite + single-cleric portrait)
  - `grifter` → `mob_grifter`
  - `bot` → `mob_bot`
- **Bosses (`MAPS[i].boss`)**:
  - Each zone defines its boss in `MAPS[i].boss` with `name`, `title`, `role`, `x`, `y`, `hp`, `maxHp`, and `socraticId`.
  - The final boss (`The Grand Demagogue`, Map 7) uses `boss_demagogue` (`Clown_Sprite.png` animations & portrait).
- **Socratic Inoculation Duels (`SOCRATIC_QUESTIONS` & `openSocraticDuelModal()`)**:
  - Displays the opponent's exact mob/boss name and faction title in the duel header and red dialogue speaker tag.

---

## 4. Buildings, Exteriors & Interior Rooms

- **Building Exteriors (`BUILDING_TYPES` & `MAPS[i].buildings`)**:
  - Configured per map with `{ id, x, y, w, h, type, name, doorCol, doorRow, interiorId }`.
  - Exterior sprites load from `assets/environment/buildings/` and `assets/sprites/buildings/` without artificial black drop-shadows underneath.
- **Building Interiors (`INTERIOR_ROOMS` & `renderInteriorRoom()`)**:
  - Defined in `INTERIOR_ROOMS` by `interiorId`.
  - Uses `interiors_wall_pattern` for upper walls, `interiors_tiles` / warm wood planking for floors, and curated furniture/props from `props_1..4` and `assets/environment/props/`.

---

## 5. Overworld Terrain, Green Grass, Paths & Water Tiles

- **Tile Codes in `mapGrid[r][c]`**:
  - `0`: Open Ground / Meadow Grass
  - `1`: Road / Cobblestone & Earth Path
  - `2`: Perimeter Wall / Impassable Cliff
  - `3`: Building Footprint (Solid)
  - `4`: Animated River / Lake Water
  - `8`: Wooden Bridge Plank (Walkable over water)
  - `9`: Tall Meadow Grass / Clearing
- **Lush Green Zones (`isGreenZone` in `renderGameplay()`)**:
  - Active on `currentMapIndex === 0` (The Quiet Archive), `1` (Sunlit Outskirts), `2` (Sunlit Glade), `5`, `6`, and `7`.
  - Renders `floors_tiles` (`16x16` pixel-art grass tiles at `x=16..48, y=160..176`), `pixel_vegetation` wildflower/grass tufts, and wind-animated grass blades.
  - Roads (`t === 1`) layer `floors_tiles` cobblestone/earth tiles (`x=96..128, y=160..176`) with organic grass overhang autotiles (`x=0..80, y=0..80`) along non-road edges so paths never look boxy or square.
- **Seamless Animated Water (`water_animation.png`, `80x16` px = 5 frames of `16x16`)**:
  - Pre-fills `#28ccdf` (`1px` bleed) and draws synchronized `wFrame = Math.floor(nowMs / 200) % 5` at `TILE_SIZE × TILE_SIZE` with `ctx.imageSmoothingEnabled = false` so adjacent water tiles have zero seams.

---

## 6. Questlines, Signposts, Narrative Props & Loot

- **Signposts (`MAPS[i].signs`) & Narrative Props (`MAPS[i].narrativeProps`)**:
  - `triggerInteraction()` passes `isSign: true` for all signposts and `isProp: true` for narrative props into `startNpcDialogue()`.
  - `renderDialoguePortraitCanvas()` checks `opts.npc.isSign` (as well as title keywords) so every signpost—regardless of its title text (e.g. `"SOUTH HIGHWAY"`)—renders the wooden signpost portrait graphic.
- **Relics & Equipment (`RELIC_DB`)**:
  - Add new items to `RELIC_DB` with `{ id, name, slot, rarity, stats, desc, iconType }` and reference their `id` in `MAPS[i].chests` or quest rewards.
