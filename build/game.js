"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var Game = /** @class */ (function () {
    function Game(config) {
        this.paused = false;
        this.CONFIG = config;
    }
    Game.prototype.showMessage = function (messageContent) {
        var _this = this;
        this.paused = true;
        // window.enemies.removeEnemies();
        var x = this.CONFIG.canvas.width / 2; //Center text in canvas 
        var y = this.CONFIG.canvas.height / 2;
        var ctx = this.CONFIG.canvas.getContext("2d");
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
