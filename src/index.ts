import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Nave } from "./nave";
import { services } from "./tools";
import { GameLoop } from "./gameLoop";
import { CollisionSystem } from "./collision";

window.onload = () => { 
    Config.init();
    const game = new Game(services);
    game.enemies = new Enemies(game, services);
    game.nave = new Nave(game, services);

    const collisions = new CollisionSystem(game, services);
    const loop = new GameLoop();
    loop.start((dt) => {
      game.update(dt);
      collisions.tick();
    });
};
