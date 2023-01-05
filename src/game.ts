import { Config } from "./config";
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

    this.config.context.font = "30px Courier New";
    this.config.context.fillStyle = 'white';
    this.config.context.fill();
    this.config.context.textAlign = 'center';
    this.config.context.fillText(messageContent, x, y);
    

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
