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

//Object Enemy
function enemy() {
 this.init = function (x,y,width,height,context,index,enemyType) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.index = index;
  this.context = context;
  this.img = enemyType;
  this.paint();
 }
	
 this.paint = function (src) {
  this.context.drawImage(this.img, this.x,this.y,this.width,this.height);
 }
	
 this.Obstruction = function () {
  var elementNumber = window.enemies.element.length-1;
  for (var i = 0;i<=elementNumber;i++) {
   if ((window.enemies.element[i].x==this.x)&&(window.enemies.element[i].index>this.index))
	return true;
  }
  return false;
 }
 
 //Enemy fire
 this.fire = function () {
  if (!window.game.paused) 
   this.directionFire(this.x,this.y,this);
 }
 
 //Fire direction
 this.directionFire = function (xPos,i,element) {
  setTimeout(function () {
   if (i<=canvasHeight-20) {//If the fire is not in screen border	
	//Make a fire and delete track
	element.context.fillStyle = "#FF0000";
	element.context.clearRect(xPos,i-20,3,9);
	element.context.fillRect(xPos,i,3,9);
	element.context.fillStyle = "#7fff00";
	//the fire resume trayectory
	element.directionFire(xPos,i+20,element);
   } else {
	if ((xPos>=window.nave.x)&&(xPos<=(window.nave.x+window.nave.width))) {	
	 window.nave.life--;
	 _life.textContent = window.nave.life;
	 if (window.nave.life<=0){
	  window.game.showMessage("You are dead");
	  setTimeout(function(){
		  window.location.reload();
	  },3000)
	  
	 } else {
	 // alert("You have only "+nave.life+" life");
	  nave.init();
	 }
    }else
	 window.enemies.context.clearRect(xPos,i-20,3,9);
   }
  },30);
 }
 
}
