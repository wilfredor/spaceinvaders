import { IConfig } from "./modele/iconfig";
import { INave } from "./modele/inave";
import { IEnemies } from "./modele/ienemies";
import { Nave } from "./nave";
import { Enemies } from "./enemies";
import { Config } from "./config";
export class Game {
  _paused!: boolean;
  _config!: Config;
  _enemies!: Enemies;
  _nave!: Nave;

  constructor(config: Config ) {
    this._config = config;
  }

  showMessage(messageContent: string) {
    this._paused = true;
    // window.enemies.removeEnemies();
    var x = this._config.canvas.width / 2; //Center text in canvas 
    var y = this._config.canvas.height / 2;

    this._config.context.font = "30px Courier New";
    this._config.context.fillStyle = 'white';
    this._config.context.fill();
    this._config.context.textAlign = 'center';
    this._config.context.fillText(messageContent, x, y);
    

    if (messageContent != "Pause") {
      setTimeout(() => {
        this._paused = false;
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
  }

  get paused ():boolean {
    return this._paused;
  }
  set paused(paused:boolean) {
    this._paused =paused;
  }
  get config ():Config {
    return this._config;
  }
  set config(config:Config) {
    this._config =config;
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

};
