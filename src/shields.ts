import { Config } from "./config";

type Cell = {
  x: number;
  y: number;
  alive: boolean;
};

class Shield {
  private cells: Cell[] = [];
  private readonly cellWidth: number;
  private readonly cellHeight: number;
  readonly patternWidth: number;
  readonly patternHeight: number;

  constructor(public x: number, public y: number) {
    const pattern = [
      "   #########   ",
      "  ###########  ",
      " ############# ",
      " ############# ",
      " ###       ### ",
      " ###       ### ",
      " ###       ### ",
      " ###       ### ",
    ];
    const cols = pattern[0].length;
    const rows = pattern.length;
    this.patternWidth = cols;
    this.patternHeight = rows;
    // Keep shields compact: total width ~ 3x nave width.
    // Make shield pixels comparable to enemy/nave pixels.
    const pixel = Math.max(3, Math.round(Config.enemyWidth / 6));
    this.cellWidth = pixel;
    this.cellHeight = pixel;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (pattern[row][col] !== " ") {
          this.cells.push({
            x: this.x + col * this.cellWidth,
            y: this.y + row * this.cellHeight,
            alive: true,
          });
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#7fff00";
    for (const cell of this.cells) {
      if (cell.alive) {
        ctx.fillRect(cell.x, cell.y, this.cellWidth, this.cellHeight);
      }
    }
  }

  intersects(px: number, py: number, pw: number, ph: number): number | null {
    for (const cell of this.cells) {
      if (!cell.alive) continue;
      const intersects =
        px < cell.x + this.cellWidth &&
        px + pw > cell.x &&
        py < cell.y + this.cellHeight &&
        py + ph > cell.y;
      if (intersects) {
        return cell.x + this.cellWidth / 2;
      }
    }
    return null;
  }

  hit(px: number, py: number, pw: number, ph: number): boolean {
    const aliveCells = this.cells.filter((c) => c.alive);
    for (const cell of aliveCells) {
      if (!cell.alive) continue;
      const intersects =
        px < cell.x + this.cellWidth &&
        px + pw > cell.x &&
        py < cell.y + this.cellHeight &&
        py + ph > cell.y;
      if (intersects) {
        this.destroyCluster(cell, aliveCells);
        return true;
      }
    }
    return false;
  }

  private destroyCluster(center: Cell, aliveCells: Cell[]) {
    // Remove the hit cell plus the 3 closest neighbors to mimic chunk damage.
    const impactX = center.x + this.cellWidth / 2;
    const impactY = center.y + this.cellHeight / 2;
    const victims = aliveCells
      .filter((c) => c.alive)
      .sort((a, b) => {
        const da = Math.hypot(
          impactX - (a.x + this.cellWidth / 2),
          impactY - (a.y + this.cellHeight / 2)
        );
        const db = Math.hypot(
          impactX - (b.x + this.cellWidth / 2),
          impactY - (b.y + this.cellHeight / 2)
        );
        return da - db;
      })
      .slice(0, 4);

    for (const victim of victims) {
      victim.alive = false;
      Config.context.clearRect(victim.x, victim.y, this.cellWidth, this.cellHeight);
    }
  }

  get cellSize() {
    return { width: this.cellWidth, height: this.cellHeight };
  }
}

export class ShieldManager {
  private shields: Shield[] = [];
  private readonly shieldTop: number;
  private readonly shieldBottom: number;

  constructor() {
    const count = 4;
    const spacing = Config.canvas.width / (count + 1);
    const y = Config.canvas.height - Config.naveHeight * 8;
    // Use a temporary shield to compute shared height for bounds metadata.
    const tempShield = new Shield(0, y);
    this.shieldTop = y;
    this.shieldBottom = y + tempShield.patternHeight * tempShield.cellSize.height;
    this.shields = Array.from({ length: count }, (_v, i) => {
      const x = spacing * (i + 1) - Config.naveWidth * 1.5;
      return new Shield(x, y);
    });
  }

  draw() {
    for (const shield of this.shields) {
      shield.draw(Config.context);
    }
  }

  hit(px: number, py: number, pw: number, ph: number): boolean {
    for (const shield of this.shields) {
      if (shield.hit(px, py, pw, ph)) {
        return true;
      }
    }
    return false;
  }

  collidesBody(px: number, py: number, pw: number, ph: number): boolean {
    for (const shield of this.shields) {
      const hit = shield.intersects(px, py, pw, ph);
      if (hit !== null) return true;
    }
    return false;
  }

  getGaps(): number[] {
    return this.shields.map((s) => s.x + (Config.enemyWidth * 2)).sort((a, b) => a - b);
  }

  getTop(): number {
    return this.shieldTop;
  }

  getBottom(): number {
    return this.shieldBottom;
  }

  getGapCenters(): number[] {
    return this.shields.map((s) => s.x + (s.patternWidth * s.cellSize.width) / 2);
  }
}
