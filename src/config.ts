import { Nave } from "./nave";
import { Game } from "./game";
export class Config {
   
     // Create canvas element in body.
     canvas = document.createElement('canvas');
     context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
   
     game = document.getElementById('game')!;
   
     mouseX = 0;
     // Where I show the information about level, score and live.
     private _level!: number;
     private _score!: number;
     private _life!: number;
     
     public set level(level:number) {
        this._level = level;
        this.setLabel('level',String(level));
     }
     public get level() {
        return this._level;
     }
     public set life(life:number) {
        this._life = life;
        this.setLabel('life',String(life));
     }
     public get life() {
        return this._life;
     }
     public set score(score:number) {
        this._score = score;
        this.setLabel('score',String(score));
     }
     public get score() {
        return this._score;
     }
     private setLabel(id:string,textContent:string) {
        const label = document.getElementById(id);
        if (label!==null) {
            label.textContent = textContent;
        }
     }
     constructor() {
   
     this.canvas.setAttribute('width', '800');
     this.canvas.setAttribute('height', '500');
     this.canvas.setAttribute('style', 'position:absolute;top:23px;'); 

     this.game.appendChild(this.canvas);

     this.level = 1;
     this.score = 0;
     this.life = 3;

     }
 
}
