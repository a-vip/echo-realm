# The Echo Realm: Chronicles of the Archivist

> **A 32-Bit Action RPG exploring echo chambers, cognitive inoculation, algorithmic radicalization, and Socratic inquiry.**  
> *Inspired by the aesthetics and puzzle mechanics of The Legend of Zelda: A Link to the Past.*

🎮 **Live Playable Web App (GitHub Pages)**: [https://a-vip.github.io/echo-realm/](https://a-vip.github.io/echo-realm/)  
📦 **GitHub Repository**: [https://github.com/a-vip/echo-realm](https://github.com/a-vip/echo-realm)

---

## 🌐 Embedding in Your Website (iframe)

To embed the game directly into your website, blog, or portfolio:

```html
<iframe 
  src="https://a-vip.github.io/echo-realm/" 
  style="width: 100%; height: 85vh; border: 3px solid #38bdf8; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);" 
  allow="autoplay"
  loading="lazy">
</iframe>
```

---

## 🎮 Game Overview

In a fractured digital realm where predatory engagement algorithms have splintered society into warring echo chambers, you play as an **Archivist Initiate** guided by **Professor Avi**.

Armed with the **Prism of Context** and the **Crest of Axioms**, you venture across 9 progressive story zones to break ideological radicalization loops, illuminate distorted minds, solve environmental puzzles, and overthrow the totalitarian demagogue at the heart of the algorithmic machine.

---

## 🕹️ Controls & Combat Guide

| Input | Action | Description |
| :--- | :--- | :--- |
| **`W` `A` `S` `D`** / Arrows | **Movement** | Walk across the 34x24 world grid with smooth collision sliding. |
| **`Q` (Hold)** | **Prism Beam of Nuance** | Channels an illuminated cone of light to expose cognitive distortions and fill the target's Clarity Gauge to 100%. |
| **`E`** | **Axiom Strike** | Performs a melee strike to dispel stunned cognitive distortions and liberate radicalized citizens. |
| **`R`** | **Socratic Nova** | 360-degree area-of-effect wave of critical inquiry that pushes back surrounding zealots. |
| **`F`** | **Sanctuary Aegis** | Deploys a golden protective barrier granting temporary damage invulnerability. |
| **`SPACE`** | **Interact / Dialogue** | Open chests, examine Socratic pedestals, speak with Professor Avi and allies. |
| **`C`** | **Codex & Lore** | View unlocked chapters on cognitive biases, fallacies, and inoculation antidotes. |
| **`B`** | **Inventory & Gear** | Open the 8-Slot 32-bit Paper-Doll Equipment screen and use consumables. |
| **`J`** | **Quest Journal** | Review current objectives, cured citizen counts, and sector goals. |
| **`ESC`** | **Game Menu** | Pause game, toggle CRT scanlines, and adjust chiptune synthesizer volume. |

---

## 🗺️ Progressive World Maps (9 Story Sectors)

```
[01: The Quiet Archive]  ->  [02: Performative Valley]  ->  [03: Sunlit Riverfront of Nuance]
                                                                          |
[06: Whispering Woods]   <-  [05: Dogma Catacombs]       <-  [04: Iron & Velvet Divide]
          |
[07: Borderland Scapegoats] -> [08: Highland Oasis]      ->  [09: The Obsidian Reich-Citadel]
```

1. **Map 1: The Quiet Archive** *(Prologue: The Awakening)*  
   Sanctuary where Professor Avi teaches the foundations of cognitive inoculation and Prism channeling.
2. **Map 2: Performative Valley** *(Chapter 1: The Golden Masks)*  
   A sector consumed by the attention economy, vanity metrics, and performative clout.
3. **Map 3: Sunlit Riverfront of Nuance** *(Interlude I: The Crystal River Bridge)*  
   Lush ALttP-style overworld with sparkling river water, wildflowers, and 3 interactive Crystal Switches that extend the river crossing.
4. **Map 4: The Iron & Velvet Divide** *(Chapter 2: Gendered Grievance Loops)*  
   Battle against gendered grievance loops and defeat **The Alpha-Cynic Algorithm**.
5. **Map 5: The Dogma Catacombs** *(Chapter 3: The Purity Spiral)*  
   Underground labyrinth dominated by purity spirals and the **Grand Inquisitor of Purity**.
6. **Map 6: Whispering Woods of Inquiry** *(Interlude II: The Sacred Glade Puzzle)*  
   Forest puzzle zone featuring movable stone mirror blocks and a Socratic inquiry stele to clear the disorienting disinformation mist.
7. **Map 7: Borderland of Scapegoats** *(Chapter 4: Fear of the Other)*  
   Confront xenophobic blame-shifting and dismantle **The Great Replacement Warden**.
8. **Map 8: Highland Oasis of Solidarity** *(Interlude III: The Three Pillars of Truth)*  
   Waterfall plateau where solving 3 Socratic pedestals along the shore raises the stone causeway to the citadel.
9. **Map 9: The Obsidian Reich-Citadel** *(Finale: The Fascist Convergence)*  
   Totalitarian fortress where all radicalization pipelines converge under **The Sovereign Demagogue**.

---

## 🛡️ Key Features

- **Socratic Boss Duels**: Bosses are not defeated by mere violence; when their clarity gauge is filled, you engage in dialectic duels where you deconstruct their claims by identifying specific fallacies (e.g. cherry-picked outrage, out-group homogeneity, thought-terminating clichés, palingenetic ultranationalism).
- **Zelda-Style ALttP Puzzles**: Sparkling river bands, pushable stone mirror blocks, crystal switch beams, and the iconic "Item-Get" fanfare where the player holds newly discovered relics overhead.
- **8-Slot 32-Bit Paper-Doll Equipment**: Head, Shoulders, Cloak, Tunic, Main-Hand Prism, Off-Hand Shield, Gloves, and Boots with dynamic visual sprite layering.
- **Systemic Difficulty Profiles**: Satirical yet mechanically impactful skin-tone selection that alters enemy aggro distance, damage taken, EXP, and Data Shard rewards.
- **Pure Web Audio Synthesizer**: Zero-dependency chiptune music, sound effects, Zelda fanfare, and bridge unlock jingles generated dynamically in-browser via native `AudioContext`.
- **LocalStorage Persistence**: Auto-saves character level, unlocked maps, relics, and customized appearance.

---

## 🚀 Quick Start & Local Test Environment

### Prerequisites
- Node.js (v18+)

### 1. Launch the Local Dev Server
```bash
# From the echo-realm directory:
npm start
# or:
node server.js
```
Open your browser to: **`http://127.0.0.1:3000`**

### 2. Run the Automated Test Suite
```bash
npm test
```
Runs 22 comprehensive automated tests verifying:
- World grid dimensions and map connectivity.
- Chest relic references and 8-slot paper doll definitions.
- Educational codex and narrative cutscene integrity.
- Socratic boss dialectic options and answer keys.
- Combat math and temper stat scaling.

---

## 📁 Repository Structure

```
echo-realm/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── assets/
│   ├── audio/                  # Audio guides & tracker assets
│   ├── maps/                   # Map format specifications
│   └── sprites/                # 16x20 & 32x32 sprite layer guides
├── docs/
│   ├── ARCHITECTURE.md         # Comprehensive engine & state documentation
│   └── EXPANSION_GUIDE.md      # Guide for adding maps, relics & Socratic bosses
├── tests/
│   ├── codex.test.js           # Codex & cutscene validation
│   ├── combat_math.test.js     # Stat formulas & temper level tests
│   ├── difficulty.test.js      # Difficulty profiles & multiplier tests
│   ├── maps.test.js            # Map grid, portals, chests & bosses
│   ├── relics.test.js          # Paper-doll slot & relic database tests
│   └── testHelper.js           # In-memory browser sandbox environment
├── (v6) NEW ZONES the_echo_realm_action_rpg.html  # Upstream release backup
├── index.html                  # Main production game entrypoint
├── package.json                # NPM scripts and project metadata
├── server.js                   # Zero-dependency local development server
├── LICENSE                     # MIT Open Source License
└── README.md                   # Project documentation
```

---

## 🛠️ Suggested Next Features & Expansion Roadmap

1. **Audio Soundscape Expansion**:
   - Add dedicated ambient chiptune background music tracks for each distinct zone (e.g. tranquil archive melody, tense catacombs arpeggios, majestic highland oasis chords).
2. **Interactive Dialectic Dialogue Tree**:
   - Expand NPC conversations with branching Socratic dialogue where player responses can inoculate allies and unlock bonus side-quests.
3. **Overworld Minimap Fog of War**:
   - Add dynamic exploration fog to the minimap that clears as the Archivist navigates unexplored quadrants.
4. **Custom Sprite Sheet & Tile Set Support**:
   - Support optional external 32x32 pixel tilesets (Kenney/Aseprite) alongside the procedural renderer.
5. **New Game+ & Speedrun Timer**:
   - Add a speedrun timer hud element, Socratic accuracy score (percentage of first-try correct refutations), and New Game+ modifiers.

