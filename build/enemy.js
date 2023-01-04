"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
var Enemy = /** @class */ (function () {
    function Enemy(x, y, width, height, context, index, enemyType, enemies) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.index = index;
        this.context = context;
        this.img = enemyType;
        this.paint();
        this.enemies = enemies;
        this.game = this.enemies.game;
        this.CONFIG = this.game.CONFIG;
    }
    Enemy.prototype.paint = function () {
        this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
    };
    Enemy.prototype.Obstruction = function () {
        var elementNumber = this.enemies.element.length - 1;
        for (var i = 0; i <= elementNumber; i++) {
            if ((this.enemies.element[i].x == this.x) && (this.enemies.element[i].index > this.index))
                return true;
        }
        return false;
    };
    ;
    //Enemy fire
    Enemy.prototype.fire = function () {
        if (!this.game.paused)
            this.directionFire(this.x, this.y, this);
    };
    ;
    //Fire direction
    Enemy.prototype.directionFire = function (xPos, i, element) {
        var _this = this;
        setTimeout(function () {
            var _a, _b;
            if (i <= _this.CONFIG.canvasHeight - 20) { //If the fire is not in screen border	
                //Make a fire and delete track
                element.context.fillStyle = "#FF0000";
                element.context.clearRect(xPos, i - 20, 3, 9);
                element.context.fillRect(xPos, i, 3, 9);
                element.context.fillStyle = "#7fff00";
                //the fire resume trayectory
                element.directionFire(xPos, i + 20, element);
            }
            else {
                if ((xPos >= _this.enemies.nave.x) && (xPos <= (_this.enemies.nave.x + _this.width))) {
                    _this.enemies.nave.life--;
                    if ((_a = _this.CONFIG._life) === null || _a === void 0 ? void 0 : _a.textContent)
                        _this.CONFIG._life.textContent = String(_this.enemies.nave.life);
                    if (_this.enemies.nave.life <= 0) {
                        _this.game.showMessage("You are dead");
                        setTimeout(function () {
                            window.location.reload();
                        }, 3000);
                    }
                    else {
                        // alert("You have only "+nave.life+" life");
                        //nave.init();
                    }
                }
                else
                    (_b = _this.enemies.context) === null || _b === void 0 ? void 0 : _b.clearRect(xPos, i - 20, 3, 9);
            }
        }, 30);
    };
    ;
    return Enemy;
}());
exports.Enemy = Enemy;
