"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemies = void 0;
var enemy_1 = require("./enemy");
var tools_1 = require("./tools");
var Enemies = /** @class */ (function () {
    function Enemies(config, game, nave) {
        this.CONFIG = config;
        this.context = this.CONFIG.canvas.getContext("2d");
        this.x = 0;
        this.y = 0;
        this.width = 30;
        this.height = 30;
        this.element = [];
        this.enemiesType = [];
        this.initEnemies();
        this.move();
        this.nave = nave;
        this.game = game;
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
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.CONFIG.canvasWidth, this.CONFIG.canvasHeight - (this.nave.height + 9));
    };
    //Remove a enemy bi index in enemies array
    Enemies.prototype.remove = function (index) {
        var _a, _b, _c, _d, _e, _f;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        if ((_b = this.CONFIG._score) === null || _b === void 0 ? void 0 : _b.textContent)
            this.CONFIG._score.textContent = String(Number((_c = this.CONFIG._score) === null || _c === void 0 ? void 0 : _c.textContent) + 1);
        if (((_d = this.element) === null || _d === void 0 ? void 0 : _d.length) === 0) {
            this.game.showMessage("You win");
            this.removeEnemies();
            if ((_e = this.CONFIG._level) === null || _e === void 0 ? void 0 : _e.textContent)
                this.CONFIG._level.textContent = String(Number((_f = this.CONFIG._level) === null || _f === void 0 ? void 0 : _f.textContent) + 1);
            //Init enemies array
            this.reset();
        }
    };
    Enemies.prototype.initEnemies = function () {
        //Enemy type images
        var enemiesType = [];
        for (var i = 0; i <= 2; i++) {
            enemiesType[i] = new Image();
            enemiesType[i].src = "spaceinvaders/images/enemies" + i + ".svg";
        }
        //Create a new enemy element and add to enemies array
        var index = 0;
        var screenBorderWidth = this.CONFIG.canvasWidth - (this.width);
        var step = this.width * 2;
        var screenBorderHeight = this.CONFIG.canvasHeight - this.height;
        for (i = this.x + this.width; i <= screenBorderWidth; i += step) {
            var enemyType = 0;
            for (var j = this.y; j <= (screenBorderHeight) / 2 + (screenBorderHeight) / 6; j += (this.height * 2)) {
                var enemy_element = new enemy_1.Enemy(this.x, this.y, this.width, this.height, this.context, index, enemyType, this);
                enemy_element = new enemy_1.Enemy(i, j, this.width, this.height, this.context, index, enemiesType[enemyType], this);
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
        if (!this.game.pause) {
            this.removeEnemies(); //clean enemies for repaint
            var elementsNumber = this.element.length - 1;
            for (var i = 0; i <= elementsNumber; i++) {
                if (tools_1.Tool.isset(move_left, null)) //If move is Horizontally
                    this.element[i].x += (move_left) ? (-this.element[i].width) : (this.element[i].width);
                else
                    this.element[i].y += this.height / 5; //Else if move is Vertically and step is 5
                this.element[i].paint(); //repaint enemies in new x,y
                if (this.element[i].y >= (this.CONFIG.canvasHeight - 3 * (this.nave.height))) { //If Enemy is in nave area
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
                move_left = (!_this.game.pause) ? (!move_left) : (move_left); //If game is paused don't move Horizontally
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
        // var noenemyRow = (this.element.length-(Math.round(this.CONFIG.canvasWidth/(this.width*2)))-1);
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
        this.moveY(8000 * Number((_a = this.CONFIG._level) === null || _a === void 0 ? void 0 : _a.textContent));
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
