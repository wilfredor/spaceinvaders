
import {IConfig} from './modele/iconfig'
export class Config implements IConfig {
    _mouseX!: number;
    _level!: number;
    _score!: number;
    _life!: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    game: HTMLElement;
    enemyWidth = 30;
    enemyHeight = 30;
    naveWidth = 50;
    naveHeight = 20;
    naveLife=3;
    naveShots=0;
    naveMaxshots=3;
    firstSpeedLevel=8000;

    constructor(

    ) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.game = document.getElementById('game')!;
        this.canvas.setAttribute('width', '800');
        this.canvas.setAttribute('height', '500');
        this.game.appendChild(this.canvas);
        this.level = 1;
        this.score = 0;
        this.life = 3;
    }

    public get mouseX(): number {
        return this._mouseX;
    }
    public set mouseX(value: number) {
        this._mouseX = value;
    }
    public set level(level: number) {
        this._level = level;
        this.setLabel('level', String(level));
    }
    public get level() {
        return this._level;
    }
    public set life(life: number) {
        this._life = life;
        this.setLabel('life', String(life));
    }
    public get life() {
        return this._life;
    }
    public set score(score: number) {
        this._score = score;
        this.setLabel('score', String(score));
    }
    public get score() {
        return this._score;
    }
    private setLabel(id: string, textContent: string) {
        const label = document.getElementById(id);
        if (label !== null) {
            label.textContent = textContent;
        }
    }


}
