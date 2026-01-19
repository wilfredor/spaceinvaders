import { Config } from "./config";
import { Game } from "./game";
import { services as defaultServices, Services, Projectile } from "./tools";

export class Nave {
  life: number;
  shots: number;
  x: number;
  y: number;
  private lastDrawX: number;
  private lastDrawY: number;
  private prevX: number;
  game: Game;
  private flashTimeout?: number;
  private flashesRemaining = 0;
  private fireIntervalId?: number;
  private invulnerableUntil = 0;
  private fireIntervalMs = 180;
  private maxShots = Config.naveMaxshots;
  private boostTime = 0;
  private readonly services: Services;

  // Event listener references for cleanup
  private readonly boundKeyDown: (e: KeyboardEvent) => void;
  private readonly boundMouseDown: () => void;
  private readonly boundMouseUp: () => void;
  private readonly boundMouseMove: (e: MouseEvent) => void;
  private readonly boundTouchStart: (e: TouchEvent) => void;
  private readonly boundTouchMove: (e: TouchEvent) => void;
  private readonly boundTouchEnd: () => void;

  constructor(
    game: Game,
    services: Services = defaultServices,
  ) {
    this.services = services;
    this.shots = Config.naveShots;
    this.x = 0;
    this.prevX = this.x;
    this.lastDrawX = this.x;
    this.lastDrawY = Config.canvas.height - Config.naveHeight;
    this.life = Config.naveLife;
    this.y = this.lastDrawY;
    this.game = game;

    // Bind event handlers
    this.boundKeyDown = (e: KeyboardEvent) => this.move(e);
    this.boundMouseDown = () => this.startAutoFire();
    this.boundMouseUp = () => this.stopAutoFire();
    this.boundMouseMove = (e: MouseEvent) => this.move(e);
    this.boundTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const x = e.touches[0]?.clientX;
      if (x !== undefined) {
        this.handleTouchMovement(x);
      }
      this.startAutoFire();
    };
    this.boundTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const x = e.touches[0]?.clientX;
      if (x !== undefined) {
        this.handleTouchMovement(x);
      }
    };
    this.boundTouchEnd = () => this.stopAutoFire();

    // Add event listeners
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
    window.addEventListener("mouseleave", this.boundMouseUp);
    window.addEventListener("mouseout", this.boundMouseUp);
    window.addEventListener("mousemove", this.boundMouseMove);
    window.addEventListener("touchstart", this.boundTouchStart, { passive: false });
    window.addEventListener("touchmove", this.boundTouchMove, { passive: false });
    window.addEventListener("touchend", this.boundTouchEnd, { passive: true });
    window.addEventListener("touchcancel", this.boundTouchEnd, { passive: true });

    this.paint();
  }

  private startAutoFire() {
    this.fire();
    if (this.fireIntervalId !== undefined) return;
    this.fireIntervalId = window.setInterval(() => this.fire(), this.fireIntervalMs);
  }

  private stopAutoFire() {
    if (this.fireIntervalId !== undefined) {
      clearInterval(this.fireIntervalId);
      this.fireIntervalId = undefined;
    }
  }

  fire(): void {
    this.updateBoost(0);
    if (!this.game.paused) {
      this.shots = this.services.countProjectiles('player');
      if (this.shots < this.maxShots) {
        this.shots++;
        const width = 3;
        const height = 12;
        const startX = this.x + (Config.naveWidth - width) / 2;
        const startY = this.y - height;
        this.services.playShoot("player");
        this.directionFire(startX, startY, width, height);
      }
    }
  }

  directionFire(x: number, y: number, width: number, height: number) {
    const speed = -500; // px/s upward

    this.services.addProjectile({
      x,
      y,
      vx: 0,
      vy: speed,
      width,
      height,
      color: "#7fff00",
      owner: "player",
      onStep: (p: Projectile) => {
        // Collision detection is handled by CollisionSystem
        // This callback only checks if projectile is out of bounds
        if (p.y + height < 0) {
          return false;
        }
        return true;
      }
    });
  }

  paint() {
    const ctx = Config.context;
    const bandMargin = 8;
    // Wipe a horizontal band where the nave moves to guarantee no trails.
    ctx.clearRect(
      0,
      this.y - bandMargin,
      Config.canvas.width,
      Config.naveHeight + bandMargin * 2 + 4
    );
    // Also clear the same band on the projectile layer in case a stale pixel landed there.
    Config.projectileContext.clearRect(
      0,
      this.y - bandMargin,
      Config.canvas.width,
      Config.naveHeight + bandMargin * 2 + 4
    );

    this.lastDrawX = this.x;
    this.lastDrawY = this.y;
    const alpha = this.isInvulnerable() ? 0.4 : 1;
    Config.context.save();
    Config.context.globalAlpha = alpha;
    this.services.paintNave(this.x, this.y);
    Config.context.restore();
  }

  moveLeft(step: number) {
    this.prevX = this.x;
    this.x -= Config.naveWidth / step;
    if (this.x <= 0)
      this.x = 0;
    this.paint();
  }

  moveRight(step: number) {
    this.prevX = this.x;
    this.x += Config.naveWidth / step;
    if (this.x + Config.naveWidth >= Config.canvas.width)
      this.x = Config.canvas.width - Config.naveWidth;
    this.paint();
  }

  move(event: KeyboardEvent | MouseEvent) {
    if (this.isPauseEvent(event)) {
      this.game.pause(!this.game.paused);
    } else if (!this.game.paused) {
      this.updateBoost(0);
      if (event instanceof MouseEvent) {
        this.handleMouseMovement(event);
      } else if (event instanceof KeyboardEvent) {
        this.handleKeyboardMovement(event);
      }
    }
  }

  flashHit() {
    this.invulnerableUntil = performance.now() + 2000;
    this.flashesRemaining = 6;
    const blink = () => {
      if (this.flashesRemaining <= 0) {
        this.flashTimeout = undefined;
        this.paint();
        return;
      }
      const hitFrame = this.flashesRemaining % 2 === 0;
      this.services.paintNave(this.x, this.y, hitFrame ? "#ff4d4d" : "#7fff00");
      this.flashesRemaining--;
      this.flashTimeout = window.setTimeout(blink, 80);
    };

    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }
    blink();
  }
  
  private isPauseEvent(event: KeyboardEvent | MouseEvent): boolean {
    return event instanceof KeyboardEvent && event.code == 'KeyP';
  }
  
  private handleMouseMovement(event: MouseEvent) {
    const mouseXaux = event.clientX;
    this.prevX = this.x;
    if (this.game.mouseX > mouseXaux) {
      this.moveLeft(5);
    } else if (this.game.mouseX < mouseXaux) {
      this.moveRight(5);
    } 
    this.game.mouseX = mouseXaux;
  }

  private handleTouchMovement(clientX: number) {
    const rect = Config.canvas.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * Config.canvas.width - Config.naveWidth / 2;
    this.prevX = this.x;
    this.x = Math.max(0, Math.min(Config.canvas.width - Config.naveWidth, relativeX));
    this.game.mouseX = clientX;
    this.paint();
  }
  
  private handleKeyboardMovement(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft') {
      this.moveLeft(2);
    } else if (event.code === 'ArrowRight') {
      this.moveRight(2);
    } else if (event.code === 'ControlLeft' || event.code === 'Space') {
      this.fire();
    }
  }

  get velocityX(): number {
    return this.x - this.prevX;
  }

  isInvulnerable(): boolean {
    return performance.now() < this.invulnerableUntil;
  }

  applyFireBoost(durationSeconds: number = 8) {
    this.boostTime = Math.max(this.boostTime, durationSeconds);
    this.fireIntervalMs = 120;
    this.maxShots = Config.naveMaxshots + 2;
    if (this.fireIntervalId !== undefined) {
      clearInterval(this.fireIntervalId);
      this.fireIntervalId = window.setInterval(() => this.fire(), this.fireIntervalMs);
    }
  }

  tick(deltaSeconds: number) {
    this.updateBoost(deltaSeconds);
  }

  private updateBoost(deltaSeconds: number) {
    if (this.boostTime <= 0) return;
    this.boostTime -= deltaSeconds;
    if (this.boostTime <= 0) {
      this.fireIntervalMs = 180;
      this.maxShots = Config.naveMaxshots;
      this.boostTime = 0;
      if (this.fireIntervalId !== undefined) {
        clearInterval(this.fireIntervalId);
        this.fireIntervalId = window.setInterval(() => this.fire(), this.fireIntervalMs);
      }
    }
  }

  destroy() {
    this.stopAutoFire();
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("mousedown", this.boundMouseDown);
    window.removeEventListener("mouseup", this.boundMouseUp);
    window.removeEventListener("mouseleave", this.boundMouseUp);
    window.removeEventListener("mouseout", this.boundMouseUp);
    window.removeEventListener("mousemove", this.boundMouseMove);
    window.removeEventListener("touchstart", this.boundTouchStart);
    window.removeEventListener("touchmove", this.boundTouchMove);
    window.removeEventListener("touchend", this.boundTouchEnd);
    window.removeEventListener("touchcancel", this.boundTouchEnd);
  }
}
