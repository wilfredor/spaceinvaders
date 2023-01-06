/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 913:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    var _a;
    _a = Config;
    Config.canvas = document.getElementsByTagName("canvas")[0];
    Config.context = _a.canvas.getContext("2d");
    Config.game = document.getElementById('game');
    Config.enemyWidth = 30;
    Config.enemyHeight = 30;
    Config.naveWidth = 50;
    Config.naveHeight = 20;
    Config.naveLife = 3;
    Config.naveShots = 0;
    Config.naveMaxshots = 3;
    Config.firstSpeedLevel = 8000;
    Config.fireHeight = 20;
    return Config;
}());
exports.Config = Config;


/***/ }),

/***/ 749:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemies = void 0;
var config_1 = __webpack_require__(913);
var enemy_1 = __webpack_require__(624);
var tools_1 = __webpack_require__(594);
var Enemies = /** @class */ (function () {
    function Enemies(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.reset();
        this.initEnemies();
        this.move();
    }
    Enemies.prototype.reset = function () {
        this.element = [];
        this.enemiesType = [];
    };
    Enemies.prototype.removeEnemies = function () {
        //Clean place
        //9 is the canon height
        config_1.Config.context.clearRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height - (config_1.Config.naveHeight + 9));
    };
    //Remove a enemy bi index in enemies array
    Enemies.prototype.remove = function (index) {
        var _a, _b;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        this.game.score++;
        if (((_b = this.element) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            this.game.showMessage("You win");
            this.removeEnemies();
            this.game.level++;
            //Init enemies array
            this.reset();
        }
    };
    Enemies.prototype.initEnemies = function () {
        // Enemy type images.
        var enemiesType = [];
        for (var i = 0; i <= 2; i++) {
            enemiesType[i] = new Image();
            enemiesType[i].src = "images/enemies".concat(i, ".svg");
        }
        // Create a new enemy element and add to enemies array.
        var index = 0;
        var screenBorderWidth = config_1.Config.canvas.width - config_1.Config.enemyWidth;
        var step = config_1.Config.enemyWidth * 2;
        var screenBorderHeight = config_1.Config.canvas.height - config_1.Config.enemyHeight;
        for (var i = this.x + config_1.Config.enemyWidth; i <= screenBorderWidth; i += step) {
            var enemyType = 0;
            for (var j = this.y; j <= screenBorderHeight / 2 + screenBorderHeight / 6; j += config_1.Config.enemyHeight * 2) {
                var enemyElement = new enemy_1.Enemy(i, j, index, enemiesType[enemyType], this.game);
                this.element.push(enemyElement);
                index++;
                if (enemyType < enemiesType.length - 1) {
                    enemyType++;
                }
            }
        }
        // This enemy go to fire.
        this.enemyFire(1000);
    };
    //paint all enemies
    Enemies.prototype.paint = function () {
        this.removeEnemies();
        for (var i = 0; i <= this.element.length - 1; i++)
            this.element[i].paint();
        return true;
    };
    //move enemy elements  move elements enemies Horizontally and Vertically
    Enemies.prototype.moveXY = function (moveLeft) {
        if (!this.game.paused) {
            this.removeEnemies(); // Clean enemies for repaint.
            var elementsNumber = this.element.length - 1;
            for (var i = 0; i <= elementsNumber; i++) {
                if (moveLeft !== null) {
                    // If move is horizontally.
                    this.element[i].x += moveLeft ? -this.element[i].width : this.element[i].width;
                }
                else {
                    // Else if move is vertically and step is 5.
                    this.element[i].y += config_1.Config.enemyHeight / 5;
                }
                this.element[i].paint(); // Repaint enemies in new x, y.
                // If enemy is in nave area.
                if (this.element[i].y >= config_1.Config.canvas.height - 3 * config_1.Config.naveHeight) {
                    this.game.showMessage("You are dead");
                    window.location.reload();
                    return false;
                }
            }
        }
        return true;
    };
    //move elements enemies Horizontally
    Enemies.prototype.moveX = function (move_left, speed) {
        var _this = this;
        setTimeout(function () {
            if (_this.moveXY(move_left)) {
                move_left = (!_this.game.paused) ? (!move_left) : (move_left); //If game is paused don't move Horizontally
                _this.moveX(move_left, speed);
            }
        }, speed);
    };
    //move elements enemies Vertically
    Enemies.prototype.moveY = function (speed) {
        var _this = this;
        setTimeout(function () {
            //window.enemies.y+=window.enemies.height/5;
            if (_this.moveXY(null))
                _this.moveY(speed);
        }, speed);
    };
    //Run fire to a enemy
    Enemies.prototype.enemyFire = function (speed) {
        var _this = this;
        //First enemy in last row
        setTimeout(function () {
            //Any enemy in last row
            var index = tools_1.Tool.randomRange(0, _this.element.length - 1);
            if (_this.element[index]) {
                _this.element[index].fire();
            }
            _this.enemyFire(speed);
        }, speed);
    };
    //move enemies Vertically and Horizontally in the screen
    Enemies.prototype.move = function () {
        this.moveX(true, 800);
        this.moveY(config_1.Config.firstSpeedLevel * this.game.level);
    };
    //Check if a enemy in array is colision with a fire
    Enemies.prototype.checkColision = function (x, y, width, height) {
        var fireBounds = {
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
        };
        var elementsNumber = this.element.length;
        for (var i = 0; i <= elementsNumber; i++) {
            if (this.element[i]) {
                var enemyBounds = {
                    x1: this.element[i].x,
                    y1: this.element[i].y,
                    x2: this.element[i].x + this.element[i].width,
                    y2: this.element[i].y + this.element[i].height,
                };
                console.log(fireBounds, enemyBounds);
                if (this.checkVerticalCollision(fireBounds, enemyBounds) &&
                    this.checkHorizontalCollision(fireBounds, enemyBounds)) {
                    console.log("killed ".concat(i));
                    this.remove(i);
                    return true;
                }
            }
        }
        return false;
    };
    Enemies.prototype.checkVerticalCollision = function (bounds1, bounds2) {
        return bounds2.y2 <= bounds1.y2 && bounds2.y2 >= bounds1.y1 || bounds1.y1 >= bounds2.y1 && bounds1.y1 <= bounds2.y2;
    };
    Enemies.prototype.checkHorizontalCollision = function (bounds1, bounds2) {
        return bounds1.x1 >= bounds2.x1 && bounds1.x1 <= bounds2.x2 || bounds2.x2 <= bounds1.x2 && bounds2.x2 >= bounds1.x1;
    };
    return Enemies;
}());
exports.Enemies = Enemies;
;


/***/ }),

/***/ 624:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemy = void 0;
var config_1 = __webpack_require__(913);
var Enemy = /** @class */ (function () {
    function Enemy(x, y, index, enemyType, game) {
        this.width = config_1.Config.enemyWidth;
        this.height = config_1.Config.enemyHeight;
        this.x = x;
        this.y = y;
        this.index = index;
        this.img = enemyType;
        this.game = game;
        this.paint();
    }
    Enemy.prototype.paint = function () {
        config_1.Config.context.drawImage(this.img, this.x, this.y, config_1.Config.enemyWidth, config_1.Config.enemyHeight);
    };
    Enemy.prototype.Obstruction = function () {
        var elementNumber = this.game.enemies.element.length - 1;
        for (var i = 0; i <= elementNumber; i++) {
            if ((this.game.enemies.element[i].x == this.x) &&
                (this.game.enemies.element[i].index > this.index))
                return true;
        }
        return false;
    };
    ;
    //Enemy fire
    Enemy.prototype.fire = function () {
        if (!this.game.paused) {
            this.directionFire(this.x, this.y);
        }
    };
    ;
    Enemy.prototype._makefire = function (context, i, xPos) {
        //Make a fire and delete track
        context.fillStyle = "#FF0000";
        context.clearRect(xPos, i - 20, 3, 9);
        context.fillRect(xPos, i, 3, 9);
        context.fillStyle = "#7fff00";
    };
    //Fire direction
    Enemy.prototype.directionFire = function (xPos, i) {
        var _this = this;
        setTimeout(function () {
            if (i <= config_1.Config.canvas.height - 20) { //If the fire is not in screen border	
                //Make a fire and delete track
                _this._makefire(config_1.Config.context, i, xPos);
                //the fire resume trayectory
                _this.directionFire(xPos, i + 20);
            }
            else if ((xPos >= _this.game.nave.x) && (xPos <= (_this.game.nave.x + config_1.Config.enemyWidth))) {
                _this.game.nave.life--;
                _this.game.life = _this.game.nave.life;
                if (_this.game.nave.life <= 0) {
                    _this.game.showMessage("You are dead");
                    _this.game.reload();
                }
                else if (_this.game.nave.life === 1) {
                    alert("You have only ".concat(_this.game.nave.life, " life"));
                }
            }
            else
                config_1.Config.context.clearRect(xPos, i - 20, 3, 9);
        }, 30);
    };
    ;
    return Enemy;
}());
exports.Enemy = Enemy;


/***/ }),

/***/ 769:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
var config_1 = __webpack_require__(913);
var Game = /** @class */ (function () {
    function Game() {
        this.level = 1;
        this.score = 0;
        this.life = 3;
    }
    Game.prototype.showMessage = function (messageContent) {
        var _this = this;
        this._paused = true;
        // window.enemies.removeEnemies();
        var x = config_1.Config.canvas.width / 2; //Center text in canvas 
        var y = config_1.Config.canvas.height / 2;
        config_1.Config.context.font = "30px Courier New";
        config_1.Config.context.fillStyle = 'white';
        config_1.Config.context.fill();
        config_1.Config.context.textAlign = 'center';
        config_1.Config.context.fillText(messageContent, x, y);
        if (messageContent != "Pause") {
            setTimeout(function () {
                _this._paused = false;
            }, 3000);
        }
    };
    Game.prototype.reload = function () {
        setTimeout(function () {
            window.location.reload();
        }, 3000);
    };
    Game.prototype.pause = function (pause) {
        if (pause) {
            this.showMessage("Pause");
        }
        this._paused = pause;
    };
    Object.defineProperty(Game.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            this._paused = paused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "enemies", {
        get: function () {
            return this._enemies;
        },
        set: function (enemies) {
            this._enemies = enemies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "nave", {
        get: function () {
            return this._nave;
        },
        set: function (nave) {
            this._nave = nave;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (level) {
            this._level = level;
            this.setLabel('level', String(level));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "life", {
        get: function () {
            return this._life;
        },
        set: function (life) {
            this._life = life;
            this.setLabel('life', String(life));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
            this.setLabel('score', String(score));
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.setLabel = function (id, textContent) {
        var label = document.getElementById(id);
        if (label !== null) {
            label.textContent = textContent;
        }
    };
    Object.defineProperty(Game.prototype, "mouseX", {
        get: function () {
            return this._mouseX;
        },
        set: function (value) {
            this._mouseX = value;
        },
        enumerable: false,
        configurable: true
    });
    return Game;
}());
exports.Game = Game;
;


/***/ }),

/***/ 861:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Nave = void 0;
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var Nave = /** @class */ (function () {
    function Nave(game) {
        var _this = this;
        this.shots = config_1.Config.naveShots;
        this.x = 0;
        this.life = config_1.Config.naveLife;
        this.y = config_1.Config.canvas.height - config_1.Config.naveHeight;
        this.game = game;
        this.paint();
        window.onkeydown = function (event) { _this.move(event); };
        window.onmousedown = function () { _this.fire(); };
        window.onmousemove = function (event) { _this.move(event); };
    }
    Nave.prototype.fire = function () {
        if (!this.game.paused) {
            if (this.shots <= config_1.Config.naveMaxshots) {
                this.shots++;
                this.directionFire(this.x + 25, config_1.Config.canvas.height - 60);
            }
        }
    };
    Nave.prototype.directionFire = function (x, y) {
        var _this = this;
        if ((y <= -config_1.Config.fireHeight))
            this.shots = 0;
        else {
            setTimeout(function () {
                if (y >= -config_1.Config.fireHeight) { //If the fire is in screen border	
                    tools_1.Tool.paintFire(x, y);
                    //if some enemy the fire stop
                    if (_this.game.enemies.checkColision(x, y, 7, 12)) {
                        y = -5;
                        _this.game.enemies.paint();
                    }
                    //Recursion, the shot is going
                    _this.directionFire(x, y - config_1.Config.fireHeight);
                }
            }, 30);
        }
    };
    Nave.prototype.paint = function () {
        tools_1.Tool.paintNave(this.x, this.y);
    };
    Nave.prototype.moveLeft = function (step) {
        this.x -= config_1.Config.naveWidth / step;
        if (this.x <= (-config_1.Config.naveWidth))
            this.x = config_1.Config.canvas.width - config_1.Config.naveWidth;
        this.paint();
    };
    Nave.prototype.moveRight = function (step) {
        this.x += config_1.Config.naveWidth / step;
        if (this.x >= config_1.Config.canvas.width)
            this.x = 0;
        this.paint();
    };
    Nave.prototype.move = function (event) {
        if (this.isPauseEvent(event)) {
            this.game.pause(!this.game.paused);
        }
        else if (!this.game.paused) {
            if (event instanceof MouseEvent) {
                this.handleMouseMovement(event);
            }
            else if (event instanceof KeyboardEvent) {
                this.handleKeyboardMovement(event);
            }
        }
    };
    Nave.prototype.isPauseEvent = function (event) {
        return event instanceof KeyboardEvent && event.code == 'KeyP';
    };
    Nave.prototype.handleMouseMovement = function (event) {
        var mouseXaux = event.clientX;
        if (this.game.mouseX > mouseXaux) {
            this.moveLeft(5);
        }
        else if (this.game.mouseX < mouseXaux) {
            this.moveRight(5);
        }
        this.game.mouseX = mouseXaux;
    };
    Nave.prototype.handleKeyboardMovement = function (event) {
        if (event.code === 'ArrowLeft') {
            this.moveLeft(2);
        }
        else if (event.code === 'ArrowRight') {
            this.moveRight(2);
        }
        else if (event.code === 'ControlLeft' || event.code === 'Space') {
            this.fire();
        }
    };
    return Nave;
}());
exports.Nave = Nave;
;


/***/ }),

/***/ 594:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tool = void 0;
var config_1 = __webpack_require__(913);
//Check if a var exist
var Tool = /** @class */ (function () {
    function Tool() {
    }
    //A random number multiple of 5
    Tool.randomRange = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    };
    Tool.paintNave = function (x, y) {
        //paint nave in relative screen position
        config_1.Config.context.fillStyle = "#7fff00";
        config_1.Config.context.clearRect(0, config_1.Config.canvas.height - (config_1.Config.naveHeight + config_1.Config.naveHeight / 2), config_1.Config.canvas.width, config_1.Config.canvas.height);
        config_1.Config.context.fillRect(x, y, config_1.Config.naveWidth, config_1.Config.naveHeight);
        //Nave canon
        config_1.Config.context.fillRect(x + 24, config_1.Config.canvas.height - 30, 3, 5);
        config_1.Config.context.clearRect(x - 4, config_1.Config.canvas.height - 27, 7, 12);
        config_1.Config.context.fillRect(x + 22, config_1.Config.canvas.height - 25, 7, 12);
        config_1.Config.context.clearRect(x + config_1.Config.naveWidth - 3, config_1.Config.canvas.height - 27, 7, 12);
    };
    Tool.paintFire = function (x, y) {
        config_1.Config.context.clearRect(x, y + 20, 2, 12);
        config_1.Config.context.fillRect(x, y, 2, 12);
    };
    return Tool;
}());
exports.Tool = Tool;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var enemies_1 = __webpack_require__(749);
var game_1 = __webpack_require__(769);
var nave_1 = __webpack_require__(861);
window.onload = function () {
    var game = new game_1.Game();
    game.enemies = new enemies_1.Enemies(game);
    game.nave = new nave_1.Nave(game);
};

})();

/******/ })()
;