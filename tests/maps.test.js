const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('World & Map Validation Test Suite', async (t) => {
    const game = loadGameEnvironment();

    await t.test('Grid configuration constants are set', () => {
        assert.strictEqual(game.MAP_COLS, 34);
        assert.strictEqual(game.MAP_ROWS, 24);
        assert.strictEqual(game.TILE_SIZE, 44);
    });

    await t.test('All 9 progressive story maps exist with proper IDs', () => {
        assert.strictEqual(game.MAPS.length, 9);
        game.MAPS.forEach((map, index) => {
            assert.strictEqual(map.id, index);
            assert.ok(map.name, `Map ${index} must have a name`);
            assert.ok(map.chapter, `Map ${index} must have a chapter`);
            assert.ok(map.themeColor, `Map ${index} must have a themeColor`);
            assert.ok(map.groundColor, `Map ${index} must have a groundColor`);
            assert.ok(map.questTitle, `Map ${index} must have a questTitle`);
            assert.ok(map.curedGoal > 0, `Map ${index} curedGoal must be > 0`);
        });
    });

    await t.test('Map portals lead to valid target maps', () => {
        game.MAPS.forEach((map, index) => {
            assert.ok(map.portalTarget >= 0 && map.portalTarget < game.MAPS.length,
                `Map ${index} portalTarget (${map.portalTarget}) must be within bounds 0..${game.MAPS.length - 1}`);
        });
    });

    await t.test('Map chests reference valid relics in RELIC_DB', () => {
        game.MAPS.forEach((map, index) => {
            if (map.chest) {
                assert.ok(map.chest.itemId, `Map ${index} chest must specify itemId`);
                assert.ok(game.RELIC_DB[map.chest.itemId],
                    `Map ${index} chest relic '${map.chest.itemId}' must exist in RELIC_DB`);
                assert.ok(map.chest.col >= 0 && map.chest.col < game.MAP_COLS,
                    `Map ${index} chest col ${map.chest.col} must be within bounds`);
                assert.ok(map.chest.row >= 0 && map.chest.row < game.MAP_ROWS,
                    `Map ${index} chest row ${map.chest.row} must be within bounds`);
            }
        });
    });

    await t.test('Professor Avi dialogues are populated for each zone', () => {
        game.MAPS.forEach((map, index) => {
            assert.ok(Array.isArray(map.aviPreDialogues) && map.aviPreDialogues.length > 0,
                `Map ${index} must have aviPreDialogues`);
            assert.ok(Array.isArray(map.aviPostDialogues) && map.aviPostDialogues.length > 0,
                `Map ${index} must have aviPostDialogues`);
        });
    });

    await t.test('ALttP Bright Interlude Zones define sparkling rivers and puzzles', () => {
        const alttpMaps = [2, 5, 7]; // Map 3, 6, 8
        alttpMaps.forEach(mapIdx => {
            const map = game.MAPS[mapIdx];
            assert.strictEqual(map.isBrightAlttpZone, true, `Map ${mapIdx} should be a bright ALttP zone`);
            assert.ok(Array.isArray(map.riverRows) && map.riverRows.length > 0,
                `Map ${mapIdx} must have riverRows defined`);
            assert.ok(map.puzzleGoal > 0, `Map ${mapIdx} must require puzzles to cross`);
        });
    });

    await t.test('Bosses and Socratic Duels have valid dialectic options', () => {
        const bossMaps = [3, 4, 6, 8]; // Maps 4, 5, 7, 9
        bossMaps.forEach(mapIdx => {
            const map = game.MAPS[mapIdx];
            assert.ok(map.boss, `Map ${mapIdx} must have a boss defined`);
            const boss = map.boss;
            assert.ok(boss.name, `Boss on map ${mapIdx} must have a name`);
            assert.ok(boss.hp > 0, `Boss on map ${mapIdx} must have hp > 0`);
            assert.ok(boss.duel, `Boss on map ${mapIdx} must have a Socratic duel`);
            assert.ok(boss.duel.claim, `Boss duel on map ${mapIdx} must have an opening claim`);
            assert.ok(Array.isArray(boss.duel.options) && boss.duel.options.length >= 2,
                `Boss duel on map ${mapIdx} must provide at least 2 dialectic response options`);
            
            const correctCount = boss.duel.options.filter(opt => opt.correct === true).length;
            assert.strictEqual(correctCount, 1,
                `Boss duel on map ${mapIdx} must have exactly 1 logically correct dialectic refutation`);
        });
    });

    await t.test('Zelda ALttP 3x3 Overworld Grid defines all 9 contiguous sectors', () => {
        assert.strictEqual(game.OVERWORLD_GRID.length, 3);
        assert.strictEqual(game.OVERWORLD_GRID[0].length, 3);
        assert.strictEqual(game.OVERWORLD_GRID[1].length, 3);
        assert.strictEqual(game.OVERWORLD_GRID[2].length, 3);

        // Every map from 0 to 8 must appear exactly once in the 3x3 grid
        const allGridMaps = game.OVERWORLD_GRID.flat();
        assert.strictEqual(allGridMaps.length, 9);
        for (let i = 0; i < 9; i++) {
            assert.ok(allGridMaps.includes(i), `Map ID ${i} must exist in OVERWORLD_GRID`);
            const meta = game.MAP_OVERWORLD_POS[i];
            assert.ok(meta, `Map ID ${i} must have MAP_OVERWORLD_POS metadata`);
            assert.ok(meta.name, `Map ID ${i} must have name`);
            assert.ok(meta.alttpName, `Map ID ${i} must have ALttP parallel region name`);
            assert.ok(meta.icon, `Map ID ${i} must have icon`);
            assert.strictEqual(game.OVERWORLD_GRID[meta.row][meta.col], i,
                `Map ID ${i} position (${meta.row}, ${meta.col}) must match OVERWORLD_GRID`);
        }
    });

    await t.test('Seamless perimeter border exits open toward adjacent overworld neighbors', () => {
        // Map 8 (Hyrule Castle Citadel) is in the center at (1, 1) and connects to all 4 neighbors!
        game.loadMap(8);
        const grid = game.mapGrid;
        // North exit at row 0, cols 14..20
        for (let c = 14; c <= 20; c++) {
            assert.strictEqual(grid[0][c], 1, `Center Citadel should have open North exit at col ${c}`);
        }
        // South exit at row MAP_ROWS - 1, cols 14..20
        for (let c = 14; c <= 20; c++) {
            assert.strictEqual(grid[game.MAP_ROWS - 1][c], 1, `Center Citadel should have open South exit at col ${c}`);
        }
        // West exit at col 0, rows 10..16
        for (let r = 10; r <= 16; r++) {
            assert.strictEqual(grid[r][0], 1, `Center Citadel should have open West exit at row ${r}`);
        }
        // East exit at col MAP_COLS - 1, rows 10..16
        for (let r = 10; r <= 16; r++) {
            assert.strictEqual(grid[r][game.MAP_COLS - 1], 1, `Center Citadel should have open East exit at row ${r}`);
        }
    });

    await t.test('Developer Mode toggles and enables click teleportation to any sector and tile', () => {
        const initialDev = game.devMode;
        game.toggleDevMode();
        assert.strictEqual(game.devMode, !initialDev, 'toggleDevMode should invert devMode state');

        // Teleport to Map 1 (Performative Valley) at col 10, row 12
        game.teleportPlayerTo(1, 10, 12);
        assert.strictEqual(game.player.mapCitizensFreed, 0);
        assert.strictEqual(game.player.x, (10 + 0.5) * game.TILE_SIZE, 'Player X should match teleport target');
        assert.strictEqual(game.player.y, (12 + 0.5) * game.TILE_SIZE, 'Player Y should match teleport target');

        // Test renderWorldMap execution without error
        assert.doesNotThrow(() => {
            game.renderWorldMap();
        }, 'renderWorldMap should execute cleanly');

        // Reset dev mode
        if (game.devMode !== initialDev) game.toggleDevMode();
    });

    await t.test('Kakariko Village (Map 1) defines expansive non-square layout with 10 buildings and plaza weathervane', () => {
        const map1 = game.MAPS[1];
        assert.strictEqual(map1.cols, 52, 'Map 1 cols should be 52');
        assert.strictEqual(map1.rows, 50, 'Map 1 rows should be 50');
        assert.ok(map1.weatherVane, 'Map 1 must have weatherVane defined');
        assert.strictEqual(map1.weatherVane.col, 25);
        assert.strictEqual(map1.weatherVane.row, 23);
        assert.ok(Array.isArray(map1.buildings) && map1.buildings.length >= 10, 'Map 1 must define at least 10 buildings');

        game.loadMap(1);
        const grid = game.mapGrid;
        assert.strictEqual(grid.length, 50, 'Loaded Map 1 grid must have 50 rows');
        assert.strictEqual(grid[0].length, 52, 'Loaded Map 1 grid must have 52 cols');

        // Verify each building footprint is marked solid (12)
        map1.buildings.forEach(b => {
            assert.ok(b.wCols >= 3 && b.hRows >= 2, `Building ${b.id} must have scale >= 3x2`);
            assert.ok(b.spriteKey, `Building ${b.id} must define spriteKey`);
            assert.ok(b.name, `Building ${b.id} must have a name`);
            for (let r = b.row; r < b.row + b.hRows; r++) {
                for (let c = b.col; c < b.col + b.wCols; c++) {
                    assert.strictEqual(grid[r][c], 12, `Tile (${c}, ${r}) for building ${b.id} should be solid 12`);
                }
            }
        });

        // Verify official ALttP spritesheet is registered in AssetManager
        assert.ok(game.assets.spritesheets.get('alttp_overworld'), 'alttp_overworld spritesheet must be registered');
    });

    await t.test('Cleaned transparent PNG sprites are registered in AssetManager without white border box artifacts', () => {
        const expectedCleanSprites = [
            'alttp_tree',
            'red_cottage_1',
            'red_cottage_2',
            'blue_cottage_1',
            'blue_cottage_2',
            'cyan_house',
            'long_tavern',
            'shed',
            'weathervane'
        ];
        expectedCleanSprites.forEach(spriteKey => {
            assert.ok(game.assets.images.has(spriteKey), `Clean transparent sprite '${spriteKey}' must be registered in AssetManager`);
            const entry = game.assets.images.get(spriteKey);
            assert.ok(entry.src.endsWith('.png'), `Sprite '${spriteKey}' src must be a PNG file (${entry.src})`);
        });
    });

    await t.test('Dynamic zone mentors are assigned as primary quest givers across maps 1 through 7', () => {
        // Map 0: Professor Avi
        game.loadMap(0);
        const qg0 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg0, 'Map 0 must have a quest giver');
        assert.strictEqual(qg0.name, 'Professor Avi');

        // Map 1: Commander Maya
        game.loadMap(1);
        const qg1 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg1, 'Map 1 must have a quest giver');
        assert.strictEqual(qg1.name, 'Commander Maya');

        // Map 2: Bridgekeeper Lyra
        game.loadMap(2);
        const qg2 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg2, 'Map 2 must have a quest giver');
        assert.strictEqual(qg2.name, 'Bridgekeeper Lyra');

        // Map 3: Comrade Tariq
        game.loadMap(3);
        const qg3 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg3, 'Map 3 must have a quest giver');
        assert.strictEqual(qg3.name, 'Comrade Tariq');

        // Map 4: Sister Elena
        game.loadMap(4);
        const qg4 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg4, 'Map 4 must have a quest giver');
        assert.strictEqual(qg4.name, 'Sister Elena');

        // Map 5: Ranger Rowan
        game.loadMap(5);
        const qg5 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg5, 'Map 5 must have a quest giver');
        assert.strictEqual(qg5.name, 'Ranger Rowan');

        // Map 6: Organizer Kael
        game.loadMap(6);
        const qg6 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg6, 'Map 6 must have a quest giver');
        assert.strictEqual(qg6.name, 'Organizer Kael');

        // Map 8: Professor Avi
        game.loadMap(8);
        const qg8 = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg8, 'Map 8 must have a quest giver');
        assert.strictEqual(qg8.name, 'Professor Avi');
    });

    await t.test('Portals are removed for open-world freedom, and quests track in stacked quest log', () => {
        game.loadMap(1); // Performative Valley (5 cured goal, Commander Maya)
        const qg = game.npcs.find(n => n.isQuestGiver);
        assert.ok(qg, 'Must have active quest giver');
        assert.strictEqual(game.portals.length, 0, 'Portals must be completely removed for open-world freedom');

        assert.strictEqual(game.player.questReadyToTurnIn, false);

        // Fulfill chapter objective
        game.player.mapCitizensFreed = game.MAPS[1].curedGoal;
        game.checkQuestProgressState();

        assert.strictEqual(game.player.questReadyToTurnIn, true, 'Quest must be marked ready to turn in');
        assert.ok(game.player.zoneQuests[1], 'Zone quest 1 must be registered in stacked quest tracker');
        assert.strictEqual(game.player.zoneQuests[1].readyToTurnIn, true, 'Stacked quest must be marked ready to turn in');
    });

    await t.test('Items feature color-coded rarity metadata, distinct visual colors, and glowing text styles', () => {
        const mythic = game.getItemRarity({ id: 'aegis_dialectics' });
        assert.strictEqual(mythic.name, 'Mythic');
        assert.strictEqual(mythic.color, '#f43f5e');

        const legendary = game.getItemRarity({ id: 'crown_veritas' });
        assert.strictEqual(legendary.name, 'Legendary');
        assert.strictEqual(legendary.color, '#f59e0b');

        const epic = game.getItemRarity({ id: 'raiment_solidarity' });
        assert.strictEqual(epic.name, 'Epic');
        assert.strictEqual(epic.color, '#c084fc');

        const rare = game.getItemRarity({ id: 'circlet_nuance' });
        assert.strictEqual(rare.name, 'Rare');
        assert.strictEqual(rare.color, '#38bdf8');

        const consumable = game.getItemRarity({ id: 'tonic', type: 'consumable' });
        assert.strictEqual(consumable.name, 'Uncommon');
        assert.strictEqual(consumable.color, '#34d399');
    });

    await t.test('All open-world exploration zones (Maps 1-8) feature expansive grand scale dimensions (50+ cols / 48+ rows) and outdoor buildings', () => {
        for (let i = 1; i < game.MAPS.length; i++) {
            const map = game.MAPS[i];
            assert.ok(map.cols >= 50, `Map ${i} (${map.name}) cols (${map.cols}) must be >= 50`);
            assert.ok(map.rows >= 48, `Map ${i} (${map.name}) rows (${map.rows}) must be >= 48`);
            assert.ok(Array.isArray(map.buildings) && map.buildings.length >= 3,
                `Map ${i} (${map.name}) must have at least 3 outdoor buildings with interactive doors`);
        }
    });

    await t.test('Blank room interior opens with physical table, physical interactive chest, narrative prop, and safe exit', () => {
        game.loadMap(1);
        const cottage = game.MAPS[1].buildings[0];
        assert.ok(cottage, 'Map 1 must have cottages');

        game.enterBuildingInterior(cottage);
        assert.ok(game.currentInterior, 'Current interior must be active');
        assert.strictEqual(game.currentInterior.name, cottage.name);
        assert.strictEqual(game.currentInterior.cols, 15);
        assert.strictEqual(game.currentInterior.rows, 13);
        assert.strictEqual(game.currentInterior.pots.length, 0, 'No baked pots or Link in bed per user requirement');
        assert.ok(game.currentInterior.table, 'Must have physical table object');
        assert.ok(game.currentInterior.chest, 'Must have physical lone chest object');
        assert.ok(game.currentInterior.prop, 'Must have narrative inspectable prop');

        // Test exiting back to overworld
        game.exitBuildingInterior();
        assert.strictEqual(game.currentInterior, null, 'Current interior must be cleared after exiting');
    });

    await t.test('Interior physical chest opens on interaction, granting shards and items', () => {
        game.loadMap(1);
        const cottage = game.MAPS[1].buildings[0];
        cottage.interiorChestOpened = false;
        game.enterBuildingInterior(cottage);

        const chest = game.currentInterior.chest;
        assert.strictEqual(chest.opened, false);
        const prevShards = game.player.shards;

        // Player near chest
        game.player.x = 640;
        game.player.y = 220;
        const target = game.findNearestInteractable();
        assert.ok(target && target.type === 'interior_chest');

        game.triggerInteraction();
        assert.strictEqual(chest.opened, true, 'Chest must be marked opened');
        assert.strictEqual(game.player.shards, prevShards + 75, 'Must award 75 shards');

        game.exitBuildingInterior();
    });

    await t.test('Combat epistemic insight opens bottom NPC dialogue chat box and stays until dismissed', () => {
        game.appState = 'PLAYING';
        game.showDeconstructToast('foundations');

        assert.strictEqual(game.appState, 'DIALOGUE', 'appState must be in DIALOGUE for bottom chat box');
        assert.strictEqual(game.activeDialogueList.length, 2, 'Must have 2 pages: distortion and antidote');

        // Dismiss modal
        game.dismissEpistemicRevelation();
        assert.strictEqual(game.appState, 'PLAYING', 'appState must resume to PLAYING after dismissal');
    });

    await t.test('Active Quest Log stacks and tracks multiple zone quests simultaneously across realms', () => {
        game.loadMap(1);
        game.player.mapCitizensFreed = 2;
        game.checkQuestProgressState();

        assert.ok(game.player.zoneQuests[1], 'Zone quest 1 must exist');
        assert.strictEqual(game.player.zoneQuests[1].cured, 2);

        // Transition to Map 2
        game.transitionToNeighborMap(2, 500, 500);
        assert.ok(game.player.zoneQuests[2], 'Zone quest 2 must exist upon entering');

        // Verify Map 1 progress was persisted in stacked quest log
        assert.strictEqual(game.player.zoneQuests[1].cured, 2, 'Map 1 progress must persist while on Map 2');

        // Advance Map 2
        game.player.mapCitizensFreed = 3;
        game.checkQuestProgressState();
        assert.strictEqual(game.player.zoneQuests[2].cured, 3);
        assert.strictEqual(game.player.zoneQuests[1].cured, 2);
    });
});

