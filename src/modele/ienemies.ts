import { IConfig } from "./iconfig";
import { INave } from "./inave";
import { IGame } from "./igame"

export interface IEnemies {
    x: number;
    y: number;
    width: number;
    height: number;
    element: any[];
    enemiesType: HTMLImageElement[];
    reset():void;
    removeEnemies():void;
    remove(index: number):void;
    initEnemies():void;
    paint():void;
    moveXY(moveLeft: boolean | null):void;
    moveX(move_left: boolean, speed: number):void;
    moveY(speed: number):void;
    //Run fire to a enemy
    enemyFire(speed: number):void;
    //move enemies Vertically and Horizontally in the screen
    move():void;
    //Check if a enemy in array is colision with a fire
    checkColision(
      x: number,
      y: number,
      width: number,
      height: number
    ): boolean;
}