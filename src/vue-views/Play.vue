<template>
  <div class="play">
    <game-scores :values="scores" :show="showScores" />
    <game-menu
      :show="showMenu"
      :levelName="levelName"
      :level="level"
      :numPlayers="numPlayers"
      @setLevel="levelName = $event"
      @update-state="updateState($event)"
      @update-num-players="setNumPlayers($event)"
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
      :numPlayers="numPlayers"
      @close="closeBotLoader()"
      @play-bot="playBot($event)"
      />
    <canvas width="1280" height="640" ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import GameScores from './Play/GameScores.vue';
import GameHighscores, { ServerResult } from './Play/GameHighscores.vue';
import GameMenu from './Play/GameMenu.vue';
import GameLevelPicker from './Play/GameLevelPicker.vue';
import GameManualInput from './Play/GameManualInput.vue';
import GameBotLoader from './Play/GameBotLoader.vue';

import { SnakeGame, Level, SnakeAgentController } from '@/game/SnakeGame';
import { SnakePlayer, InputHistory } from '@/game/SnakePlayer';
import { SnakeRenderer, Theme } from '@/game/SnakeRenderer';
import { SnakeRecording } from '@/game/SnakeRecording';
import { SnakeBot } from '@/game/SnakeBot';
import Axios from 'axios';
import { Alert } from '../alerts/alerts';
import { keyBindings } from '../game/SnakeKeyBindings';
import { SnakeAgent } from '../game/SnakeAgent';

interface GamePlayerState {
  playId: string;
  game: SnakeGame;
  renderer: SnakeRenderer;
  players: SnakeAgentController[];
};

export interface GamePlayerResult {
  sessionId: string;
  playId: string;
  score: number;
  inputHistory: InputHistory;
};

export const theme: Theme = {
  wallColor: '#fd5819',
  snakeColor: ['hsl(190, 89%, 49%)', 'hsl(220, 89%, 49%)', 'hsl(250, 89%, 49%)', 'hsl(160, 89%, 49%)'],
  floorColor: '#FFF',
  candyColor: '#3F3',
};

type GameState = 'menu' | 'play' | 'replay' | 'highscores' | 'choose-level' | 'load-bot' | 'play-bot';
@Component({
  components: {
    GameScores,
    GameHighscores,
    GameMenu,
    GameLevelPicker,
    GameManualInput,
    GameBotLoader,
  },
})
export default class HomeView extends Vue {
  public gameState: GameState = 'menu';
  public scores: number[] = [0];
  public levelName: string = 'cw-level';
  public level: Level | null = null;
  public numPlayers: number = 1;
  public playerResult: GamePlayerResult | null = null;
  public sessionId: string = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32);

  public created() {
    // load or save session ID, this is used for saving maps as a user-token
    if (sessionStorage.sessionID) {
        this.sessionId = sessionStorage.sessionId;
    } else {
        sessionStorage.sessionId = this.sessionId;
    }
    // load map
    this.loadLevel();
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

  public get maxNumPlayers(): number {
    if (!this.level) return 0;
    return this.level.snakeTiles.length;
  }

  public updateState(newState: GameState): void {
    this.gameState = newState;
    if (newState === 'play') this.play();
  }

  public setLevel(levelName: string): void {
    this.levelName = levelName;
    this.gameState = 'menu';
  }

  public setNumPlayers(numPlayers: number): void {
    if (!this.level) {
      Alert('You cannot set the number of players before the level has been loaded');
      return;
    } else if (numPlayers > this.maxNumPlayers) {
      Alert(`This map only supports ${this.maxNumPlayers} players`);
      return;
    } else if (numPlayers < 1) {
      Alert('Stop being such a jerk');
      return;
    } else {
      this.numPlayers = numPlayers;
    }
  }

  @Watch('levelName')
  private async loadLevel() {
    this.level = null;
    const result = (await Axios.get<ServerResult<Level>>(`/level/${this.levelName}`)).data;
    if (!result.success) {
      Alert('Failed to load level ' + this.levelName);
    } else {
      this.level = result.data;
      this.setNumPlayers(this.numPlayers);
    }
  }

  public async play() {
    if (!this.level) {
      Alert(`Can't play when level isn't loaded`);
      return;
    }
    // Reset state
    this.playerResult = null;
    this.scores = new Array(this.numPlayers).fill(0);

    // Start a game
    const playId = (await Axios.post(`/get-play-id`, { sessionId: this.sessionId })).data.data;
    const game = new SnakeGame(playId, this.level, this.numPlayers);
    game.addScoreListener(this.setScore.bind(this));

    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const renderer = new SnakeRenderer(game, theme, context);
    const players = game.assignAgentControllers((agent: SnakeAgent, agentIndex: number) => {
      return new SnakePlayer(agent, keyBindings[agentIndex]);
    })

    // Wait for gameover
    const state: GamePlayerState = { playId, game, renderer, players };
    game.gameover.then(this.playersGameoverHandler.bind(this, state));
  }

  public async startReplay({ playId, inputHistory }: {playId: string, inputHistory: InputHistory }): Promise<void> {
    this.updateState('replay');
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const level = (await Axios.get(`/level/${this.levelName}`)).data.data;
    const game = new SnakeGame(playId, level, 1);
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

  public async playBot(bots: Worker[]): Promise<void> {
    if (!this.level) {
      Alert(`Can't activate bot when level isn't loaded`);
      return;
    }

    this.gameState = 'play';
    this.playerResult = null;
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const level = (await Axios.get(`/level/${this.levelName}`)).data.data;
    const playId = (await Axios.post(`/get-play-id`, { sessionId: this.sessionId })).data.data;

    const game = new SnakeGame(playId, level, bots.length);
    game.addScoreListener(this.setScore.bind(this));

    const renderer = new SnakeRenderer(game, theme, context);
    const botPlayers = bots.map((bot, botIndex) => new SnakeBot(game, level, bot, botIndex));

    // Wait for gameover
    const state: GamePlayerState = { playId, game, renderer, players: botPlayers };
    game.gameover.then(this.botGameoverHandler.bind(this, state));
  }

  public setScore({ playerIndex, score } : { playerIndex: number, score: number }) {
    this.$set(this.scores, playerIndex, score);
  }

  private async playersGameoverHandler(state: GamePlayerState) {
    state.players.forEach((player: SnakeAgentController) => player.destroy());
    state.renderer.destroy();

    if (this.numPlayers === 1) {
      this.playerResult = {
        playId: state.playId,
        sessionId: this.sessionId,
        score: state.game.getScores()[0],
        inputHistory: (state.players[0] as unknown as SnakePlayer).inputHistory
      };
    } else {
      this.playerResult = null;
    }
    this.updateState('highscores');
  }

  private async botGameoverHandler(state: GamePlayerState) {
    state.players.forEach((player: SnakeAgentController) => player.destroy());
    state.renderer.destroy();
    this.gameState = 'menu';
  }
}
</script>

<style lang="scss" scoped>
</style>
