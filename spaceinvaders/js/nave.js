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

//Object nave definition
var nave = {
	
 init : function () {
  this.context = canvas.getContext("2d");
  this.width = 50;
  this.height = 20;
  this.lives = _lives.textContent;
  this.shots = 0;
  this.maxshots = 3;
  this.x = 0;
  this.y = canvasHeight-this.height;
  this.paint(); 
 },
 
 fire: function () {
  if (this.shots<=this.maxshots){
   this.shots++;
   var xPos = window.nave.x+25;
   var i=(canvasHeight-60);
   this.directionFire(xPos,i);
  }
 },
 
 directionFire: function(xPos,i){
  if ((i<=-20))
   this.shots=0;
  setTimeout(function () {
   if (i>=-20) {//If the fire is in screen border	
	//create fire and delete track
    window.nave.context.clearRect(xPos,i+20,2,12);
	window.nave.context.fillRect(xPos,i,2,12);
	//if some enemy the fire stop
	if(enemies.checkColision(xPos,i,7,12)){
	 i=-5;
	 enemies.paint();
	 //this.shots=0;
	}
	//Recursion, the shot is going
	window.nave.directionFire(xPos,i-20);
   }
  },30);
 },
 
 paint: function () {
  //paint nave in relative screen position
  this.context.fillStyle = "#7fff00";
  this.context.clearRect(0,canvasHeight-(this.height+this.height/2),canvasWidth,canvasHeight);
  this.context.fillRect (this.x,this.y,this.width,this.height);	 
  //Nave canon
  this.context.fillRect (this.x+24,canvasHeight-30,3,5);
  this.context.clearRect(this.x-4,canvasHeight-27,7,12);
  this.context.fillRect (this.x+22,canvasHeight-25,7,12);
  this.context.clearRect(this.x+this.width-3,canvasHeight-27,7,12);
 },
 
 moveLeft : function (step) {
  this.x-=this.width/step;
  if(this.x<=(-this.width))
   this.x=canvasWidth-this.width;
  this.paint();
 },
 
 moveRight : function (step) {
  this.x+=this.width/step;
  if(this.x>=canvasWidth)
   this.x=0;
  this.paint();
 },
 
 move : function (event) {
  var mouseXaux = event.clientX + document.body.scrollLeft;
  if (mouseX>mouseXaux)
   this.moveLeft(5);
  if (mouseX<mouseXaux)
   this.moveRight(5);
  if(mouseX!=mouseXaux)
   mouseX=mouseXaux;
  //alert (event.keyCode);
  if (event.keyCode==37)  //LEFT
   this.moveLeft(2);
  else if (event.keyCode==39)  //RIGHT
   this.moveRight(2);
  else if (event.keyCode==17)  //UP FIRE
   this.fire();
 }
}