"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nave = void 0;
var enemies_1 = require("./enemies");
var game_1 = require("./game");
var Nave = /** @class */ (function () {
    function Nave(config) {
        var _a;
        this.context = config.canvas.getContext("2d");
        this.width = 50;
        this.height = 20;
        this.life = Number((_a = config._life) === null || _a === void 0 ? void 0 : _a.textContent);
        this.shots = 0;
        this.maxshots = 3;
        this.x = 0;
        this.y = config.canvasHeight - this.height;
        this.paint();
        this.CONFIG = config;
        this.GAME = new game_1.Game(config);
        this.enemies = new enemies_1.Enemies(config, this.GAME, this);
    }
    Nave.prototype.fire = function () {
        if (!this.GAME.pause) {
            if (this.shots <= this.maxshots) {
                this.shots++;
                var xPos = this.x + 25;
                var i = (this.CONFIG.canvasHeight - 60);
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
            this.context.clearRect(0, this.CONFIG.canvasHeight - (this.height + this.height / 2), this.CONFIG.canvasWidth, this.CONFIG.canvasHeight);
            this.context.fillRect(this.x, this.y, this.width, this.height);
            //Nave canon
            this.context.fillRect(this.x + 24, this.CONFIG.canvasHeight - 30, 3, 5);
            this.context.clearRect(this.x - 4, this.CONFIG.canvasHeight - 27, 7, 12);
            this.context.fillRect(this.x + 22, this.CONFIG.canvasHeight - 25, 7, 12);
            this.context.clearRect(this.x + this.width - 3, this.CONFIG.canvasHeight - 27, 7, 12);
        }
    };
    Nave.prototype.moveLeft = function (step) {
        this.x -= this.width / step;
        if (this.x <= (-this.width))
            this.x = this.CONFIG.canvasWidth - this.width;
        this.paint();
    };
    Nave.prototype.moveRight = function (step) {
        this.x += this.width / step;
        if (this.x >= this.CONFIG.canvasWidth)
            this.x = 0;
        this.paint();
    };
    Nave.prototype.move = function (event) {
        if (event.keyCode == 80)
            this.GAME.pause(!this.GAME.pause);
        if (!this.GAME.pause) {
            var mouseXaux = event.clientX + document.body.scrollLeft;
            if (this.CONFIG.mouseX > mouseXaux)
                this.moveLeft(5);
            if (this.CONFIG.mouseX < mouseXaux)
                this.moveRight(5);
            if (this.CONFIG.mouseX != mouseXaux)
                this.CONFIG.mouseX = mouseXaux;
            //alert (event.keyCode);
            if (event.keyCode == 37) //LEFT
                this.moveLeft(2);
            else if (event.keyCode == 39) //RIGHT
                this.moveRight(2);
            else if ((event.keyCode == 17) || (event.keyCode == 32)) //UP FIRE
                this.fire();
        }
    };
    return Nave;
}());
exports.Nave = Nave;
;
