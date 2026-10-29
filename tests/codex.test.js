const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('Educational Codex & Story Lore Test Suite', async (t) => {
    const game = loadGameEnvironment();

    await t.test('All 9 maps map to valid Codex entries', () => {
        game.MAPS.forEach((map, index) => {
            assert.ok(map.codexKey, `Map ${index} must have a codexKey`);
            assert.ok(game.CODEX_ENTRIES[map.codexKey],
                `Map ${index} codexKey '${map.codexKey}' must exist in CODEX_ENTRIES`);
        });
    });

    await t.test('Every Codex entry contains complete educational and antidote metadata', () => {
        const codexList = Object.values(game.CODEX_ENTRIES);
        assert.strictEqual(codexList.length, 9, 'Must have 9 progressive codex entries');

        codexList.forEach(entry => {
            assert.ok(entry.id, 'Entry must have id');
            assert.ok(entry.title, `Entry ${entry.id} must have title`);
            assert.ok(entry.icon, `Entry ${entry.id} must have icon`);
            assert.ok(entry.hook, `Entry ${entry.id} must have hook`);
            assert.ok(entry.mechanism, `Entry ${entry.id} must have mechanism`);
            assert.ok(Array.isArray(entry.fallacies) && entry.fallacies.length > 0,
                `Entry ${entry.id} must have fallacies`);
            assert.ok(entry.antidote, `Entry ${entry.id} must have antidote`);
            assert.ok(Array.isArray(entry.deconstructions) && entry.deconstructions.length > 0,
                `Entry ${entry.id} must have deconstructions`);
            entry.deconstructions.forEach(d => {
                assert.ok(d.myth, `Deconstruction in ${entry.id} must have myth`);
                assert.ok(d.truth, `Deconstruction in ${entry.id} must have truth`);
            });
        });
    });

    await t.test('Cutscene prologue contains 7 progressive narrative scenes', () => {
        assert.strictEqual(game.CUTSCENE_SCENES.length, 7);
        game.CUTSCENE_SCENES.forEach((scene, index) => {
            assert.ok(scene.tag.includes(`${index + 1} / 7`), `Scene ${index + 1} tag must indicate sequence`);
            assert.ok(scene.text && scene.text.length > 20, `Scene ${index + 1} must have descriptive text`);
        });
    });
});

