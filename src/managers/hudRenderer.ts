import { Config } from "../config";

export class HudRenderer {
  readonly height = 28;

  draw(level: number, score: number, lives: number) {
    const ctx = Config.context;
    const h = this.height;
    ctx.clearRect(0, 0, Config.canvas.width, h);

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, Config.canvas.width, h);

    ctx.font = "14px Courier New";
    ctx.fillStyle = "#9fe29f";
    ctx.textBaseline = "middle";
    ctx.fillText(`LVL`, 10, h / 2);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(level), 40, h / 2);

    ctx.fillStyle = "#9fe29f";
    ctx.fillText(`SCORE`, 80, h / 2);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(score), 140, h / 2);

    ctx.fillStyle = "#9fe29f";
    ctx.fillText(`LIVES`, 200, h / 2);
    for (let i = 0; i < lives; i++) {
      ctx.fillStyle = "#ff4d4d";
      const size = 8;
      const x = 250 + i * (size + 6);
      ctx.fillRect(x, h / 2 - size / 2, size, size);
    }

    ctx.fillStyle = "#cfcfcf";
    const pauseText = "Press P to pause";
    const textWidth = ctx.measureText(pauseText).width;
    ctx.fillText(pauseText, Config.canvas.width - textWidth - 10, h / 2);
  }
}
