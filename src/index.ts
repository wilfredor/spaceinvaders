
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Nave } from "./nave";

window.onload = () => { 
    const game = new Game();
    game.enemies = new Enemies(game);
    game.nave = new Nave(game);
};