import { Snake, Direction, DIRECTIONS } from './Snake';
import { SnakePlayer, InputHistory } from './SnakePlayer';

export class SnakeRecording {
    private game: Snake;
    private inputHistory: InputHistory;
    private recordingOverPromise: Promise<void>;
    private recordingOverPromiseResolver!: () => void;
    private tickIndex: number = 0;

    constructor(game: Snake, inputHistory: InputHistory) {
        // Store arguments
        this.game = game;
        this.inputHistory = inputHistory;
        // Create promise to signify we're done
        this.recordingOverPromise = new Promise((resolve) => {
            this.recordingOverPromiseResolver = resolve;
        });

        setTimeout(this.tick.bind(this), this.tickInterval);
    }

    public get over(): Promise<void> {
        return this.recordingOverPromise;
    }

    private tick() {
        const input: Direction | null = (this.inputHistory.UP.indexOf(this.tickIndex) >= 0) ? 'UP'
            : (this.inputHistory.DOWN.indexOf(this.tickIndex) >= 0) ? 'DOWN'
            : (this.inputHistory.LEFT.indexOf(this.tickIndex) >= 0) ? 'LEFT'
            : (this.inputHistory.RIGHT.indexOf(this.tickIndex) >= 0) ? 'RIGHT' : null;

        if (input) this.game.setDirection(DIRECTIONS[input]);
        if (this.game.tick()) {
            setTimeout(this.tick.bind(this), this.tickInterval);
            this.tickIndex++;
        } else {
            this.recordingOverPromiseResolver();
        }
    }

    private get tickInterval(): number {
        const calc1 = 1/(Math.pow(this.game.getScore() + 10, 0.1));
        const calc2 = 1-((1- calc1) * 2);
        const calc3 = (calc2-0.2) * 2.5;
        const calc4 = calc3 * SnakePlayer.TICK_INTERVAL_RANGE + (SnakePlayer.TICK_INTERVAL_BASE - SnakePlayer.TICK_INTERVAL_RANGE);
        return calc4 / 4;
    }
}