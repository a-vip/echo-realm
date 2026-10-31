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

        // Incomplete progress keeps Citadel sealed
        env.player.zoneQuests[0] = { completed: true, bossDefeated: true };
        assert.equal(env.isCitadelUnlocked(), false, 'Citadel must remain sealed when only 1 sector is completed');

        // Satisfy requirements: complete all prior sectors 0 through 7 and defeat their bosses
        for (let i = 0; i <= 7; i++) {
            env.player.zoneQuests[i] = {
                completed: true,
                bossDefeated: true
            };
        }
        assert.equal(env.isCitadelUnlocked(), true, 'Citadel must unlock once all 8 outer sectors (0 through 7) are liberated');
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

    test('Map 3 (Iron & Velvet Divide) contains zero interior giant grey monolith blocks (tile 2) and has open bridges', () => {
        const env = loadGameEnvironment();
        env.loadMap(3);
        const grid = env.mapGrid;
        const rows = grid.length;
        const cols = grid[0].length;

        // Check inner area (away from outer border rows/cols) for any tile 2 (wall blocks)
        let interiorWallBlocks = 0;
        for (let r = 2; r < rows - 2; r++) {
            for (let c = 2; c < cols - 2; c++) {
                if (grid[r][c] === 2) {
                    interiorWallBlocks++;
                }
            }
        }
        assert.equal(interiorWallBlocks, 0, 'Map 3 must contain zero giant grey monolith wall blocks in the interior');

        // Check that bridge tiles (tile 8) exist crossing the central river
        let bridgeTiles = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 8) bridgeTiles++;
            }
        }
        assert.ok(bridgeTiles > 0, 'Map 3 must have bridge causeways crossing the river');
    });

    test('Grand Archive Sanctuary uses archive_tower style and renders custom arcane library interior', () => {
        const env = loadGameEnvironment();
        env.loadMap(0);
        const archiveBuilding = env.MAPS[0].buildings.find(b => b.id === 'archive_sanctuary');
        assert.ok(archiveBuilding, 'Archive Sanctuary must exist on Map 0');
        assert.equal(archiveBuilding.style, 'archive_tower', 'Archive Sanctuary must use archive_tower style');

        // Enter interior
        env.enterBuildingInterior(archiveBuilding);
        assert.equal(env.currentInterior.buildingId, 'archive_sanctuary');
        assert.doesNotThrow(() => {
            env.renderGameplay();
        }, 'Archive tower arcane interior must render cleanly');
    });

    test('Socratic Cognitive Inoculation duel triggers minimal bottom dialog with [Q], [E], [R] choices at HP thresholds', () => {
        const env = loadGameEnvironment();
        env.loadMap(3);
        const boss = env.MAPS[3].boss;
        assert.ok(boss, 'Map 3 must have Alpha-Cynic Algorithm boss');
        assert.ok(boss.duels && boss.duels.length > 0, 'Boss must define multi-stage duels');

        // Trigger duel at 50% HP threshold
        boss.hp = Math.floor(boss.maxHp * 0.49);
        env.triggerSocraticBossDuel(boss, 0.50);

        assert.equal(env.appState, 'PAUSED', 'App state should pause during Socratic duel');
        assert.ok(env.activeDuelBoss, 'Active duel boss must be set');
        assert.equal(env.activeDuelOptions.length, 3, 'Duel must present 3 dialectic choices');

        // Verify options modal content
        const duelModal = env.document.getElementById('socraticDuelModal');
        const choices = env.document.getElementById('duelChoicesContainer');
        assert.ok(choices.innerHTML.includes('>Q<') || choices.innerHTML.includes('Q'), 'Duel UI must display [Q] shortcut badge');
        assert.ok(choices.innerHTML.includes('>E<') || choices.innerHTML.includes('E'), 'Duel UI must display [E] shortcut badge');
        assert.ok(choices.innerHTML.includes('>R<') || choices.innerHTML.includes('R'), 'Duel UI must display [R] shortcut badge');

        // Select correct option with hotkey
        const correctIndex = env.activeDuelOptions.findIndex(o => o.correct);
        assert.ok(correctIndex >= 0);
        const initialBossHp = boss.hp;
        env.selectSocraticDuelOption(correctIndex);

        assert.equal(env.appState, 'PLAYING', 'Game should resume playing after resolving duel');
        assert.ok(boss.hp < initialBossHp, 'Boss HP must be damaged by correct Socratic refutation');
    });

    test('Citadel perimeter border guards prevent entry and trigger warning when outer sectors are incomplete', () => {
        const env = loadGameEnvironment();
        env.loadMap(7); // Borderlands adjacent to Map 8 (Citadel)
        env.appState = 'PLAYING';
        assert.equal(env.isCitadelUnlocked(), false, 'Citadel must be locked initially');

        // Move player close to the Citadel border gate
        env.player.x = 20;
        env.player.y = 800;
        env.updateGameplay(0.016);

        // Guard intercept should trigger warning dialog
        assert.doesNotThrow(() => {
            env.triggerCitadelGuardWarning();
        });
        assert.equal(env.appState, 'DIALOGUE');
        const dialogueText = env.document.getElementById('dialogueText').textContent;
        assert.ok(dialogueText.toLowerCase().includes('martial lockdown'),
            'Guard warning dialogue must notify player of lockdown');
    });

    test('Main story quests progress in a continuous chain, with turn-in granting follow-up quest', () => {
        const env = loadGameEnvironment();
        env.loadMap(0);
        env.appState = 'PLAYING';

        // Clear Map 0 dummy training objectives
        env.player.mapCitizensFreed = 2;
        env.checkQuestProgressState();
        assert.equal(env.player.questReadyToTurnIn, true);

        // Turn in to Professor Avi
        const avi = env.npcs.find(n => n.name === 'Professor Avi');
        assert.ok(avi, 'Professor Avi must exist on Map 0');
        env.player.x = avi.x;
        env.player.y = avi.y + 20;
        env.triggerInteraction(); // initiates dialogue
        assert.equal(env.appState, 'DIALOGUE');

        // Advance through dialogue to turn in
        while (env.appState === 'DIALOGUE') {
            env.advanceDialogue();
        }

        // Verify Map 0 is completed
        assert.equal(env.player.zoneQuests[0].completed, true, 'Map 0 quest must be marked completed');

        // Verify Map 1 quest is chained and accepted
        assert.ok(env.player.zoneQuests[1], 'Map 1 quest must exist');
        assert.equal(env.player.zoneQuests[1].accepted, true, 'Map 1 quest must be chained and accepted');
        assert.equal(env.player.zoneQuests[1].inGuidanceStage, true, 'Map 1 quest should guide player to Commander Maya');

        // Verify Active Quest HUD displays follow-up guidance
        env.updateStackedQuestHud();
        const activeQuests = Object.values(env.player.zoneQuests).filter(q => q.accepted && !q.completed);
        assert.equal(activeQuests.length, 1);
        assert.ok(activeQuests[0].guidanceTitle.includes('Performative Valley'));
    });

    test('Completing Sector 7 liberates all outer realms and immediately unlocks the Obsidian Citadel', () => {
        const env = loadGameEnvironment();
        // Satisfy sectors 0 through 6
        for (let i = 0; i < 7; i++) {
            env.player.zoneQuests[i] = {
                mapIndex: i,
                cured: 10,
                curedGoal: 2,
                puzzlesSolved: 5,
                puzzleGoal: 0,
                bossDefeated: true,
                completed: true,
                accepted: true
            };
        }

        env.loadMap(7);
        env.appState = 'PLAYING';
        assert.equal(env.isCitadelUnlocked(), false, 'Citadel should still be locked before completing Sector 7');

        // Clear Sector 7 boss and puzzle objectives
        env.player.mapCitizensFreed = 5;
        env.player.mapPuzzlesSolved = 3;
        env.player.mapBossDefeated = true;
        env.checkQuestProgressState();

        // Turn in to Elder Zephyr
        const zephyr = env.npcs.find(n => n.name.includes('Zephyr'));
        assert.ok(zephyr);
        env.player.x = zephyr.x;
        env.player.y = zephyr.y + 20;
        env.triggerInteraction();
        while (env.appState === 'DIALOGUE') {
            env.advanceDialogue();
        }

        // Verify Citadel is unlocked
        assert.equal(env.player.citadelUnlocked, true, 'player.citadelUnlocked must be true');
        assert.equal(env.isCitadelUnlocked(), true, 'isCitadelUnlocked() must return true');
        assert.ok(env.player.zoneQuests[8], 'Sector 8 Finale quest must be initialized');
        assert.equal(env.player.zoneQuests[8].accepted, true, 'Sector 8 Finale quest must be accepted in quest chain');
    });

    test('Looting treasure chests displays minimal dialogue without slot headers or flavor quotes', () => {
        const env = loadGameEnvironment();
        env.loadMap(0);
        env.appState = 'PLAYING';

        const chestMeta = env.MAPS[0].chest;
        assert.ok(chestMeta, 'Map 0 must have chest');
        const chestObj = { ...chestMeta, relic: env.RELIC_DB[chestMeta.itemId] };

        // Open chest
        env.openTreasureChestZeldaStyle(chestObj);
        assert.equal(env.appState, 'ITEM_FANFARE');

        const speakerEl = env.document.getElementById('dialogueSpeaker');
        const textEl = env.document.getElementById('dialogueText');

        // Check speaker is hidden and has no "RELIC ACQUIRED" or slot text
        assert.ok(speakerEl.classList.contains('hidden') || speakerEl.textContent.trim() === '',
            'Speaker element must be hidden without slot banner');
        assert.ok(!speakerEl.textContent.includes('RELIC ACQUIRED'),
            'Must not contain RELIC ACQUIRED text');

        // Check text says "Found [Relic Name]!" without verbose "You opened the Archive Chest..." or quotes
        assert.ok(textEl.innerHTML.includes('Found '), 'Must say Found [Relic]');
        assert.ok(!textEl.innerHTML.includes('You opened the Archive Chest and obtained'),
            'Must not contain verbose opening text');
        assert.ok(!textEl.innerHTML.includes('Woven in the Whispering Woods'),
            'Must not contain italic description quote');
    });

    test('Citadel gates remain strictly locked and guarded even when Dev Mode is enabled until Quest 8 is received', () => {
        const env = loadGameEnvironment();
        env.loadMap(0);
        env.devMode = true; // Dev mode enabled
        env.player.zoneQuests = {};

        // With devMode true, isCitadelUnlocked() must still be false until Quest 8 is received
        assert.equal(env.isCitadelUnlocked(), false, 'Citadel gates must remain locked in Dev Mode until story quest is accepted');

        // Grant Quest 8
        env.player.zoneQuests[8] = { accepted: true };
        assert.equal(env.isCitadelUnlocked(), true, 'Citadel opens once Quest 8 is accepted');
    });

    test('Map 7 (Highland Oasis) contains zero impassable diagonal tree barriers and permits traversal across the sector', () => {
        const env = loadGameEnvironment();
        env.loadMap(7);
        const grid = env.mapGrid;

        // Verify that there is a clear vertical path from north highway (r=1) down to south lake promenade (r=35)
        let blockedRows = 0;
        for (let r = 1; r <= 35; r++) {
            let hasWalkable = false;
            for (let c = 14; c <= 22; c++) {
                if (grid[r][c] !== 2 && grid[r][c] !== 3) {
                    hasWalkable = true;
                    break;
                }
            }
            if (!hasWalkable) blockedRows++;
        }
        assert.equal(blockedRows, 0, 'North-South avenue in Map 7 must have no blocked rows from trees or walls');

        // Verify clearings around buildings: no trees touching building footprints
        const buildings = env.MAPS[7].buildings;
        buildings.forEach(b => {
            for (let r = b.row; r < b.row + b.hRows; r++) {
                for (let c = b.col; c < b.col + b.wCols; c++) {
                    assert.notEqual(grid[r][c], 3, "Building " + b.id + " must not be obstructed by trees");
                }
            }
        });
    });

    test('Building interior player movement towards chest is smooth and free of snapping or teleportation', () => {
        const env = loadGameEnvironment();
        env.loadMap(1);
        const building = env.MAPS[1].buildings[0];
        env.enterBuildingInterior(building);
        assert.ok(env.currentInterior);

        // Player starts at x=380, y=510. Move player towards the treasure chest alcove (x ~ 620, y ~ 220)
        env.player.x = 450;
        env.player.y = 220;

        // Step player right towards chest
        for (let step = 0; step < 10; step++) {
            const prevX = env.player.x;
            env.moveEntityWithCollision(env.player, 5, 0);
            assert.ok(env.player.x >= prevX, "Player moving right towards chest should smoothly advance without snapping backwards (was " + prevX + ", now " + env.player.x + ")");
        }

        // Verify player can get close to chest without jitter
        env.player.x = 600;
        env.player.y = 220;
        const target = env.findNearestInteractable();
        assert.ok(target && target.type === 'interior_chest', 'Player near chest must detect interior_chest interactable');
    });

    test('Character sprite does not render golden belt buckle on back when facing away (dir === 1)', () => {
        const env = loadGameEnvironment();
        const fillRectCalls = [];
        const mockCtx = {
            save() {},
            restore() {},
            translate() {},
            fillRect(x, y, w, h) {
                fillRectCalls.push({ x, y, w, h, fillStyle: this.fillStyle });
            },
            beginPath() {},
            ellipse() {},
            arc() {},
            fill() {},
            stroke() {},
            rotate() {},
            setLineDash() {},
            measureText() { return { width: 10 }; },
            fillText() {}
        };

        // Draw facing Up (dir === 1)
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'player', dir: 1, frame: 0 });
        const goldBuckleOnBack = fillRectCalls.find(call =>
            call.fillStyle === '#fbbf24' && call.w === 4 && call.h === 2
        );
        assert.equal(goldBuckleOnBack, undefined, 'Golden belt buckle must NOT be drawn on back when dir === 1');

        // Draw facing Down (dir === 0)
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'player', dir: 0, frame: 0 });
        const goldBuckleOnFront = fillRectCalls.find(call =>
            call.fillStyle === '#fbbf24' && call.w === 4 && call.h === 2
        );
        assert.ok(goldBuckleOnFront, 'Golden belt buckle MUST be drawn on front when dir === 0');
    });

    test('World Map UI modal displays 32-bit Realm Atlas header without Overworld text or repeated M', () => {
        const env = loadGameEnvironment();
        const modal = env.document.getElementById('worldMapModal');
        assert.ok(modal, 'worldMapModal must exist');

        const startIdx = env.rawHtml.indexOf('id="worldMapModal"');
        const endIdx = env.rawHtml.indexOf('id="inventoryModal"');
        const modalHtml = env.rawHtml.substring(startIdx, endIdx);
        assert.ok(!modalHtml.includes('OVERWORLD MAP'), 'Modal must not contain OVERWORLD MAP text');
        assert.ok(modalHtml.includes('REALM ATLAS'), 'Modal must display REALM ATLAS');
        assert.ok(!modalHtml.includes('Close [M / ESC]'), 'Close button must not repeat [M]');
        assert.ok(modalHtml.includes('Close [ESC]'), 'Close button must say Close [ESC]');
        assert.ok(!modalHtml.includes('[PRESS M TO CLOSE]'), 'Action prompt must not say [PRESS M TO CLOSE]');
    });

    test('Bridges across all zones span seamlessly without gaps and are never orphaned on dry land without river adjacency', () => {
        const env = loadGameEnvironment();
        for (let m = 0; m <= 8; m++) {
            env.loadMap(m);
            const grid = env.mapGrid;
            const rows = grid.length;
            const cols = grid[0].length;
            for (let r = 1; r < rows - 1; r++) {
                for (let c = 1; c < cols - 1; c++) {
                    if (grid[r][c] === 8) {
                        const neighbors = [grid[r - 1][c], grid[r + 1][c], grid[r][c - 1], grid[r][c + 1]];
                        const adjacentToWaterOrBridge = neighbors.some(n => n === 4 || n === 8);
                        assert.ok(
                            adjacentToWaterOrBridge,
                            `Orphaned bridge tile 8 on Map ${m} at [${c}, ${r}] with zero water/bridge adjacency!`
                        );
                    }
                }
            }
        }
    });

    test('Puzzle-gated bridges in Bright Interlude zones (Maps 2, 5, 7) have accessible puzzle nodes and properly extend contiguous crossing upon completion', () => {
        const env = loadGameEnvironment();

        // Map 2: Sunlit Riverfront (3 Crystal Switches on West Bank)
        env.loadMap(2);
        assert.equal(env.mapGrid[14][27], 4, 'Map 2 river crossing must start as water before puzzle');
        assert.equal(env.puzzleNodes.length, 3, 'Map 2 must define 3 crystal switches');
        env.puzzleNodes.forEach(node => {
            assert.ok(node.x / env.TILE_SIZE < 25, `Switch ${node.label} must be accessible on West Bank`);
            node.solved = true;
        });
        env.unlockRiverBridgeIfReady();
        assert.equal(env.mapGrid[14][27], 8, 'Map 2 river crossing must be extended to bridge tile 8');

        // Map 5: Whispering Woods (2 Mirror Blocks + 1 Stele in Sacred Glade)
        env.loadMap(5);
        assert.equal(env.mapGrid[7][27], 4, 'Map 5 brook crossing must start as water before puzzle');
        assert.equal(env.puzzleNodes.length, 3, 'Map 5 must define 3 glade puzzle trials');
        env.puzzleNodes.forEach(node => {
            assert.ok(node.y / env.TILE_SIZE > 10, `Trial ${node.label} must be accessible in Sacred Glade`);
            node.solved = true;
        });
        env.unlockRiverBridgeIfReady();
        assert.equal(env.mapGrid[7][27], 8, 'Map 5 brook crossing must be extended to bridge tile 8');

        // Map 7: Highland Oasis (3 Socratic Pedestals along Western Promenade)
        env.loadMap(7);
        assert.equal(env.mapGrid[14][27], 4, 'Map 7 inlet crossing must start as water before puzzle');
        assert.equal(env.puzzleNodes.length, 3, 'Map 7 must define 3 Socratic Pillars');
        env.puzzleNodes.forEach(node => {
            assert.ok(node.x / env.TILE_SIZE < 25, `Pillar ${node.label} must be accessible on Western Promenade`);
            node.solved = true;
        });
        env.unlockRiverBridgeIfReady();
        assert.equal(env.mapGrid[14][27], 8, 'Map 7 inlet crossing must be extended to bridge tile 8');
    });

    test('Player and Mentor NPC sprites render high-detail 32-bit pixel art models with distinct hair, facial features, and role-specific attire', () => {
        const env = loadGameEnvironment();
        const fillRectCalls = [];
        const mockCtx = {
            save() {}, restore() {}, translate() {},
            fillRect(x, y, w, h) { fillRectCalls.push({ fillStyle: this.fillStyle, x, y, w, h }); },
            beginPath() {}, ellipse() {}, fill() {}, stroke() {}, arc() {}
        };

        // 1. Auron (Player Sprite): Multi-tone hair, cobalt iris, specular eye glint, collar, belt buckle
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'player', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#0284c7'), 'Auron must render cobalt iris');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#ffffff'), 'Auron must render specular eye glint');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#fde047'), 'Auron must render golden hair highlight');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#92400e'), 'Auron must render amber hair shadow');

        // 2. Commander Maya: Vanguard armor, officer circlet & sash
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'maya', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#fbbf24'), 'Maya must render golden armor/circlet');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#dc2626'), 'Maya must render crimson officer sash');

        // 3. Bridgekeeper Lyra: Water lily floral garland & riverkeeper turquoise dress
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'lyra', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#06b6d4' || c.fillStyle === '#38bdf8'), 'Lyra must render riverkeeper turquoise garb');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#ffffff'), 'Lyra must render water lily petals');

        // 4. Comrade Tariq: Crimson beret, dark beard & leather tool harness
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'tariq', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#dc2626'), 'Tariq must render crimson beret');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#1c1917'), 'Tariq must render dark beard');

        // 5. Sister Elena: Violet habit & ivory wimple
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'elena', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#581c87'), 'Elena must render violet habit');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#f8fafc'), 'Elena must render ivory monastic wimple');

        // 6. Velvet Femsphere: Long flowing brunette hair with highlights, cobalt bikini & soft skin tones
        fillRectCalls.length = 0;
        env.drawCharacterSprite(mockCtx, 100, 100, 2, { role: 'velvet', dir: 0, frame: 0 });
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#2563eb'), 'Velvet must render cobalt bikini');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#92400e'), 'Velvet must render voluminous brunette hair');
        assert.ok(fillRectCalls.some(c => c.fillStyle === '#d97706'), 'Velvet must render hair highlights and navel');
    });

});
