/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 913:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
        var _a;
        //Canvas size
        this.canvasWidth = 800;
        this.canvasHeight = 500;
        //Create canvas element in body
        this.canvas = window.document.createElement("canvas");
        this.game = window.document.getElementById("game");
        this.mouseX = 0;
        //Where I show the information about level, score and live
        this.level = window.document.getElementById("level");
        this.score = window.document.getElementById("score");
        this.life = window.document.getElementById("life");
        this.canvas.setAttribute('width', String(this.canvasWidth));
        this.canvas.setAttribute('height', String(this.canvasHeight));
        this.canvas.setAttribute('style', 'position:absolute;top:23px;'); //Space for level,score and life
        (_a = this.game) === null || _a === void 0 ? void 0 : _a.appendChild(this.canvas);
        if (this.level)
            this.level.textContent = "1";
        if (this.score)
            this.score.textContent = "0";
        if (this.life)
            this.life.textContent = "3";
    }
    return Config;
}());
exports.Config = Config;


/***/ }),

/***/ 749:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemies = void 0;
var enemy_1 = __webpack_require__(624);
var tools_1 = __webpack_require__(594);
var Enemies = /** @class */ (function () {
    function Enemies(game, nave, config) {
        this.config = config;
        this.context = this.config.canvas.getContext("2d");
        this.x = 0;
        this.y = 0;
        this.width = 30;
        this.height = 30;
        this.element = [];
        this.enemiesType = [];
        this.nave = nave;
        this.game = game;
        this.initEnemies();
        this.move();
    }
    Enemies.prototype.reset = function () {
        this.x = 0;
        this.y = 0;
        this.width = 30;
        this.height = 30;
        this.element = [];
        this.enemiesType = [];
    };
    Enemies.prototype.removeEnemies = function () {
        var _a;
        //Clean place
        //window.nave.height+9 is the nave height + canon
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight - (this.nave.height + 9));
    };
    //Remove a enemy bi index in enemies array
    Enemies.prototype.remove = function (index) {
        var _a, _b, _c, _d;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        if (this.config.score)
            this.config.score.textContent = String(Number((_b = this.config.score) === null || _b === void 0 ? void 0 : _b.textContent) + 1);
        if (((_c = this.element) === null || _c === void 0 ? void 0 : _c.length) === 0) {
            this.game.showMessage("You win");
            this.removeEnemies();
            if (this.config.level)
                this.config.level.textContent = String(Number((_d = this.config.level) === null || _d === void 0 ? void 0 : _d.textContent) + 1);
            //Init enemies array
            this.reset();
        }
    };
    Enemies.prototype.initEnemies = function () {
        //Enemy type images
        var enemiesType = [];
        for (var i = 0; i <= 2; i++) {
            enemiesType[i] = new Image();
            enemiesType[i].src = "images/enemies" + i + ".svg";
        }
        //Create a new enemy element and add to enemies array
        var index = 0;
        var screenBorderWidth = this.config.canvasWidth - (this.width);
        var step = this.width * 2;
        var screenBorderHeight = this.config.canvasHeight - this.height;
        for (i = this.x + this.width; i <= screenBorderWidth; i += step) {
            var enemyType = 0;
            for (var j = this.y; j <= (screenBorderHeight) / 2 + (screenBorderHeight) / 6; j += (this.height * 2)) {
                var enemy_element = new enemy_1.Enemy(i, j, index, enemiesType[enemyType], this);
                this.element.push(enemy_element);
                index++;
                if (enemyType < enemiesType.length - 1)
                    enemyType++;
            }
        }
        //this enemy go to fire
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
    Enemies.prototype.moveXY = function (move_left) {
        if (!this.game.paused) {
            this.removeEnemies(); //clean enemies for repaint
            var elementsNumber = this.element.length - 1;
            for (var i = 0; i <= elementsNumber; i++) {
                if (move_left !== null) { //If move is Horizontally
                    this.element[i].x += (move_left === true) ? (-this.element[i].width) : (this.element[i].width);
                }
                else {
                    this.element[i].y += this.height / 5; //Else if move is Vertically and step is 5
                }
                this.element[i].paint(); //repaint enemies in new x,y
                if (this.element[i].y >= (this.config.canvasHeight - 3 * (this.nave.height))) { //If Enemy is in nave area
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
            _this.element[index].fire();
            _this.enemyFire(speed);
        }, speed);
    };
    //move enemies Vertically and Horizontally in the screen
    Enemies.prototype.move = function () {
        var _a;
        this.moveX(true, 800);
        //First speed level is 8000
        this.moveY(8000 * Number((_a = this.config.level) === null || _a === void 0 ? void 0 : _a.textContent));
    };
    //Check if a enemy in array is colision with a fire
    Enemies.prototype.checkColision = function (x, y, width, height) {
        var x1_Fire = x;
        var y1_Fire = y;
        var x2_Fire = x + width;
        var y2_Fire = y + height;
        var elementsNumber = this.element.length;
        for (var i = 0; i <= elementsNumber; i++) {
            if (this.element[i]) {
                var x1_enemy = this.element[i].x;
                var y1_enemy = this.element[i].y;
                var x2_enemy = this.element[i].x + this.element[i].width;
                var y2_enemy = this.element[i].y + this.element[i].height;
                //check colision areas
                if (((y2_enemy <= y2_Fire) && (y2_enemy >= y1_Fire)) || ((y1_enemy >= y1_Fire) && (y1_enemy <= y2_Fire))) {
                    if (((x1_Fire >= x1_enemy) && (x1_Fire <= x2_enemy)) || ((x2_Fire <= x2_enemy) && (x2_Fire >= x1_enemy))) {
                        console.log('killed ' + i);
                        this.remove(i);
                        return true;
                    }
                }
            }
        }
    };
    return Enemies;
}());
exports.Enemies = Enemies;
;


/***/ }),

/***/ 624:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemy = void 0;
var Enemy = /** @class */ (function () {
    function Enemy(x, y, index, enemyType, enemies) {
        this.width = enemies.width;
        this.height = enemies.height;
        this.x = x;
        this.y = y;
        this.index = index;
        this.context = enemies.config.canvas.getContext("2d");
        this.img = enemyType;
        this.enemies = enemies;
        this.game = this.enemies.game;
        this.config = this.enemies.config;
        this.paint();
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
            if (i <= _this.config.canvasHeight - 20) { //If the fire is not in screen border	
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
                    if ((_a = _this.config.life) === null || _a === void 0 ? void 0 : _a.textContent)
                        _this.config.life.textContent = String(_this.enemies.nave.life);
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


/***/ }),

/***/ 769:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
var Game = /** @class */ (function () {
    function Game(config) {
        this.paused = false;
        this.config = config;
    }
    Game.prototype.showMessage = function (messageContent) {
        var _this = this;
        this.paused = true;
        // window.enemies.removeEnemies();
        var x = this.config.canvas.width / 2; //Center text in canvas 
        var y = this.config.canvas.height / 2;
        var ctx = this.config.canvas.getContext("2d");
        if (ctx) {
            ctx.font = "30px Courier New";
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.textAlign = 'center';
            ctx.fillText(messageContent, x, y);
        }
        if (messageContent != "Pause") {
            setTimeout(function () {
                _this.paused = false;
            }, 3000);
        }
    };
    Game.prototype.pause = function (pause) {
        if (pause) {
            this.showMessage("Pause");
        }
        this.paused = pause;
    };
    return Game;
}());
exports.Game = Game;
;


/***/ }),

/***/ 861:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Nave = void 0;
var enemies_1 = __webpack_require__(749);
var game_1 = __webpack_require__(769);
var Nave = /** @class */ (function () {
    function Nave(config) {
        var _this = this;
        var _a;
        this.context = config.canvas.getContext("2d");
        this.width = 50;
        this.height = 20;
        this.life = Number((_a = config.life) === null || _a === void 0 ? void 0 : _a.textContent);
        this.shots = 0;
        this.maxshots = 3;
        this.x = 0;
        this.y = config.canvasHeight - this.height;
        this.GAME = new game_1.Game(config);
        this.enemies = new enemies_1.Enemies(this.GAME, this, config);
        this.config = config;
        this.paint();
        window.onkeydown = function (event) { _this.move(event); };
        window.onmousedown = function () { _this.fire(); };
        window.onmousemove = function (event) { _this.move(event); };
    }
    Nave.prototype.fire = function () {
        if (!this.GAME.paused) {
            if (this.shots <= this.maxshots) {
                this.shots++;
                var xPos = this.x + 25;
                var i = (this.config.canvasHeight - 60);
                this.directionFire(xPos, i);
            }
        }
    };
    Nave.prototype.directionFire = function (xPos, i) {
        var _this = this;
        if ((i <= -20))
            this.shots = 0;
        setTimeout(function () {
            var _a, _b;
            if (i >= -20) { //If the fire is in screen border	
                //create fire and delete track
                (_a = _this.context) === null || _a === void 0 ? void 0 : _a.clearRect(xPos, i + 20, 2, 12);
                (_b = _this.context) === null || _b === void 0 ? void 0 : _b.fillRect(xPos, i, 2, 12);
                //if some enemy the fire stop
                if (_this.enemies.checkColision(xPos, i, 7, 12)) {
                    i = -5;
                    _this.enemies.paint();
                    //this.shots=0;
                }
                //Recursion, the shot is going
                _this.directionFire(xPos, i - 20);
            }
        }, 30);
    };
    Nave.prototype.paint = function () {
        if (this.context) {
            //paint nave in relative screen position
            this.context.fillStyle = "#7fff00";
            this.context.clearRect(0, this.config.canvasHeight - (this.height + this.height / 2), this.config.canvasWidth, this.config.canvasHeight);
            this.context.fillRect(this.x, this.y, this.width, this.height);
            //Nave canon
            this.context.fillRect(this.x + 24, this.config.canvasHeight - 30, 3, 5);
            this.context.clearRect(this.x - 4, this.config.canvasHeight - 27, 7, 12);
            this.context.fillRect(this.x + 22, this.config.canvasHeight - 25, 7, 12);
            this.context.clearRect(this.x + this.width - 3, this.config.canvasHeight - 27, 7, 12);
        }
    };
    Nave.prototype.moveLeft = function (step) {
        this.x -= this.width / step;
        if (this.x <= (-this.width))
            this.x = this.config.canvasWidth - this.width;
        this.paint();
    };
    Nave.prototype.moveRight = function (step) {
        this.x += this.width / step;
        if (this.x >= this.config.canvasWidth)
            this.x = 0;
        this.paint();
    };
    Nave.prototype.move = function (event) {
        if ((event instanceof KeyboardEvent) && event.code == 'KeyP')
            this.GAME.pause(!this.GAME.paused);
        if (!this.GAME.paused) {
            if (event instanceof MouseEvent) {
                var mouseXaux = event.clientX + document.body.scrollLeft;
                if (this.config.mouseX > mouseXaux)
                    this.moveLeft(5);
                if (this.config.mouseX < mouseXaux)
                    this.moveRight(5);
                if (this.config.mouseX != mouseXaux)
                    this.config.mouseX = mouseXaux;
            }
            else if (event instanceof KeyboardEvent) {
                console.log(event.code);
                if (event.code == 'ArrowLeft') //LEFT
                    this.moveLeft(2);
                else if (event.code == 'ArrowRight') //RIGHT
                    this.moveRight(2);
                else if (event.code == 'ControlLeft' || event.code == 'Space') //UP FIRE
                    this.fire();
            }
        }
    };
    return Nave;
}());
exports.Nave = Nave;
;


/***/ }),

/***/ 594:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tool = void 0;
//------------Tool functions
//Check if a var exist
var Tool = /** @class */ (function () {
    function Tool() {
    }
    //A random number multiple of 5
    Tool.randomRange = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
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
var config_1 = __webpack_require__(913);
var nave_1 = __webpack_require__(861);
window.onload = function () { new nave_1.Nave(new config_1.Config()); };

})();

/******/ })()
;