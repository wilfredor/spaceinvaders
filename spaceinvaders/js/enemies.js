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

  if (this.element.length===0) {
   window.game.showMessage("You win");
   this.removeEnemies();
   _level.textContent++;
	
   //Init enemies array
   enemies.init();
  }
 },
 
 initEnemies: function () {
 
  //Enemy type images
  var enemiesType = [];
  enemiesType = [0, 1, 2].map(i => {
    var enemyImage = new Image();
    enemyImage.src = `spaceinvaders/images/enemies${i}.svg`;
    return enemyImage;
  });
  
  //Create a new enemy element and add to enemies array
 var index = 0;
 var screenBorderWidth = canvasWidth - this.width;
 var screenBorderHeight = canvasHeight - this.height;
 var step = this.width * 2;

 for (i = this.x + this.width; i <= screenBorderWidth; i += step) {
   for (var j = this.y; j <= (screenBorderHeight / 2) + (screenBorderHeight / 6); j += (this.height * 2)) {
     for (var enemyType = 0; enemyType < enemiesType.length; enemyType++) {
       var enemy_element = new enemy();
       enemy_element.init(i, j, this.width, this.height, this.context, index, enemiesType[enemyType]);
       this.element.push(enemy_element);
       index++;
     }
   }
 }
  //this enemy go to fire
  this.enemyFire(1000);
 },

//paint all enemies
paint: function (move_left) {
  this.removeEnemies();

  this.element.forEach(function(element) {
    if (!element.isPainted) {
      element.paint();
    }
  });

  return true;
},
 
 //move enemy elements  move elements enemies Horizontally and Vertically
 moveXY: function (moveLeft) {
  // Initialize the game and naveHeight variables with the corresponding properties
  // of the global window object.
  var game = window.game;
  var naveHeight = window.nave.height;

  // If the game is not paused, proceed to move the enemies.
  if (!game.paused) {
    // Remove the enemies to repaint them in their new position.
    window.enemies.removeEnemies();

    // Calculate the number of elements in the this.element array.
    var elementsNumber = this.element.length - 1;

    // Iterate over each element in the this.element array.
    for (var i = 0; i <= elementsNumber; i++) {
      // If moveLeft is undefined, move the element down by a step of 5.
      // If moveLeft is defined, move the element left or right depending on
      // whether the value of moveLeft is true or false.
      if (moveLeft === undefined) {
        this.element.i.y += this.height / 5;
      } else {
        this.element.i.x += (moveLeft) ? -this.element.i.width : this.element.i.width;
      }

      // Repaint the element in its new x, y position.
      this.element.i.paint();

      // If the element is in the nave area, show a game over message and reload the page.
      if (this.element.i.y >= (canvasHeight - 3 * naveHeight)) {
        game.showMessage("You are dead");
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
     move_left = (!window.game.paused)?(!move_left):(move_left); //If game is paused don't move Horizontally
	 window.enemies.moveX(move_left,speed);
    }
   },
  speed);
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
 checkColision: function(x, y, width, height) {
  // Create an object to store the coordinates and dimensions of the object to check
  const obj = { x1: x, y1: y, x2: x + width, y2: y + height };

  // Loop through all elements in the game
  for (const element of this.elements) {
    // Create an object to store the coordinates and dimensions of the current element
    const elementObj = {
      x1: element.x,
      y1: element.y,
      x2: element.x + element.width,
      y2: element.y + element.height
    };

    // Check if the object to check collides with the current element
    if (this.intersects(obj, elementObj)) {
      // If there is a collision, remove the element and return true
      this.remove(element);
      return true;
    }
  }

  // If there is no collision with any element, return false
  return false;
}
	
};
