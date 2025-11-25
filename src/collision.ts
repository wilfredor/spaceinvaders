import { Config } from "./config";
import { Enemies } from "./enemies";
import { Game } from "./game";
import { services as defaultServices, Services, Projectile } from "./tools";

export class CollisionSystem {
  private readonly services: Services;

  constructor(private game: Game, services: Services = defaultServices) {
    this.services = services;
  }

  tick() {
    this.handleProjectiles();
    this.handleAttackers();
  }

  private handleProjectiles() {
    this.services.forEachProjectile((p: Projectile) => {
      if (p.owner === "player") {
        const enemies = this.game.enemies.items;
        const hit = enemies.findIndex(e =>
          p.x < e.x + e.width &&
          p.x + p.width > e.x &&
          p.y < e.y + e.height &&
          p.y + p.height > e.y
        );
        if (hit !== -1) {
          const enemy = enemies[hit];
          this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
          this.game.enemies.remove(hit);
          this.game.enemies.paint();
          return false;
        }
      } else {
        const nave = this.game.nave;
        const hit =
          p.x < nave.x + Config.naveWidth &&
          p.x + p.width > nave.x &&
          p.y < nave.y + Config.naveHeight &&
          p.y + p.height > nave.y;
        if (hit) {
          nave.life--;
          this.game.life = nave.life;
          nave.flashHit();
          if (nave.life <= 0) {
            this.services.explode(nave.x + Config.naveWidth / 2, nave.y + Config.naveHeight / 2, Config.naveWidth);
            this.game.showMessage("You are dead");
            this.game.reload();
          }
          return false;
        }
      }
      return true;
    });
  }

  private handleAttackers() {
    const enemies = this.game.enemies.items;
    const nave = this.game.nave;
    for (const enemy of enemies) {
      if (!enemy.isInAttack()) continue;
      const hit =
        enemy.x < nave.x + Config.naveWidth &&
        enemy.x + enemy.width > nave.x &&
        enemy.y < nave.y + Config.naveHeight &&
        enemy.y + enemy.height > nave.y;
      if (hit) {
        this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
        this.game.enemies.remove(enemy.index);
        enemy.resetPosition(0, 0);
        nave.life--;
        this.game.life = nave.life;
        nave.flashHit();
        if (nave.life <= 0) {
          this.services.explode(nave.x + Config.naveWidth / 2, nave.y + Config.naveHeight / 2, Config.naveWidth);
          this.game.showMessage("You are dead");
          this.game.reload();
          return;
        }
      }
    }
  }
}
