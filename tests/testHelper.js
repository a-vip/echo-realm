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
        findNearestInteractable
    };`;

    const mockElem = {
        getContext: () => ({
            clearRect: () => {}, fillRect: () => {}, strokeRect: () => {}, beginPath: () => {}, arc: () => {},
            fill: () => {}, stroke: () => {}, drawImage: () => {}, save: () => {},
            restore: () => {}, translate: () => {}, rotate: () => {}, fillText: () => {},
            moveTo: () => {}, lineTo: () => {}, closePath: () => {}, ellipse: () => {},
            rect: () => {}, clip: () => {}, setLineDash: () => {}, bezierCurveTo: () => {},
            measureText: () => ({ width: 50 }),
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} })
        }),
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        style: {},
        appendChild: () => {},
        innerHTML: '',
        textContent: '',
        addEventListener: () => {},
        removeEventListener: () => {},
        onclick: null,
        oninput: null,
        onchange: null
    };

    const sandbox = {
        window: {
            addEventListener: () => {},
            innerWidth: 1920,
            innerHeight: 1080
        },
        document: {
            getElementById: () => mockElem,
            createElement: () => mockElem,
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
    return sandbox.window.__EXPORTED__;
}

module.exports = { loadGameEnvironment };

