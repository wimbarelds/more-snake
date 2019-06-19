/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server/src/server.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./server/src/server.ts":
/*!******************************!*\
  !*** ./server/src/server.ts ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _src_game_SnakeScoreCalculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../src/game/SnakeScoreCalculator */ "./src/game/SnakeScoreCalculator.ts");

const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const server = express__WEBPACK_IMPORTED_MODULE_0___default()();
server.use(express__WEBPACK_IMPORTED_MODULE_0___default.a.json());

// all routes
server.use('/', express__WEBPACK_IMPORTED_MODULE_0___default.a.static(path.join(__dirname, '../../dist')));
server.use('/edit', express__WEBPACK_IMPORTED_MODULE_0___default.a.static(path.join(__dirname, '../../dist')));
server.use('/about', express__WEBPACK_IMPORTED_MODULE_0___default.a.static(path.join(__dirname, '../../dist')));
function getLevelNameError(levelName) {
    if (!levelName.match(/^[a-zA-Z0-9-_]+$/)) {
        return 'Allowed characters for level name are a-z, 0-9, - and _ (max-length 16)';
    }
    else if (levelName.length > 16) {
        return 'Level name may not be longer than 16 characters';
    }
    return false;
}
function getLevels() {
    const allDirectoryContent = fs.readdirSync(path.join(__dirname, '../levels'));
    const levels = allDirectoryContent.filter((result) => !getLevelNameError(result));
    return levels;
}
function levelExists(levelName, loose = false) {
    if (loose) {
        return getLevels().find((level) => level.toLowerCase() === levelName.toLowerCase()) || false;
    }
    else {
        const fullpath = path.join(__dirname, `../levels/${levelName}/map.json`);
        return (fs.existsSync(fullpath));
    }
}
function loadLevel(levelName) {
    const fullpath = path.join(__dirname, `../levels/${levelName}/map.json`);
    return JSON.parse(fs.readFileSync(fullpath, { encoding: 'utf8' }));
}
function levelOwned(levelName, sessionId) {
    const map = loadLevel(levelName);
    return !!map.sessionId && map.sessionId === sessionId;
}
function writeLevel(levelName, data) {
    const dirPath = path.join(__dirname, `../levels/${levelName}`);
    const fullpath = path.join(dirPath, 'map.json');
    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(fullpath, JSON.stringify(data), { encoding: 'utf8', flag: 'w' });
}
function loadHighscores(levelName) {
    const fullpath = path.join(__dirname, `../levels/${levelName}/highscores.json`);
    const highscores = (fs.existsSync(fullpath)) ? JSON.parse(fs.readFileSync(fullpath, { encoding: 'utf8' })) : [];
    while (highscores.length < 5) {
        highscores.push({
            playerName: 'N/A',
            score: 0,
            inputHistory: { UP: [], DOWN: [], LEFT: [], RIGHT: [] },
            playId: 'null',
        });
    }
    return highscores;
}
function saveHighscores(levelName, highscores) {
    const dirPath = path.join(__dirname, `../levels/${levelName}`);
    const fullpath = path.join(dirPath, 'highscores.json');
    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(fullpath, JSON.stringify(highscores), { encoding: 'utf8', flag: 'w' });
}
server.post('/save', (req, res, next) => {
    if (!req.body || !req.body.levelName || !req.body.sessionId || !req.body.snakeTiles || !req.body.wallTiles) {
        res.send({
            success: false,
            message: 'Malformed data',
        });
    }
    else if (getLevelNameError(req.body.levelName)) {
        res.send({
            success: false,
            message: getLevelNameError(req.body.levelName),
        });
    }
    else {
        const { sessionId, snakeTiles, wallTiles } = req.body;
        const levelName = levelExists(req.body.levelName, true) || req.body.levelName; // this is for case-insensitive checking, a little ugly actually
        if (levelExists(levelName) && !levelOwned(levelName, sessionId)) {
            res.send({
                success: false,
                message: 'You do not have ownership of that level (name already in use)',
            });
        }
        else {
            writeLevel(levelName, { levelName, sessionId, snakeTiles, wallTiles });
            res.send({
                success: true,
                message: 'Level has been saved',
            });
        }
    }
});
server.get('/level/:levelName', (req, res, next) => {
    if (!levelExists(req.params.levelName)) {
        res.send({
            success: false,
            message: 'Level does not exist',
        });
    }
    else {
        res.send({
            success: true,
            data: Object.assign(loadLevel(req.params.levelName), { sessionId: undefined }) // this will remove sessionid from returned data
        });
    }
});
server.get('/level-list', (req, res, next) => {
    res.send({
        success: true,
        data: getLevels(),
    });
});
let playSessions = [];
server.post('/get-play-id', (req, res, next) => {
    if (!req.body || !req.body.sessionId) {
        res.send({
            success: false,
            message: 'No session ID found in post-data',
        });
    }
    else {
        // Generate random play-ID
        const playId = (Math.random() * Number.MAX_SAFE_INTEGER).toString(32);
        // Add playsession
        playSessions.push({
            playId,
            sessionId: req.body.sessionId,
            timestamp: Date.now(),
        });
        // Send playId back to user
        res.send({
            success: true,
            data: playId,
        });
        // Remove sessions older than 12 hours
        playSessions = playSessions.filter((session) => session.timestamp >= (Date.now() - (24 * 60 * 60 * 1000)));
    }
});
// submit highscore = map, playername, playid, score, input{UP:[],DOWN:[],LEFT:[],RIGHT:[]}
server.get('/highscores/:levelName', (req, res, next) => {
    if (!levelExists(req.params.levelName)) {
        res.send({
            success: false,
            message: 'Level does not exist',
        });
    }
    else {
        res.send({
            success: true,
            data: loadHighscores(req.params.levelName),
        });
    }
});
server.post('/highscores/:levelName', (req, res, next) => {
    const error = !levelExists(req.params.levelName) ? 'Level does not exist'
        : (!req.body.playId) ? 'Postdata is missing a playId'
            : (!req.body.sessionId) ? 'Postdata is missing a sessionId'
                : (!req.body.playerName) ? 'Postdata is missing a playerName'
                    : (!req.body.score) ? 'Postdata is missing score'
                        : (!req.body.inputHistory) ? 'Postdata is missing input-history'
                            : !playSessions.some((session) => (session.playId === req.body.playId && session.sessionId === req.body.sessionId)) ? 'Could not find playsession registered'
                                : '';
    if (error) {
        res.send({
            success: false,
            message: error,
        });
    }
    else {
        const level = loadLevel(req.params.levelName);
        const score = Object(_src_game_SnakeScoreCalculator__WEBPACK_IMPORTED_MODULE_1__["SnakeScoreCalculator"])(req.body.playId, level, req.body.inputHistory);
        if (score !== req.body.score) {
            console.log(score, req.body.score);
            res.send({
                success: false,
                message: 'Could not validate your score',
            });
        }
        else {
            let highscores = loadHighscores(req.params.levelName);
            if (highscores.every((highscore) => highscore.score >= score)) {
                res.send({
                    success: false,
                    message: `Your score isn't high enough to be a highscore`,
                });
            }
            else {
                // Clear the playsession to avoid duplicate submissions
                const playSessionIndex = playSessions.findIndex((session) => session.sessionId === req.body.sessionId && session.playId === req.body.playId);
                playSessions.splice(playSessionIndex, 1);
                highscores.push({
                    playerName: req.body.playerName,
                    score: score,
                    inputHistory: req.body.inputHistory,
                    playId: req.body.playId,
                });
                highscores = highscores.sort((a, b) => b.score - a.score).slice(0, 5);
                saveHighscores(req.params.levelName, highscores);
                res.send({
                    success: true,
                    data: highscores,
                });
            }
        }
    }
});
server.listen(8008);
console.log('Server listening http://localhost:8008/');


/***/ }),

/***/ "./src/game/SnakeAgent.ts":
/*!********************************!*\
  !*** ./src/game/SnakeAgent.ts ***!
  \********************************/
/*! exports provided: SnakeAgent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SnakeAgent", function() { return SnakeAgent; });
/* harmony import */ var _SnakeGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SnakeGame */ "./src/game/SnakeGame.ts");
/* harmony import */ var _SnakePlayer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SnakePlayer */ "./src/game/SnakePlayer.ts");


class SnakeAgent {
    constructor(snakeGame, snakeTiles) {
        this.direction = _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].DOWN;
        this._score = 0;
        this.scoreCallbacks = [];
        this.moveCallbacks = [];
        this.snakeGame = snakeGame;
        this.snakeTiles = snakeTiles;
        // Add game-over promise
        this.gameoverPromise = new Promise((resolve, reject) => {
            this.gameoverPromiseResolver = () => resolve(this.score);
        });
    }
    get gameover() {
        return this.gameoverPromise;
    }
    get snakeHead() {
        return this.snakeTiles[this.snakeTiles.length - 1];
    }
    get snakeTailEnd() {
        return this.snakeTiles[0];
    }
    getTiles() {
        return this.snakeTiles;
    }
    getScore() {
        return this._score;
    }
    addMoveListener(callback) {
        this.moveCallbacks.push(callback);
    }
    set score(val) {
        this._score = val;
        this.scoreCallbacks.forEach((callback) => callback(val));
    }
    addScoreListener(callback) {
        this.scoreCallbacks.push(callback);
    }
    isSnakeCollisionAt(pos) {
        return this.snakeTiles.some((snakeTile) => (pos !== snakeTile && pos.x === snakeTile.x && pos.y === snakeTile.y));
    }
    moveHead() {
        // Move head
        this.snakeTiles.push({
            x: this.snakeHead.x + this.direction.x,
            y: this.snakeHead.y + this.direction.y,
        });
        // Check if we need to increment score
        if (this.snakeGame.isCandyAt(this.snakeHead)) {
            this.score = this._score + 1;
            return this.snakeGame.placeCandy();
        }
        return false;
    }
    moveTail() {
        const head = this.snakeHead;
        const dead = this.snakeGame.isSnakeCollisionAt(head) || this.snakeGame.isOutOfBoundsAt(head) || this.snakeGame.isWallCollisionAt(head);
        if (dead)
            this.gameoverPromiseResolver();
        // Only remove the last tail bit if we didn't hit a candy (effectively keeping our snake's length)
        else if (!this.snakeGame.removeCandyAt(this.snakeTailEnd))
            this.snakeTiles.shift();
        // Return whether or not we died
        return !dead;
    }
    tick() {
        const candyPlaced = this.moveHead();
        const alive = this.moveTail();
        this.moveCallbacks.forEach((callback) => {
            callback(Object(_SnakePlayer__WEBPACK_IMPORTED_MODULE_1__["getDirectionKey"])(this.direction));
        });
        return !alive ? false : candyPlaced || true;
    }
    setDirection(newDirection) {
        // Don't allow direction reversal
        if (this.direction === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].DOWN && newDirection === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].UP)
            return;
        if (this.direction === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].UP && newDirection === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].DOWN)
            return;
        if (this.direction === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].LEFT && newDirection === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].RIGHT)
            return;
        if (this.direction === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].RIGHT && newDirection === _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"].LEFT)
            return;
        this.direction = newDirection;
    }
    activateCheats() {
        this.snakeGame.activateCheats();
    }
}


/***/ }),

/***/ "./src/game/SnakeGame.ts":
/*!*******************************!*\
  !*** ./src/game/SnakeGame.ts ***!
  \*******************************/
/*! exports provided: DIRECTIONS, SnakeGame */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DIRECTIONS", function() { return DIRECTIONS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SnakeGame", function() { return SnakeGame; });
/* harmony import */ var _SnakeRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SnakeRenderer */ "./src/game/SnakeRenderer.ts");
/* harmony import */ var _SnakeAgent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SnakeAgent */ "./src/game/SnakeAgent.ts");


const seedRandom = __webpack_require__(/*! seed-random */ "seed-random"); // For repeatable candy placements
const NUM_CANDY_ON_MAP = 25;
const DIRECTIONS = {
    UP: { x: 0, y: -10 },
    DOWN: { x: 0, y: 10 },
    LEFT: { x: -10, y: 0 },
    RIGHT: { x: 10, y: 0 }
};
class SnakeGame {
    constructor(playId, level, numPlayers) {
        this.candyTiles = [];
        this.level = level;
        this.agents = new Array(numPlayers).fill(0).map((x, agentIndex) => new _SnakeAgent__WEBPACK_IMPORTED_MODULE_1__["SnakeAgent"](this, level.snakeTiles[agentIndex]));
        this.wallTiles = level.wallTiles.slice().sort((a, b) => ((a.x === b.x) ? (a.y - b.y) : (a.x - b.x))); // if we sort our wall tiles we search for collision checks much faster
        this.floorTiles = this.computeFloorTiles();
        this.gameoverPromise = Promise.all(this.agents.map((agent) => agent.gameover));
        this.reset(playId);
    }
    get gameover() {
        return this.gameoverPromise;
    }
    get snakeAgents() {
        return this.agents;
    }
    get snakeTiles() {
        return this.agents.reduce((tiles, agent) => {
            tiles.push.apply(tiles, agent.getTiles());
            return tiles;
        }, []);
    }
    computeFloorTiles() {
        const floorTiles = [];
        // First copy our snake tiles as floor tiles as the snake must always start on valid floortiles
        floorTiles.push.apply(floorTiles, this.snakeTiles);
        // Then expand outwards from there in all directions until a wall is hit
        // Create a map in which we record which tiles have been scanned, so we don't scan anything twice
        const scannedMap = floorTiles.reduce((acc, curr) => {
            acc[`${curr.x}.${curr.y}`] = true;
            return acc;
        }, {});
        // Create a list of tiles to search from
        let searchFromTiles = floorTiles.slice();
        while (true) {
            const newTiles = [];
            for (const floorTile of searchFromTiles) {
                const search = [
                    { x: floorTile.x - 10, y: floorTile.y },
                    { x: floorTile.x + 10, y: floorTile.y },
                    { x: floorTile.x, y: floorTile.y - 10 },
                    { x: floorTile.x, y: floorTile.y + 10 },
                ];
                for (const tile of search) {
                    const key = `${tile.x}.${tile.y}`;
                    if (scannedMap[key])
                        continue; // If we've already scanned this tile, ignore it
                    scannedMap[key] = true; // Otherwise we're scanning it now, so adding it to the list
                    if (this.isWallCollisionAt(tile))
                        continue; // If there is a wall here, it's not a floor tile
                    if (this.isOutOfBoundsAt(tile))
                        continue;
                    newTiles.push(tile);
                }
            }
            // If we haven't found any new tiles, we're done
            if (newTiles.length === 0)
                break;
            // Add all the newly found tiles to the floorTiles list
            floorTiles.push.apply(floorTiles, newTiles);
            // Then search from the new
            searchFromTiles = newTiles;
        }
        return floorTiles;
    }
    getRandom(min = 0, max = 1, floored = false) {
        const delta = max - min;
        const value = min + (this.randomizer() * delta);
        return floored ? Math.floor(value) : value;
    }
    assignAgentControllers(creationCallback) {
        return this.agents.map((agent, agentIndex) => creationCallback(agent, agentIndex));
    }
    addScoreListener(listener) {
        // Add listeners to all agents and update our listeners whenever one of our agents reports a score change
        for (let i = 0; i < this.agents.length; i++) {
            this.agents[i].addScoreListener((score) => {
                listener({ playerIndex: i, score });
            });
        }
    }
    getScores() {
        return this.agents.map((agent) => agent.getScore());
    }
    isWallCollisionAt(pos) {
        // Determine an initial search point based on the x point of the position
        const xMin = this.wallTiles[0].x;
        const xMax = this.wallTiles[this.wallTiles.length - 1].x;
        const xDelta = xMax - xMin;
        const pct = Math.min(1, Math.max(0, (pos.x - xMin) / xDelta));
        const searchStart = Math.floor(pct * (this.wallTiles.length - 1));
        // Make sure our search start point isn't the position we're looking for
        const searchStartTile = this.wallTiles[searchStart];
        if (searchStartTile.x === pos.x && searchStartTile.y === pos.y)
            return true;
        // Determine which direction we should be looking in
        const direction = (pos.x > searchStartTile.x || (pos.x === searchStartTile.x && pos.y > searchStartTile.y)) ? 1 : -1;
        for (let i = (searchStart + direction); i < this.wallTiles.length && i >= 0; i += direction) {
            const tile = this.wallTiles[i];
            if (tile.x === pos.x && tile.y === pos.y)
                return true;
            if (direction === 1 && tile.x > pos.x)
                return false;
            if (direction === -1 && tile.x < pos.x)
                return false;
        }
        return false;
    }
    isOutOfBoundsAt(pos) {
        if (pos.x < 0)
            return true;
        if (pos.y < 0)
            return true;
        if (pos.x >= _SnakeRenderer__WEBPACK_IMPORTED_MODULE_0__["CANVAS_WIDTH"])
            return true;
        if (pos.y >= _SnakeRenderer__WEBPACK_IMPORTED_MODULE_0__["CANVAS_HEIGHT"])
            return true;
        return false;
    }
    isSnakeCollisionAt(pos) {
        return this.agents.some((agent) => agent.isSnakeCollisionAt(pos));
    }
    isCandyAt(pos) {
        return this.indexOfCandyAt(pos) !== -1;
    }
    placeCandy(n = 1) {
        const validTiles = this.floorTiles.filter((floorTile) => {
            if (this.snakeTiles.some((snakeTile) => (snakeTile.x === floorTile.x && snakeTile.y === floorTile.y)))
                return false;
            if (this.candyTiles.some((candyTile) => (candyTile.x === floorTile.x && candyTile.y === floorTile.y)))
                return false;
            return true;
        });
        const placements = [];
        for (let i = 0; i < n; i++) {
            if (validTiles.length === 0)
                break;
            const tileIndex = this.getRandom(0, validTiles.length, true);
            const tile = validTiles.splice(tileIndex, 1)[0];
            this.candyTiles.push(tile);
            placements.push(tile);
        }
        return placements;
    }
    indexOfCandyAt(pos) {
        return this.candyTiles.findIndex((candyTile) => (candyTile.x === pos.x && candyTile.y === pos.y));
    }
    removeCandyAt(pos) {
        const index = this.indexOfCandyAt(pos);
        // If there is no candy here, return false
        if (index === -1)
            return false;
        // If there is candy here, remove it
        this.candyTiles.splice(index, 1);
        return true;
        // TODO: Announce a candy is removed
    }
    reset(playId) {
        this.randomizer = seedRandom(playId);
        this.candyTiles = [];
        this.placeCandy(NUM_CANDY_ON_MAP);
    }
    activateCheats() {
        this.placeCandy(250);
    }
    getWallTiles() {
        return this.wallTiles;
    }
    getFloorTiles() {
        return this.floorTiles;
    }
    getCandyTiles() {
        return this.candyTiles;
    }
    getSnakeTiles() {
        return this.snakeTiles;
    }
}


/***/ }),

/***/ "./src/game/SnakePlayer.ts":
/*!*********************************!*\
  !*** ./src/game/SnakePlayer.ts ***!
  \*********************************/
/*! exports provided: getDirectionKey, SnakePlayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDirectionKey", function() { return getDirectionKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SnakePlayer", function() { return SnakePlayer; });
/* harmony import */ var _SnakeGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SnakeGame */ "./src/game/SnakeGame.ts");

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
const getDirectionKey = (pos) => {
    if (pos.x < 0)
        return 'LEFT';
    if (pos.x > 0)
        return 'RIGHT';
    if (pos.y < 0)
        return 'UP';
    return 'DOWN';
};
class SnakePlayer {
    constructor(agent, keyBindings) {
        this.tickCount = 0;
        this.tickTimeout = 0;
        this.tickInput = null;
        this.queuedInput = null;
        this.KONAMIKeyCodeHistory = [];
        this.inputHistory = { UP: [], DOWN: [], LEFT: [], RIGHT: [] };
        this.KEYMAP = keyBindings;
        this.REVERSE_KEYMAP = {
            [this.KEYMAP.UP]: 'UP',
            [this.KEYMAP.DOWN]: 'DOWN',
            [this.KEYMAP.LEFT]: 'LEFT',
            [this.KEYMAP.RIGHT]: 'RIGHT',
        };
        // Add input handler
        this.agent = agent;
        this.inputHandler = (e) => {
            // Only handle Konami input for 1 player
            this.konamiLogger(e.keyCode);
            const direction = this.REVERSE_KEYMAP[e.keyCode];
            const newDirection = _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"][direction];
            if (!newDirection)
                return;
            if (!this.tickInput) {
                this.agent.setDirection(newDirection);
                this.tickInput = newDirection;
            }
            else if (!this.queuedInput) {
                this.queuedInput = newDirection;
            }
        };
        this.bindKeys();
        this.scheduleNextTick();
    }
    destroy() {
        this.unbindKeys();
        clearTimeout(this.tickTimeout);
    }
    tick() {
        if (this.agent.tick()) { // agent is alive
            // Add input history if needed
            if (this.tickInput)
                this.inputHistory[getDirectionKey(this.tickInput)].push(this.tickCount);
            // Increment tickCounter
            this.tickCount++;
            // Schedule next tick
            this.scheduleNextTick();
            if (this.queuedInput) {
                this.tickInput = this.queuedInput;
                this.agent.setDirection(this.queuedInput);
                this.queuedInput = null;
            }
            else {
                this.tickInput = null;
            }
        }
        else { // agent is dead
            this.destroy();
        }
    }
    scheduleNextTick() {
        this.tickTimeout = setTimeout(this.tick.bind(this), this.tickInterval); // in node this is of 'Timeout' type, but we don't care and can ignore this
    }
    get tickInterval() {
        const calc1 = 1 / (Math.pow(this.agent.getScore() + 10, 0.1));
        const calc2 = 1 - ((1 - calc1) * 2);
        const calc3 = (calc2 - 0.2) * 2.5;
        const calc4 = calc3 * SnakePlayer.TICK_INTERVAL_RANGE + (SnakePlayer.TICK_INTERVAL_BASE - SnakePlayer.TICK_INTERVAL_RANGE);
        return calc4;
    }
    konamiLogger(keyCode) {
        this.KONAMIKeyCodeHistory.push(keyCode);
        while (this.KONAMIKeyCodeHistory.length > KONAMI.length) {
            this.KONAMIKeyCodeHistory.splice(0, 1);
        }
        // Check for KONAMI code match
        if (this.KONAMIKeyCodeHistory.length === KONAMI.length && this.KONAMIKeyCodeHistory.every((key, index) => KONAMI[index] === key)) {
            this.agent.activateCheats();
        }
    }
    bindKeys() {
        window.addEventListener('keydown', this.inputHandler);
    }
    unbindKeys() {
        window.removeEventListener('keydown', this.inputHandler);
    }
}
SnakePlayer.TICK_INTERVAL_BASE = 150;
SnakePlayer.TICK_INTERVAL_RANGE = 130;


/***/ }),

/***/ "./src/game/SnakeRenderer.ts":
/*!***********************************!*\
  !*** ./src/game/SnakeRenderer.ts ***!
  \***********************************/
/*! exports provided: CANVAS_WIDTH, CANVAS_HEIGHT, SnakeRenderer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CANVAS_WIDTH", function() { return CANVAS_WIDTH; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CANVAS_HEIGHT", function() { return CANVAS_HEIGHT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SnakeRenderer", function() { return SnakeRenderer; });
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 640;
class SnakeRenderer {
    constructor(game, theme, context) {
        this.animationFrame = 0;
        this.game = game;
        this.theme = theme;
        this.ctx = context;
        this.wallCanvas = this.drawStaticCanvas(game.getWallTiles(), theme.wallColor);
        this.floorCanvas = this.drawStaticCanvas(game.getFloorTiles(), theme.floorColor);
        this.draw();
    }
    draw() {
        // Clear the screen
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Draw Floor
        this.ctx.drawImage(this.floorCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Draw Walls
        this.ctx.drawImage(this.wallCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Draw Candy
        this.drawTilesOnContext(this.game.getCandyTiles(), this.theme.candyColor);
        // Draw Snake
        this.game.snakeAgents.forEach((agent, agentIndex) => {
            this.drawTilesOnContext(agent.getTiles(), this.theme.snakeColor[agentIndex]);
        });
        // Draw the next frame when we're ready
        this.animationFrame = requestAnimationFrame(this.draw.bind(this));
    }
    destroy() {
        this.draw();
        cancelAnimationFrame(this.animationFrame);
    }
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        return canvas;
    }
    drawStaticCanvas(tiles, color) {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = color;
        for (const tile of tiles) {
            ctx.rect(tile.x, tile.y, 10, 10);
        }
        ctx.fill();
        return canvas;
    }
    drawTilesOnContext(tiles, color) {
        this.ctx.beginPath();
        for (const tile of tiles) {
            this.ctx.rect(tile.x, tile.y, 10, 10);
        }
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
}


/***/ }),

/***/ "./src/game/SnakeScoreCalculator.ts":
/*!******************************************!*\
  !*** ./src/game/SnakeScoreCalculator.ts ***!
  \******************************************/
/*! exports provided: SnakeScoreCalculator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SnakeScoreCalculator", function() { return SnakeScoreCalculator; });
/* harmony import */ var _SnakeGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SnakeGame */ "./src/game/SnakeGame.ts");

function SnakeScoreCalculator(playId, level, inputHistory) {
    const game = new _SnakeGame__WEBPACK_IMPORTED_MODULE_0__["SnakeGame"](playId, level, 1);
    const agent = game.snakeAgents[0];
    let tick = 0;
    let gameover = false;
    while (!gameover) {
        const input = (inputHistory.UP.indexOf(tick) >= 0) ? 'UP'
            : (inputHistory.DOWN.indexOf(tick) >= 0) ? 'DOWN'
                : (inputHistory.LEFT.indexOf(tick) >= 0) ? 'LEFT'
                    : (inputHistory.RIGHT.indexOf(tick) >= 0) ? 'RIGHT' : null;
        if (input)
            agent.setDirection(_SnakeGame__WEBPACK_IMPORTED_MODULE_0__["DIRECTIONS"][input]);
        gameover = !agent.tick();
        tick++;
    }
    return agent.getScore();
}


/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "seed-random":
/*!******************************!*\
  !*** external "seed-random" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("seed-random");

/***/ })

/******/ });
//# sourceMappingURL=server.js.map