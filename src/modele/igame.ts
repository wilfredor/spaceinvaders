import { Config } from "../config";
import { Enemies } from "../enemies";
import { Nave } from "../nave";
import { IConfig } from "./iconfig";
import { IEnemies } from "./ienemies";
import { INave } from "./inave";

export interface IGame {
    showMessage(messageContent: string):void;
    pause(pause: boolean):void;
    paused(paused:boolean):void;
    config(config:Config):void;
    enemies(enemies:Enemies):void;
    nave(nave:Nave):void;
}