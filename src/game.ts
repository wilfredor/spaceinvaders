import { Nave } from "./nave";
import { Enemies } from "./enemies";
import { Config } from "./config";
import { Services, services as defaultServices } from "./tools";
import { ShieldManager } from "./shields";
import { PowerUpManager } from "./powerUps";

export class Game {
  private readonly services: Services;
  paused = false;
  enemies!: Enemies;
  nave!: Nave;
  mouseX = 0;
  shields: ShieldManager;
  powerUps: PowerUpManager;
  private _level = 1;
  private _score = 0;
  private _life = 3;
  private isGameOver = false;

  constructor(services: Services = defaultServices) {
    this.services = services;
    this.shields = new ShieldManager();
    this.powerUps = new PowerUpManager();
    this.updateHud();
  }

  get level(): number {
    return this._level;
  }

  set level(value: number) {
    this._level = value;
    this.updateHud();
  }

  get score(): number {
    return this._score;
  }

  set score(value: number) {
    this._score = value;
    this.updateHud();
  }

  get life(): number {
    return this._life;
  }

  set life(value: number) {
    this._life = value;
    this.updateHud();
  }

  private updateHud() {
    this.services.drawHud(this._level, this._score, this._life);
  }

  showMessage(messageContent: string) {
    this.paused = true;
    this.services.printMessage(messageContent);

    if (messageContent !== "Pause") {
      setTimeout(() => {
        this.paused = false;
        this.redraw();
      }, 3000);
    }
  }

  pause(shouldPause: boolean) {
    if (shouldPause) {
      this.services.playPauseSound();
      this.showMessage("Pause");
    }

    this.paused = shouldPause;
    if (!shouldPause) {
      this.redraw();
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.services.explode(
      this.nave.x + Config.naveWidth / 2,
      this.nave.y + Config.naveHeight / 2,
      Config.naveWidth * 1.5
    );
    this.services.playPlayerDestroyed();
    this.services.startGameOverTheme();
    this.showMessage("You are dead");

    setTimeout(() => {
      this.reset();
    }, 3000);
  }

  reset() {
    // Clean up existing instances
    if (this.nave) {
      this.nave.destroy();
    }
    if (this.enemies) {
      this.enemies.stopEnemyFire();
    }

    // Reset state
    this.isGameOver = false;
    this.paused = false;
    this._level = 1;
    this._score = 0;
    this._life = 3;

    // Recreate managers
    this.shields = new ShieldManager();
    this.powerUps = new PowerUpManager();

    // Clear canvas
    this.services.clearAll();

    // Recreate game entities
    this.enemies = new Enemies(this, this.services);
    this.nave = new Nave(this, this.services);

    this.updateHud();
  }

  update(deltaSeconds: number) {
    if (this.paused || this.isGameOver) return;
    if (this.enemies) {
      this.enemies.update(deltaSeconds);
    }
    if (this.nave) {
      this.nave.tick(deltaSeconds);
    }
    this.powerUps.update(deltaSeconds, this.nave);
  }

  private redraw() {
    this.services.clearAll();
    this.updateHud();
    this.powerUps.clear();
    this.shields.draw();
    if (this.enemies) {
      this.enemies.paint();
    }
    if (this.nave) {
      this.nave.paint();
    }
  }
}
