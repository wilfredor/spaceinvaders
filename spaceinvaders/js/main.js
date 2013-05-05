/*
 
Wilfredo R. Rodriguez H. (wilfredor@gmail.com)

Copyright (C) 2013

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

//Canvas size
canvasWidth = 800;
canvasHeight = 500;

//Create canvas element in body
var canvas = document.createElement("canvas");
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
canvas.setAttribute('style', 'position:absolute;top:23px;');
window.document.body.appendChild(canvas);

var mouseX=0;

//Where I show the information about level, score and live
var _level = window.document.getElementById("level");
var _score = window.document.getElementById("score");
var _life = window.document.getElementById("life");

_level.textContent = 1;
_score.textContent = 0;
_life.textContent = 3;

var gamePaused = false;

window.onload = function() {
 //Input events
 window.document.body.onkeydown=function (event) {nave.move(event);};
 window.document.body.onmousedown=function () {nave.fire();};
 window.document.body.onmousemove=function (event) {nave.move(event);};
 
 //Init nave
 nave.init();
 //Init enemies
 enemies.init();
}