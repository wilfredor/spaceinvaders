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
var game = {
	
 init : function () {
	 this.paused = false;
	 //Init nave
	 nave.init();
	 //Init enemies
	 enemies.init();
	 
 },
 showMessage: function (messageContent) {
	 document.getElementById('game').style.display = 'none';
	 document.getElementById('message').textContent = messageContent;
 },
 hideMessage: function () {
	 document.getElementById('game').style.display = 'block';
	 document.getElementById('message').textContent = '';
 },
 pause: function (pause) {
	 if (pause)
	  this.showMessage("Pause...");
	 else
	  this.hideMessage();
	 this.paused = pause;
	 
 }
 
}