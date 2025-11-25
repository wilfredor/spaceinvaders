import { Config } from "./config";
import { Game } from "./game";

//Check if a var exist
export class Tool {
    //A random number multiple of 5
    static randomRange(min: number, max: number) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    }
    static paintNave(x:number,y:number, color: string = "#7fff00") {
        //paint nave in relative screen position
        Config.context.fillStyle = color;
        Config.context.clearRect(0, 
                                Config.canvas.height - (Config.naveHeight + Config.naveHeight / 2), 
                                Config.canvas.width, Config.canvas.height);
        Config.context.fillRect(x, y, Config.naveWidth, Config.naveHeight);
        //Nave canon
        Config.context.fillRect(x + 24, Config.canvas.height - 30, 3, 5);
        Config.context.clearRect(x - 4, Config.canvas.height - 27, 7, 12);
        Config.context.fillRect(x + 22, Config.canvas.height - 25, 7, 12);
        Config.context.clearRect(x + Config.naveWidth - 3, Config.canvas.height - 27, 7, 12);
    }
    static paintFire(x:number,y:number) {
        Config.context.clearRect(x, y + 20, 2, 12);
        Config.context.fillRect(x, y, 2, 12);
    }
    static makefire(x:number, y:number) {
        //Make a fire and delete track
        Config.context.fillStyle = "#FF0000";
        Config.context.clearRect(x, y - 20, 3, 9);
        Config.context.fillRect(x, y, 3, 9);
        Config.context.fillStyle = "#7fff00";
     }
     static printMessage(messageContent:string){
        var x = Config.canvas.width / 2; //Center text in canvas 
        var y = Config.canvas.height / 2;
        Config.context.font = "30px Courier New";
        Config.context.fillStyle = 'white';
        Config.context.fill();
        Config.context.textAlign = 'center';
        Config.context.fillText(messageContent, x, y);
     }
     static directionFire(x: number, y: number,game:Game) {
        setTimeout(() => {
           if (y <= Config.canvas.height - 20) {//If the fire is not in screen border	
              //Make a fire and delete track
              Tool.makefire(x, y);
              //the fire resume trayectory
              this.directionFire(x, y + 20,game);
           } else if ((x >= game.nave.x) && (x <= (game.nave.x + Config.enemyWidth))) {
                 game.nave.life--;
                 game.life = game.nave.life;
                 game.nave.flashHit();
                 if (game.nave.life <= 0) {
                    game.showMessage("You are dead");
                    game.reload();
                 }
           } else
              Config.context.clearRect(x, y - 20, 3, 9);
        }, 30);
     }
     static removeEnemies() {
        //Clean place
        //9 is the canon height
        Config.context.clearRect(0, 
                                0, 
                                Config.canvas.width, 
                                Config.canvas.height - (Config.naveHeight + 9));
      }
}
