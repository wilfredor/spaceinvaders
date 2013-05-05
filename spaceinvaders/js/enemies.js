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

var enemies = {
	
 init: function () {
  this.context = canvas.getContext("2d");
  this.x = 0;
  this.y = 0;
  this.width = 30;
  this.height = 30;
  this.element = [];
  this.enemiesType = [];
  this.initEnemies();
  this.move();
 },
 
 removeEnemies : function () {
   //Clean place
  //window.nave.height+9 is the nave height + canon
  this.context.clearRect(0,0,canvasWidth,canvasHeight - (window.nave.height+9));
 },
 
 //Remove a enemy bi index in enemies array
 remove: function (index) {
  this.element.splice(index,1);
  _score.textContent++;

  if (this.element.length==0) {
   alert ("You win");
   this.removeEnemies();
   _level.textContent++;
	
   //Init enemies array
   enemies.init();
  }
 },
 
 initEnemies: function () {
 
  //Enemy type images
  var enemiesType = [];
  for (var i=0;i<=2;i++) {
   enemiesType[i] = new Image();
   enemiesType[i].src = "spaceinvaders/images/enemies"+i+".svg";
  }
  
  //Create a new enemy element and add to enemies array
  var index = 0;
  for (var i = this.x+this.width;i<=canvasWidth-(this.width);i+=(this.width*2)) {
   var enemyType =0;
   for (var j = this.y;j<=(canvasHeight-this.height)/2+(canvasHeight-this.height)/6;j+=(this.height+this.height)){
    var enemy_element = new enemy();
	enemy_element.init(i,j,this.width,this.height,this.context,index,enemiesType[enemyType]);
	this.element.push(enemy_element);
	index++;
	if (enemyType<enemiesType.length-1)
	 enemyType++;
   }
  }
  //this enemy go to fire
  this.enemyFire(1000);
 },
 
 //paint all enemies
 paint: function (move_left) {
  this.removeEnemies();
  for (var i = 0;i<=this.element.length-1;i++) 
   this.element[i].paint();
  return true;
 },
 
 //move enemy elements  move elements enemies Horizontally and Vertically
 moveXY: function (move_left) {
  if (!window.gamePaused) {
   window.enemies.removeEnemies(); //clean enemies for repaint
   for (var i = 0;i<=this.element.length-1;i++){
    if (isset(move_left)) //If move is Horizontally
 	 this.element[i].x+=(move_left)?(-this.element[i].width):(this.element[i].width);
    else
 	 this.element[i].y+=this.height/5; //Else if move is Vertically and step is 5
    this.element[i].paint(); //repaint enemies in new x,y
    if (this.element[i].y>=(canvasHeight - 3*(window.nave.height))){ //If Enemy is in nave area
	 alert ("You are dead");
	 window.location.reload();
	 return false;
    }
   }
  }
  return true;
 },
 
 //move elements enemies Horizontally
 moveX: function (move_left,speed) {
  setTimeout(function(){
    if(window.enemies.moveXY(move_left)) {
     move_left = (!window.gamePaused)?(!move_left):(move_left); //If game is paused don't move Horizontally
	 window.enemies.moveX(move_left,speed);
    }
   }
  ,speed);
 }, 
 
 //move elements enemies Vertically
 moveY: function (speed) {
  setTimeout(function(){
    //window.enemies.y+=window.enemies.height/5;
    if(window.enemies.moveXY())
	 window.enemies.moveY(speed);
   },speed);
 }, 
 
 //Run fire to a enemy
 enemyFire: function(speed) {
 //First enemy in last row
  var noenemyRow = (window.enemies.element.length-(Math.round(canvasWidth/(this.width*2)))-1);
  setTimeout(function () {
   //Any enemy in last row
   var index = randomRange(0, window.enemies.element.length-1);
   window.enemies.element[index].fire();
   window.enemies.enemyFire(speed);
  },speed);
 },
 
 //move enemies Vertically and Horizontally in the screen
 move: function() {
  this.moveX(true,800);
  //First speed level is 8000
  this.moveY(8000*_level.textContent);
 },
 
 //Check if a enemy in array is colision with a fire
 checkColision: function (x,y,width,height) {
  var x1_Fire = x;
  var y1_Fire = y;
  var x2_Fire = x+width;
  var y2_Fire = y+height;
  for (var i = 0;i<=this.element.length;i++){
   if (this.element[i]) {
    var x1_enemy = this.element[i].x;
    var y1_enemy = this.element[i].y;
    var x2_enemy = this.element[i].x+this.element[i].width;
    var y2_enemy = this.element[i].y+this.element[i].height;
    //check colision areas
    if (((y2_enemy<=y2_Fire)&&(y2_enemy>=y1_Fire))||((y1_enemy>=y1_Fire)&&(y1_enemy<=y2_Fire))){
     if (((x1_Fire>=x1_enemy)&&(x1_Fire<=x2_enemy))||((x2_Fire<=x2_enemy)&&(x2_Fire>=x1_enemy))){
      console.log('killed '+i);
      this.remove(i);
      return true;
     }  
    }
   }
  }
 }
}