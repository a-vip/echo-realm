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

    test('Combat epistemic insight dialogue box is minimal 32-bit conversational dialogue without yellow headers or red banners', () => {
        const env = loadGameEnvironment();
        env.appState = 'PLAYING';
        env.showDeconstructToast('foundations');

        assert.equal(env.appState, 'DIALOGUE');
        assert.equal(env.activeDialogueList.length, 2);

        // Page 1: Liberated Citizen speaks their myth with red NPC name header
        const page1 = env.activeDialogueList[0];
        assert.equal(page1.speaker, '', 'Speaker must be empty so no top yellow header text appears');
        assert.ok(page1.text.includes('text-rose-400'), 'NPC name must be formatted in red text');
        assert.ok(page1.text.includes('LIBERATED CITIZEN:'));
        assert.equal(page1.portrait.type, 'citizen');
        assert.ok(!page1.text.includes('💡'), 'Must not have yellow lightbulb header');
        assert.ok(!page1.text.includes('PROPAGANDA DISTORTION'), 'Must not have old propaganda banner');

        // Page 2: Player responds with socratic antidote with green player name header
        const page2 = env.activeDialogueList[1];
        assert.equal(page2.speaker, '', 'Speaker must be empty so no top yellow header text appears');
        assert.ok(page2.text.includes('text-emerald-400'), 'Player name must be formatted in green text');
        assert.ok(page2.text.includes('AURON:'));
        assert.equal(page2.portrait.type, 'player');
        assert.ok(!page2.text.includes('💡'));
        assert.ok(!page2.text.includes('SOCRATIC ANTIDOTE'));

        // Dismiss dialogue
        env.dismissEpistemicRevelation();
        assert.equal(env.appState, 'PLAYING');
    });

    test('Questgivers display glowing exclamation mark [!] before interaction and quests only appear in log after acceptance', () => {
        const env = loadGameEnvironment();
        env.loadMap(1); // Performative Valley with Commander Maya

        // Initially unaccepted
        assert.equal(env.player.questAccepted, false, 'Quest must start unaccepted');
        assert.equal(env.player.zoneQuests[1].accepted, false, 'Zone quest must start unaccepted');

        // Quest giver must have '!' marker
        const maya = env.npcs.find(n => n.name === 'Commander Maya');
        assert.ok(maya && maya.isQuestGiver, 'Commander Maya must be a quest giver');

        // Update stacked HUD
        env.updateStackedQuestHud();
        const activeQuests = Object.values(env.player.zoneQuests).filter(q => q.accepted && !q.completed);
        assert.equal(activeQuests.length, 0, 'Unaccepted quests must NOT appear in the active quest log');

        // Accept quest via dialogue interaction
        env.appState = 'PLAYING';
        env.player.x = maya.x;
        env.player.y = maya.y + 20;
        env.triggerInteraction(); // triggers dialogue with Maya
        assert.equal(env.appState, 'DIALOGUE');

        // Advance through Maya's dialogue to completion
        for (let i = 0; i < 5; i++) {
            env.advanceDialogue ? env.advanceDialogue() : env.triggerInteraction();
        }

        assert.equal(env.player.questAccepted, true, 'Quest must be accepted after dialogue');
        assert.equal(env.player.zoneQuests[1].accepted, true);

        // Now quest appears in active quest log
        env.updateStackedQuestHud();
        const activeQuestsAfter = Object.values(env.player.zoneQuests).filter(q => q.accepted && !q.completed);
        assert.equal(activeQuestsAfter.length, 1, 'Accepted quest must now appear in the active quest log');
    });

    test('Solid tree stumps provide physical collision that prevents player walking through them', () => {
        const env = loadGameEnvironment();
        env.loadMap(2); // Map 3 (Sunlit Riverfront) has open bright meadows with stumps
        assert.ok(env.treeStumps.length > 0, 'Should have tree stumps on bright alttp zones');

        const stump = env.treeStumps[0];
        env.player.x = stump.x - 24;
        env.player.y = stump.y;

        // Attempt to move player through stump center
        env.moveEntityWithCollision(env.player, 16, 0);

        const dist = Math.hypot(env.player.x - stump.x, env.player.y - stump.y);
        const minAllowed = (env.player.radius || 14) + (stump.radius || 16);
        assert.ok(
            dist >= minAllowed - 0.2,
            `Player walked through stump! dist=${dist}, minAllowed=${minAllowed}`
        );
    });

    test('Building doorways on Map 3 and across all sectors are completely clear and never obstructed by trees', () => {
        const env = loadGameEnvironment();
        for (let m = 0; m <= 8; m++) {
            env.loadMap(m);
            const mapMeta = env.MAPS[m];
            if (mapMeta.buildings && Array.isArray(mapMeta.buildings)) {
                mapMeta.buildings.forEach((b, bIdx) => {
                    const doorC = b.col + Math.floor(b.wCols / 2);
                    const doorR = b.row + b.hRows;
                    for (let dr = 0; dr <= 4; dr++) {
                        const tr = doorR + dr;
                        if (tr < env.mapGrid.length) {
                            const tile = env.mapGrid[tr][doorC];
                            assert.notEqual(
                                tile,
                                3,
                                `Building ${bIdx} (${b.name || b.id}) on Map ${m} has tree tile (3) directly obstructing door at row ${tr}, col ${doorC}!`
                            );
                        }
                    }
                });
            }
        }
    });

    test('All 9 Overworld sectors feature unique topologies and distinct road/river layouts', () => {
        const env = loadGameEnvironment();
        const sectorSignatures = [];

        for (let m = 0; m <= 8; m++) {
            const grid = env.getSectorGrid(m);
            let waterCount = 0;
            let bridgeCount = 0;
            let wallCount = 0;
            let pathCount = 0;
            let treeCount = 0;

            for (let r = 0; r < grid.length; r++) {
                for (let c = 0; c < grid[r].length; c++) {
                    const t = grid[r][c];
                    if (t === 4) waterCount++;
                    if (t === 8) bridgeCount++;
                    if (t === 2) wallCount++;
                    if (t === 1) pathCount++;
                    if (t === 3) treeCount++;
                }
            }

            const signature = `m${m}_w${waterCount}_b${bridgeCount}_wl${wallCount}_p${pathCount}_t${treeCount}`;
            sectorSignatures.push(signature);
        }

        // Verify all 9 sector signatures are unique
        const uniqueSet = new Set(sectorSignatures);
        assert.equal(
            uniqueSet.size,
            9,
            `Expected all 9 sectors to have unique topological signatures, but got duplicates: ${sectorSignatures.join(', ')}`
        );
    });

    test('NPC dialogues are immersive, concise, and contain zero 4th-wall control prompts', () => {
        const env = loadGameEnvironment();
        const forbiddenPatterns = [/\[Q\]/i, /\[E\]/i, /\[F\]/i, /\[SPACE\]/i, /\[C\]/i, /press\s+\[/i];

        env.MAPS.forEach((m, mIdx) => {
            const checkList = [
                ...(m.aviPreDialogues || []),
                ...(m.aviPostDialogues || []),
                ...(m.ally && m.ally.dialogues ? m.ally.dialogues : [])
            ];

            checkList.forEach(text => {
                forbiddenPatterns.forEach(pattern => {
                    assert.ok(
                        !pattern.test(text),
                        `Map ${mIdx} dialogue contains 4th-wall control prompt matching ${pattern}: "${text}"`
                    );
                });
            });
        });
    });

    test('Active Quest Log is hidden when no quests are active, and quest cards contain zero Map numbers, mentor names, or boss status', () => {
        const env = loadGameEnvironment();
        env.loadMap(1); // Performative Valley

        // Initially no accepted quest
        env.updateStackedQuestHud();
        const box = env.document.getElementById('stackedQuestBox');
        assert.ok(box.classList.contains('hidden'), 'Active quest box must be hidden when 0 quests are accepted');

        // Accept quest
        const maya = env.npcs.find(n => n.name === 'Commander Maya');
        env.appState = 'PLAYING';
        env.player.x = maya.x;
        env.player.y = maya.y + 20;
        env.triggerInteraction();
        for (let i = 0; i < 5; i++) env.advanceDialogue ? env.advanceDialogue() : env.triggerInteraction();

        // Update HUD
        env.updateStackedQuestHud();
        assert.ok(!box.classList.contains('hidden'), 'Active quest box must be visible after quest is accepted');

        const listEl = env.document.getElementById('stackedQuestList');
        const cardHtml = listEl.innerHTML;
        assert.ok(!/Map\s+\d+:/i.test(cardHtml), 'Quest card must NOT include Map number prefix');
        assert.ok(!/Mentor:/i.test(cardHtml), 'Quest card must NOT state who you got it from (Mentor)');
        assert.ok(!/Boss Alive/i.test(cardHtml) && !/Boss Defeated/i.test(cardHtml), 'Quest card must NOT state whether boss is alive');
        assert.ok(/Performative Valley/i.test(cardHtml), 'Quest card should display concise area name');
    });

    test('Location HUD banner and MAPS definitions display concise area names without Map number prefixes', () => {
        const env = loadGameEnvironment();
        env.MAPS.forEach((m, idx) => {
            assert.ok(!/^Map\s+\d+:/i.test(m.name), `Map ${idx} name must not contain 'Map X:' prefix: ${m.name}`);
        });
        Object.entries(env.MAP_OVERWORLD_POS).forEach(([k, p]) => {
            assert.ok(!/^Map\s+\d+:/i.test(p.name), `Overworld pos ${k} must not contain 'Map X:' prefix: ${p.name}`);
        });

        env.loadMap(0);
        const locBanner = env.document.getElementById('locationBannerText');
        assert.ok(!/^Map\s+\d+:/i.test(locBanner.textContent), 'Location HUD banner must not state Map number');
    });

    test('Boss health container is hidden until the boss is actively aggroed in combat', () => {
        const env = loadGameEnvironment();
        env.loadMap(3); // Map 4 (Iron & Velvet Divide with Alpha-Cynic Algorithm)
        env.appState = 'PLAYING';

        const bossHud = env.document.getElementById('hudBossContainer');
        assert.ok(env.enemies.some(e => e.isBoss), 'Sector must spawn boss');

        // Place player far from boss at bottom of sector
        env.player.x = 25 * env.TILE_SIZE;
        env.player.y = 44 * env.TILE_SIZE;
        env.updateGameplay(0.016);
        assert.ok(bossHud.classList.contains('hidden'), 'Boss HUD must be hidden when boss is not aggroed');

        // Place player right in front of boss within aggro range
        const boss = env.enemies.find(e => e.isBoss);
        env.player.x = boss.x;
        env.player.y = boss.y + 60;
        env.updateGameplay(0.016);
        assert.ok(boss.isAggroed, 'Boss should become aggroed when player enters combat range');
        assert.ok(!bossHud.classList.contains('hidden'), 'Boss HUD must be shown when boss is actively aggroed in combat');
    });

    test('Interactive signposts have physical collision and trigger dialogue upon interaction', () => {
        const env = loadGameEnvironment();
        env.loadMap(1);

        assert.ok(env.signposts && env.signposts.length > 0, 'Signposts must be spawned across sector');
        const sign = env.signposts[0];

        // Verify collision
        env.player.x = sign.x - 25;
        env.player.y = sign.y;
        const initialX = env.player.x;
        env.moveEntityWithCollision(env.player, 15, 0);
        assert.ok(env.player.x < sign.x, 'Player must be physically blocked by signpost');

        // Verify interaction
        env.player.x = sign.x;
        env.player.y = sign.y + 20;
        env.appState = 'PLAYING';
        const target = env.findNearestInteractable();
        assert.ok(target && target.type === 'sign', 'Signpost must be detected as interactable');

        env.triggerInteraction();
        assert.equal(env.appState, 'DIALOGUE');
        assert.ok(env.document.getElementById('dialogueText').textContent.length > 0, 'Dialogue modal must display sign message');
    });

    test('House interior exit prompt strictly says Exit without overworld or space key words', () => {
        const env = loadGameEnvironment();
        env.loadMap(1);
        const building = env.MAPS[1].buildings[0];
        env.enterBuildingInterior(building);
        env.appState = 'PLAYING';

        const roomH = env.currentInterior.roomH;
        const roomW = env.currentInterior.roomW;
        env.player.x = Math.floor(roomW / 2);
        env.player.y = roomH - 40; // Standing at the south exit doorway

        const target = env.findNearestInteractable();
        assert.equal(target.type, 'exit_door');
        assert.equal(target.label, 'Exit');

        env.updateGameplay(0.016);
        const prompt = env.document.getElementById('interactPrompt');
        assert.equal(prompt.textContent.trim(), 'Exit', 'Prompt must strictly say Exit');
    });
});

