
import { Game } from "../game";
import { IGame } from "./igame"
export interface IEnemy {
    height: number;
    width: number;
    x: number;
    y: number;
    index: number;
    img: HTMLImageElement;
    game: Game;
}