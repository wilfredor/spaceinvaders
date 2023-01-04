import { Nave } from "./nave";
import { Game } from "./game";
export class Config {
    canvasWidth: number;
    canvasHeight: number;
    canvas: HTMLCanvasElement;
    game: HTMLElement | null;
    mouseX: number;
    level: HTMLElement | null;
    score: HTMLElement | null;
    life: HTMLElement | null;

    constructor() {
        //Canvas size
        this.canvasWidth = 800;
        this.canvasHeight = 500;

        //Create canvas element in body
        this.canvas = window.document.createElement("canvas");

        this.game = window.document.getElementById("game");

        this.mouseX = 0;
        //Where I show the information about level, score and live
        this.level = window.document.getElementById("level");
        this.score = window.document.getElementById("score");
        this.life = window.document.getElementById("life");

        this.canvas.setAttribute('width', String(this.canvasWidth));
        this.canvas.setAttribute('height', String(this.canvasHeight));
        this.canvas.setAttribute('style', 'position:absolute;top:23px;');//Space for level,score and life
        this.game?.appendChild(this.canvas);

        if (this.level) this.level.textContent = "1";
        if (this.score) this.score.textContent = "0";
        if (this.life) this.life.textContent = "3";
    }
}
