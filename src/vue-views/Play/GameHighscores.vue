<template>
    <transition name="overlay-slide">
        <div class="overlay__container" v-if="show">
            <div class="overlay__backdrop"></div>
            <div class="overlay__content modal">
                <div class="modal__title">
                    <h2>Highscores</h2>
                    <button class="modal__close" @click="$emit('close')">&times;</button>
                </div>
                <div class="modal__body">
                    <ul class="highscores" v-if="highscores">
                        <li class="highscore" v-for="(highscore, index) in highscores" :key="index" @click="watchReplay(highscore.playId, highscore.inputHistory)">
                            <button class="highscore__replay" title="Watch replay">
                                <img src="/Replay_1.png" alt="" class="rewind">
                                <img src="/Replay_2.png" alt="" class="arrow">
                            </button>
                            <span class="highscore__name">{{ highscore.playerName }}</span>
                            <span class="highscore__score">{{ highscore.score }}</span>
                        </li>
                    </ul>
                    <p v-else-if="loading">
                        Loading highscores
                    </p>
                    <div class="playerresult" v-if="playerResult">
                        <p class="playerscore">
                            <span class="label">Your score:</span>
                            <span class="value">{{ playerResult.score }}</span>
                        </p>
                        <div class="submit-highscore" v-if="playerHasHighscore">
                            <h3>That's a highscore!</h3>
                            <div class="submit-highscore__form" v-if="!scoreSubmitted">
                                <input type="text" v-model="playerName" placeholder="Enter your name">
                                <button @click="submitScore()">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { GamePlayerResult } from '../Play.vue';
import Axios from 'axios';
import { InputHistory, Highscore } from '@/game/SnakePlayer';
import { Alert } from '@/alerts/alerts';

interface ServerResultError {
    success: false;
    message: string;
}

interface ServerResultSuccess<T> {
    success: true;
    data: T;
}

export type ServerResult<T> = ServerResultError | ServerResultSuccess<T>;

@Component
export default class GameHighscores extends Vue {
    @Prop({ default: false }) public show!: boolean;
    @Prop({ default: '' }) public levelName!: string;
    @Prop({ required: false }) public playerResult?: GamePlayerResult;

    public loading: boolean = true;
    public highscores: Highscore[] | null = null;
    public playerName: string = '';
    public scoreSubmitted: boolean = false;

    public get playerScore(): number {
        return this.playerResult ? this.playerResult.score : 0;
    }

    public get playerHasHighscore(): boolean {
        const playerScore = this.playerScore;
        const highscores = this.highscores;
        if (!playerScore || !highscores) return false;
        return (highscores.some((highscore: Highscore) => highscore.score < playerScore));
    }

    @Watch('levelName', { immediate: true })
    public async loadHighscores() {
        this.loading = true;
        if (!this.levelName) return;
        const highscoresResult = await Axios.get<ServerResult<Highscore[]>>(`/highscores/${this.levelName}`);
        if (!highscoresResult.data.success) {
            Alert(highscoresResult.data.message, 'Error');
        } else {
            this.highscores = highscoresResult.data.data;
        }
        this.loading = false;
    }

    @Watch('playerHasHighscore')
    private toggleScoreSubmitted() {
        if (this.playerHasHighscore) this.scoreSubmitted = false;
    }

    public async submitScore() {
        if (!this.playerResult) return Alert('Nothing to submit');
        if (!this.playerName || !this.playerName.trim()) return Alert('You must enter a playername');
        this.scoreSubmitted = true;
        const result = await Axios.post<ServerResult<Highscore[]>>(`/highscores/${this.levelName}`, {
            playId: this.playerResult.playId,
            sessionId: this.playerResult.sessionId,
            playerName: this.playerName,
            score: this.playerResult.score,
            inputHistory: this.playerResult.inputHistory,
        });
        if (!result.data.success) {
            Alert(result.data.message, 'Error');
        } else {
            this.highscores = result.data.data;
            this.playerName = '';
        }
    }

    public watchReplay(playId: string, inputHistory: InputHistory) {
        this.$emit('start-replay', { playId, inputHistory })
    }
}
</script>

<style lang="scss" scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(-360deg);
    }
}

.playerresult {
    margin: 0 -10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, .05);

    h3 {
        text-align: center;
        font-size: 20px;
        padding: 0;
        margin: 10px 0;
        white-space: nowrap;
    }
}

.submit-highscore {
    &__form {
        display: flex;

        input, button {
            font-family: 'Arcade Normal';
            height: 36px;
            padding: 5px 10px;
        }

        input {
            flex: 1;
            background-color: var(--color-primary);
            border: solid var(--color-secondary) 1px;
        }

        button {
            border: 0;
            background-color: var(--color-secondary);
            color: var(--color-primary);
            cursor: pointer;
        }
    }
}

.playerscore {
    display: flex;
    justify-content: space-between;
    font-size: 14px;

    .value {
        color: var(--color-accent);
    }
}

.highscores {
    display: block;
    list-style: none;
    margin: 0;
    padding: 5px 0;
    font-size: 13px;

    .highscore {
        display: flex;
        list-style: none;
        padding: 5px 0;
        margin: 0;
        line-height: 20px;
        text-align: left;
        color: var(--color-secondary);
        transition: color .4s ease-in-out;
        cursor: pointer;

        &:hover {
            color: var(--color-accent);

            .rewind {
                animation: spin 1s ease-in-out infinite;
            }
        }

        &__name {
            flex: 1;
            margin: 0 10px;
        }

        &__replay {
            display: block;
            border: 0;
            background-color: transparent;
            position: relative;
            padding: 0;
            width: 20px;
            height: 20px;

            .rewind {
                position: absolute;
            }
        }
    }
}

</style>
