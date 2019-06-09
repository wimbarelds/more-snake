let wallTiles = [];
let snakeTiles = [];
let candyTiles = [];

let SEARCH_SPEED = 18.5;

let depth, locationsSearched, lastCandyFound = Date.now();

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 640;

const OPPOSITES = {
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
    UP: 'DOWN',
    DOWN: 'UP'
};

const DIRECTIONS = {
    UP: { x: 0, y: -10 },
    DOWN: { x: 0, y: 10 },
    LEFT: { x: -10, y: 0 },
    RIGHT: { x: 10, y: 0 }
};

// NOTE TO SELF: If you cant find a candy, go in the direction that has the most search-options

const DIRECTIONKEYS = Object.keys(DIRECTIONS);

const init = function(data) {
    candyTiles = data.candyTiles;
    snakeTiles = data.level.snakeTiles;
    // Sort walltiles for faster searching
    wallTiles = data.level.wallTiles.slice().sort((a, b) => ((a.x === b.x) ? (a.y - b.y) : (a.x - b.x)));
};

function placeCandy(data) {
    if (candyTiles instanceof Array) {
        candyTiles.push(... data);
    } else {
        candyTiles.push(data);
    }
}

const candyCheck = (location) => {
    return candyTiles.findIndex((candyTile) => location.x === candyTile.x && location.y === candyTile.y);
};

const isWallCollisionAt = (pos) => {
    // Determine an initial search point based on the x point of the position
    const xMin = wallTiles[0].x;
    const xMax = wallTiles[wallTiles.length - 1].x;
    const xDelta = xMax - xMin;
    const pct = Math.min(1, Math.max(0, (pos.x - xMin) / xDelta));
    const searchStart = Math.floor(pct * (wallTiles.length - 1));
    // Make sure our search start point isn't the position we're looking for
    const searchStartTile = wallTiles[searchStart];
    if (searchStartTile.x === pos.x && searchStartTile.y === pos.y) return true;
    // Determine which direction we should be looking in
    const direction = (pos.x > searchStartTile.x || (pos.x === searchStartTile.x && pos.y > searchStartTile.y)) ? 1 : -1;
    for (let i = (searchStart + direction); i < wallTiles.length && i >= 0; i += direction) {
        const tile = wallTiles[i];
        if (tile.x === pos.x && tile.y === pos.y) return true;
        if (direction === 1 && tile.x > pos.x) return false;
        if (direction === -1 && tile.x < pos.x) return false;
    }
    return false;
}

const isOutOfBounds = (pos) => {
    if (pos.x < 0) return true;
    if (pos.y < 0) return true;
    if (pos.x >= CANVAS_WIDTH) return true;
    if (pos.y >= CANVAS_HEIGHT) return true;
    return false;
}

const isTailCollision = (location, skipHead = false) => {
    for (let i = 0; i < snakeTiles.length - (skipHead ? 2 : 1); i++) {
        const tailBit = snakeTiles[i];
        if (tailBit.x === location.x && tailBit.y === location.y) return true;
    }
    return false;
}

const deathCheck = (location) => {
    if (isWallCollisionAt(location)) return true;
    if (isOutOfBounds(location)) return true;
    if (isTailCollision(location)) return true;
    return false;
}

const getLocationStr = (location) => {
    return `x${location.x},y${location.y}`;
};

const trimCollisionLocations = (locations) => {
    return locations.filter((location) => !deathCheck(location));
};

const trimForbidden = (locations, forbidden) => {
    let newLocations = [];
    for(let location of locations) {
        let locationStr = getLocationStr(location);
        if(!forbidden[locationStr]) {
            newLocations.push(location);
        }
    }
    return newLocations;
};

const getExpandedSearchArea = (search, forbidden) => {
    const newSearch = {};
    for (let direction in search) {
        newSearch[direction] = [];

        const locations = search[direction];
        for (let location of locations) {
            let additions = [
                { x: location.x + 10, y: location.y },
                { x: location.x, y: location.y + 10 },
                { x: location.x, y: location.y - 10 },
                { x: location.x - 10, y: location.y }
            ];
            additions = trimForbidden(additions, forbidden);
            additions = trimCollisionLocations(additions);

            for (let addition of additions) {
                // Add these locations for searching
                newSearch[direction].push(addition);
                // Prevent this location from being evaluated again
                forbidden[getLocationStr(addition)] = addition;
            }
        }
    }
    return newSearch;
};

const searchCandy = (direction, maxLocationsSearched) => {
    const snakeHead = snakeTiles[snakeTiles.length - 1];
    // Array of where we cant go
    const forbidden = { [getLocationStr(snakeHead)]: snakeHead };

    // Array containing our next search points
    let search = {};
    const opposite = OPPOSITES[direction];
    // Determine possible search tiles
    for (let directionKey of DIRECTIONKEYS) {
        // We cannot go immediately in the opposite direction of where we're going
        if (directionKey === opposite) continue;
        const DIRECTION = DIRECTIONS[directionKey];
        search[directionKey] = trimCollisionLocations([{ x: snakeHead.x + DIRECTION.x, y: snakeHead.y + DIRECTION.y }]);
    }

    locationsSearched = 0;
    for (let depth = 0;; depth++) {
        for (let direction in search) {
            let locations = search[direction];
            // Check for candyTiles on all search locations, if found that's the direction we go
            for (let location of locations) {
                // If we find a candy, go there
                if (candyCheck(location) >= 0) {
                    lastCandyFound = Date.now();
                    return direction;
                }
                // If we don't find a candy but have searched too far, stop searching
                if (++locationsSearched >= maxLocationsSearched) {
                    return false;
                }
            }
        }
        // Find new places to search
        search = getExpandedSearchArea(search, forbidden);
        const numSearchLocations = Object.values(search).reduce((count, locations) => count + locations.length, 0);
        if (numSearchLocations === 0){
            // There's nowhere to go, we've exhausted all search options
            return false;
        }
    }
}

const snapDecision = (direction) => {
    let snakeHead = snakeTiles[snakeTiles.length - 1];
    let directionIndex = DIRECTIONKEYS.indexOf(direction);
    for(let i = 0; i < DIRECTIONKEYS.length; i++) {
        let moveIndex = (directionIndex + i) % DIRECTIONKEYS.length;
        let moveDirection = DIRECTIONKEYS[moveIndex];
        let move = DIRECTIONS[moveDirection];
        if(!deathCheck({ x: snakeHead.x + move.x, y: snakeHead.y + move.y })) return moveDirection;
    }
    return false;
};

let stuckDirection = null;
const compactMovement = (direction) => {
    if(stuckDirection === null) stuckDirection = direction;

    if((stuckDirection === 'UP' || stuckDirection === 'DOWN') && direction == 'LEFT') {
        if(!deathCheck({ x: snakeHead.x - 10, y: snakeHead.y })) return 'LEFT';
        else if(stuckDirection === 'UP' && !deathCheck({ x: snakeHead.x, y: snakeHead.y - 10 })) return 'UP';
        else if(stuckDirection === 'DOWN' && !deathCheck({ x: snakeHead.x, y: snakeHead.y + 10 })) return 'DOWN';
    }
    if((stuckDirection === 'UP' || stuckDirection === 'DOWN') && direction == 'RIGHT') {
        if(!deathCheck({ x: snakeHead.x + 10, y: snakeHead.y })) return 'RIGHT';
        else if(stuckDirection === 'UP' && !deathCheck({ x: snakeHead.x, y: snakeHead.y - 10 })) return 'UP';
        else if(stuckDirection === 'DOWN' && !deathCheck({ x: snakeHead.x, y: snakeHead.y + 10 })) return 'DOWN';
    }
    if((stuckDirection === 'LEFT' || stuckDirection === 'RIGHT') && direction == 'UP') {
        if(!deathCheck({ x: snakeHead.x, y: snakeHead.y - 10 })) return 'UP';
        else if(stuckDirection === 'LEFT' && !deathCheck({ x: snakeHead.x - 10, y: snakeHead.y })) return 'LEFT';
        else if(stuckDirection === 'RIGHT' && !deathCheck({ x: snakeHead.x + 10, y: snakeHead.y })) return 'RIGHT';
    }
    if((stuckDirection === 'LEFT' || stuckDirection === 'RIGHT') && direction == 'DOWN') {
        if(!deathCheck({ x: snakeHead.x, y: snakeHead.y + 10 })) return 'DOWN';
        else if(stuckDirection === 'LEFT' && !deathCheck({ x: snakeHead.x - 10, y: snakeHead.y })) return 'LEFT';
        else if(stuckDirection === 'RIGHT' && !deathCheck({ x: snakeHead.x + 10, y: snakeHead.y })) return 'RIGHT';
    }
    return false;
};

function tick (data){
    // Move snakeTiles
    let tailEnd = snakeTiles[0];
    let move = DIRECTIONS[data.direction];
    for(let i = 0; i < snakeTiles.length; i++) {
        // Tail
        if(i < (snakeTiles.length - 1)) {
            snakeTiles[i] = snakeTiles[i + 1];
        }
        // Head
        else {
            snakeTiles[i] = { x: snakeTiles[i].x + move.x, y: snakeTiles[i].y + move.y };
        }
    }

    // Remove candyTiles once picked up and extend tail
    let candyIndex = candyCheck(tailEnd);
    if(candyIndex >= 0) {
        candyTiles.splice(candyIndex, 1);
        snakeTiles.unshift(tailEnd);
    }
    let before = Date.now();
    let maxSearchLocations = Math.round(data.interval * SEARCH_SPEED);
    let newDirection = searchCandy(data.direction, maxSearchLocations);

    // If we found out we're stuck, move compactly (ie: zigzag)
    if(newDirection === 0) newDirection = compactMovement(data.direction);
    else {
        // If we're not stuck, save that
        stuckDirection = null;
        // If we still can't find a candyTiles, make a snap decision
        if(newDirection == false) newDirection = snapDecision(data.direction);
    }

    if(newDirection) postMessage(newDirection);

    let frameTime = Date.now() - before;
    let maxTime = data.frameDelay;

    if(frameTime > maxTime) console.warn({ frameTime, maxTime: data.frameDelay, locationsSearched, depth });
    // If nothing has been found for too long, add artificial candies to lead snake to other candyTiles
    if(lastCandyFound < Date.now() - 10000) {
        console.log('No candyTiles found for too long, placing artificial candyTiles');
        // Make this map agnostic, but ignore for now
        candyTiles.push({ x: 250, y: 300 });
        candyTiles.push({ x: 550, y: 300 });
        candyTiles.push({ x: 850, y: 100 });
        candyTiles.push({ x: 850, y: 500 });
        candyTiles.push({ x: 1150, y: 300 });
        candyTiles.push({ x: 1450, y: 300 });
        lastCandyFound = Date.now();
    }
};

onmessage = function(message) {
    let obj = message.data;
    switch(obj.type) {
        case 'init':
            init(obj.data);
            break;
        case 'candyTiles':
            placeCandy(obj.data);
            break;
        case 'tick':
            tick(obj.data);
            break;
    }
};

console.log('Webworker AI test-bot.js ready');
