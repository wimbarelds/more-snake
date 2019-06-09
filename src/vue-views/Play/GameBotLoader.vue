<template>
    <transition name="overlay-slide">
        <div class="overlay__container" v-if="show">
            <div class="overlay__backdrop"></div>
            <div class="overlay__content modal">
                <div class="modal__title">
                    <h2>Bot loader</h2>
                    <button class="modal__close" @click="$emit('close')">&times;</button>
                </div>
                <div class="modal__body">
                    <p>
                        You can create a bot for this game and run it in a webworker.
                        The bot will receive relevant game info and be able to send input to the game.
                    </p>
                    <p>
                        You can either load a bot from a URL (which will need to allow cross-origin requests), or upload a file.
                    </p>
                    <form class="bot-loader-option" @submit="onURLSubmit($event)">
                        <h3>Enter Bot-script URL</h3>
                        <div class="form">
                            <input type="url" placeholder="http://" required v-model="botURL">
                            <button type="submit">Load bot from URL</button>
                        </div>
                    </form>
                    <form class="bot-loader-option" @submit="onFileSubmit($event)">
                        <h3>Pick a file</h3>
                        <div class="form">
                            <label class="upload-file">
                                <span class="filename" :class="{ empty: !file }">{{ fileName }}</span>
                                <input type="file" required ref="fileInput" @change="onFileChange">
                            </label>
                            <button type="submit">Load bot from File</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Axios from 'axios';

@Component
export default class GameBotLoader extends Vue {
    @Prop({ default: false }) show!: boolean;

    public botURL: string = 'http://localhost:8008/wim-bot.js';
    public file: File | null = null;

    public get fileName(): string {
        if (!this.file) return 'No file selected';
        return this.file.name;
    }

    public onFileChange() {
        this.file = null;
        const fileInput: HTMLInputElement = this.$refs.fileInput as HTMLInputElement;
        if (fileInput.files && fileInput.files.length) {
            this.file = fileInput.files[0];
        }
    }

    public async onURLSubmit(e: Event) {
        e.preventDefault();
        const response = Axios.get<string>(this.botURL);
        const script: string = (await response).data;
        const bot: Worker = new Worker(
            URL.createObjectURL(new Blob([ script ]))
        );
        this.$emit('play-bot', bot);
    }

    public onFileSubmit(e: Event): void {
        e.preventDefault();
        const fileInput: HTMLInputElement = this.$refs.fileInput as HTMLInputElement;
        if (!fileInput.files || !fileInput.files.length) return;
        const bot: Worker = new Worker(
            URL.createObjectURL(fileInput.files[0])
        );
        this.$emit('play-bot', bot);
    }
};
</script>

<style lang="scss" scoped>
.modal {
    width: 400px;
    max-width: calc(100vw - 30px);
    padding-bottom: 10px;
}

.form {
    display: flex;
    flex-direction: column;
}

input[type="url"],
.upload-file {
    display: block;
    flex: 1;
    font-size: 14px;
    font-family: 'Arcade Normal';
    border: solid var(--color-secondary) 3px;
    height: 24px;
    padding: 5px 10px;
}

input[type="file"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.form button {
    font-family: 'Arcade Normal';
    border: 0;
    background-color: var(--color-secondary);
    color: var(--color-primary);
    cursor: pointer;
    padding: 10px;
    margin-top: 5px;
}

.filename.empty {
    opacity: .5;
}
</style>
