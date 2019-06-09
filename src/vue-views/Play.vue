<template>
  <div class="play">
    <game-score :value="score" :show="showScores" />
    <game-menu
      :show="showMenu"
      :level="levelName"
      @setLevel="levelName = $event"
      @update-state="updateState($event)"
      />
    <game-highscores
      :show="showHighscores"
      :levelName="levelName"
      :playerResult="playerResult"
      @close="closeHighscores()"
      @start-replay="startReplay($event)"
      />
    <game-level-picker
      :show="showLevelPicker"
      @set-level="setLevel($event)"
      />
    <game-manual-input
      :show="showManualInput"
      />
    <game-bot-loader
      :show="showBotLoader"
      @close="closeBotLoader()"
      @play-bot="playBot($event)"
      />
    <canvas width="1280" height="640" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GameScore from './Play/GameScore.vue';
import GameHighscores from './Play/GameHighscores.vue';
import GameMenu from './Play/GameMenu.vue';
import GameLevelPicker from './Play/GameLevelPicker.vue';
import GameManualInput from './Play/GameManualInput.vue';
import GameBotLoader from './Play/GameBotLoader.vue';

import { Snake, Level } from '@/game/Snake';
import { SnakePlayer, InputHistory } from '@/game/SnakePlayer';
import { SnakeRenderer, Theme } from '@/game/SnakeRenderer';
import { SnakeRecording } from '@/game/SnakeRecording';
import { SnakeBot } from '@/game/SnakeBot';
import Axios from 'axios';

interface GamePlayerState {
  playId: string;
  level: Level;
  game: Snake;
  renderer: SnakeRenderer;
  player: SnakePlayer | SnakeBot;
};

export interface GamePlayerResult {
  sessionId: string;
  playId: string;
  score: number;
  inputHistory: InputHistory;
};

const theme: Theme = {
  wallColor: '#900',
  snakeColor: '#090',
  floorColor: '#FFF',
  candyColor: '#F90',
};

type GameState = 'menu' | 'play' | 'replay' | 'highscores' | 'choose-level' | 'load-bot' | 'play-bot';
@Component({
  components: {
    GameScore,
    GameHighscores,
    GameMenu,
    GameLevelPicker,
    GameManualInput,
    GameBotLoader,
  },
})
export default class HomeView extends Vue {
  public gameState: GameState = 'menu';
  public score: number = 0;
  public levelName: string = 'cw-level';
  public playerResult: GamePlayerResult | null = null;
  public sessionId: string = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32);

  public mounted() {
    // load or save session ID, this is used for saving maps as a user-token
    if (sessionStorage.sessionID) {
        this.sessionId = sessionStorage.sessionId;
    } else {
        sessionStorage.sessionId = this.sessionId;
    }
  }

  public get showMenu(): boolean {
    return this.gameState === 'menu';
  }

  public get showHighscores(): boolean {
    return this.gameState === 'highscores';
  }

  public get showManualInput(): boolean {
    return this.gameState === 'play';
  }

  public get showScores(): boolean {
    return this.gameState === 'play' || this.gameState === 'replay';
  }

  public get showLevelPicker(): boolean {
    return this.gameState === 'choose-level';
  }

  public get showBotLoader(): boolean {
    return this.gameState === 'load-bot';
  }

  public updateState(newState: GameState): void {
    this.gameState = newState;
    if (newState === 'play') this.play();
  }

  public setLevel(levelName: string): void {
    this.levelName = levelName;
    this.gameState = 'menu';
  }

  public async play() {
    this.playerResult = null;
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const level = (await Axios.get(`/level/${this.levelName}`)).data.data;
    const playId = (await Axios.post(`/get-play-id`, { sessionId: this.sessionId })).data.data;

    const game = new Snake(playId, level);
    game.addScoreListener(this.setScore.bind(this));

    const renderer = new SnakeRenderer(game, theme, context);
    const player = new SnakePlayer(game);

    // Wait for gameover
    const state: GamePlayerState = { playId, level, game, renderer, player };
    player.gameover.then(this.playerGameoverHandler.bind(this, state));
  }

  public async startReplay({ playId, inputHistory }: {playId: string, inputHistory: InputHistory }): Promise<void> {
    this.updateState('replay');
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const level = (await Axios.get(`/level/${this.levelName}`)).data.data;
    const game = new Snake(playId, level);
    game.addScoreListener(this.setScore.bind(this));

    const renderer = new SnakeRenderer(game, theme, context);
    const recording = new SnakeRecording(game, inputHistory);
    // Wait until the replay is over
    await recording.over;
    renderer.destroy();
    setTimeout(() => {
      this.updateState('highscores');
    }, 500);
  }

  public closeHighscores(): void {
    this.updateState('menu');
    this.playerResult = null;
  }

  public closeBotLoader(): void {
    this.updateState('menu');
  }

  public async playBot(bot: Worker): Promise<void> {
    this.gameState = 'play';
    this.playerResult = null;
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const level = (await Axios.get(`/level/${this.levelName}`)).data.data;
    const playId = (await Axios.post(`/get-play-id`, { sessionId: this.sessionId })).data.data;

    const game = new Snake(playId, level);
    game.addScoreListener(this.setScore.bind(this));

    const renderer = new SnakeRenderer(game, theme, context);
    const botPlayer = new SnakeBot(game, level, bot);

    // Wait for gameover
    const state: GamePlayerState = { playId, level, game, renderer, player: botPlayer };
    botPlayer.gameover.then(this.botGameoverHandler.bind(this, state));
  }

  public setScore(score: number) {
    this.score = score;
  }

  private async playerGameoverHandler(state: GamePlayerState, inputHistory: InputHistory) {
    state.player.destroy();
    state.renderer.destroy();

    this.playerResult = {
      playId: state.playId,
      sessionId: this.sessionId,
      score: state.game.getScore(),
      inputHistory,
    };
    this.updateState('highscores');
    // highscores: scores[], highscore: boolean
  }

  private async botGameoverHandler(state: GamePlayerState, inputHistory: InputHistory) {
    state.player.destroy();
    state.renderer.destroy();
    this.gameState = 'menu';
  }
}
</script>

<style lang="scss" scoped>
</style>
