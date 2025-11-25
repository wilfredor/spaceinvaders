export class Config {
    static canvas: HTMLCanvasElement;
    static context: CanvasRenderingContext2D;
    static projectileCanvas: HTMLCanvasElement;
    static projectileContext: CanvasRenderingContext2D;
    static game = document.getElementById('game')! as HTMLElement;

    // Base values used to scale sprites relative to canvas size.
    private static readonly baseWidth = 560;
    private static readonly baseHeight = 720;
    private static readonly baseEnemySize = 24;
    private static readonly baseNaveSize = { width: 40, height: 16 };
    private static readonly baseFireHeight = 16;
    private static readonly baseFirstSpeedLevel = 8000;
    private static readonly baseEnemyFireSpeed = 1000;

    static enemyWidth: number;
    static enemyHeight: number;
    static naveWidth: number;
    static naveHeight: number;
    static naveLife = 3;
    static naveShots = 0;
    static naveMaxshots = 3;
    static firstSpeedLevel: number;
    static fireHeight: number;
    static enemyFireSpeed: number;

    static init() {
        this.canvas = document.getElementById("playfield") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.projectileCanvas = document.getElementById("projectiles") as HTMLCanvasElement;
        this.projectileContext = this.projectileCanvas.getContext("2d") as CanvasRenderingContext2D;

        const scale = Math.min(
            this.canvas.width / this.baseWidth,
            this.canvas.height / this.baseHeight
        );

        this.enemyWidth = Math.max(12, Math.round(this.baseEnemySize * scale));
        this.enemyHeight = this.enemyWidth;
        this.naveWidth = Math.max(24, Math.round(this.baseNaveSize.width * scale));
        this.naveHeight = Math.max(10, Math.round(this.baseNaveSize.height * scale));
        this.fireHeight = Math.max(8, Math.round(this.baseFireHeight * scale));

        // Speed values inversely scale so timing stays similar across sizes.
        const speedScale = Math.max(0.5, Math.min(2, 1 / scale));
        this.firstSpeedLevel = Math.round(this.baseFirstSpeedLevel * speedScale);
        this.enemyFireSpeed = Math.round(this.baseEnemyFireSpeed * speedScale);
    }
}
