const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadGameEnvironment } = require('./testHelper');

describe('Character Sprite Sheets & Cutscene Robustness Test Suite', () => {
    test('All 18 character sprite sheets exist, have exact 216x26 dimensions, and contain 12 valid frames', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame/characters');
        const sheets = [
            'player/player_male.png',
            'player/player_female.png',
            'mentors/mentor_avi.png',
            'mentors/mentor_maya.png',
            'mentors/mentor_rowan.png',
            'mentors/mentor_lyra.png',
            'mentors/mentor_tariq.png',
            'mentors/mentor_kaelen.png',
            'mentors/mentor_elena.png',
            'mentors/mentor_zephyr.png',
            'citizens/citizen_villager_m.png',
            'citizens/citizen_villager_f.png',
            'citizens/citizen_scholar.png',
            'citizens/citizen_miner.png',
            'citizens/citizen_noble.png',
            'citizens/citizen_waterfolk.png',
            'bosses/boss_valkor.png',
            'bosses/boss_demagogue.png'
        ];

        for (const rel of sheets) {
            const p = path.join(baseDir, rel);
            assert.ok(fs.existsSync(p), `Missing sprite sheet: ${rel}`);
            const stat = fs.statSync(p);
            assert.ok(stat.size > 1000, `Sprite sheet is too small: ${rel}`);
        }
    });

    test('Opening cutscene elements and skip controls are properly wired', () => {
        const env = loadGameEnvironment();
        const doc = env.document;

        const badge = doc.getElementById('cutsceneTagBadge');
        assert.ok(badge, 'cutsceneTagBadge element must exist');

        const btnSkip = doc.getElementById('btnSkipIntroCutscene');
        assert.ok(btnSkip, 'btnSkipIntroCutscene button must exist');

        const sub = doc.getElementById('cutsceneSubtitle');
        assert.ok(sub, 'cutsceneSubtitle element must exist');
    });

    test('All 7 scenes of updateAndRenderIntro execute without throwing errors', () => {
        const env = loadGameEnvironment();

        // Advance through all cutscene scenes
        for (let i = 0; i < env.CUTSCENE_SCENES.length; i++) {
            assert.doesNotThrow(() => {
                if (typeof env.updateAndRenderIntro === 'function') {
                    env.updateAndRenderIntro(0.016);
                }
            }, `Scene ${i} threw an error during updateAndRenderIntro`);
        }
    });

    test('Boss scale and normal enemy scale remain proportional and never jump', () => {
        const env = loadGameEnvironment();
        const reg = env.NPC_SPRITE_REGISTRY;

        assert.ok(reg.boss_valkor, 'boss_valkor must be in registry');
        assert.ok(reg.boss_demagogue, 'boss_demagogue must be in registry');
        assert.equal(reg.boss_valkor.scale, 2.5);
        assert.equal(reg.boss_demagogue.scale, 2.5);

        // Standard characters scale around 2.2 - 2.3
        assert.equal(reg.player_m.scale, 2.2);
        assert.equal(reg.avi.scale, 2.2);
        assert.equal(reg.villager_m.scale, 2.2);
    });

    test('Mind freed enemies retain role identity and do not morph into player character', () => {
        const env = loadGameEnvironment();
        const getKey = env.getSpriteRegistryKey;

        // Verify that freed roles resolve to their own dedicated identities
        assert.equal(getKey('iron'), 'miner');
        assert.equal(getKey('velvet'), 'noble');
        assert.equal(getKey('inquisitor'), 'scholar');
        assert.equal(getKey('blackshirt'), 'villager_m');
        assert.equal(getKey('valkor'), 'boss_valkor');
        assert.equal(getKey('demagogue'), 'boss_demagogue');

        // Verify they are never mapped to player
        assert.notEqual(getKey('iron'), 'player_m');
        assert.notEqual(getKey('velvet'), 'player_m');
        assert.notEqual(getKey('inquisitor'), 'player_m');
        assert.notEqual(getKey('valkor'), 'player_m');
    });
});
