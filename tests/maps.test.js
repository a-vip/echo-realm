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
});

