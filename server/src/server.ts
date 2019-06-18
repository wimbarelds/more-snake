import express, { Request, Response, NextFunction } from 'express';
const path = require('path');
const fs = require('fs');

const server = express();
server.use(express.json());

import { SnakeScoreCalculator } from '../../src/game/SnakeScoreCalculator';
import { Highscore } from '../../src/game/SnakePlayer';
import { Pos } from '../../src/game/SnakeGame';


// all routes
server.use('/', express.static(path.join(__dirname, '../../dist')));
server.use('/edit', express.static(path.join(__dirname, '../../dist')));
server.use('/about', express.static(path.join(__dirname, '../../dist')));

interface GameLevel {
    levelName: string;
    sessionId?: string;
    snakeTiles: Pos[][];
    wallTiles: Pos[];
}

function getLevelNameError(levelName: string): string | false {
    if (!levelName.match(/^[a-zA-Z0-9-_]+$/)) {
        return 'Allowed characters for level name are a-z, 0-9, - and _ (max-length 16)';
    } else if (levelName.length > 16) {
        return 'Level name may not be longer than 16 characters';
    }
    return false;
}

function getLevels() {
    const allDirectoryContent = fs.readdirSync(path.join(__dirname, '../levels')) as string[];
    const levels = allDirectoryContent.filter((result) => !getLevelNameError(result));
    return levels;
}

function levelExists(levelName: string, loose: boolean = false): false | string {
    if (loose) {
        return getLevels().find((level) => level.toLowerCase() === levelName.toLowerCase()) || false;
    } else {
        const fullpath = path.join(__dirname, `../levels/${levelName}/map.json`);
        return (fs.existsSync(fullpath));
    }
}

function loadLevel(levelName: string): GameLevel {
    const fullpath = path.join(__dirname, `../levels/${levelName}/map.json`);
    return JSON.parse(fs.readFileSync(fullpath, { encoding: 'utf8' }));
}

function levelOwned(levelName: string, sessionId: string): boolean {
    const map = loadLevel(levelName);
    return !!map.sessionId && map.sessionId === sessionId;
}

function writeLevel(levelName: string, data: GameLevel) {
    const dirPath = path.join(__dirname, `../levels/${levelName}`);
    const fullpath = path.join(dirPath, 'map.json');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(fullpath, JSON.stringify(data), { encoding: 'utf8', flag: 'w' });
}

function loadHighscores(levelName: string) {
    const fullpath = path.join(__dirname, `../levels/${levelName}/highscores.json`);
    const highscores: Highscore[] = (fs.existsSync(fullpath)) ? JSON.parse(fs.readFileSync(fullpath, { encoding: 'utf8' })) : [];
    while (highscores.length < 5) {
        highscores.push({
            playerName: 'N/A',
            score: 0,
            inputHistory: {UP:[],DOWN:[],LEFT:[],RIGHT:[]},
            playId: 'null',
        });
    }
    return highscores;
}

function saveHighscores(levelName: string, highscores: Highscore[]) {
    const dirPath = path.join(__dirname, `../levels/${levelName}`);
    const fullpath = path.join(dirPath, 'highscores.json');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(fullpath, JSON.stringify(highscores), { encoding: 'utf8', flag: 'w' });
}

server.post('/save', (req: Request, res: Response, next: NextFunction) => {
    if (!req.body || !req.body.levelName || !req.body.sessionId || !req.body.snakeTiles || !req.body.wallTiles) {
        res.send({
            success: false,
            message: 'Malformed data',
        });
    } else if (getLevelNameError(req.body.levelName)) {
        res.send({
            success: false,
            message: getLevelNameError(req.body.levelName), // calling this function twice is a little ugly, but its a fast small function
        });
    } else {
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
    } else {
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

interface PlaySession {
    playId: string;
    sessionId: string;
    timestamp: number;
}

let playSessions: PlaySession[] = [];
server.post('/get-play-id', (req, res, next) => {
    if (!req.body || !req.body.sessionId) {
        res.send({
            success: false,
            message: 'No session ID found in post-data',
        });
    } else {
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
})

// submit highscore = map, playername, playid, score, input{UP:[],DOWN:[],LEFT:[],RIGHT:[]}
server.get('/highscores/:levelName', (req, res, next) => {
    if (!levelExists(req.params.levelName)) {
        res.send({
            success: false,
            message: 'Level does not exist',
        });
    } else {
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
    } else {
        const level = loadLevel(req.params.levelName);
        const score = SnakeScoreCalculator(req.body.playId, level, req.body.inputHistory);
        if (score !== req.body.score) {
            console.log(score, req.body.score);
            res.send({
                success: false,
                message: 'Could not validate your score',
            });
        } else {
            let highscores = loadHighscores(req.params.levelName);
            if (highscores.every((highscore) => highscore.score >= score)) {
                res.send({
                    success: false,
                    message: `Your score isn't high enough to be a highscore`,
                });
            } else {
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
