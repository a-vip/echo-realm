# Map Assets & Level Design Guide

## Current Architecture: 34x24 Tile Engine
The game world is laid out in a responsive grid of `MAP_COLS = 34` by `MAP_ROWS = 24` tiles at `TILE_SIZE = 44px`.

### Standard Tile IDs:
- `0`: Grass / Standard Floor
- `1`: Cobblestone Path / Main Thoroughfare
- `2`: Stone Wall / Cliff Perimeter (blocking)
- `3`: Canopy Tree / Forest Obstacle (blocking)
- `4`: Sparkling River Water (blocking until bridges are extended)
- `5`: Archive / Sanctuary Floor Tile
- `6`: Stone Monolith / Pillar (blocking)
- `8`: Wooden Plank Bridge (walkable across river)
- `9`: Sunlit Wildflowers (aesthetic decor)

### Zelda-Style Interactive Puzzles:
1. **Crystal Orbs (`crystal_orb`)**: Activated by channeled [Q] Prism Beam or [E] Axiom Strike. Changing color from dormant cyan to energized amber.
2. **Pushable Mirror Blocks (`push_block`)**: Moved by player contact into target coordinates, triggering golden floor runes.
3. **Socratic Pedestals (`socratic_pedestal`)**: Interactive steles that pose critical thinking challenges and epistemological inquiries.

### Adding New Maps:
1. Add an entry to the `MAPS` array in `index.html`.
2. Assign a unique `id`, name, chapter title, theme/ground colors, and `codexKey`.
3. Define the `chest` coordinates and corresponding relic from `RELIC_DB`.
4. Define pre- and post-quest dialogues for Professor Avi.
5. If creating an ALttP bright zone, set `isBrightAlttpZone: true` and specify `riverRows`.
6. Run `npm test` to automatically verify map dimensions, portals, chest references, and Socratic duels.
