const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadGameEnvironment() {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
        throw new Error('No <script> tag found in index.html');
    }

    let scriptContent = scriptMatch[1];
    scriptContent += `\n; window.__EXPORTED__ = {
        CODEX_ENTRIES,
        DIFFICULTY_PROFILES,
        PAPER_DOLL_SLOTS,
        RELIC_DB,
        MAPS,
        CUTSCENE_SCENES,
        TILE_SIZE,
        MAP_COLS,
        MAP_ROWS,
        getTotalMaxHp,
        getTotalContextPower,
        getTotalAxiomAttack,
        getTotalDefense,
        getTotalSpeed,
        getEquipBonus,
        isRelicOwned,
        player,
        loadMap,
        unlockRiverBridgeIfReady,
        assets,
        audio,
        ZONE_BGM_TRACKS,
        revealFogAround,
        get fogGrid() { return fogGrid; },
        get mapGrid() { return mapGrid; },
        get devMode() { return devMode; },
        toggleDevMode,
        teleportPlayerTo,
        transitionToNeighborMap,
        OVERWORLD_GRID,
        MAP_OVERWORLD_POS,
        renderWorldMap,
        getItemRarity,
        checkQuestProgressState,
        get npcs() { return npcs; },
        get critters() { return critters; },
        useQuickTonic,
        get portals() { return portals; },
        get currentInterior() { return currentInterior; },
        enterBuildingInterior,
        exitBuildingInterior,
        throwHeldPot,
        get activePotProjectiles() { return activePotProjectiles; },
        showDeconstructToast,
        dismissEpistemicRevelation,
        get appState() { return appState; },
        set appState(val) { appState = val; },
        updateStackedQuestHud,
        triggerInteraction,
        advanceDialogue,
        findNearestInteractable,
        get NPC_SPRITE_REGISTRY() { return (typeof NPC_SPRITE_REGISTRY !== 'undefined') ? NPC_SPRITE_REGISTRY : {}; },
        get getPokemonSpriteFrameCol() { return (typeof getPokemonSpriteFrameCol !== 'undefined') ? getPokemonSpriteFrameCol : null; },
        get getSpriteRegistryKey() { return (typeof getSpriteRegistryKey !== 'undefined') ? getSpriteRegistryKey : null; },
        get activeDialogueList() { return activeDialogueList; },
        updateGameplay,
        renderGameplay,
        moveEntityWithCollision,
        isCitadelUnlocked,
        get grassBushes() { return grassBushes; },
        get treeStumps() { return treeStumps; },
        get puzzleNodes() { return puzzleNodes; },
        get signposts() { return signposts; },
        get enemies() { return enemies; },
        get document() { return document; },
        getSectorGrid,
        triggerCitadelGuardWarning,
        triggerSocraticBossDuel,
        selectSocraticDuelOption,
        get activeDuelBoss() { return activeDuelBoss; },
        get activeDuelOptions() { return activeDuelOptions; },
        openTreasureChestZeldaStyle,
        drawCharacterSprite,
        get INTERACTIVE_STATIONS() { return (typeof INTERACTIVE_STATIONS !== 'undefined') ? INTERACTIVE_STATIONS : {}; },
        get drawPixelQuestSymbol() { return drawPixelQuestSymbol; },
        set drawPixelQuestSymbol(fn) { drawPixelQuestSymbol = fn; },
        findNearestInteractable,
        };`;

    function createMockElement(id = '') {
        const classSet = new Set();
        return {
            id,
            getContext: () => ({
                clearRect: () => {}, fillRect: () => {}, strokeRect: () => {}, beginPath: () => {}, arc: () => {},
                fill: () => {}, stroke: () => {}, drawImage: () => {}, save: () => {},
                restore: () => {}, translate: () => {}, scale: () => {}, rotate: () => {}, fillText: () => {},
                moveTo: () => {}, lineTo: () => {}, closePath: () => {}, ellipse: () => {},
                arcTo: () => {},
                rect: () => {}, clip: () => {}, setLineDash: () => {}, bezierCurveTo: () => {},
                quadraticCurveTo: () => {},
                measureText: () => ({ width: 50 }),
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createRadialGradient: () => ({ addColorStop: () => {} })
            }),
            classList: {
                add: (c) => classSet.add(c),
                remove: (c) => classSet.delete(c),
                toggle: (c, force) => {
                    if (force !== undefined) {
                        if (force) classSet.add(c);
                        else classSet.delete(c);
                    } else {
                        if (classSet.has(c)) classSet.delete(c);
                        else classSet.add(c);
                    }
                },
                contains: (c) => classSet.has(c)
            },
            style: {},
            appendChild: function(ch) {
                this._children = this._children || [];
                this._children.push(ch);
                if (ch.innerHTML) this.innerHTML = (this.innerHTML || '') + ch.innerHTML;
            },
            querySelector: function() { return createMockElement(); },
            _innerHTML: '',
            _textContent: '',
            get innerHTML() { return this._innerHTML; },
            set innerHTML(val) {
                this._innerHTML = String(val);
                this._textContent = String(val).replace(/<[^>]*>/g, '');
            },
            get textContent() { return this._textContent; },
            set textContent(val) {
                this._textContent = String(val);
                this._innerHTML = String(val);
            },
            addEventListener: () => {},
            removeEventListener: () => {},
            onclick: null,
            oninput: null,
            onchange: null
        };
    }

    const elemRegistry = {};
    const sandbox = {
        window: {
            addEventListener: () => {},
            innerWidth: 1920,
            innerHeight: 1080
        },
        document: {
            getElementById: (id) => {
                if (!elemRegistry[id]) elemRegistry[id] = createMockElement(id);
                return elemRegistry[id];
            },
            createElement: (tag) => createMockElement(tag),
            querySelectorAll: () => [],
            addEventListener: () => {}
        },
        console: console,
        Image: class {
            constructor() {
                this.src = '';
                this.width = 1024;
                this.height = 545;
                setTimeout(() => { if (this.onload) this.onload(); }, 0);
            }
        },
        AudioContext: class {
            createOscillator() {
                return {
                    type: '',
                    frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
                    connect: () => {},
                    start: () => {},
                    stop: () => {}
                };
            }
            createGain() {
                return {
                    gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
                    connect: () => {}
                };
            }
            get currentTime() { return 0; }
            get destination() { return {}; }
        },
        webkitAudioContext: null,
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        },
        setInterval: (fn, ms) => {
            const id = setInterval(fn, ms);
            if (id && typeof id.unref === 'function') id.unref();
            return id;
        },
        clearInterval: (id) => clearInterval(id),
        setTimeout: (fn, ms) => {
            const id = setTimeout(fn, ms);
            if (id && typeof id.unref === 'function') id.unref();
            return id;
        },
        clearTimeout: (id) => clearTimeout(id),
        requestAnimationFrame: () => {},
        performance: { now: () => 0 },
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat
    };
    sandbox.window.localStorage = sandbox.localStorage;

    vm.runInNewContext(scriptContent, sandbox);
    const exp = sandbox.window.__EXPORTED__;
    exp.rawHtml = html;
    return exp;
}

module.exports = { loadGameEnvironment };

