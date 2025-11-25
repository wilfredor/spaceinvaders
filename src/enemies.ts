import { Config } from "./config";
import { Enemy } from "./enemy";
import { Game } from "./game";
import { services as defaultServices, Services } from "./tools";

export class Enemies {
  x!: number;
  y!: number;
  items!: Enemy[];
  game: Game;
  private horizontalDirection: 1 | -1 = 1;
  private horizontalSpeed = Config.enemyWidth * 1.6; // px/s, scales with enemy size
  private descentStep = Config.enemyHeight * 0.45;
  private totalTime = 0;
  private formationOffsetX = 0;
  private formationOffsetY = 0;
  private attackAccumulator = 0;
  private nextAttackIn = 1.5;
  private readonly services: Services;

  constructor( game: Game, services: Services = defaultServices) {
    this.game = game;
    this.services = services;
    this.x = 0;
    this.y = 0;
    this.reset();
    this.initEnemies();
  }

  reset() {
    this.formationOffsetX = 0;
    this.formationOffsetY = 0;
    this.attackAccumulator = 0;
    this.items = [];
  }

  //Remove a enemy bi index in enemies array
  remove(index: number) {
    this.items?.splice(index, 1);
    this.game.score++;

    if (this.items?.length === 0) {
      this.game.showMessage(`You win`);
      this.services.removeEnemies();
      this.game.level++;

      //Init next wave
      this.reset();
      this.services.clearAll();
      this.initEnemies();
    }
  }

   initEnemies(): void {
    // Arcade-like formation: 11 columns x 5 rows, centered.
    const columns = 11;
    const rows = 5;

    const gapX = Config.enemyWidth * 1.5;
    const gapY = Config.enemyHeight * 1.6;

    const formationWidth = Config.enemyWidth + gapX * (columns - 1);
    const startX = Math.max(0, (Config.canvas.width - formationWidth) / 2);
    const startY = this.services.hudHeight + Config.enemyHeight * 1.5;

    let index = 0;
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const enemyType = Math.min(Math.max(0, row), 2);
        const x = startX + col * gapX;
        const y = startY + row * gapY;
        const enemyElement = new Enemy(x, y, index, enemyType, this, this.services);
        this.items.push(enemyElement);
        index++;
      }
    }
    this.enemyFire(Config.enemyFireSpeed);
  }

  private frontLineEnemies(): Enemy[] {
    const buckets = new Map<number, Enemy>();
    const bucketSize = Config.enemyWidth * 1.5;

    for (const enemy of this.items) {
      if (enemy.isInAttack()) continue;
      const bucket = Math.round(enemy.x / bucketSize);
      const current = buckets.get(bucket);
      if (!current || enemy.y > current.y) {
        buckets.set(bucket, enemy);
      }
    }

    return Array.from(buckets.values());
  }

  //paint all enemies
  paint() {
    this.services.removeEnemies();
    for (var i = 0; i <= this.items.length - 1; i++)
      this.items[i].paint();
    return true;
  }

  //Run fire to a enemy
  enemyFire(speed: number) {
    //First enemy in last row
    setTimeout(() => {
      if (this.items.length > 0) {
        // Choose a random enemy from the bottom-most row per column.
        const frontLine = this.frontLineEnemies();
        const shooter = frontLine[this.services.randomRange(0, frontLine.length - 1)];
        shooter?.fire();
      }
      this.enemyFire(speed);
    }, speed);
  }

  update(deltaSeconds: number) {
    if (this.game.paused) return;
    const moveX = this.horizontalDirection * this.horizontalSpeed * deltaSeconds;
    const minYBeforeDescent = this.services.hudHeight + Config.enemyHeight * 0.5;
    this.totalTime += deltaSeconds;

    // Check formation bounds based on base positions (ignore attackers' current x).
    let minX = Infinity;
    let maxX = -Infinity;
    for (const enemy of this.items) {
      minX = Math.min(minX, enemy.baseX + this.formationOffsetX);
      maxX = Math.max(maxX, enemy.baseX + this.formationOffsetX + enemy.width);
    }
    const wouldHitLeft = minX + moveX < 0;
    const wouldHitRight = maxX + moveX > Config.canvas.width;
    if (wouldHitLeft || wouldHitRight) {
      this.horizontalDirection = this.horizontalDirection === 1 ? -1 : 1;
      this.formationOffsetY += this.descentStep;
    } else {
      this.formationOffsetX += moveX;
    }

    this.attackAccumulator += deltaSeconds;
    if (this.attackAccumulator >= this.nextAttackIn) {
      this.launchAttacker();
      this.attackAccumulator = 0;
      this.nextAttackIn = 1 + Math.random() * 2;
    }

    this.services.removeEnemies();
    for (let i = 0; i < this.items.length; i++) {
      const enemy = this.items[i];
      if (enemy.isInAttack()) {
        // Clear previous position trail for attackers.
        Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
        const stillAttacking = enemy.updateAttack(deltaSeconds, this.formationOffsetX, this.formationOffsetY);
        if (!stillAttacking) {
          // Skip painting this frame; will be drawn in formation next frame.
          continue;
        }
        const nave = this.game.nave;
        const collidesWithNave =
          enemy.x < nave.x + Config.naveWidth &&
          enemy.x + enemy.width > nave.x &&
          enemy.y < nave.y + Config.naveHeight &&
          enemy.y + enemy.height > nave.y;
        if (collidesWithNave) {
          Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
          enemy.resetPosition(this.formationOffsetX, this.formationOffsetY);
          this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
          this.remove(enemy.index);
          nave.life--;
          this.game.life = nave.life;
          nave.flashHit();
          if (nave.life <= 0) {
            this.services.explode(nave.x + Config.naveWidth / 2, nave.y + Config.naveHeight / 2, Config.naveWidth);
            this.game.showMessage("You are dead");
            this.game.reload();
            return;
          }
          continue;
        }
      } else {
        const wobble = Math.sin(this.totalTime * 2 + enemy.bobPhase) * (Config.enemyHeight * 0.12);
        enemy.x = enemy.baseX + this.formationOffsetX;
        enemy.y = Math.max(minYBeforeDescent, enemy.baseY + this.formationOffsetY + wobble);
        enemy.animate(deltaSeconds);
      }

      enemy.paint();
      if (!enemy.isInAttack() && enemy.y >= Config.canvas.height - 3 * Config.naveHeight) {
        this.game.showMessage(`You are dead`);
        window.location.reload();
        return;
      }
      if (enemy.y < minYBeforeDescent) {
        enemy.y = minYBeforeDescent;
      }
    }
  }

  private launchAttacker() {
    const frontLine = this.frontLineEnemies().filter(e => !e.isInAttack());
    if (frontLine.length === 0) return;
    const shooter = frontLine[this.services.randomRange(0, frontLine.length - 1)];
    const targetX = this.game.nave.x + Config.naveWidth / 2;
    const targetY = this.game.nave.y;
    shooter.startAttack(targetX, targetY);
  }
};
