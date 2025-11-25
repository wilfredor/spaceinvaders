import { Nave } from "./nave";
import { Enemies } from "./enemies";
import { Config } from "./config";
import { Tool } from "./tools";

export class Game {
  _paused!: boolean;
  _enemies!: Enemies;
  _nave!: Nave;
  _mouseX!: number;
  _level!: number;
  _score!: number;
  _life!: number;

  constructor() {
    this.level = 1;
    this.score = 0;
    this.life = 3;
  }

  showMessage(messageContent: string) {
    this._paused = true;

    Tool.printMessage(messageContent);

    if (messageContent != "Pause") {
      setTimeout(() => {
        this._paused = false;
        this.redraw();
      }, 3000);
    }

  }
  reload() {
    setTimeout(function () {
      window.location.reload();
   }, 3000);
  }

  pause(pause: boolean) {
    if (pause) {
      this.showMessage("Pause");
    }

    this._paused = pause;
    if (!pause) {
      this.redraw();
    }
  }

  get paused ():boolean {
    return this._paused;
  }
  set paused(paused:boolean) {
    this._paused =paused;
  }
  get enemies ():Enemies {
    return this._enemies;
  }
  set enemies(enemies:Enemies) {
    this._enemies =enemies;
  }
  get nave ():Nave {
    return this._nave;
  }
  set nave(nave:Nave) {
    this._nave =nave;
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
    Tool.drawHud(this._level, this._score, this._life);
}

public get mouseX(): number {
  return this._mouseX;
}
public set mouseX(value: number) {
  this._mouseX = value;
}

private redraw() {
  Tool.clearAll();
  Tool.drawHud(this._level, this._score, this._life);
  if (this._enemies) {
    this._enemies.paint();
  }
  if (this._nave) {
    this._nave.paint();
  }
}

};
