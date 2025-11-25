import { Config } from "../config";

export class CanvasCleaner {
  constructor(private readonly hudHeight: number) {}

  clearAll() {
    Config.context.clearRect(0, 0, Config.canvas.width, Config.canvas.height);
    Config.projectileContext.clearRect(0, 0, Config.projectileCanvas.width, Config.projectileCanvas.height);
  }

  clearEnemiesArea() {
    Config.context.clearRect(
      0,
      this.hudHeight,
      Config.canvas.width,
      Config.canvas.height - this.hudHeight - (Config.naveHeight + 9)
    );
  }
}
