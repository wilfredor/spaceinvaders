import { Enemy } from "./enemy";

type Bounds = {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  };

export class Colision {
//Check if a enemy in array is colision with a fire
static checkColision(x: number, y: number, width: number, height: number, enemies:Enemy[]): number {
    const fireBounds = {
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height,
    };
    const elementsNumber = enemies.length;
    for (let i = 0; i <= elementsNumber; i++) {
      if (enemies[i]) {
        const enemyBounds = {
          x1: enemies[i].x,
          y1: enemies[i].y,
          x2: enemies[i].x + enemies[i].width,
          y2: enemies[i].y + enemies[i].height,
        };

        if (this.checkVerticalCollision(fireBounds, enemyBounds) && 
            this.checkHorizontalCollision(fireBounds, enemyBounds)) {
          console.log(`killed ${i}`);
          return i;
        }
      }
    }
    return -1;
  }
  
  private static checkVerticalCollision(bounds1: Bounds, bounds2: Bounds): boolean {
    return bounds2.y2 <= bounds1.y2 && bounds2.y2 >= bounds1.y1 || bounds1.y1 >= bounds2.y1 && bounds1.y1 <= bounds2.y2;
  }
  
  private static checkHorizontalCollision(bounds1: Bounds, bounds2: Bounds): boolean {
    return bounds1.x1 >= bounds2.x1 && bounds1.x1 <= bounds2.x2 || bounds2.x2 <= bounds1.x2 && bounds2.x2 >= bounds1.x1;
  }
}