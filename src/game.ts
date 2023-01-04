import { Config } from "./config";
import { Enemies } from "./enemies";
export class Game {
  paused: boolean;
  config: Config;
  constructor(config: Config) {
    this.paused = false;
    this.config = config;
  }

  showMessage(messageContent: string) {
    this.paused = true;
    // window.enemies.removeEnemies();
    var x = this.config.canvas.width / 2; //Center text in canvas 
    var y = this.config.canvas.height / 2;
    var ctx = this.config.canvas.getContext("2d") as CanvasRenderingContext2D;
    if (ctx) {
      ctx.font = "30px Courier New";
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillText(messageContent, x, y);
    }

    if (messageContent != "Pause") {
      setTimeout(() => {
        this.paused = false;
      }, 3000);
    }

  }

  pause(pause: boolean) {
    if (pause) {
      this.showMessage("Pause");
    }

    this.paused = pause;
  }

};
