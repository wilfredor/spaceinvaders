
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Nave } from "./nave";

window.onload = () => { 
    const game = new Game(new Config());
    game.enemies = new Enemies(0,0, game);
    game.nave = new Nave(0, game);
};