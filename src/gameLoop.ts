export class GameLoop {
  private rafId?: number;
  private lastTime?: number;
  private callback: ((dt: number) => void) | null = null;

  start(callback: (dt: number) => void) {
    this.callback = callback;
    this.lastTime = undefined;
    this.tick(performance.now());
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    this.callback = null;
    this.lastTime = undefined;
  }

  private tick(time: number) {
    if (!this.callback) return;
    if (this.lastTime === undefined) {
      this.lastTime = time;
    }
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.callback(dt);
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }
}
