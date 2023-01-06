export class Config {
    static canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    static context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    static game = document.getElementById('game')! as HTMLElement;
    static enemyWidth = 30;
    static enemyHeight = 30;
    static naveWidth = 50;
    static naveHeight = 20;
    static naveLife = 3;
    static naveShots = 0;
    static naveMaxshots = 3;
    static firstSpeedLevel = 8000;
    static fireHeight = 20;
    static enemyFireSpeed = 1000;
}
