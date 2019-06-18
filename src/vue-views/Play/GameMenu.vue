<template>
    <transition name="slide">
        <div class="backdrop" v-if="show">
            <div class="menu">
                <h2>Game Menu</h2>
                <div class="menu-items">
                    <div class="num-players">
                        <p>Num players</p>
                        <div class="num-players__buttons">
                            <button
                                v-for="n in 3"
                                :key="n"
                                type="button"
                                :class="{ active: (numPlayers === n) }"
                                :disabled="n > maxNumPlayers"
                                @click="setNumPlayers(n)">
                                {{ n }}
                            </button>
                        </div>
                    </div>
                    <button type="button" @click="$emit('update-state', 'play')" :disabled="!levelLoaded">
                        Start game
                        <span class="small-text">{{ levelNameLoading }}</span>
                    </button>
                    <button type="button" @click="$emit('update-state', 'load-bot')" :disabled="!levelLoaded">Load bot</button>
                    <button type="button" @click="$emit('update-state', 'choose-level')">Choose level</button>
                    <button type="button" @click="$emit('update-state', 'highscores')">Show highscores</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Level } from '../../game/SnakeGame';
@Component
export default class GameMenu extends Vue {
    @Prop({ default: false }) public show!: boolean;
    @Prop({ required: true }) public levelName!: string;
    @Prop({ default: null }) public level!: Level | null;
    @Prop({ default: 1 }) public numPlayers!: number;

    public get levelLoaded(): boolean {
        return this.level !== null;
    }

    public get levelNameLoading(): string {
        const { levelLoaded, levelName } = this;
        return levelLoaded ? levelName : 'Loading';
    }

    public get maxNumPlayers(): number {
        return this.level ? this.level.snakeTiles.length : 0;
    }

    public setNumPlayers(numPlayers: number) {
        this.$emit('update-num-players', numPlayers);
    }
}
</script>

<style lang="scss" scoped>
.backdrop {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .5);
    z-index: 1;
}
.menu {
    h2 {
        text-shadow: 1px 1px var(--color-primary);
    }
}

.num-players {
    p {
        margin-top: 0;
    }

    &__buttons {
        display: flex;

        button {
            text-align: center;

            + button {
                margin-left: 20px;
            }
        }
    }
}

button {
    display: block;
    position: relative;
    color: var(--color-primary);
    background-color: rgba(0, 0, 0, .5);
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
    text-align: left;
    border: 0;
    font-family: 'Arcade Normal';
    border: solid var(--color-accent) 1px;
    cursor: pointer;
    box-shadow: 0px 0px var(--color-accent);
    transition: box-shadow .4s ease-in-out, background-color .4s ease-in-out;
    outline: 0;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: .75;
    }

    &:hover {
        box-shadow: 5px 5px var(--color-accent);
    }

    &.active {
        background-color: var(--color-accent);
        border-color: var(--color-secondary);
    }

    .small-text {
        font-size: 50%;
    }

    &[disabled] {
        pointer-events: none;
        filter: saturate(0);
    }
}
</style>
