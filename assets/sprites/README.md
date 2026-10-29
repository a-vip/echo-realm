# Sprite Assets & Rendering Guide

## Current Architecture: Procedural 32-Bit Pixel Sprite Engine
The Echo Realm currently employs a procedural 16x20 canvas pixel-art renderer (`drawCharacterSprite`) that renders characters dynamically at any scale with pixel-perfect crispness (`image-rendering: pixelated`).

### Layer Composition Order:
1. **Drop Shadow**: Elliptical semi-transparent shadow beneath the feet.
2. **Back Cloak**: Rendered behind the torso or overhead when facing North.
3. **Boots & Footwear**: Bobbing walk-cycle animation (4-frame cycle).
4. **Tunic & Pants**: Torso, belt, golden buckle, shoulder trim.
5. **Head & Face**: Skin tone (linked to systemic difficulty profile), eyes, eyewear, scholar beard, hair styles.
6. **Armor & Pauldrons**: Left and right pauldrons responding to equipped items.
7. **Arms & Gestures**: Walking arm swing, forward staff thrust, and the two-handed overhead "Zelda Item-Get" pose.
8. **Weapons & Off-Hand**: Main-hand Prism of Context, Off-hand Axiom Shield / Crest.
9. **Status Effects**: Stun stars halo, clarity auras, barrier shields.

## Expanding with Custom Sprites / Sprite Sheets
To integrate external PNG sprite sheets (e.g. from Aseprite or Kenney / OpenGameArt):
- Target frame dimensions: `16x20` or `32x32` pixels per frame.
- Direction row order: Down (0), Up (1), Left (2), Right (3).
- Animation columns: Idle, Walk 1, Walk 2, Attack Slash, Cast Beam, Overhead Fanfare.

