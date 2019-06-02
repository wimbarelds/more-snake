import { InputHistory } from './SnakePlayer';
import { Snake, Level, Direction, DIRECTIONS } from './Snake';

export function SnakeScoreCalculator(playId: string, level: Level, inputHistory: InputHistory) {
    const game = new Snake(playId, level);
    let tick = 0;
    let gameover = false;
    while(!gameover) {
        const input: Direction | null = (inputHistory.UP.indexOf(tick) >= 0) ? 'UP'
            : (inputHistory.DOWN.indexOf(tick) >= 0) ? 'DOWN'
            : (inputHistory.LEFT.indexOf(tick) >= 0) ? 'LEFT'
            : (inputHistory.RIGHT.indexOf(tick) >= 0) ? 'RIGHT' : null;
        
        if (input) game.setDirection(DIRECTIONS[input]);
        gameover = !game.tick();
        tick++;
    }
    return game.getScore();
}