# The Echo Realm: Architecture & Engine Specifications

## 1. High-Level System Architecture
*The Echo Realm: Chronicles of the Archivist* is an educational 32-bit Action RPG built in pure HTML5, vanilla JavaScript, Canvas 2D, Tailwind CSS, and the Web Audio API. It runs with zero external runtime build dependencies.

```
+-------------------------------------------------------------+
|                        HTML5 Canvas                         |
|  +------------------+  +------------------+  +-----------+  |
|  |  Tilemap Layer   |  |  Entities & NPCs |  | Particles |  |
|  +------------------+  +------------------+  +-----------+  |
+-------------------------------------------------------------+
|                      Tailwind UI Layer                      |
|  - HUD (HP, EXP, Shards, Hotbars, Minimap)                  |
|  - Dialogue & Socratic Duel Modals                          |
|  - 8-Slot Paper-Doll Character Sheet [C] / Inventory [B]    |
|  - Educational Lore Codex [C] & Quest Journal [J]           |
+-------------------------------------------------------------+
|                      Core Engine Core                       |
|  - Game Loop (requestAnimationFrame, delta-time cap: 50ms)   |
|  - State Machine (INTRO, TITLE, CHAR_CREATE, PLAYING, etc.) |
|  - Collision Grid (34x24 tiles @ 44px)                      |
|  - Procedural 16x20 Sprite Renderer                         |
|  - Realtime Web Audio Chiptune Synthesizer                  |
|  - LocalStorage Save / Load System                          |
+-------------------------------------------------------------+
```

---

## 2. State Machine (`appState`)
The game is managed via a strict application state machine:
- `INTRO`: 7-scene prologue cutscene with chiptune music, subtitle ticker, and scene stepper.
- `TITLE`: Main start menu with Continue, New Game, Character Select, and Settings modals.
- `CHAR_CREATE`: Character customization screen (skin tone difficulty, hair styles, tunic colors) with real-time preview canvas.
- `PLAYING`: Active gameplay loop (physics, movement, combat channeling, AI steering, particle simulation).
- `PAUSED`: Game loop suspended, options and help screens active.
- `DIALOGUE`: Conversation active with Professor Avi, Resistance Allies, or Socratic Bosses.
- `ITEM_FANFARE`: Classic Zelda-style treasure discovery pose; entities pause, player holds relic aloft, chiptune fanfare plays.

---

## 3. Spatial & Collision System
- **Grid Layout**: 34 columns by 24 rows, with each tile sized at 44x44 pixels.
- **Entity Movement**: Sub-pixel floating-point positions updated with delta-time:
  $$\Delta x = v_x \cdot \Delta t, \quad \Delta y = v_y \cdot \Delta t$$
- **AABB vs Tile Collision**: `moveEntityWithCollision` splits movement into independent $X$ and $Y$ axes to allow smooth sliding along walls and river banks.
- **Dynamic Terrain Updates**: River tiles (`4`) dynamically become walkable Bridge tiles (`8`) when puzzle nodes are triggered.

---

## 4. Combat & Dialectic Inquiry Mechanics
The combat system rejects pure violence in favor of *cognitive liberation*:

1. **[Q] Prism Beam (Nuance)**:
   - Channels a continuous light cone in the player's facing direction.
   - Pierces cognitive distortions, rapidly filling the enemy's Clarity Gauge (0% $\to$ 100%).
   - Stuns distorted enemies once full clarity is attained.

2. **[E] Axiom Strike**:
   - A directional melee strike using the Axiom Crest / Staff.
   - Cleanses stunned enemies, returning them to liberated citizens and dropping Data Shards and Insight EXP.

3. **[R] Socratic Nova**:
   - 360-degree radial blast that repels surrounding zealots and interrupts incoming attacks.

4. **[F] Sanctuary Aegis**:
   - Creates a temporary golden protective barrier that grants total damage immunity.

5. **Socratic Boss Duels**:
   - When a boss's Clarity reaches 100%, the duel modal triggers.
   - Players must deconstruct the boss's extremist claim by identifying the underlying logical fallacy (e.g., Cherry-Picked Outrage, Palingenetic Ultranationalism, Thought-Terminating Clichés).
   - Selecting the correct dialectic counter immediately liberates the sector.

---

## 5. Procedural 16x20 Pixel Sprite Renderer & Custom Asset Pipeline
Characters and equipment are rendered via direct Canvas 2D raster commands without requiring external sprite sheets:
- **Base Resolution**: 16 pixels wide by 20 pixels tall.
- **Layer Stack**:
  1. Ground shadow (semi-transparent ellipse)
  2. Back Cloak / Cape
  3. Boots with dynamic walk-cycle foot-bobbing
  4. Tunic, Belt, Buckle, and Scholar Stole
  5. Pauldrons / Shoulders
  6. Head, Eyes, Facial Hair / Streaks, Masks, or Spectacles
  7. Arms (directional walking, staff thrust, or overhead Item-Get posture)
  8. Equipped Weapons (Prism Crystal) & Off-Hand Shield (Axiom Crest)

### AssetManager (`assets`)
Enables zero-breaking-change integration of external PNG sprite sheets and tilesets:
- `assets.registerSpriteSheet(id, src, frameW, frameH)`: Registers an external character sprite sheet.
- `assets.registerTileSet(id, src, tileSize)`: Registers an external tileset image.
- When an asset is registered and loaded, `drawCharacterSprite` and `renderGameplay` automatically render the external frames; otherwise, they seamlessly fall back to the built-in procedural raster engine.

---

## 6. Realtime Web Audio Chiptune Synthesizer (`RetroAudio`)
Synthesizes 8-bit / 16-bit sound directly via native `AudioContext` oscillators with zero external audio assets.

### Zone-Specific Ambient BGM Tracks (`ZONE_BGM_TRACKS`)
Each chapter features a procedurally synthesized retro background track reflecting its philosophical theme:
- **The Quiet Archive (`archive`)**: Contemplative D-minor Dorian arpeggio on soft triangle and sine waves.
- **Performative Valley (`valley`)**: Erratic, syncopated clout-chasing square wave melody in E-minor.
- **ALttP Interludes (`pastoral`)**: Heroic, expansive pastoral Zelda-inspired overworld themes in G and C Major.
- **Iron & Velvet Divide (`divide`)**: Conflicting, sharp polyrhythmic minor arpeggio.
- **Dogma Catacombs (`catacombs`)**: Solemn liturgical chiptune chant with deep sub-bass resonance.
- **Borderland of Scapegoats (`border`)**: Tense marching cadence in B-minor.
- **The Obsidian Reich-Citadel (`citadel`)**: Menacing, totalitarian brass-like march with descending dissonance.

### Tactile Material-Based Footsteps (`playFootstep`)
Synthesizes subtle terrain-specific audio feedback based on the tile beneath the Archivist:
- **`stone`**: Crisp, high-frequency tick for cobblestones, sanctuary floors, and monoliths.
- **`wood`**: Resonant, hollow thud for wooden river bridge planks.
- **`water`**: Bright liquid squelch for shallow stream crossings.
- **`flower`**: Soft, breezy rustle across sunlit wildflower meadows.
- **`hazard`**: Sizzling static distortion chirp over echo traps.
- **`grass`**: Default soft filtered noise puff.

---

## 7. Dynamic Minimap Fog of War (`fogGrid`)
Exploration is governed by a persistent `fogGrid[MAP_ROWS][MAP_COLS]` matrix:
- **Revelation Radius**: As the player moves, `revealFogAround(x, y, 6)` continuously uncovers a 6-tile circular radius.
- **Minimap Shroud**: Unvisited quadrants remain shrouded in deep void (`#050811`), hiding distant terrain, unopened chests, allies, and enemy patrols until discovered.
- **Explored Terrain**: Visited paths, waterways, bridges, and hazards render in stylized tactical minimap colors.

---

## 8. Thematic Environmental Hazards & Echo Traps
- **Outrage Vent (Tile `10`)**: An unstable algorithmic distortion vent. Spews rage-bait static, slowing player speed by 40% and draining 2-4 Clarity per second.
- **Dogmatic Stasis Rune (Tile `11`)**: A thought-terminating ideological trap. Slows movement by 70% and deals an instant burst of stasis damage.
- **Cleansing & Neutralization**:
  - Focusing the **`[Q]` Prism Beam of Nuance** for 0.75s dispels the delusion, purifying the tile into clean cobblestone and rewarding +1 Data Shard and +15 Insight EXP.
  - Striking adjacent hazards with **`[E]` Axiom Strike** instantly shatters the trap.

---

## 9. Persistence & Game Saves
Saved under the `echo_realm_save_v1` key in `window.localStorage`:
- Current map index and highest map unlocked.
- Player level, EXP, current and max HP, stat points, and temper level.
- Shards balance and total citizens liberated.
- 8-Slot equipped gear and inventory consumables.
- Player visual customizations (skin tone index, hair style, hair color, tunic color).

