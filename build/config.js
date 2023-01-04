"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
        var _a, _b, _c, _d;
        //Canvas size
        this.canvasWidth = 800;
        this.canvasHeight = 500;
        //Create canvas element in body
        this.canvas = document.createElement("canvas");
        this.app = document.getElementById("game");
        this.mouseX = 0;
        //Where I show the information about level, score and live
        this._level = document.getElementById("level");
        this._score = document.getElementById("score");
        this._life = document.getElementById("life");
        this.canvas.setAttribute('width', String(this.canvasWidth));
        this.canvas.setAttribute('height', String(this.canvasHeight));
        this.canvas.setAttribute('style', 'position:absolute;top:23px;'); //Space for level,score and life
        (_a = this.app) === null || _a === void 0 ? void 0 : _a.appendChild(this.canvas);
        if ((_b = this._level) === null || _b === void 0 ? void 0 : _b.textContent)
            this._level.textContent = "1";
        if ((_c = this._score) === null || _c === void 0 ? void 0 : _c.textContent)
            this._score.textContent = "0";
        if ((_d = this._life) === null || _d === void 0 ? void 0 : _d.textContent)
            this._life.textContent = "3";
    }
    return Config;
}());
exports.Config = Config;
