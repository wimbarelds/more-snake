<template>
    <div class="edit">
        <div class="right">
            <div class="meta-info">
                <input type="text" v-model="levelName" placeholder="level name">
                <button type="button" @click="saveMap()">Save</button>
            </div>
            <div class="tools">
                <button type="button" :class="{active: tool === activeTool }" v-for="tool in tools" :key="tool" @click="activeTool = tool">{{ tool }}</button>
                <button type="button" @click="resetMap()">Reset Level</button>
            </div>
        </div>
        <canvas
            ref="canvas"
            width="1280"
            height="640"
            @mousemove="mouseMoveHandler($event)"
            @mousedown="mouseDownHandler($event)"
            ></canvas>
    </div>
</template>

<script lang="ts">
const canvasWidth = 1280;
const canvasHeight = 640;

import { Component, Vue, Watch } from 'vue-property-decorator';
import Axios from 'axios';
import { Alert, Confirm } from '@/alerts/alerts';

type Tool = 'Draw Wall' | 'Place Snake' | 'Erase Wall';
interface Pos {
    x: number;
    y: number;
}

const initialSnakePos = [ { x: 630, y: 320 }, { x: 630, y: 330 } ];

@Component
export default class EditView extends Vue {
    public activeTool: Tool = 'Draw Wall';
    public tools: Tool[] = [ 'Draw Wall', 'Place Snake', 'Erase Wall' ];
    public wallTiles: Pos[] = [];
    public snakeTiles: Pos[] = initialSnakePos;
    public levelName: string = '';
    public sessionId: string = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(32);

    private rendererActive: boolean = false;
    private gridCanvas: HTMLCanvasElement = document.createElement('canvas');
    private wallCanvas: HTMLCanvasElement = document.createElement('canvas');

    private mouseButtonDown: boolean = false;
    private mouseUpHandler!: (e: MouseEvent) => void;

    private get canvas(): HTMLCanvasElement {
        return this.$refs.canvas as HTMLCanvasElement;
    }

    private get context(): CanvasRenderingContext2D {
        if (!this.canvas) {
            return null as unknown as CanvasRenderingContext2D;
        }
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public mounted(): void {
        // Mouse Up Handler
        this.mouseUpHandler = (e: MouseEvent) => {
            this.mouseButtonDown = false;
        };
        document.addEventListener('mouseup', this.mouseUpHandler);
        // load or save session ID, this is used for saving maps as a user-token
        if (sessionStorage.sessionID) {
            this.sessionId = sessionStorage.sessionId;
        } else {
            sessionStorage.sessionId = this.sessionId;
        }
        // Render init
        this.renderInit();
    }

    public resetMap() {
        this.levelName = '';
        this.activeTool = 'Draw Wall';
        this.snakeTiles = initialSnakePos;
        this.wallTiles = [];
        (this.wallCanvas.getContext('2d') as CanvasRenderingContext2D).clearRect(0, 0, canvasWidth, canvasHeight);
    }

    public async saveMap() {
        const levelName = this.levelName.trim();
        if (!levelName) {
            return alert(`You haven't given your level a name!`);
        }
        if (!this.wallTiles.length) {
            return alert(`You have to place some walls first!`);
        }
        const data = {
            levelName,
            sessionId: this.sessionId,
            wallTiles: this.wallTiles,
            snakeTiles: this.snakeTiles,
        };

        const result = await Axios.post('/save', data);
        if (result.data.success) {
            Alert('Your level was saved');
        } else {
            Alert(result.data.message, 'Error saving your level');
        }
    }

    public mouseMoveHandler(e: MouseEvent) {
        e.preventDefault();
        if (this.mouseButtonDown) {
            this.onCursorDown(e);
        }
    }

    public mouseDownHandler(e: MouseEvent) {
        e.preventDefault();
        this.mouseButtonDown = true;
        this.onCursorDown(e);
    }

    private renderInit(): void {
        this.initGrid(); // prepare a layer that we can insta-draw later
        this.initWall();

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.rendererActive = true;
        this.renderFrame();
    }

    private initGrid(): void {
        this.gridCanvas.width = canvasWidth;
        this.gridCanvas.height = canvasHeight;
        const gridContext = this.gridCanvas.getContext('2d') as CanvasRenderingContext2D;
        for (let x = 10; x < canvasWidth; x += 10) {
            gridContext.beginPath();
            gridContext.strokeStyle = '#FFF';
            gridContext.setLineDash([.25, .25]);
            gridContext.moveTo(x, 0);
            gridContext.lineTo(x, canvasHeight);
            gridContext.stroke();
        }
        for (let y = 10; y < canvasHeight; y += 10) {
            gridContext.beginPath();
            gridContext.strokeStyle = '#FFF';
            gridContext.setLineDash([.25, .25]);
            gridContext.moveTo(0, y);
            gridContext.lineTo(canvasWidth, y);
            gridContext.stroke();
        }
    }

    private initWall(): void {
        this.wallCanvas.width = canvasWidth;
        this.wallCanvas.height = canvasHeight;
    }

    private drawWallTile(x: number, y: number) {
        const context = this.wallCanvas.getContext('2d') as CanvasRenderingContext2D;
        context.beginPath();
        context.fillStyle = '#FFF';
        context.rect(x, y, 10, 10);
        context.fill();
    }

    private eraseWallTile(x: number, y: number) {
        const context = this.wallCanvas.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(x, y, 10, 10);
    }

    private renderSnake(): void {
        this.snakeTiles.forEach((pos) => {
            this.context.beginPath();
            this.context.fillStyle = '#fd5819';
            this.context.rect(pos.x, pos.y, 10, 10);
            this.context.fill();
        });
    }

    private renderFrame(): void {
        this.context.clearRect(0, 0, canvasWidth, canvasHeight);

        this.context.drawImage(this.wallCanvas, 0, 0);
        this.context.drawImage(this.gridCanvas, 0, 0);
        this.renderSnake();

        if (this.rendererActive) {
            requestAnimationFrame(this.renderFrame.bind(this));
        }
    }

    private normalizedCursorPosFromEvent(e: MouseEvent): Pos {
        return {
            x: Math.floor(e.offsetX / this.canvas.clientWidth * canvasWidth / 10) * 10,
            y: Math.floor(e.offsetY / this.canvas.clientHeight * canvasHeight / 10) * 10,
        };
    }

    private addWallTile(pos: Pos) {
        if (this.wallTiles.some((tile) => tile.x === pos.x && tile.y === pos.y)) {
            return;
        }
        if (this.snakeTiles.some((tile) => tile.x === pos.x && tile.y === pos.y)) {
            return;
        }
        this.wallTiles.push(pos);
        this.drawWallTile(pos.x, pos.y);
    }

    private placeSnake(pos: Pos) {
        this.snakeTiles = [ pos, { x: pos.x, y: pos.y + 10 } ];
        this.snakeTiles.forEach(this.removeWall.bind(this));
    }

    private removeWall(erasePos: Pos) {
        const index = this.wallTiles.findIndex((wallTile) => erasePos.x === wallTile.x && erasePos.y === wallTile.y);
        if (index >= 0) {
            const removed = this.wallTiles.splice(index, 1).pop() as Pos;
            this.eraseWallTile(removed.x, removed.y);
        }
    }

    private onCursorDown(e: MouseEvent) {
        const pos = this.normalizedCursorPosFromEvent(e);
        if (this.activeTool === 'Draw Wall') {
            this.addWallTile(pos);
        }
        if (this.activeTool === 'Place Snake') {
            this.placeSnake(pos);
        }
        if (this.activeTool === 'Erase Wall') {
            this.removeWall(pos);
        }
    }

    private beforeDestroy() {
        document.removeEventListener('mouseup', this.mouseUpHandler);
    }
}
</script>

<style lang="scss" scoped>
canvas {
    cursor: crosshair;
}

.right {
    position: fixed;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    top: 0;
    right: 10px;
}

.meta-info {
    padding: 10px;
    display: flex;

    input {
        background: transparent;
        border: solid var(--color-primary) 5px;
        font-family: 'Arcade Rounded';
        color: var(--color-primary);
        padding: 5px;
        height: 35px;
    }

    button {
        background: var(--color-primary);
        border: 0;
        font-family: 'Arcade Normal';
        color: var(--color-secondary);
        padding: 10px;
        cursor: pointer;
        height: 35px;
    }
}

.tools {
    border: solid var(--color-primary) 5px;
    border-top: 0;
    padding: 10px;

    button {
        border: 0;
        border-bottom: 0;
        padding: 0 10px;
        background-color: transparent;
        color: var(--color-primary);
        font-family: 'Arcade Normal';
        outline: 0;
        cursor: pointer;
        line-height: 1;

        &:hover {
            text-decoration: underline;
        }

        &.active {
            color: var(--color-accent);
        }
    }
}

@media (max-width: 800px) and (orientation: portrait) {
    .right {
        max-width: calc(100vw - 10px);
        left: 10px;
        right: 0;
    }

    .tools {
        width: 110px;
        border-right: 0;
        button + button {
            margin-top: 10px;
        }
    }

    .meta-info {
        margin-top: 60px;
        margin-right: 10px;
        display: flex;
        width: calc(100vw - 120px);
        overflow: hidden;
        padding: 0;

        input {
            width: calc(100% - 75px);
        }
    }
}
</style>
