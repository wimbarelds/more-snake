<template>
    <transition name="fade">
        <div class="controls" v-if="show">
            <button class="up" @touchstart="sendFake('UP')"></button>
            <button class="down" @touchstart="sendFake('DOWN');"></button>
            <button class="left" @touchstart="sendFake('LEFT');"></button>
            <button class="right" @touchstart="sendFake('RIGHT');"></button>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Direction } from '../../game/SnakeGame';
import { keyBindings } from '../../game/SnakeKeyBindings';

@Component
export default class GameMenu extends Vue {
    @Prop({ default: false }) public show!: boolean;

    public sendFake(key: Direction) {
        const event = document.createEvent('Event');
        if (event.initEvent) event.initEvent('keydown', true, true);
        Object.assign(event, { keyCode: keyBindings[0], which: keyBindings[0][key] });
        window.dispatchEvent(event);
    }
}
</script>

<style lang="scss" scoped>
.controls {
    position: fixed;
    display: none;
    bottom: 10px;
    left: 50%;
    width: 260px;
    height: 190px;
    margin-left: -130px;
    @media (max-width: 800px) and (orientation: portrait) {
        display: block;
    }
}

button {
    position: absolute;
    width: 90px;
    height: 90px;
    background-color: var(--color-accent);
    border: 0;
    border-radius: 50%;
    outline: 0;

    &::before {
        content: '';
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 30px;
        height: 30px;
        margin-left: -15px;
        margin-top: -15px;
        border: solid 5px var(--color-primary);
        border-width: 5px 5px 0 0;
    }

    &.up, &.down { left: 85px; }
    &.left, &.right { top: 50px; }
    &.up { top: 0px; }
    &.down { bottom: 0px; }
    &.left { left: 0px; }
    &.right { right: 0px; }

    &.up::before { transform: translateY(5px) rotate(-45deg); }
    &.down::before { transform: translateY(-5px) rotate(135deg); }
    &.right::before { transform: translateX(-5px) rotate(45deg); }
    &.left::before { transform: translateX(5px) rotate(-135deg); }

    &:active {
        background-color: var(--color-accent-alt);
    }
}
</style>
