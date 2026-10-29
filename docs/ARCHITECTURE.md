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

## 5. Procedural 16x20 Pixel Sprite Renderer
Characters and equipment are rendered via direct Canvas 2D raster commands without requiring large external sprite sheets:
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

---

## 6. Realtime Web Audio Chiptune Synthesizer (`RetroAudio`)
- Synthesizes 8-bit / 16-bit sound directly via native `AudioContext` oscillators.
- **Waveforms**: Square waves for 8-bit leads, Sawtooth for bass and resonance, White Noise for impacts and footsteps.
- **Sound Events**:
  - `playFanfare()`: Multi-stage ascending Zelda item discovery fanfare.
  - `playBridgeSecretChime()`: 8-note mystery solved chime.
  - `playSlash()`, `playBeam()`, `playNova()`, `playAegis()`: Dynamic combat audio.
  - `playDialogueBlip()`: Typewriter-style NPC voice modulation.

---

## 7. Persistence & Game Saves
Saved under the `echo_realm_save_v1` key in `window.localStorage`:
- Current map index and highest map unlocked.
- Player level, EXP, current and max HP, stat points, and temper level.
- Shards balance and total citizens liberated.
- 8-Slot equipped gear and inventory consumables.
- Player visual customizations (skin tone index, hair style, hair color, tunic color).
