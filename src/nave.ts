
import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
export class Nave {
  public width = 50;
  public height = 20;
  public life: number;
  public shots = 0;
  public maxshots = 3;
  public x = 0;
  public y: number;
  GAME: Game;
  enemies: Enemies;
  config: Config;

  constructor(config: Config) {
    this.life = config.life;
    this.y = config.canvas.height - this.height;
    this.GAME = new Game(config);
    this.enemies = new Enemies(this.GAME, this, config);
    this.config = config;
    this.paint();
    window.onkeydown = (event: KeyboardEvent) => { this.move(event); };
    window.onmousedown = () => { this.fire(); };
    window.onmousemove = (event: MouseEvent) => { this.move(event); };

  }

  fire(): void {
    if (!this.GAME.paused) {
      if (this.shots <= this.maxshots) {
        this.shots++;
        var xPos = this.x + 25;
        var i = (this.config.canvas.height - 60);
        this.directionFire(xPos, i);
      }
    }
  }

  directionFire(xPos: number, i: number) {
    if ((i <= -20))
      this.shots = 0;
    setTimeout(() => {
      if (i >= -20) {//If the fire is in screen border	
        //create fire and delete track
        this.config.context.clearRect(xPos, i + 20, 2, 12);
        this.config.context.fillRect(xPos, i, 2, 12);
        //if some enemy the fire stop
        if (this.enemies.checkColision(xPos, i, 7, 12)) {
          i = -5;
          this.enemies.paint();
          //this.shots=0;
        }
        //Recursion, the shot is going
        this.directionFire(xPos, i - 20);
      }
    }, 30);
  }

  paint() {
      //paint nave in relative screen position
      this.config.context.fillStyle = "#7fff00";
      this.config.context.clearRect(0, this.config.canvas.height - (this.height + this.height / 2), this.config.canvas.width, this.config.canvas.height);
      this.config.context.fillRect(this.x, this.y, this.width, this.height);
      //Nave canon
      this.config.context.fillRect(this.x + 24, this.config.canvas.height - 30, 3, 5);
      this.config.context.clearRect(this.x - 4, this.config.canvas.height - 27, 7, 12);
      this.config.context.fillRect(this.x + 22, this.config.canvas.height - 25, 7, 12);
      this.config.context.clearRect(this.x + this.width - 3, this.config.canvas.height - 27, 7, 12);
  }

  moveLeft(step: number) {
    this.x -= this.width / step;
    if (this.x <= (-this.width))
      this.x = this.config.canvas.width - this.width;
    this.paint();
  }

  moveRight(step: number) {
    this.x += this.width / step;
    if (this.x >= this.config.canvas.width)
      this.x = 0;
    this.paint();
  }

  move(event: KeyboardEvent | MouseEvent) {
    if ((event instanceof KeyboardEvent) && event.code == 'KeyP')
      this.GAME.pause(!this.GAME.paused);
    if (!this.GAME.paused) {
      if (event instanceof MouseEvent) {
        var mouseXaux = event.clientX + document.body.scrollLeft;
        if (this.config.mouseX > mouseXaux)
          this.moveLeft(5);
        if (this.config.mouseX < mouseXaux)
          this.moveRight(5);
        if (this.config.mouseX != mouseXaux)
        this.config.mouseX = mouseXaux;
      }
      else if (event instanceof KeyboardEvent) {
        console.log(event.code);
        if (event.code == 'ArrowLeft')  //LEFT
          this.moveLeft(2);
        else if (event.code == 'ArrowRight')  //RIGHT
          this.moveRight(2);
        else if (event.code == 'ControlLeft' || event.code == 'Space')  //UP FIRE
          this.fire();
      }
    }
  }
};
