# The Echo Realm: Developer & Content Expansion Guide

This guide details how to build out new content, expand existing mechanics, and add new assets to *The Echo Realm: Chronicles of the Archivist*.

---

## 1. Adding a New Story Zone / Map

All maps are defined in the `MAPS` array inside `index.html`. To add a new map:

1. **Define the Map Specification**:
   ```javascript
   {
       id: 9, // Incremental map index
       name: 'Map 10: The Sovereign Algorithmic Core',
       chapter: 'Epilogue: Reconstructing Shared Reality',
       themeColor: '#0369a1',
       groundColor: '#0c4a6e',
       codexKey: 'core_inoculation',
       curedGoal: 6,
       questTitle: 'Reboot 6 Cognitive Relays & Free the Central Nodes',
       portalTarget: 0, // Where the north portal leads
       chest: { col: 14, row: 6, itemId: 'aegis_pluralism' },
       aviPreDialogues: [
           'We stand before the central core...',
           'Use your Socratic Nova [R] to clear corrupted feedback buffers.'
       ],
       aviPostDialogues: [
           'The feed has been restored to human scale!'
       ],
       ally: {
           name: 'Chief Architect Aaron',
           col: 22, row: 18,
           tunicColor: '#38bdf8',
           dialogues: ['The central relays are responding to the Prism!']
       },
       boss: null // Or define a Socratic Boss
   }
   ```

2. **Add a Corresponding Codex Entry** in `CODEX_ENTRIES`:
   ```javascript
   core_inoculation: {
       id: 'core_inoculation',
       unlockMap: 9,
       title: 'Epilogue: Distributed Sense-Making',
       icon: '🌐',
       map: 'Map 10: The Sovereign Algorithmic Core',
       hook: 'No single authority should hold monopoly over truth; resilient societies depend on distributed critical verification.',
       mechanism: 'Decentralized platforms with transparent, open-source algorithms prevent engagement-driven radicalization spirals.',
       fallacies: ['Techno-Authoritarian Inevitability: Believing predatory algorithms are the only possible way to organize modern communication.'],
       antidote: 'Public-interest digital infrastructure, community moderation, and algorithmic transparency.',
       deconstructions: [
           { myth: '"Algorithms must maximize outrage to survive!"', truth: 'Human-centric algorithms optimize for comprehension, context, and mutual understanding.' }
       ]
   }
   ```

3. **Verify with the Automated Test Suite**:
   ```bash
   npm test
   ```
   The test suite will automatically ensure portal indices are within bounds, chest relic references exist, dialogues are present, and codex keys match.

---

## 2. Adding New Relics & Equipment

Relics are defined in `RELIC_DB`. Each item belongs to one of the 8 Paper-Doll slots (`head`, `shoulders`, `back`, `chest`, `mainHand`, `offHand`, `hands`, `feet`):

```javascript
aegis_pluralism: {
    id: 'aegis_pluralism',
    name: 'Aegis of Pluralism',
    slot: 'offHand',
    icon: '🛡️',
    visualColor: '#38bdf8',
    stat: 'defense',
    val: 18,
    bonus: '+18 Epistemic Defense',
    desc: 'Shield forged from distributed community consensus. Nullifies targeted disinformation strikes.'
}
```

---

## 3. Creating Socratic Boss Duels

Socratic boss fights test the player's philosophical and critical analysis skills rather than just reflexes:

```javascript
boss: {
    name: 'THE TECHNO-FATALIST MONOPOLIST',
    hp: 550,
    maxHp: 550,
    role: 'blackshirt',
    quote: '"You cannot resist the engagement algorithm! Outrage is human nature!"',
    duel: {
        claim: '"Humans are hardwired only for hatred and fear. Designing algorithms for nuance is biologically impossible!"',
        options: [
            {
                text: 'Naturalistic Fallacy & Cynical Determinism (confusing what is algorithmically amplified with the entirety of human capacity).',
                correct: true
            },
            {
                text: 'Agree and delete the game.',
                correct: false
            },
            {
                text: 'Engage in an angry Twitter flame-war.',
                correct: false
            }
        ]
    }
}
```

---

## 4. Expanding Environmental Puzzles

Puzzles are instantiated inside `loadMap(mapIndex)`:
- **`crystal_orb`**: Activate by channeling [Q] Prism Beam or striking with [E] Axiom Blade.
- **`push_block`**: Push into target coordinate to activate pressure switches.
- **`socratic_pedestal`**: Interactive pedestals that open multiple-choice dialectic challenges.
- **River Bridges**: Dynamically populated when `unlockRiverBridgeIfReady()` evaluates to true.
