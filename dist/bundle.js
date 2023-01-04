(()=>{"use strict";var t,e,i={913:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Config=void 0;e.Config=function(){this.canvasWidth=800,this.canvasHeight=500,this.canvas=document.createElement("canvas"),this.game=document.getElementById("game"),this.mouseX=0,this.level=document.getElementById("level"),this.score=document.getElementById("score"),this.life=document.getElementById("life"),this.canvas.setAttribute("width",String(this.canvasWidth)),this.canvas.setAttribute("height",String(this.canvasHeight)),this.canvas.setAttribute("style","position:absolute;top:23px;"),this.game&&this.game.appendChild(this.canvas),this.level&&(this.level.textContent="1"),this.score&&(this.score.textContent="0"),this.life&&(this.life.textContent="3")}},749:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Enemies=void 0;var n=i(624),s=i(594),o=function(){function t(t,e,i){this.config=i,this.context=this.config.canvas.getContext("2d"),this.x=0,this.y=0,this.width=30,this.height=30,this.element=[],this.enemiesType=[],this.nave=e,this.game=t,this.initEnemies(),this.move()}return t.prototype.reset=function(){this.x=0,this.y=0,this.width=30,this.height=30,this.element=[],this.enemiesType=[]},t.prototype.removeEnemies=function(){var t;null===(t=this.context)||void 0===t||t.clearRect(0,0,this.config.canvasWidth,this.config.canvasHeight-(this.nave.height+9))},t.prototype.remove=function(t){var e,i,n,s;null===(e=this.element)||void 0===e||e.splice(t,1),this.config.score&&(this.config.score.textContent=String(Number(null===(i=this.config.score)||void 0===i?void 0:i.textContent)+1)),0===(null===(n=this.element)||void 0===n?void 0:n.length)&&(this.game.showMessage("You win"),this.removeEnemies(),this.config.level&&(this.config.level.textContent=String(Number(null===(s=this.config.level)||void 0===s?void 0:s.textContent)+1)),this.reset())},t.prototype.initEnemies=function(){for(var t=[],e=0;e<=2;e++)t[e]=new Image,t[e].src="images/enemies".concat(e,".svg");var i=0,s=this.config.canvasWidth-this.width,o=2*this.width,h=this.config.canvasHeight-this.height;for(e=this.x+this.width;e<=s;e+=o)for(var c=0,a=this.y;a<=h/2+h/6;a+=2*this.height){var r=new n.Enemy(e,a,i,t[c],this);this.element.push(r),i++,c<t.length-1&&c++}this.enemyFire(1e3)},t.prototype.paint=function(){this.removeEnemies();for(var t=0;t<=this.element.length-1;t++)this.element[t].paint();return!0},t.prototype.moveXY=function(t){if(!this.game.paused){this.removeEnemies();for(var e=this.element.length-1,i=0;i<=e;i++)if(null!==t?this.element[i].x+=t?-this.element[i].width:this.element[i].width:this.element[i].y+=this.height/5,this.element[i].paint(),this.element[i].y>=this.config.canvasHeight-3*this.nave.height)return this.game.showMessage("You are dead"),window.location.reload(),!1}return!0},t.prototype.moveX=function(t,e){var i=this;setTimeout((function(){i.moveXY(t)&&(t=i.game.paused?t:!t,i.moveX(t,e))}),e)},t.prototype.moveY=function(t){var e=this;setTimeout((function(){e.moveXY(null)&&e.moveY(t)}),t)},t.prototype.enemyFire=function(t){var e=this;setTimeout((function(){var i=s.Tool.randomRange(0,e.element.length-1);e.element[i]&&e.element[i].fire(),e.enemyFire(t)}),t)},t.prototype.move=function(){var t;this.moveX(!0,800),this.moveY(8e3*Number(null===(t=this.config.level)||void 0===t?void 0:t.textContent))},t.prototype.checkColision=function(t,e,i,n){for(var s=t,o=e,h=t+i,c=e+n,a=this.element.length,r=0;r<=a;r++)if(this.element[r]){var l=this.element[r].x,f=this.element[r].y,v=this.element[r].x+this.element[r].width,m=this.element[r].y+this.element[r].height;if((m<=c&&m>=o||f>=o&&f<=c)&&(s>=l&&s<=v||h<=v&&h>=l))return console.log("killed ".concat(r)),this.remove(r),!0}return!1},t}();e.Enemies=o},624:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Enemy=void 0;var i=function(){function t(t,e,i,n,s){this.width=s.width,this.height=s.height,this.x=t,this.y=e,this.index=i,this.context=s.config.canvas.getContext("2d"),this.img=n,this.enemies=s,this.game=this.enemies.game,this.config=this.enemies.config,this.paint()}return t.prototype.paint=function(){this.context.drawImage(this.img,this.x,this.y,this.width,this.height)},t.prototype.Obstruction=function(){for(var t=this.enemies.element.length-1,e=0;e<=t;e++)if(this.enemies.element[e].x==this.x&&this.enemies.element[e].index>this.index)return!0;return!1},t.prototype.fire=function(){this.game.paused||this.directionFire(this.x,this.y,this)},t.prototype.directionFire=function(t,e,i){var n=this;setTimeout((function(){var s,o;e<=n.config.canvasHeight-20?(i.context.fillStyle="#FF0000",i.context.clearRect(t,e-20,3,9),i.context.fillRect(t,e,3,9),i.context.fillStyle="#7fff00",i.directionFire(t,e+20,i)):t>=n.enemies.nave.x&&t<=n.enemies.nave.x+n.width?(n.enemies.nave.life--,(null===(s=n.config.life)||void 0===s?void 0:s.textContent)&&(n.config.life.textContent=String(n.enemies.nave.life)),n.enemies.nave.life<=0?(n.game.showMessage("You are dead"),setTimeout((function(){window.location.reload()}),3e3)):1===n.enemies.nave.life&&alert("You have only "+n.enemies.nave.life+" life")):null===(o=n.enemies.context)||void 0===o||o.clearRect(t,e-20,3,9)}),30)},t}();e.Enemy=i},769:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Game=void 0;var i=function(){function t(t){this.paused=!1,this.config=t}return t.prototype.showMessage=function(t){var e=this;this.paused=!0;var i=this.config.canvas.width/2,n=this.config.canvas.height/2,s=this.config.canvas.getContext("2d");s&&(s.font="30px Courier New",s.fillStyle="white",s.fill(),s.textAlign="center",s.fillText(t,i,n)),"Pause"!=t&&setTimeout((function(){e.paused=!1}),3e3)},t.prototype.pause=function(t){t&&this.showMessage("Pause"),this.paused=t},t}();e.Game=i},861:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Nave=void 0;var n=i(749),s=i(769),o=function(){function t(t){var e,i=this;this.context=t.canvas.getContext("2d"),this.width=50,this.height=20,this.life=Number(null===(e=t.life)||void 0===e?void 0:e.textContent),this.shots=0,this.maxshots=3,this.x=0,this.y=t.canvasHeight-this.height,this.GAME=new s.Game(t),this.enemies=new n.Enemies(this.GAME,this,t),this.config=t,this.paint(),window.onkeydown=function(t){i.move(t)},window.onmousedown=function(){i.fire()},window.onmousemove=function(t){i.move(t)}}return t.prototype.fire=function(){if(!this.GAME.paused&&this.shots<=this.maxshots){this.shots++;var t=this.x+25,e=this.config.canvasHeight-60;this.directionFire(t,e)}},t.prototype.directionFire=function(t,e){var i=this;e<=-20&&(this.shots=0),setTimeout((function(){var n,s;e>=-20&&(null===(n=i.context)||void 0===n||n.clearRect(t,e+20,2,12),null===(s=i.context)||void 0===s||s.fillRect(t,e,2,12),i.enemies.checkColision(t,e,7,12)&&(e=-5,i.enemies.paint()),i.directionFire(t,e-20))}),30)},t.prototype.paint=function(){this.context&&(this.context.fillStyle="#7fff00",this.context.clearRect(0,this.config.canvasHeight-(this.height+this.height/2),this.config.canvasWidth,this.config.canvasHeight),this.context.fillRect(this.x,this.y,this.width,this.height),this.context.fillRect(this.x+24,this.config.canvasHeight-30,3,5),this.context.clearRect(this.x-4,this.config.canvasHeight-27,7,12),this.context.fillRect(this.x+22,this.config.canvasHeight-25,7,12),this.context.clearRect(this.x+this.width-3,this.config.canvasHeight-27,7,12))},t.prototype.moveLeft=function(t){this.x-=this.width/t,this.x<=-this.width&&(this.x=this.config.canvasWidth-this.width),this.paint()},t.prototype.moveRight=function(t){this.x+=this.width/t,this.x>=this.config.canvasWidth&&(this.x=0),this.paint()},t.prototype.move=function(t){if(t instanceof KeyboardEvent&&"KeyP"==t.code&&this.GAME.pause(!this.GAME.paused),!this.GAME.paused)if(t instanceof MouseEvent){var e=t.clientX+document.body.scrollLeft;this.config.mouseX>e&&this.moveLeft(5),this.config.mouseX<e&&this.moveRight(5),this.config.mouseX!=e&&(this.config.mouseX=e)}else t instanceof KeyboardEvent&&(console.log(t.code),"ArrowLeft"==t.code?this.moveLeft(2):"ArrowRight"==t.code?this.moveRight(2):"ControlLeft"!=t.code&&"Space"!=t.code||this.fire())},t}();e.Nave=o},594:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Tool=void 0;var i=function(){function t(){}return t.randomRange=function(t,e){return 5*Math.round((Math.random()*(e-t)+t)/5)},t}();e.Tool=i}},n={};function s(t){var e=n[t];if(void 0!==e)return e.exports;var o=n[t]={exports:{}};return i[t](o,o.exports,s),o.exports}t=s(913),e=s(861),window.onload=function(){new e.Nave(new t.Config)}})();