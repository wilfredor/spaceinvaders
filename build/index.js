"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nave_1 = require("./nave");
var config_1 = require("./config");
window.onload = function () {
    var nave = new nave_1.Nave(new config_1.Config());
    //Input events
    document.body.onkeydown = function (event) { nave.move(event); };
    document.body.onmousedown = function () { nave.fire(); };
    document.body.onmousemove = function (event) { nave.move(event); };
};
