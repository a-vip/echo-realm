const test = require('node:test');
const assert = require('node:assert');
const { loadGameEnvironment } = require('./testHelper.js');

test('Audio, Atmosphere & Visual Systems Test Suite', async (t) => {
    const game = loadGameEnvironment();

    t.after(() => {
        if (game.audio) game.audio.stopMusic();
    });

    await t.test('All Zone BGM chiptune tracks are configured', () => {
        const expectedTracks = ['archive', 'valley', 'pastoral', 'divide', 'catacombs', 'border', 'citadel'];
        expectedTracks.forEach(trackKey => {
            const track = game.ZONE_BGM_TRACKS[trackKey];
            assert.ok(track, `Track '${trackKey}' must exist in ZONE_BGM_TRACKS`);
            assert.ok(track.tempo > 0, `Track '${trackKey}' must have positive tempo`);
            assert.ok(Array.isArray(track.notes) && track.notes.length > 0, `Track '${trackKey}' must have melody notes`);
            assert.ok(Array.isArray(track.bass) && track.bass.length > 0, `Track '${trackKey}' must have bass notes`);
            assert.ok(track.type, `Track '${trackKey}' must specify lead waveform type`);
            assert.ok(track.bassType, `Track '${trackKey}' must specify bass waveform type`);
        });
    });

    await t.test('Material-based footstep synthesizer responds to all terrain types', () => {
        const materials = ['grass', 'stone', 'wood', 'water', 'flower', 'hazard'];
        materials.forEach(mat => {
            assert.doesNotThrow(() => {
                game.audio.playFootstep(mat);
            }, `Footstep for material '${mat}' should execute without throwing`);
        });
    });

    await t.test('AssetManager provides plug-and-play sprite sheet & tileset registry', () => {
        assert.ok(game.assets, 'AssetManager instance must be available');
        assert.strictEqual(typeof game.assets.registerSpriteSheet, 'function');
        assert.strictEqual(typeof game.assets.registerTileSet, 'function');
        assert.strictEqual(typeof game.assets.hasSpriteSheet, 'function');
        assert.strictEqual(typeof game.assets.hasTileSet, 'function');
        assert.strictEqual(typeof game.assets.drawSprite, 'function');
        assert.strictEqual(typeof game.assets.drawTile, 'function');

        // Test registration
        const sheet = game.assets.registerSpriteSheet('custom_hero', 'assets/sprites/hero.png', 16, 20);
        assert.strictEqual(sheet.id, 'custom_hero');
        assert.strictEqual(sheet.frameW, 16);
        assert.strictEqual(sheet.frameH, 20);
    });

    await t.test('Dynamic Minimap Fog of War initializes and reveals exploration tiles', () => {
        game.loadMap(0);
        const fog = game.fogGrid;
        assert.strictEqual(fog.length, game.MAP_ROWS, 'Fog grid rows must match MAP_ROWS');
        assert.strictEqual(fog[0].length, game.MAP_COLS, 'Fog grid cols must match MAP_COLS');

        // Verify spawn tile is revealed
        const pCol = Math.floor(game.player.x / game.TILE_SIZE);
        const pRow = Math.floor(game.player.y / game.TILE_SIZE);
        assert.strictEqual(fog[pRow][pCol], true, 'Player spawn tile must be revealed');

        // Verify far corner is initially unrevealed
        assert.strictEqual(fog[1][1], false, 'Unvisited far corner tile should be hidden in fog');

        // Test revealFogAround
        game.revealFogAround(2 * game.TILE_SIZE, 2 * game.TILE_SIZE, 3);
        assert.strictEqual(fog[2][2], true, 'Revealed tile must be marked true');
    });

    await t.test('Thematic environmental hazard tiles (Outrage Vent 10, Stasis Rune 11) exist on contested maps', () => {
        // Map 1: Performative Valley
        game.loadMap(1);
        let hasHazardMap1 = false;
        for (let r = 0; r < game.MAP_ROWS; r++) {
            for (let c = 0; c < game.MAP_COLS; c++) {
                if (game.mapGrid[r][c] === 10) hasHazardMap1 = true;
            }
        }
        assert.strictEqual(hasHazardMap1, true, 'Map 1 should feature Outrage Vents (Tile 10)');

        // Map 4: Dogma Catacombs
        game.loadMap(4);
        let hasHazardMap4 = false;
        for (let r = 0; r < game.MAP_ROWS; r++) {
            for (let c = 0; c < game.MAP_COLS; c++) {
                if (game.mapGrid[r][c] === 11) hasHazardMap4 = true;
            }
        }
        assert.strictEqual(hasHazardMap4, true, 'Map 4 should feature Dogmatic Stasis Runes (Tile 11)');
    });
});
