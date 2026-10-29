# Audio & Chiptune Synthesizer Guide

## Current Architecture: Web Audio API Realtime Synthesizer
The game uses a zero-dependency retro audio synthesizer (`RetroAudio`) powered by the browser's native `AudioContext`. This allows instant retro sound effects and chiptune melodies without requiring multi-megabyte sound assets.

### Synthesizer Capabilities:
- **Square & Sawtooth Waves**: Authentic NES / Game Boy style leads, basslines, and fanfares.
- **Noise Channel & Envelopes**: Exponential gain decay for footsteps, crystal hums, weapon strikes, and barrier pulses.
- **Signatures & Fanfares**:
  - `playFanfare()`: The iconic Zelda 4-stage ascending treasure chest fanfare.
  - `playBridgeSecretChime()`: The 8-note classic ALttP secret/puzzle solved jingle.
  - `playBeam()`, `playSlash()`, `playNova()`, `playAegis()`: Interactive combat audio feedback.
  - `playLevelUp()`, `playHurt()`, `playEnemyLiberate()`, `playDialogueBlip()`: Retro UI and state transitions.

## Expanding with Audio Assets:
- Custom BGM: To add ambient soundtrack files, place `.ogg` or `.mp3` files in this directory and reference them via standard HTML5 Audio or Web Audio buffer nodes.
- Tracker Chiptunes: Support for XM / MOD tracker formats can be added via lightweight WASM or JavaScript tracker players.

