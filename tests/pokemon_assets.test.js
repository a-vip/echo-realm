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

        // Bosses
        assert.ok(reg.boss_valkor, 'boss_valkor must be defined in registry');
        assert.ok(reg.boss_demagogue, 'boss_demagogue must be defined in registry');
        assert.ok(reg.mob_manosphere, 'mob_manosphere must be defined in registry');
        assert.ok(reg.mob_velvet, 'mob_velvet must be defined in registry');
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
            'citizens/citizen_waterfolk.png',
            'bosses/boss_valkor.png',
            'bosses/boss_demagogue.png',
            'mobs/mob_manosphere.png',
            'mobs/mob_velvet.png'
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
            'portrait_citizen_waterfolk.png',
            'portrait_mob_manosphere.png',
            'portrait_mob_velvet.png'
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
            'armory_bastion.png',
            'cottage_blue_medium.png',
            'cottage_brick_large.png',
            'cottage_red_large.png',
            'cottage_red_medium.png',
            'cottage_stone_small.png',
            'village_inn_long.png'
        ];

        for (const f of expectedBuildings) {
            const p = path.join(bldDir, f);
            assert.ok(fs.existsSync(p), `Missing building sprite on disk: ${f}`);
            const stat = fs.statSync(p);
            assert.ok(stat.size > 1000, `Building sprite file is too small: ${f}`);
        }
        const doorsPath = path.resolve(__dirname, '../assets/ingame/doors/doors_sheet.png');
        assert.ok(fs.existsSync(doorsPath), 'doors_sheet.png must exist on disk');
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
        assert.equal(getKey('iron'), 'mob_manosphere');
        assert.equal(getKey('velvet'), 'mob_velvet');
        assert.equal(getKey('inquisitor'), 'scholar');
        assert.equal(getKey('valkor'), 'boss_valkor');
        assert.equal(getKey('demagogue'), 'boss_demagogue');
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
        assert.ok(assets.images.has('doors_sheet'), 'keep_citadel_fortress must be registered');
        assert.ok(assets.images.has('portrait_boss_demagogue'), 'portrait_boss_demagogue must be registered');
        assert.ok(assets.images.has('char_boss_valkor'), 'char_boss_valkor must be registered');
        assert.ok(assets.images.has('char_boss_demagogue'), 'char_boss_demagogue must be registered');
    });
    test('Character creation provides clean Male and Female character sprite selection', () => {
        const env = loadGameEnvironment();
        const btnMale = env.document.getElementById('btnSelectMale');
        const btnFemale = env.document.getElementById('btnSelectFemale');

        assert.ok(btnMale, '#btnSelectMale must exist in character creator');
        assert.ok(btnFemale, '#btnSelectFemale must exist in character creator');

        // Initial default is male
        assert.equal(env.player.gender || 'male', 'male');
        assert.equal(env.getSpriteRegistryKey('player', { gender: env.player.gender }), 'player_m');

        // Toggle female
        btnFemale.onclick();
        assert.equal(env.player.gender, 'female');
        assert.equal(env.getSpriteRegistryKey('player', { gender: env.player.gender }), 'player_f');

        // Toggle male
        btnMale.onclick();
        assert.equal(env.player.gender, 'male');
        assert.equal(env.getSpriteRegistryKey('player', { gender: env.player.gender }), 'player_m');
    });

    test('Strict validation: Only 7 valid front-facing cottage models exist and no backwards buildings', () => {
        const bldDir = path.resolve(__dirname, '../assets/ingame/buildings');
        const files = fs.readdirSync(bldDir);

        assert.equal(files.length, 7, 'Must have exactly 7 valid cottage building files');

        const forbiddenBackwards = [
            'archive_library_large.png',
            'archive_sanctuary_tower.png',
            'cottage_wood_medium.png',
            'hermitage_lodge.png',
            'keep_citadel_fortress.png',
            'manor_grand.png',
            'temple_shrine.png'
        ];

        for (const bad of forbiddenBackwards) {
            assert.ok(!files.includes(bad), `Backwards/doorless building must NOT exist in buildings: ${bad}`);
        }

        const doorsFile = path.resolve(__dirname, '../assets/ingame/doors/doors_sheet.png');
        assert.ok(fs.existsSync(doorsFile), 'doors_sheet.png must exist in doors directory');
    });

    test('Teleporting to Map 8 is strictly blocked unless citadel is unlocked', () => {
        const env = loadGameEnvironment();
        env.player.citadelUnlocked = false;
        env.player.zoneQuests = { 8: { accepted: false, completed: false } };

        env.teleportPlayerTo(8, 20, 20);
        assert.notEqual(env.currentMapIndex, 8, 'Teleportation to Map 8 must be blocked when citadel is locked');
    });

    test('All 24 dedicated character folders exist and contain sprite.png, animations.png, and trainer.png', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame/characters');
        const expectedChars = [
            'player_male', 'player_female', 'mentor_avi', 'mentor_maya', 'mentor_lyra',
            'mentor_tariq', 'mentor_elena', 'mentor_rowan', 'mentor_kaelen', 'mentor_zephyr',
            'boss_valkor', 'boss_demagogue', 'mob_manosphere', 'mob_velvet', 'mob_inquisitor',
            'mob_border', 'mob_blackshirt', 'mob_masked', 'citizen_villager_m', 'citizen_villager_f',
            'citizen_scholar', 'citizen_miner', 'citizen_noble', 'citizen_waterfolk'
        ];

        for (const cid of expectedChars) {
            const cDir = path.join(baseDir, cid);
            assert.ok(fs.existsSync(cDir), 'Character folder missing: ' + cid);

            const spriteP = path.join(cDir, 'sprite.png');
            assert.ok(fs.existsSync(spriteP), 'Missing sprite.png in ' + cid);
            assert.ok(fs.statSync(spriteP).size > 100, 'sprite.png too small in ' + cid);

            const gridP = path.join(cDir, 'grid.png');
            assert.ok(fs.existsSync(gridP), 'Missing grid.png in ' + cid);
            assert.ok(fs.statSync(gridP).size > 500, 'grid.png too small in ' + cid);

            const animP = path.join(cDir, 'animations.png');
            assert.ok(fs.existsSync(animP), 'Missing animations.png in ' + cid);
            assert.ok(fs.statSync(animP).size > 500, 'animations.png too small in ' + cid);

            const trainerP = path.join(cDir, 'trainer.png');
            assert.ok(fs.existsSync(trainerP), 'Missing trainer.png in ' + cid);
            assert.ok(fs.statSync(trainerP).size > 200, 'trainer.png too small in ' + cid);
        }
    });

    test('Hostile mob roles are registered in NPC_SPRITE_REGISTRY with dedicated sheets and portraits', () => {
        const env = loadGameEnvironment();
        const reg = env.NPC_SPRITE_REGISTRY;

        const mobs = ['mob_inquisitor', 'mob_border', 'mob_blackshirt', 'mob_masked'];
        for (const m of mobs) {
            assert.ok(reg[m], 'Mob ' + m + ' must be defined in NPC_SPRITE_REGISTRY');
            assert.ok(reg[m].sheet, 'Mob ' + m + ' must specify sheet');
            assert.ok(reg[m].portrait, 'Mob ' + m + ' must specify portrait');
            assert.equal(reg[m].frameW, 18);
            assert.equal(reg[m].frameH, 26);
        }
    });

    test('getFacingDirTowards accurately computes cardinal direction towards target', () => {
        const env = loadGameEnvironment();
        const faceFn = env.getFacingDirTowards;
        assert.ok(typeof faceFn === 'function', 'getFacingDirTowards must be a function');

        // Target directly above -> North (1)
        assert.equal(faceFn({ x: 100, y: 100 }, { x: 100, y: 40 }), 1, 'Target above must be North (1)');
        // Target directly below -> South (0)
        assert.equal(faceFn({ x: 100, y: 100 }, { x: 100, y: 160 }), 0, 'Target below must be South (0)');
        // Target to left -> West (2)
        assert.equal(faceFn({ x: 100, y: 100 }, { x: 40, y: 100 }), 2, 'Target left must be West (2)');
        // Target to right -> East (3)
        assert.equal(faceFn({ x: 100, y: 100 }, { x: 160, y: 100 }), 3, 'Target right must be East (3)');
    });

    test('NPC turns to face player upon dialogue interaction', () => {
        const env = loadGameEnvironment();
        const npc = { name: 'Village Guide', x: 100, y: 100, dir: 0, dialogues: ['Hello traveler!'], isQuestGiver: false };
        env.player.x = 100;
        env.player.y = 50; // Player is above NPC

        env.startNpcDialogue(npc);
        assert.equal(npc.dir, 1, 'NPC must turn North (dir: 1) to face player above them');
        assert.equal(env.activeDialogueNpc, npc, 'Active dialogue NPC must be set');
    });

    test('Peacock creature assets exist and are registered with folded tail and walk animations', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame/creatures/peacock');
        const expectedFiles = ['peacock_folded.png', 'peacock_walk.png', 'sprite.png'];
        for (const f of expectedFiles) {
            const p = path.join(baseDir, f);
            assert.ok(fs.existsSync(p), 'Peacock creature file missing: ' + f);
            assert.ok(fs.statSync(p).size > 100, 'Peacock creature file too small: ' + f);
        }

        const env = loadGameEnvironment();
        assert.ok(env.assets.images.has('peacock_folded'), 'peacock_folded must be registered in AssetManager');
        assert.ok(env.assets.images.has('peacock_walk'), 'peacock_walk must be registered in AssetManager');
        assert.ok(env.assets.images.has('peacock_sprite'), 'peacock_sprite must be registered in AssetManager');
    });

    test('Environment tilesets and props exist on disk in assets/ingame/environment/ and are registered in AssetManager', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame/environment');
        const expectedPaths = [
            'tilesets/floors_tiles.png',
            'tilesets/wall_tiles.png',
            'tilesets/dungeon_tiles.png',
            'props/furniture.png',
            'props/interior_props.png',
            'props/interior_walls.png',
            'props/dungeon_props.png',
            'props/esoteric.png',
            'props/alchemy_station.png',
            'props/bonfire.png',
            'props/furnace.png',
            'props/workbench.png',
            'interiors/interiors_sheet.png',
            'interiors/room_builder.png'
        ];

        for (const rel of expectedPaths) {
            const p = path.join(baseDir, rel);
            assert.ok(fs.existsSync(p), 'Missing environment asset on disk: ' + rel);
            assert.ok(fs.statSync(p).size > 500, 'Environment asset too small: ' + rel);
        }

        const env = loadGameEnvironment();
        const expectedKeys = [
            'floors_tiles', 'wall_tiles', 'dungeon_tiles',
            'furniture_sheet', 'interior_props_sheet', 'interior_walls_sheet',
            'dungeon_props_sheet', 'esoteric_sheet', 'alchemy_station_sheet',
            'bonfire_sheet', 'furnace_sheet', 'workbench_sheet',
            'interiors_sheet', 'room_builder_sheet',
            'wood_interior_set', 'simple_city_tiles', 'metro_tiles',
            'metro_roads', 'metro_trees', 'fire_station', 'police_station', 'metro_building'
        ];
        for (const k of expectedKeys) {
            assert.ok(env.assets.images.has(k), 'Environment/City asset must be registered in AssetManager: ' + k);
        }
    });

    test('New City, Interior and HMG character assets exist on disk in assets/ingame/', () => {
        const baseDir = path.resolve(__dirname, '../assets/ingame');
        const expectedFiles = [
            'environment/props/wood_interior_set.png',
            'environment/city/simple_city_tiles.png',
            'environment/city/metro_tiles.png',
            'environment/city/metro_roads.png',
            'environment/city/metro_trees.png',
            'environment/city/buildings/fire_station.png',
            'environment/city/buildings/police_station.png',
            'environment/city/buildings/metro_building.png'
        ];
        for (const f of expectedFiles) {
            const p = path.join(baseDir, f);
            assert.ok(fs.existsSync(p), 'File must exist on disk: ' + f);
            assert.ok(fs.statSync(p).size > 100, 'File must not be empty: ' + f);
        }

        const hmgDir = path.join(baseDir, 'characters/hmg');
        assert.ok(fs.existsSync(hmgDir), 'HMG characters directory must exist');
        const hmgFiles = fs.readdirSync(hmgDir).filter(f => f.endsWith('.png'));
        assert.ok(hmgFiles.length >= 11, 'Must have at least 11 HMG character sheets, got: ' + hmgFiles.length);
    });

    test('Combat stability: drawCharacterSprite with isMindFreed=true and resetGameState execute without errors', () => {
        const env = loadGameEnvironment();
        // Test drawCharacterSprite with isMindFreed: true
        const mockCtx = {
            save: () => {}, restore: () => {}, beginPath: () => {}, closePath: () => {},
            moveTo: () => {}, lineTo: () => {}, stroke: () => {}, fill: () => {},
            arc: () => {}, ellipse: () => {}, fillRect: () => {}, strokeRect: () => {},
            clearRect: () => {}, quadraticCurveTo: () => {}, fillText: () => {},
            measureText: () => ({ width: 10 }), createLinearGradient: () => ({ addColorStop: () => {} }),
            drawImage: () => {}, translate: () => {}, rotate: () => {}, scale: () => {}
        };
        assert.doesNotThrow(() => {
            env.drawCharacterSprite(mockCtx, 100, 100, 2.3, { role: 'citizen', isMindFreed: true });
            env.drawCharacterSprite(mockCtx, 100, 100, 2.3, { role: 'masked', isMindFreed: true });
            env.drawCharacterSprite(mockCtx, 100, 100, 2.3, { role: 'player', isMindFreed: false });
        }, 'drawCharacterSprite with isMindFreed: true must never throw ReferenceError');

        // Test resetGameState
        assert.doesNotThrow(() => {
            env.player.hp = 10;
            env.player.cdE = 5;
            env.resetGameState(true);
            assert.equal(env.player.hp, 120, 'Player HP must be reset to 120');
            assert.equal(env.player.cdE, 0, 'Player cdE must be reset to 0');
            assert.equal(env.appState, 'PLAYING', 'appState must be PLAYING');
        }, 'resetGameState must execute cleanly and restore default state');
    });

    test('Peacock creatures spawn in Map 1 with natural idle/flee/walk behaviors', () => {
        const env = loadGameEnvironment();
        env.loadMap(1);
        const peacocks = env.critters.filter(c => c.type === 'peacock');
        assert.ok(peacocks.length >= 2, 'Map 1 must spawn at least 2 peacocks in the village gardens');
        for (const p of peacocks) {
            assert.ok(['idle', 'walk', 'flee'].includes(p.state), 'Peacock must have valid state');
            assert.ok(typeof p.x === 'number' && typeof p.y === 'number', 'Peacock must have valid coordinates');
        }
    });
});
