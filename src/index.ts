import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { Nave } from "./nave";
import { services } from "./tools";
import { GameLoop } from "./gameLoop";
import { CollisionSystem } from "./collision";

function sizeCanvases() {
    const playfield = document.getElementById("playfield") as HTMLCanvasElement;
    const projectiles = document.getElementById("projectiles") as HTMLCanvasElement;
    if (!playfield || !projectiles) return;

    const maxWidth = Math.min(480, Math.max(320, window.innerWidth - 20));
    const aspect = 500 / 480; // original canvas aspect after recent change
    const maxHeight = Math.min(640, window.innerHeight - 40);
    const height = Math.min(maxHeight, Math.max(400, Math.round(maxWidth * aspect)));

    playfield.width = maxWidth;
    playfield.height = height;
    projectiles.width = maxWidth;
    projectiles.height = height;

    const gameContainer = document.getElementById("game") as HTMLElement;
    if (gameContainer) {
        gameContainer.style.width = `${maxWidth}px`;
        gameContainer.style.height = `${height}px`;
    }
}

function attachAudioUnlock() {
    const unlock = () => {
        services.unlockAudio();
        services.startIntroTheme();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
}

window.onload = () => { 
    sizeCanvases();
    Config.init();
    // Attempt to start audio immediately; fallback unlock remains for browsers that still require gesture.
    services.unlockAudio();
    services.startIntroTheme();
    attachAudioUnlock();
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
