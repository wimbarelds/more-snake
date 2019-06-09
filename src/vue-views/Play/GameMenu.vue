<template>
    <transition name="slide">
        <div class="backdrop" v-if="show">
            <div class="menu">
                <h2>Game Menu</h2>
                <div class="menu-items">
                    <button type="button" @click="$emit('update-state', 'play')">
                        Start game
                        <span class="small-text">{{ level }}</span>
                    </button>
                    <button type="button" @click="$emit('update-state', 'load-bot')">Load bot</button>
                    <button type="button" @click="$emit('update-state', 'choose-level')">Choose level</button>
                    <button type="button" @click="$emit('update-state', 'highscores')">Show highscores</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class GameMenu extends Vue {
    @Prop({ default: false }) public show!: boolean;
    @Prop({ required: true }) public level!: string;
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

button {
    display: block;
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
    transition: box-shadow .4s ease-in-out;
    outline: 0;

    &:hover {
        box-shadow: 5px 5px var(--color-accent);
    }

    .small-text {
        font-size: 50%;
    }
}
</style>
