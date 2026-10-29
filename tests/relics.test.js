const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('Paper-Doll & Relic Database Test Suite', async (t) => {
    const game = loadGameEnvironment();

    await t.test('All 8 Paper-Doll slots are defined', () => {
        const expectedSlots = ['head', 'shoulders', 'back', 'chest', 'mainHand', 'offHand', 'hands', 'feet'];
        assert.strictEqual(game.PAPER_DOLL_SLOTS.length, 8);
        const slotIds = game.PAPER_DOLL_SLOTS.map(s => s.id);
        expectedSlots.forEach(expected => {
            assert.ok(slotIds.includes(expected), `Slot ${expected} must exist in PAPER_DOLL_SLOTS`);
        });
    });

    await t.test('All relics in RELIC_DB are well-formed', () => {
        const slotIds = new Set(game.PAPER_DOLL_SLOTS.map(s => s.id));
        const relicEntries = Object.entries(game.RELIC_DB);

        assert.ok(relicEntries.length >= 8, 'RELIC_DB should have at least 8 relics');

        for (const [key, relic] of relicEntries) {
            assert.strictEqual(key, relic.id, `Relic key '${key}' must match relic.id '${relic.id}'`);
            assert.ok(relic.name, `Relic ${key} must have a name`);
            assert.ok(slotIds.has(relic.slot), `Relic ${key} slot '${relic.slot}' must be a valid paper-doll slot`);
            assert.ok(relic.icon, `Relic ${key} must have an icon`);
            assert.ok(relic.visualColor, `Relic ${key} must have visualColor`);
            assert.ok(relic.stat, `Relic ${key} must specify a stat bonus`);
            assert.ok(typeof relic.val === 'number' && relic.val > 0, `Relic ${key} val must be a positive number`);
            assert.ok(relic.desc, `Relic ${key} must have a description`);
        }
    });

    await t.test('Initial player equipment occupies valid slots', () => {
        const playerEquipment = game.player.equipment;
        const validSlots = game.PAPER_DOLL_SLOTS.map(s => s.id);

        for (const [slot, item] of Object.entries(playerEquipment)) {
            assert.ok(validSlots.includes(slot), `Equipment slot ${slot} must be valid`);
            if (item) {
                assert.strictEqual(item.slot, slot, `Item equipped in ${slot} must have matching slot property`);
                assert.ok(item.val > 0, `Initial item in ${slot} must provide positive stat value`);
            }
        }
    });
});

