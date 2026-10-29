const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('Combat Math & Stat Progression Test Suite', async (t) => {
    const game = loadGameEnvironment();

    await t.test('Base stats + equipment bonuses compute correctly', () => {
        // Initial setup:
        // base player.maxHp = 120, init_tunic gives +25 => total 145
        // base player.contextPower = 85, init_prism gives +15 => total 100
        // base player.axiomAttack = 38, init_crest gives +10 => total 48
        // base player.defense = 5, no defense gear => total 5
        // base player.speed = 210, init_boots gives +20 => total 230

        assert.strictEqual(game.getTotalMaxHp(), 145);
        assert.strictEqual(game.getTotalContextPower(), 100);
        assert.strictEqual(game.getTotalAxiomAttack(), 48);
        assert.strictEqual(game.getTotalDefense(), 5);
        assert.strictEqual(game.getTotalSpeed(), 230);
    });

    await t.test('Temper level increases all combat stats', () => {
        const initialHp = game.getTotalMaxHp();
        const initialPower = game.getTotalContextPower();
        const initialAtk = game.getTotalAxiomAttack();

        game.player.temperLevel = 2;

        assert.strictEqual(game.getTotalMaxHp(), initialHp + 2 * 15);
        assert.strictEqual(game.getTotalContextPower(), initialPower + 2 * 8);
        assert.strictEqual(game.getTotalAxiomAttack(), initialAtk + 2 * 6);
    });
});
