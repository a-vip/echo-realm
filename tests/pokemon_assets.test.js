const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadGameEnvironment } = require('./testHelper');

describe('Pokemon-Style NPC Sprites & Sliced Cottage Architecture Test Suite', () => {
    test('NPC_SPRITE_REGISTRY defines all core player and regional mentor character models', () => {
        const env = loadGameEnvironment();
        const reg = env.NPC_SPRITE_REGISTRY;

        assert.ok(reg, 'NPC_SPRITE_REGISTRY must be defined');
        
        // Player models
        assert.ok(reg.player_m, 'player_m must be defined in registry');
        assert.ok(reg.player_f, 'player_f must be defined in registry');
        assert.equal(reg.player_m.frameW, 18);
        assert.equal(reg.player_m.frameH, 26);

        // Mentors
        const mentors = ['avi', 'maya', 'lyra', 'tariq', 'elena', 'rowan', 'kael', 'zephyr'];
        for (const m of mentors) {
            assert.ok(reg[m], `Mentor ${m} must be defined in registry`);
            assert.ok(reg[m].sheet, `Mentor ${m} must specify a sprite sheet ID`);
            assert.ok(reg[m].portrait, `Mentor ${m} must specify a portrait ID`);
            assert.equal(reg[m].frameW, 18);
            assert.equal(reg[m].frameH, 26);
        }

        // Sector factions & citizens
        const citizens = ['villager_m', 'villager_f', 'scholar', 'miner', 'noble', 'waterfolk'];
        for (const c of citizens) {
            assert.ok(reg[c], `Citizen role ${c} must be defined in registry`);
            assert.equal(reg[c].frameW, 18);
            assert.equal(reg[c].frameH, 26);
        }
    });

    test('All active in-game character sprite sheets exist on disk in assets/ingame/characters/', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame/characters');
        
        const expectedSheets = [
            'player/player_male.png',
            'player/player_female.png',
            'mentors/mentor_avi.png',
            'mentors/mentor_maya.png',
            'mentors/mentor_lyra.png',
            'mentors/mentor_tariq.png',
            'mentors/mentor_elena.png',
            'mentors/mentor_rowan.png',
            'mentors/mentor_kaelen.png',
            'mentors/mentor_zephyr.png',
            'citizens/citizen_villager_m.png',
            'citizens/citizen_villager_f.png',
            'citizens/citizen_scholar.png',
            'citizens/citizen_miner.png',
            'citizens/citizen_noble.png',
            'citizens/citizen_waterfolk.png'
        ];

        for (const rel of expectedSheets) {
            const p = path.join(baseDir, rel);
            assert.ok(fs.existsSync(p), `Missing character sheet on disk: ${rel}`);
            const stat = fs.statSync(p);
            assert.ok(stat.size > 500, `Character sheet file is too small: ${rel}`);
        }
    });

    test('All 64x64 trainer dialogue portraits exist on disk in assets/ingame/characters/portraits/', () => {
        const portDir = path.resolve(__dirname, '../assets/ingame/characters/portraits');

        const expectedPortraits = [
            'portrait_player_m.png',
            'portrait_player_f.png',
            'portrait_avi.png',
            'portrait_maya.png',
            'portrait_lyra.png',
            'portrait_tariq.png',
            'portrait_elena.png',
            'portrait_rowan.png',
            'portrait_kaelen.png',
            'portrait_zephyr.png',
            'portrait_boss_valkor.png',
            'portrait_boss_demagogue.png',
            'portrait_citizen_villager_m.png',
            'portrait_citizen_villager_f.png',
            'portrait_citizen_scholar.png',
            'portrait_citizen_miner.png',
            'portrait_citizen_noble.png',
            'portrait_citizen_waterfolk.png'
        ];

        for (const f of expectedPortraits) {
            const p = path.join(portDir, f);
            assert.ok(fs.existsSync(p), `Missing portrait on disk: ${f}`);
            const stat = fs.statSync(p);
            assert.ok(stat.size > 200, `Portrait file is too small: ${f}`);
        }
    });

    test('All sliced cottage building sprites exist on disk in assets/ingame/buildings/', () => {
        const bldDir = path.resolve(__dirname, '../assets/ingame/buildings');

        const expectedBuildings = [
            'cottage_stone_small.png',
            'cottage_wood_medium.png',
            'cottage_red_large.png',
            'cottage_blue_medium.png',
            'cottage_red_medium.png',
            'village_inn_long.png',
            'archive_library_large.png',
            'archive_sanctuary_tower.png',
            'cottage_brick_large.png',
            'armory_bastion.png',
            'hermitage_lodge.png',
            'manor_grand.png',
            'keep_citadel_fortress.png',
            'temple_shrine.png'
        ];

        for (const f of expectedBuildings) {
            const p = path.join(bldDir, f);
            assert.ok(fs.existsSync(p), `Missing building sprite on disk: ${f}`);
            const stat = fs.statSync(p);
            assert.ok(stat.size > 1000, `Building sprite file is too small: ${f}`);
        }
    });

    test('Directional frame column calculator computes correct 4-direction walk and idle frames', () => {
        const env = loadGameEnvironment();
        const getCol = env.getPokemonSpriteFrameCol;
        assert.ok(typeof getCol === 'function', 'getPokemonSpriteFrameCol must be a function');

        // South (dir 0): Frame 1 is idle, Frames 0 and 2 are walk
        assert.equal(getCol(0, false, 0), 1, 'South idle should be frame col 1');
        assert.equal(getCol(0, true, 0), 0, 'South walk step 0 should be col 0');
        assert.equal(getCol(0, true, 1), 1, 'South walk step 1 should be col 1');
        assert.equal(getCol(0, true, 2), 2, 'South walk step 2 should be col 2');
        assert.equal(getCol(0, true, 3), 1, 'South walk step 3 should be col 1');

        // East (dir 3): Frame 4 is idle, Frames 3 and 5 are walk
        assert.equal(getCol(3, false, 0), 4, 'East idle should be frame col 4');
        assert.equal(getCol(3, true, 0), 3, 'East walk step 0 should be col 3');
        assert.equal(getCol(3, true, 2), 5, 'East walk step 2 should be col 5');

        // West (dir 2): Frame 7 is idle, Frames 6 and 8 are walk
        assert.equal(getCol(2, false, 0), 7, 'West idle should be frame col 7');
        assert.equal(getCol(2, true, 0), 6, 'West walk step 0 should be col 6');
        assert.equal(getCol(2, true, 2), 8, 'West walk step 2 should be col 8');

        // North (dir 1): Frame 10 is idle, Frames 9 and 11 are walk
        assert.equal(getCol(1, false, 0), 10, 'North idle should be frame col 10');
        assert.equal(getCol(1, true, 0), 9, 'North walk step 0 should be col 9');
        assert.equal(getCol(1, true, 2), 11, 'North walk step 2 should be col 11');
    });

    test('getSpriteRegistryKey correctly resolves role mappings for all regional mentors and citizens', () => {
        const env = loadGameEnvironment();
        const getKey = env.getSpriteRegistryKey;
        assert.ok(typeof getKey === 'function', 'getSpriteRegistryKey must be a function');

        assert.equal(getKey('player', { gender: 'male' }), 'player_m');
        assert.equal(getKey('player', { gender: 'female' }), 'player_f');
        assert.equal(getKey('avi'), 'avi');
        assert.equal(getKey('maya'), 'maya');
        assert.equal(getKey('lyra'), 'lyra');
        assert.equal(getKey('tariq'), 'tariq');
        assert.equal(getKey('elena'), 'elena');
        assert.equal(getKey('rowan'), 'rowan');
        assert.equal(getKey('kael'), 'kael');
        assert.equal(getKey('zephyr'), 'zephyr');
        assert.equal(getKey('iron'), 'miner');
        assert.equal(getKey('velvet'), 'noble');
        assert.equal(getKey('inquisitor'), 'scholar');
    });

    test('AssetManager provides registerPokemonSheet, hasPokemonSheet, and drawPokemonSprite methods', () => {
        const env = loadGameEnvironment();
        const assets = env.assets;

        assert.ok(typeof assets.registerPokemonSheet === 'function');
        assert.ok(typeof assets.hasPokemonSheet === 'function');
        assert.ok(typeof assets.drawPokemonSprite === 'function');

        // Verify key in-game sheets are registered in AssetManager
        assert.ok(assets.images.has('char_player_m'), 'char_player_m must be registered');
        assert.ok(assets.images.has('char_mentor_avi'), 'char_mentor_avi must be registered');
        assert.ok(assets.images.has('char_mentor_maya'), 'char_mentor_maya must be registered');
        assert.ok(assets.images.has('cottage_red_medium'), 'cottage_red_medium must be registered');
        assert.ok(assets.images.has('keep_citadel_fortress'), 'keep_citadel_fortress must be registered');
        assert.ok(assets.images.has('portrait_boss_demagogue'), 'portrait_boss_demagogue must be registered');
    });
});
