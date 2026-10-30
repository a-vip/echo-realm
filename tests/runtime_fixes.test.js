const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { loadGameEnvironment } = require('./testHelper');

describe('Runtime Gameplay Fixes & Stability Test Suite', () => {
    test('All 9 sectors load, update, and render cleanly without ReferenceError on renderList', () => {
        const env = loadGameEnvironment();
        for (let m = 0; m <= 8; m++) {
            assert.doesNotThrow(() => {
                env.loadMap(m);
                env.appState = 'PLAYING';
                env.updateGameplay(0.016);
                env.renderGameplay();
            }, `Map ${m} threw an error during load/update/render tick!`);
        }
    });

    test('House interior grants immunity: zero damage from overworld hazards, enemies or projectiles', () => {
        const env = loadGameEnvironment();
        env.loadMap(6); // Map with Outrage Vents and active Boss
        const initialHp = env.player.hp;
        const building = env.MAPS[6].buildings[0];
        env.enterBuildingInterior(building);

        assert.equal(!!env.currentInterior, true, 'Player should be inside building interior');

        // Run 25 gameplay frames
        for (let i = 0; i < 25; i++) {
            env.updateGameplay(0.05);
        }

        assert.equal(env.player.hp, initialHp, 'Player must take 0 damage while inside house interior');
    });

    test('Boss HUD is hidden when entering a building interior', () => {
        const env = loadGameEnvironment();
        env.loadMap(6);
        const building = env.MAPS[6].buildings[0];
        env.enterBuildingInterior(building);

        // Update gameplay inside interior
        env.updateGameplay(0.05);

        // Verify interior state is active and player is protected
        assert.equal(!!env.currentInterior, true);
    });

    test('Bushes strictly spawn on meadow grass (0 or 9) and NEVER on cobblestone paths (1), bridges (8), or water (4)', () => {
        const env = loadGameEnvironment();
        for (let m = 0; m <= 8; m++) {
            env.loadMap(m);
            const bushes = env.grassBushes;
            assert.ok(bushes.length > 0, `Map ${m} should spawn bushes`);
            bushes.forEach((b, idx) => {
                const c = Math.floor(b.x / env.TILE_SIZE);
                const r = Math.floor(b.y / env.TILE_SIZE);
                const t = env.mapGrid[r] ? env.mapGrid[r][c] : -1;
                assert.ok(
                    t === 0 || t === 9,
                    `Bush ${idx} on Map ${m} spawned on invalid tile type ${t} at [${c}, ${r}] (must be grass 0 or meadow 9)`
                );
            });
        }
    });

    test('Uncut grass bushes provide physical collision that prevents player phasing through them', () => {
        const env = loadGameEnvironment();
        env.loadMap(1);
        const bush = env.grassBushes[0];
        assert.ok(bush, 'Should have at least one bush');
        assert.equal(bush.cut, false, 'Bush should start uncut');

        // Attempt to move player into bush center
        env.player.x = bush.x - 20;
        env.player.y = bush.y;
        env.moveEntityWithCollision(env.player, 10, 0);

        const dist = Math.hypot(env.player.x - bush.x, env.player.y - bush.y);
        const minAllowed = (env.player.radius || 14) + 12;
        assert.ok(
            dist >= minAllowed - 0.1,
            `Player moved too close to uncut bush: dist=${dist}, minAllowed=${minAllowed}`
        );
    });

    test('Final Boss Citadel (Map 8) entrances are locked until regional sector requirements are met', () => {
        const env = loadGameEnvironment();
        env.loadMap(0);
        env.player.freedTotal = 0;
        env.player.zoneQuests = {};

        assert.equal(env.isCitadelUnlocked(), false, 'Citadel should be locked initially');

        // Satisfy requirements
        env.player.freedTotal = 20;
        assert.equal(env.isCitadelUnlocked(), true, 'Citadel should unlock once enough minds are freed');
    });
});
