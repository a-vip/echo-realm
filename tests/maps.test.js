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
});
