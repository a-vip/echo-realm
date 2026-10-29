const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('Systemic Difficulty Profiles Test Suite', async (t) => {
    const game = loadGameEnvironment();

    await t.test('4 Difficulty profiles exist', () => {
        assert.strictEqual(game.DIFFICULTY_PROFILES.length, 4);
    });

    await t.test('Difficulty profiles scale multipliers appropriately', () => {
        game.DIFFICULTY_PROFILES.forEach((profile, index) => {
            assert.strictEqual(profile.id, index);
            assert.ok(profile.name);
            assert.ok(/^#[0-9a-fA-F]{6}$/.test(profile.skinHex), `skinHex ${profile.skinHex} must be valid hex`);
            assert.ok(/^#[0-9a-fA-F]{6}$/.test(profile.skinShadow), `skinShadow ${profile.skinShadow} must be valid hex`);
            assert.ok(profile.aggroMult > 0);
            assert.ok(profile.dmgTakenMult > 0);
            assert.ok(profile.shardMult > 0);
            assert.ok(profile.xpMult > 0);
        });

        // Easy vs Expert comparisons
        const easy = game.DIFFICULTY_PROFILES[0];
        const expert = game.DIFFICULTY_PROFILES[3];

        assert.ok(easy.aggroMult < expert.aggroMult, 'Expert should have higher enemy aggro range');
        assert.ok(easy.dmgTakenMult < expert.dmgTakenMult, 'Expert should take more damage');
        assert.ok(expert.xpMult > easy.xpMult, 'Expert should reward higher bonus EXP for overcoming systemic barriers');
    });
});

