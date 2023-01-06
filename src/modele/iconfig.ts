export interface IConfig {
    _mouseX: number;
    _level: number;
    _score: number;
    _life: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    game: HTMLElement;
     get mouseX(): number;
     set mouseX(value: number);
     set level(level: number);
     get level();
     set life(life: number);
     get life();
     set score(score: number);
     get score();
}