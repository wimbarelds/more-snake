import { DIRECTIONS, Pos, Snake, Direction } from './Snake';
const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
export const KEYCODES: { [d: string]: number } = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39
}

const KEYDIRECTIONS: { [n: number]: Pos } = {
    37: DIRECTIONS.LEFT,
    38: DIRECTIONS.UP,
    39: DIRECTIONS.RIGHT,
    40: DIRECTIONS.DOWN,
};

const getDirectionKey = (pos: Pos): Direction => {
    if (pos.x < 0) return 'LEFT';
    if (pos.x > 0) return 'RIGHT';
    if (pos.y < 0) return 'UP';
    return 'DOWN';
}

export type InputHistory = {
    [d in Direction]: number[];
}

export interface Highscore {
    playerName: string;
    score: number;
    inputHistory: InputHistory;
    playId: string;
}

export class SnakePlayer {
    public static readonly TICK_INTERVAL_BASE: number = 150;
    public static readonly TICK_INTERVAL_RANGE: number = 130;
    private tickCount: number = 0;
    private tickTimeout: number = 0;
    private tickInput: Pos | null = null;
    private queuedInput: Pos | null = null;
    private snakeGame: Snake;
    private keycodeHistory: number[] = [];
    
    private inputHandler: (e: KeyboardEvent) => void;
    private gameoverPromise: Promise<InputHistory>;
    private gameoverPromiseResolver!: (value: InputHistory) => void;
    private inputHistory: InputHistory = { UP: [], DOWN: [], LEFT: [], RIGHT: [] };

    constructor(snakeGame: Snake) {
        // Add game-over promise
        this.gameoverPromise = new Promise((resolve, reject) => {
            this.gameoverPromiseResolver = resolve;
        });
        // Add input handler
        this.snakeGame = snakeGame;
        this.inputHandler = (e: KeyboardEvent) => {
            this.logKeyCode(e.keyCode);

            const newDirection = KEYDIRECTIONS[e.keyCode];
            if (!newDirection) return;

            if (!this.tickInput) {
                this.snakeGame.setDirection(newDirection);
                this.tickInput = newDirection;
            } else if(!this.queuedInput) {
                this.queuedInput = newDirection;
            }

        };
        this.bindKeys();
        this.tick();
    }

    public destroy() {
        this.unbindKeys();
        clearTimeout(this.tickTimeout);
    }

    public get gameover() {
        return this.gameoverPromise;
    }

    private tick() {
        if (this.snakeGame.tick()) {
            // If tick has input, add it to the history
            if(this.tickInput) {
                this.inputHistory[getDirectionKey(this.tickInput)].push(this.tickCount);
            }
            // Player is not game over
            this.tickCount++;
            this.tickTimeout = setTimeout(this.tick.bind(this), this.tickInterval) as unknown as number; // in node this is of 'Timeout' type, but we don't care and can ignore this
    
            if (this.queuedInput) {
                this.tickInput = this.queuedInput;
                this.snakeGame.setDirection(this.queuedInput);
                this.queuedInput = null;
            } else {
                this.tickInput = null;
            }
        } else {
            this.gameoverPromiseResolver(this.inputHistory);
        }
    }

    private get tickInterval(): number {
        const calc1 = 1/(Math.pow(this.snakeGame.getScore() + 10, 0.1));
        const calc2 = 1-((1- calc1) * 2);
        const calc3 = (calc2-0.2) * 2.5;
        const calc4 = calc3 * SnakePlayer.TICK_INTERVAL_RANGE + (SnakePlayer.TICK_INTERVAL_BASE - SnakePlayer.TICK_INTERVAL_RANGE);
        return calc4;
    }

    private logKeyCode(keyCode: number) {
        this.keycodeHistory.push(keyCode);
        while (this.keycodeHistory.length > KONAMI.length) {
            this.keycodeHistory.splice(0, 1);
        }
        // Check for KONAMI code match
        if (this.keycodeHistory.length === KONAMI.length && this.keycodeHistory.every((key, index) => KONAMI[index] === key)) {
            this.snakeGame.enableCheats();
        }
    }

    private bindKeys() {
        window.addEventListener('keydown', this.inputHandler);
    }

    private unbindKeys() {
        window.removeEventListener('keydown', this.inputHandler);
    }
}
