/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 124:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Colision = void 0;
var Colision = /** @class */ (function () {
    function Colision() {
    }
    //Check if a enemy in array is colision with a fire
    Colision.checkColision = function (x, y, width, height, enemies) {
        var fireBounds = {
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
        };
        var elementsNumber = enemies.length;
        for (var i = 0; i <= elementsNumber; i++) {
            if (enemies[i]) {
                var enemyBounds = {
                    x1: enemies[i].x,
                    y1: enemies[i].y,
                    x2: enemies[i].x + enemies[i].width,
                    y2: enemies[i].y + enemies[i].height,
                };
                if (this.checkVerticalCollision(fireBounds, enemyBounds) &&
                    this.checkHorizontalCollision(fireBounds, enemyBounds)) {
                    console.log("killed ".concat(i));
                    return i;
                }
            }
        }
        return -1;
    };
    Colision.checkVerticalCollision = function (bounds1, bounds2) {
        return bounds2.y2 <= bounds1.y2 && bounds2.y2 >= bounds1.y1 || bounds1.y1 >= bounds2.y1 && bounds1.y1 <= bounds2.y2;
    };
    Colision.checkHorizontalCollision = function (bounds1, bounds2) {
        return bounds1.x1 >= bounds2.x1 && bounds1.x1 <= bounds2.x2 || bounds2.x2 <= bounds1.x2 && bounds2.x2 >= bounds1.x1;
    };
    return Colision;
}());
exports.Colision = Colision;


/***/ }),

/***/ 874:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollisionSystem = void 0;
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var CollisionSystem = /** @class */ (function () {
    function CollisionSystem(game, services) {
        if (services === void 0) { services = tools_1.services; }
        this.game = game;
        this.services = services;
    }
    CollisionSystem.prototype.tick = function () {
        this.handleProjectiles();
        this.handleAttackers();
    };
    CollisionSystem.prototype.handleProjectiles = function () {
        var _this = this;
        this.services.forEachProjectile(function (p) {
            if (p.owner === "player") {
                var enemies = _this.game.enemies.items;
                var hit = enemies.findIndex(function (e) {
                    return p.x < e.x + e.width &&
                        p.x + p.width > e.x &&
                        p.y < e.y + e.height &&
                        p.y + p.height > e.y;
                });
                if (_this.game.shields.hit(p.x, p.y, p.width, p.height)) {
                    return false;
                }
                if (hit !== -1) {
                    var enemy = enemies[hit];
                    _this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    _this.game.enemies.remove(hit);
                    _this.game.enemies.paint();
                    return false;
                }
            }
            else {
                if (_this.game.shields.hit(p.x, p.y, p.width, p.height)) {
                    return false;
                }
                var nave = _this.game.nave;
                var hit = p.x < nave.x + config_1.Config.naveWidth &&
                    p.x + p.width > nave.x &&
                    p.y < nave.y + config_1.Config.naveHeight &&
                    p.y + p.height > nave.y;
                if (hit) {
                    nave.life--;
                    _this.game.life = nave.life;
                    nave.flashHit();
                    if (nave.life <= 0) {
                        _this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth);
                        _this.services.playPlayerDestroyed();
                        _this.services.startGameOverTheme();
                        _this.game.showMessage("You are dead");
                        _this.game.reload();
                    }
                    return false;
                }
            }
            return true;
        });
    };
    CollisionSystem.prototype.handleAttackers = function () {
        var enemies = this.game.enemies.items;
        var nave = this.game.nave;
        for (var _i = 0, enemies_1 = enemies; _i < enemies_1.length; _i++) {
            var enemy = enemies_1[_i];
            if (!enemy.isInAttack())
                continue;
            var hit = enemy.x < nave.x + config_1.Config.naveWidth &&
                enemy.x + enemy.width > nave.x &&
                enemy.y < nave.y + config_1.Config.naveHeight &&
                enemy.y + enemy.height > nave.y;
            if (hit) {
                this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                this.game.enemies.remove(enemy.index);
                enemy.resetPosition(0, 0);
                nave.life--;
                this.game.life = nave.life;
                nave.flashHit();
                if (nave.life <= 0) {
                    this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth);
                    this.services.playPlayerDestroyed();
                    this.services.startGameOverTheme();
                    this.game.showMessage("You are dead");
                    this.game.reload();
                    return;
                }
            }
        }
    };
    return CollisionSystem;
}());
exports.CollisionSystem = CollisionSystem;


/***/ }),

/***/ 913:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.init = function () {
        this.canvas = document.getElementById("playfield");
        this.context = this.canvas.getContext("2d");
        this.projectileCanvas = document.getElementById("projectiles");
        this.projectileContext = this.projectileCanvas.getContext("2d");
        var scale = Math.min(this.canvas.width / this.baseWidth, this.canvas.height / this.baseHeight);
        this.enemyWidth = Math.max(12, Math.round(this.baseEnemySize * scale));
        this.enemyHeight = this.enemyWidth;
        this.naveWidth = Math.max(24, Math.round(this.baseNaveSize.width * scale));
        this.naveHeight = Math.max(10, Math.round(this.baseNaveSize.height * scale));
        this.fireHeight = Math.max(8, Math.round(this.baseFireHeight * scale));
        // Speed values inversely scale so timing stays similar across sizes.
        var speedScale = Math.max(0.5, Math.min(2, 1 / scale));
        this.firstSpeedLevel = Math.round(this.baseFirstSpeedLevel * speedScale);
        this.enemyFireSpeed = Math.round(this.baseEnemyFireSpeed * speedScale);
    };
    Config.game = document.getElementById('game');
    // Base values used to scale sprites relative to canvas size.
    Config.baseWidth = 560;
    Config.baseHeight = 720;
    Config.baseEnemySize = 24;
    Config.baseNaveSize = { width: 40, height: 16 };
    Config.baseFireHeight = 16;
    Config.baseFirstSpeedLevel = 8000;
    Config.baseEnemyFireSpeed = 1000;
    Config.naveLife = 3;
    Config.naveShots = 0;
    Config.naveMaxshots = 3;
    return Config;
}());
exports.Config = Config;


/***/ }),

/***/ 749:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemies = void 0;
var config_1 = __webpack_require__(913);
var enemy_1 = __webpack_require__(624);
var tools_1 = __webpack_require__(594);
var Enemies = /** @class */ (function () {
    function Enemies(game, services) {
        if (services === void 0) { services = tools_1.services; }
        this.horizontalDirection = 1;
        this.horizontalSpeed = config_1.Config.enemyWidth * 1.6; // px/s, scales with enemy size
        this.descentStep = config_1.Config.enemyHeight * 0.45;
        this.totalTime = 0;
        this.formationOffsetX = 0;
        this.formationOffsetY = 0;
        this.attackAccumulator = 0;
        this.nextAttackIn = 1.5;
        this.game = game;
        this.services = services;
        this.x = 0;
        this.y = 0;
        this.reset();
        this.initEnemies();
    }
    Enemies.prototype.reset = function () {
        this.formationOffsetX = 0;
        this.formationOffsetY = 0;
        this.attackAccumulator = 0;
        this.items = [];
    };
    //Remove a enemy bi index in enemies array
    Enemies.prototype.remove = function (index) {
        var _a, _b;
        (_a = this.items) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
        this.game.score++;
        this.services.playEnemyDestroyed();
        if (((_b = this.items) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            this.game.showMessage("You win");
            this.services.removeEnemies();
            this.game.level++;
            //Init next wave
            this.reset();
            this.services.clearAll();
            this.initEnemies();
        }
    };
    Enemies.prototype.initEnemies = function () {
        // Arcade-like formation: 11 columns x 5 rows, centered.
        var columns = 11;
        var rows = 5;
        var gapX = config_1.Config.enemyWidth * 1.9;
        var gapY = config_1.Config.enemyHeight * 1.8;
        var formationWidth = config_1.Config.enemyWidth + gapX * (columns - 1);
        var startX = Math.max(0, (config_1.Config.canvas.width - formationWidth) / 2);
        var startY = this.services.hudHeight + config_1.Config.enemyHeight * 1.5;
        var index = 0;
        for (var col = 0; col < columns; col++) {
            for (var row = 0; row < rows; row++) {
                var enemyType = Math.min(Math.max(0, row), 2);
                var x = startX + col * gapX;
                var y = startY + row * gapY;
                var enemyElement = new enemy_1.Enemy(x, y, index, enemyType, this, this.services);
                this.items.push(enemyElement);
                index++;
            }
        }
        this.enemyFire(config_1.Config.enemyFireSpeed);
        // Initial paint so the formation is visible before the first update tick.
        this.paint();
    };
    Enemies.prototype.frontLineEnemies = function () {
        var buckets = new Map();
        var bucketSize = config_1.Config.enemyWidth * 1.5;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (enemy.isInAttack())
                continue;
            var bucket = Math.round(enemy.x / bucketSize);
            var current = buckets.get(bucket);
            if (!current || enemy.y > current.y) {
                buckets.set(bucket, enemy);
            }
        }
        return Array.from(buckets.values());
    };
    //paint all enemies
    Enemies.prototype.paint = function () {
        this.services.removeEnemies();
        this.game.shields.draw();
        for (var i = 0; i <= this.items.length - 1; i++)
            this.items[i].paint();
        return true;
    };
    //Run fire to a enemy
    Enemies.prototype.enemyFire = function (speed) {
        var _this = this;
        //First enemy in last row
        setTimeout(function () {
            if (_this.items.length > 0) {
                // Choose a random enemy from the bottom-most row per column.
                var frontLine = _this.frontLineEnemies();
                var shooter = frontLine[Math.floor(Math.random() * frontLine.length)];
                shooter === null || shooter === void 0 ? void 0 : shooter.fire();
            }
            _this.enemyFire(speed);
        }, speed);
    };
    Enemies.prototype.update = function (deltaSeconds) {
        if (this.game.paused)
            return;
        var moveX = this.horizontalDirection * this.horizontalSpeed * deltaSeconds;
        var minYBeforeDescent = this.services.hudHeight + config_1.Config.enemyHeight * 0.5;
        this.totalTime += deltaSeconds;
        // Check formation bounds based on base positions (ignore attackers' current x).
        var minX = Infinity;
        var maxX = -Infinity;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var enemy = _a[_i];
            minX = Math.min(minX, enemy.baseX + this.formationOffsetX);
            maxX = Math.max(maxX, enemy.baseX + this.formationOffsetX + enemy.width);
        }
        var wouldHitLeft = minX + moveX < 0;
        var wouldHitRight = maxX + moveX > config_1.Config.canvas.width;
        if (wouldHitLeft || wouldHitRight) {
            this.horizontalDirection = this.horizontalDirection === 1 ? -1 : 1;
            this.formationOffsetY += this.descentStep;
        }
        else {
            this.formationOffsetX += moveX;
        }
        this.attackAccumulator += deltaSeconds;
        if (this.attackAccumulator >= this.nextAttackIn) {
            this.launchAttacker();
            this.attackAccumulator = 0;
            this.nextAttackIn = 1 + Math.random() * 2;
        }
        this.services.removeEnemies();
        this.game.shields.draw();
        for (var i = 0; i < this.items.length; i++) {
            var enemy = this.items[i];
            if (enemy.isInAttack()) {
                // Clear previous position trail for attackers.
                config_1.Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                var stillAttacking = enemy.updateAttack(deltaSeconds, this.formationOffsetX, this.formationOffsetY, this.game.shields);
                if (!stillAttacking) {
                    // Skip painting this frame; will be drawn in formation next frame.
                    continue;
                }
                var nave = this.game.nave;
                var collidesWithNave = enemy.x < nave.x + config_1.Config.naveWidth &&
                    enemy.x + enemy.width > nave.x &&
                    enemy.y < nave.y + config_1.Config.naveHeight &&
                    enemy.y + enemy.height > nave.y;
                if (collidesWithNave) {
                    config_1.Config.context.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    enemy.resetPosition(this.formationOffsetX, this.formationOffsetY);
                    this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    this.remove(enemy.index);
                    nave.life--;
                    this.game.life = nave.life;
                    nave.flashHit();
                    if (nave.life <= 0) {
                        this.services.explode(nave.x + config_1.Config.naveWidth / 2, nave.y + config_1.Config.naveHeight / 2, config_1.Config.naveWidth);
                        this.services.playPlayerDestroyed();
                        this.services.startGameOverTheme();
                        this.game.showMessage("You are dead");
                        this.game.reload();
                        return;
                    }
                    continue;
                }
            }
            else {
                var wobble = Math.sin(this.totalTime * 2 + enemy.bobPhase) * (config_1.Config.enemyHeight * 0.12);
                enemy.x = enemy.baseX + this.formationOffsetX;
                enemy.y = Math.max(minYBeforeDescent, enemy.baseY + this.formationOffsetY + wobble);
                enemy.animate(deltaSeconds);
            }
            enemy.paint();
            if (!enemy.isInAttack() && enemy.y >= config_1.Config.canvas.height - 3 * config_1.Config.naveHeight) {
                this.game.showMessage("You are dead");
                this.services.playPlayerDestroyed();
                this.services.startGameOverTheme();
                window.location.reload();
                return;
            }
            if (enemy.y < minYBeforeDescent) {
                enemy.y = minYBeforeDescent;
            }
        }
    };
    Enemies.prototype.launchAttacker = function () {
        var frontLine = this.frontLineEnemies().filter(function (e) { return !e.isInAttack(); });
        if (frontLine.length === 0)
            return;
        var shooter = frontLine[Math.floor(Math.random() * frontLine.length)];
        var gaps = this.game.shields.getGaps();
        var predictedX = this.game.nave.x + config_1.Config.naveWidth / 2 + this.game.nave.velocityX * 0.5;
        var clampedTarget = Math.max(0, Math.min(config_1.Config.canvas.width, predictedX));
        var targetX = clampedTarget;
        if (gaps.length > 0) {
            targetX = gaps.reduce(function (prev, curr) {
                return Math.abs(curr - clampedTarget) < Math.abs(prev - clampedTarget) ? curr : prev;
            });
        }
        var targetY = this.game.nave.y;
        shooter.startAttack(targetX, targetY);
    };
    return Enemies;
}());
exports.Enemies = Enemies;
;


/***/ }),

/***/ 624:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Enemy = void 0;
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var Enemy = /** @class */ (function () {
    function Enemy(x, y, index, type, enemies, services) {
        if (services === void 0) { services = tools_1.services; }
        var _a;
        this.framePhase = 0;
        this.animationFrame = 0;
        this.isAttacking = false;
        this.attackTime = 0;
        this.vxAttack = 0;
        this.vyAttack = 0;
        this.attackAmplitude = 0;
        this.attackFrequency = 0;
        this.width = config_1.Config.enemyWidth;
        this.height = config_1.Config.enemyHeight;
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.index = index;
        this.type = Math.min(Math.max(0, type), Enemy.frames.length - 1);
        this.color = (_a = Enemy.colors[this.type]) !== null && _a !== void 0 ? _a : "#ffffff";
        this.enemies = enemies;
        this.animationSpeed = 1.5 + Math.random() * 1.5; // frames per second
        this.bobPhase = Math.random() * Math.PI * 2;
        this.services = services;
        this.paint();
    }
    Enemy.prototype.startAttack = function (targetX, targetY) {
        var dx = targetX - (this.x + this.width / 2);
        var dy = targetY - (this.y + this.height / 2);
        var angle = Math.atan2(dy, dx);
        var speed = 180 + Math.random() * 60;
        this.vxAttack = Math.cos(angle) * speed;
        this.vyAttack = Math.sin(angle) * speed;
        this.attackAmplitude = this.width * (1 + Math.random());
        this.attackFrequency = 2 + Math.random() * 2;
        this.attackTime = 0;
        this.isAttacking = true;
    };
    Enemy.prototype.updateAttack = function (deltaSeconds, formationOffsetX, formationOffsetY, shields) {
        if (!this.isAttacking)
            return false;
        this.attackTime += deltaSeconds;
        var wobble = Math.sin(this.attackTime * this.attackFrequency) * this.attackAmplitude * deltaSeconds;
        var shieldTop = shields.getTop();
        var shieldBottom = shields.getBottom();
        var gapCenters = shields.getGapCenters();
        if (this.y + this.height >= shieldTop - this.height && this.y <= shieldBottom + this.height) {
            // Nudge horizontally toward the nearest gap to avoid crashing into shields.
            var centerX_1 = this.x + this.width / 2;
            if (gapCenters.length > 0) {
                var nearestGap = gapCenters.reduce(function (prev, curr) {
                    return Math.abs(curr - centerX_1) < Math.abs(prev - centerX_1) ? curr : prev;
                });
                var steer = Math.sign(nearestGap - centerX_1);
                var steerAccel = 140; // px/s^2 horizontal steering
                this.vxAttack += steer * steerAccel * deltaSeconds;
            }
        }
        var nextX = this.x + this.vxAttack * deltaSeconds + wobble;
        var nextY = this.y + this.vyAttack * deltaSeconds + wobble * 0.2;
        if (shields.collidesBody(nextX, nextY, this.width, this.height)) {
            this.resetPosition(formationOffsetX, formationOffsetY);
            return false;
        }
        this.x = nextX;
        this.y = nextY;
        this.animate(deltaSeconds);
        var outOfBounds = this.y > config_1.Config.canvas.height + this.height || this.x < -this.width || this.x > config_1.Config.canvas.width + this.width;
        if (outOfBounds) {
            // Clear the final attack position to avoid trails.
            config_1.Config.context.clearRect(this.x, this.y, this.width, this.height);
            this.isAttacking = false;
            // Rejoin the formation at its current offset.
            this.x = this.baseX + formationOffsetX;
            this.y = this.baseY + formationOffsetY;
            return false;
        }
        return true;
    };
    Enemy.prototype.isInAttack = function () {
        return this.isAttacking;
    };
    Enemy.prototype.stopAttack = function () { this.isAttacking = false; };
    Enemy.prototype.resetPosition = function (formationOffsetX, formationOffsetY) {
        this.isAttacking = false;
        this.x = this.baseX + formationOffsetX;
        this.y = this.baseY + formationOffsetY;
        this.attackTime = 0;
        this.framePhase = 0;
    };
    Enemy.prototype.getColor = function () {
        return this.color;
    };
    Enemy.prototype.animate = function (deltaSeconds) {
        var _a, _b;
        var frames = (_a = Enemy.frames[this.type]) !== null && _a !== void 0 ? _a : Enemy.frames[0];
        var frameCount = (_b = frames === null || frames === void 0 ? void 0 : frames.length) !== null && _b !== void 0 ? _b : 0;
        if (frameCount === 0)
            return;
        this.framePhase += this.animationSpeed * deltaSeconds;
        this.animationFrame = Math.floor(this.framePhase) % frameCount;
    };
    Enemy.prototype.paint = function () {
        var _a;
        var frames = (_a = Enemy.frames[this.type]) !== null && _a !== void 0 ? _a : Enemy.frames[0];
        if (!frames || frames.length === 0)
            return;
        var frameIndex = this.animationFrame % frames.length || 0;
        var frame = frames[frameIndex];
        if (!frame || frame.length === 0 || !frame[0])
            return;
        var pixelWidth = this.width / frame[0].length;
        var pixelHeight = this.height / frame.length;
        var ctx = config_1.Config.context;
        ctx.fillStyle = this.color;
        ctx.clearRect(this.x, this.y, this.width, this.height);
        for (var row = 0; row < frame.length; row++) {
            var line = frame[row];
            for (var col = 0; col < line.length; col++) {
                if (line[col] !== " ") {
                    ctx.fillRect(this.x + col * pixelWidth, this.y + row * pixelHeight, pixelWidth, pixelHeight);
                }
            }
        }
    };
    Enemy.prototype.Obstruction = function () {
        var elementNumber = this.enemies.items.length - 1;
        for (var i = 0; i <= elementNumber; i++) {
            if ((this.enemies.items[i].x == this.x) &&
                (this.enemies.items[i].index > this.index))
                return true;
        }
        return false;
    };
    ;
    //Enemy fire
    Enemy.prototype.fire = function () {
        var _this = this;
        if (!this.enemies.game.paused) {
            var width_1 = 3;
            var height_1 = 12;
            var startX = this.x + this.width / 2 - width_1 / 2;
            var startY = this.y + this.height + 5;
            var speed = 250; // px/s downward
            var game_1 = this.enemies.game;
            var nave_1 = game_1.nave;
            this.services.playShoot("enemy");
            this.services.addProjectile({
                x: startX,
                y: startY,
                vx: 0,
                vy: speed,
                width: width_1,
                height: height_1,
                color: this.color,
                owner: "enemy",
                onStep: function (p) {
                    var hitHorizontally = p.x + width_1 >= nave_1.x && p.x <= nave_1.x + config_1.Config.naveWidth;
                    var hitVertically = p.y + height_1 >= nave_1.y && p.y <= nave_1.y + config_1.Config.naveHeight;
                    if (hitHorizontally && hitVertically) {
                        nave_1.life--;
                        game_1.life = nave_1.life;
                        nave_1.flashHit();
                        if (nave_1.life <= 0) {
                            _this.services.playPlayerDestroyed();
                            _this.services.startGameOverTheme();
                            game_1.showMessage("You are dead");
                            game_1.reload();
                        }
                        return false;
                    }
                    return p.y <= config_1.Config.canvas.height;
                }
            });
        }
    };
    ;
    Enemy.frames = [
        // Classic invader shape: two-frame animation.
        [
            [
                "   ###   ",
                "  #####  ",
                " ####### ",
                "## ### ##",
                "#########",
                "#  # #  #",
                " #     # ",
                "##     ##",
            ],
            [
                "   ###   ",
                "  #####  ",
                " ####### ",
                "## ### ##",
                "#########",
                " #  #  # ",
                "##  #  ##",
                " #     # ",
            ],
        ],
        // Variant with wider stance.
        [
            [
                "  #####  ",
                " ####### ",
                "#########",
                "### ### #",
                "#########",
                "#  ###  #",
                "   # #   ",
                "  ## ##  ",
            ],
            [
                "  #####  ",
                " ####### ",
                "#########",
                "### ### #",
                "#########",
                " # ### # ",
                "  #   #  ",
                " ##   ## ",
            ],
        ],
        // Small invader.
        [
            [
                "  ###  ",
                " ##### ",
                "#######",
                "## # ##",
                "#######",
                "  # #  ",
                " #   # ",
                "##   ##",
            ],
            [
                "  ###  ",
                " ##### ",
                "#######",
                "## # ##",
                "#######",
                " # # # ",
                "  # #  ",
                " ## ## ",
            ],
        ],
    ];
    Enemy.colors = [
        "#8fffcf",
        "#ffd166",
        "#ff6b6b", // high
    ];
    return Enemy;
}());
exports.Enemy = Enemy;


/***/ }),

/***/ 769:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
var tools_1 = __webpack_require__(594);
var shields_1 = __webpack_require__(799);
var Game = /** @class */ (function () {
    function Game(services) {
        if (services === void 0) { services = tools_1.services; }
        this.services = services;
        this.shields = new shields_1.ShieldManager();
        this.level = 1;
        this.score = 0;
        this.life = 3;
    }
    Game.prototype.showMessage = function (messageContent) {
        var _this = this;
        this._paused = true;
        this.services.printMessage(messageContent);
        if (messageContent != "Pause") {
            setTimeout(function () {
                _this._paused = false;
                _this.redraw();
            }, 3000);
        }
    };
    Game.prototype.reload = function () {
        setTimeout(function () {
            window.location.reload();
        }, 3000);
    };
    Game.prototype.pause = function (pause) {
        if (pause) {
            this.services.playPauseSound();
            this.showMessage("Pause");
        }
        this._paused = pause;
        if (!pause) {
            this.redraw();
        }
    };
    Object.defineProperty(Game.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            this._paused = paused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "enemies", {
        get: function () {
            return this._enemies;
        },
        set: function (enemies) {
            this._enemies = enemies;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "nave", {
        get: function () {
            return this._nave;
        },
        set: function (nave) {
            this._nave = nave;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (level) {
            this._level = level;
            this.setLabel('level', String(level));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "life", {
        get: function () {
            return this._life;
        },
        set: function (life) {
            this._life = life;
            this.setLabel('life', String(life));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
            this.setLabel('score', String(score));
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.setLabel = function (_id, _textContent) {
        this.services.drawHud(this._level, this._score, this._life);
    };
    Game.prototype.update = function (deltaSeconds) {
        if (this._paused)
            return;
        if (this._enemies) {
            this._enemies.update(deltaSeconds);
        }
    };
    Object.defineProperty(Game.prototype, "mouseX", {
        get: function () {
            return this._mouseX;
        },
        set: function (value) {
            this._mouseX = value;
        },
        enumerable: false,
        configurable: true
    });
    Game.prototype.redraw = function () {
        this.services.clearAll();
        this.services.drawHud(this._level, this._score, this._life);
        this.shields.draw();
        if (this._enemies) {
            this._enemies.paint();
        }
        if (this._nave) {
            this._nave.paint();
        }
    };
    return Game;
}());
exports.Game = Game;
;


/***/ }),

/***/ 137:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameLoop = void 0;
var GameLoop = /** @class */ (function () {
    function GameLoop() {
        this.callback = null;
    }
    GameLoop.prototype.start = function (callback) {
        this.callback = callback;
        this.lastTime = undefined;
        this.tick(performance.now());
    };
    GameLoop.prototype.stop = function () {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = undefined;
        }
        this.callback = null;
        this.lastTime = undefined;
    };
    GameLoop.prototype.tick = function (time) {
        var _this = this;
        if (!this.callback)
            return;
        if (this.lastTime === undefined) {
            this.lastTime = time;
        }
        var dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.callback(dt);
        this.rafId = requestAnimationFrame(function (t) { return _this.tick(t); });
    };
    return GameLoop;
}());
exports.GameLoop = GameLoop;


/***/ }),

/***/ 639:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasCleaner = void 0;
var config_1 = __webpack_require__(913);
var CanvasCleaner = /** @class */ (function () {
    function CanvasCleaner(hudHeight) {
        this.hudHeight = hudHeight;
    }
    CanvasCleaner.prototype.clearAll = function () {
        config_1.Config.context.clearRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        config_1.Config.projectileContext.clearRect(0, 0, config_1.Config.projectileCanvas.width, config_1.Config.projectileCanvas.height);
    };
    CanvasCleaner.prototype.clearEnemiesArea = function () {
        config_1.Config.context.clearRect(0, this.hudHeight, config_1.Config.canvas.width, config_1.Config.canvas.height - this.hudHeight - (config_1.Config.naveHeight + 9));
    };
    return CanvasCleaner;
}());
exports.CanvasCleaner = CanvasCleaner;


/***/ }),

/***/ 814:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExplosionRenderer = void 0;
var config_1 = __webpack_require__(913);
var ExplosionRenderer = /** @class */ (function () {
    function ExplosionRenderer() {
        this.time = 0;
        this.duration = 0.5;
        this.origin = null;
        this.palette = ["#ffffff", "#ffb300", "#ff4000"];
    }
    ExplosionRenderer.prototype.trigger = function (x, y, radius, color) {
        var _this = this;
        if (radius === void 0) { radius = 30; }
        this.origin = { x: x, y: y };
        this.time = 0;
        this.palette = color ? this.makePalette(color) : this.palette;
        if (!this.frame) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts, radius); });
        }
    };
    ExplosionRenderer.prototype.clear = function () {
        this.frame = undefined;
        this.origin = null;
    };
    ExplosionRenderer.prototype.update = function (_timestamp, radius) {
        var _this = this;
        var ctx = config_1.Config.context;
        var step = 16; // approx 60fps
        var delta = step / 1000;
        this.time += delta;
        if (this.origin) {
            var progress = Math.min(this.time / this.duration, 1);
            var alpha_1 = 1 - progress;
            var r = radius * (0.5 + 0.8 * progress);
            var colors = this.palette.map(function (c) { return _this.applyAlpha(c, alpha_1); });
            var pixel = Math.max(2, radius * 0.08);
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            for (var i = 0; i < 30; i++) {
                var angle = Math.random() * Math.PI * 2;
                var dist = Math.random() * r;
                var px = this.origin.x + Math.cos(angle) * dist;
                var py = this.origin.y + Math.sin(angle) * dist;
                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(px, py, pixel, pixel);
            }
            ctx.restore();
        }
        if (this.time < this.duration) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts, radius); });
        }
        else {
            this.frame = undefined;
            this.origin = null;
        }
    };
    ExplosionRenderer.prototype.makePalette = function (color) {
        return [color, this.tint(color, 1.2), this.tint(color, 0.8)];
    };
    ExplosionRenderer.prototype.tint = function (hex, factor) {
        var m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m)
            return hex;
        var num = parseInt(m[1], 16);
        var r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 0xff) * factor)));
        var g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 0xff) * factor)));
        var b = Math.min(255, Math.max(0, Math.round((num & 0xff) * factor)));
        return "#".concat(((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1));
    };
    ExplosionRenderer.prototype.applyAlpha = function (hex, alpha) {
        var m = hex.match(/^#?([0-9a-fA-F]{6})$/);
        if (!m)
            return hex;
        var num = parseInt(m[1], 16);
        var r = (num >> 16) & 0xff;
        var g = (num >> 8) & 0xff;
        var b = num & 0xff;
        return "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(alpha, ")");
    };
    return ExplosionRenderer;
}());
exports.ExplosionRenderer = ExplosionRenderer;


/***/ }),

/***/ 688:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HudRenderer = void 0;
var config_1 = __webpack_require__(913);
var HudRenderer = /** @class */ (function () {
    function HudRenderer() {
        this.height = 28;
    }
    HudRenderer.prototype.draw = function (level, score, lives) {
        var ctx = config_1.Config.context;
        var h = this.height;
        ctx.clearRect(0, 0, config_1.Config.canvas.width, h);
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, config_1.Config.canvas.width, h);
        var fontSize = Math.max(10, Math.round(config_1.Config.canvas.width / 38));
        ctx.font = "".concat(fontSize, "px Courier New");
        ctx.fillStyle = "#9fe29f";
        ctx.textBaseline = "middle";
        ctx.fillText("LVL", 10, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(level), 40, h / 2);
        ctx.fillStyle = "#9fe29f";
        ctx.fillText("SCORE", 80, h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(score), 140, h / 2);
        ctx.fillStyle = "#9fe29f";
        ctx.fillText("LIVES", 200, h / 2);
        for (var i = 0; i < lives; i++) {
            ctx.fillStyle = "#ff4d4d";
            var size = 8;
            var x = 250 + i * (size + 6);
            ctx.fillRect(x, h / 2 - size / 2, size, size);
        }
        ctx.fillStyle = "#cfcfcf";
        var pauseText = "Press P to pause";
        var textWidth = ctx.measureText(pauseText).width;
        ctx.fillText(pauseText, config_1.Config.canvas.width - textWidth - 10, h / 2);
    };
    return HudRenderer;
}());
exports.HudRenderer = HudRenderer;


/***/ }),

/***/ 75:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProjectileManager = void 0;
var config_1 = __webpack_require__(913);
var ProjectileManager = /** @class */ (function () {
    function ProjectileManager() {
        this.projectiles = [];
    }
    ProjectileManager.prototype.add = function (projectile) {
        var _this = this;
        this.projectiles.push(projectile);
        if (!this.frame) {
            this.lastTimestamp = undefined;
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
        }
    };
    ProjectileManager.prototype.count = function (owner) {
        return this.projectiles.filter(function (p) { return p.owner === owner; }).length;
    };
    ProjectileManager.prototype.forEach = function (fn) {
        this.projectiles = this.projectiles.filter(function (p) {
            var keep = fn(p);
            return keep !== false;
        });
    };
    ProjectileManager.prototype.clear = function () {
        this.projectiles = [];
        if (this.frame) {
            cancelAnimationFrame(this.frame);
            this.frame = undefined;
        }
        config_1.Config.projectileContext.clearRect(0, 0, config_1.Config.projectileCanvas.width, config_1.Config.projectileCanvas.height);
    };
    ProjectileManager.prototype.update = function (timestamp) {
        var _this = this;
        if (this.lastTimestamp === undefined) {
            this.lastTimestamp = timestamp;
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
            return;
        }
        var deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        var ctx = config_1.Config.projectileContext;
        ctx.clearRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        var alive = [];
        for (var _i = 0, _a = this.projectiles; _i < _a.length; _i++) {
            var p = _a[_i];
            p.x += p.vx * deltaSeconds;
            p.y += p.vy * deltaSeconds;
            var keep = p.y + p.height >= 0 && p.y <= config_1.Config.canvas.height;
            if (keep && p.onStep) {
                keep = p.onStep(p) !== false;
            }
            if (keep) {
                alive.push(p);
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;
                var grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
                grad.addColorStop(0, p.color);
                grad.addColorStop(1, "white");
                ctx.fillStyle = grad;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                ctx.restore();
            }
        }
        this.projectiles = alive;
        if (this.projectiles.length > 0) {
            this.frame = requestAnimationFrame(function (ts) { return _this.update(ts); });
        }
        else {
            this.frame = undefined;
        }
    };
    return ProjectileManager;
}());
exports.ProjectileManager = ProjectileManager;


/***/ }),

/***/ 544:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundManager = void 0;
var SoundManager = /** @class */ (function () {
    function SoundManager() {
        this.currentTheme = null;
        this.unlocked = false;
        this.suspendedFallbackSet = false;
        this.pendingIntro = false;
    }
    SoundManager.prototype.ensureContext = function () {
        if (!this.unlocked)
            return;
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.35;
            this.master.connect(this.ctx.destination);
        }
    };
    SoundManager.prototype.resumeIfNeeded = function () {
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    };
    SoundManager.prototype.unlock = function () {
        var _this = this;
        this.unlocked = true;
        this.ensureContext();
        if (this.ctx) {
            this.ctx.resume().catch(function () {
                // Some browsers need a user gesture; rely on the fallback listeners.
                if (!_this.suspendedFallbackSet) {
                    _this.suspendedFallbackSet = true;
                    var resume_1 = function () {
                        var _a;
                        (_a = _this.ctx) === null || _a === void 0 ? void 0 : _a.resume();
                        window.removeEventListener("pointerdown", resume_1);
                        window.removeEventListener("touchstart", resume_1);
                        window.removeEventListener("keydown", resume_1);
                    };
                    window.addEventListener("pointerdown", resume_1, { once: true, passive: true });
                    window.addEventListener("touchstart", resume_1, { once: true, passive: true });
                    window.addEventListener("keydown", resume_1, { once: true });
                }
            });
        }
        if (this.pendingIntro) {
            this.pendingIntro = false;
            this.startIntroTheme();
        }
    };
    SoundManager.prototype.loadMusicBuffer = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var res, arr, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.ensureContext();
                        if (!this.ctx)
                            return [2 /*return*/];
                        if (this.audioBuffer)
                            return [2 /*return*/];
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        res = _b.sent();
                        return [4 /*yield*/, res.arrayBuffer()];
                    case 2:
                        arr = _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.ctx.decodeAudioData(arr)];
                    case 3:
                        _a.audioBuffer = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SoundManager.prototype.playMusicBuffer = function (loop) {
        if (loop === void 0) { loop = true; }
        if (!this.ctx || !this.master || !this.audioBuffer)
            return;
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource.disconnect();
        }
        var src = this.ctx.createBufferSource();
        src.buffer = this.audioBuffer;
        src.loop = loop;
        var gain = this.ctx.createGain();
        gain.gain.value = 0.35;
        src.connect(gain);
        gain.connect(this.master);
        src.start();
        this.musicSource = src;
    };
    SoundManager.prototype.playShoot = function (owner) {
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        var freq = owner === "player" ? 720 : 500;
        var duration = 0.05;
        this.boop(freq, duration, "square", owner === "player" ? 0.2 : 0.16, false, 0.0015);
        this.boop(freq * 0.55, duration * 0.8, "triangle", 0.09, false, 0.004);
    };
    SoundManager.prototype.playExplosion = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        this.boop(140, 0.28, "sawtooth", 0.4, true, 0.006);
    };
    SoundManager.prototype.playEnemyDestroyed = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        this.boop(520, 0.1, "triangle", 0.18, false, 0.002);
        this.boop(392, 0.12, "square", 0.14, false, 0.002);
    };
    SoundManager.prototype.playPlayerDestroyed = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        this.boop(160, 0.4, "sawtooth", 0.45, true, 0.01);
        this.boop(90, 0.45, "triangle", 0.25, false, 0);
    };
    SoundManager.prototype.playPause = function () {
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        this.boop(440, 0.08, "sine", 0.15, false, 0);
    };
    SoundManager.prototype.startIntroTheme = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1, bpm, beatMs, soprano, alto, bass, progression, sopIdx, altoIdx, bassIdx, chordIdx, blockIdx, playVoice;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureContext();
                        this.resumeIfNeeded();
                        if (!this.ctx) {
                            this.pendingIntro = true;
                            return [2 /*return*/];
                        }
                        if (this.currentTheme === "intro")
                            return [2 /*return*/];
                        this.stopMusic();
                        this.currentTheme = "intro";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.loadMusicBuffer("/assets/music.mp3")];
                    case 2:
                        _a.sent();
                        this.playMusicBuffer(true);
                        return [2 /*return*/];
                    case 3:
                        e_1 = _a.sent();
                        console.warn("Falling back to synth theme:", e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        bpm = 92;
                        beatMs = 60000 / bpm;
                        soprano = [
                            { f: 392.0, beats: 1 }, { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 },
                            { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
                            { f: 494.0, beats: 2 },
                            { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 },
                            { f: 740.0, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
                            { f: 494.0, beats: 2 },
                            { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 },
                            { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 },
                            { f: 523.3, beats: 2 },
                            { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 },
                            { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 }, { f: 494.0, beats: 1 }, { f: 440.0, beats: 1 },
                            { f: 392.0, beats: 2 },
                        ];
                        alto = [
                            { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
                            { f: 392.0, beats: 2 }, { f: 440.0, beats: 2 }, { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 },
                            { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 261.6, beats: 2 }, { f: 246.9, beats: 2 },
                            { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
                            { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 }, { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 },
                        ];
                        bass = [
                            { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 164.8, beats: 2 }, { f: 174.6, beats: 2 },
                            { f: 196.0, beats: 2 }, { f: 174.6, beats: 2 }, { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 },
                            { f: 130.8, beats: 2 }, { f: 123.5, beats: 2 }, { f: 110.0, beats: 2 }, { f: 98.0, beats: 2 },
                            { f: 110.0, beats: 2 }, { f: 123.5, beats: 2 }, { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 },
                            { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 130.8, beats: 2 }, { f: 110.0, beats: 2 },
                        ];
                        progression = [
                            [
                                [392.0, 494.0, 587.3],
                                [293.7, 369.9, 440.0],
                                [329.6, 392.0, 493.9],
                                [261.6, 329.6, 392.0], // C
                            ],
                            [
                                [293.7, 349.2, 440.0],
                                [329.6, 415.3, 493.9],
                                [220.0, 261.6, 329.6],
                                [293.7, 369.9, 440.0], // D
                            ],
                            [
                                [261.6, 329.6, 415.3],
                                [246.9, 311.1, 392.0],
                                [293.7, 349.2, 440.0],
                                [329.6, 392.0, 493.9], // Em
                            ],
                        ];
                        sopIdx = 0;
                        altoIdx = 0;
                        bassIdx = 0;
                        chordIdx = 0;
                        blockIdx = 0;
                        playVoice = function (note, vol, type, detune) {
                            if (detune === void 0) { detune = 0; }
                            if (!_this.ctx || !_this.master)
                                return;
                            var osc = _this.ctx.createOscillator();
                            osc.type = type;
                            osc.frequency.value = note.f;
                            osc.detune.value = detune;
                            var gain = _this.ctx.createGain();
                            var now = _this.ctx.currentTime;
                            var durSec = (note.beats * beatMs) / 1000;
                            gain.gain.setValueAtTime(vol, now);
                            gain.gain.linearRampToValueAtTime(vol * 0.65, now + durSec * 0.6);
                            gain.gain.linearRampToValueAtTime(0.0001, now + durSec);
                            osc.connect(gain);
                            gain.connect(_this.master);
                            osc.start();
                            osc.stop(now + durSec + 0.05);
                        };
                        this.musicTimer = window.setInterval(function () {
                            playVoice(soprano[sopIdx % soprano.length], 0.18, "triangle");
                            playVoice(soprano[sopIdx % soprano.length], 0.06, "sawtooth", 6); // light shimmer
                            if (sopIdx % 2 === 0) {
                                playVoice(alto[altoIdx % alto.length], 0.12, "sine");
                                playVoice(bass[bassIdx % bass.length], 0.1, "sawtooth");
                                altoIdx++;
                                bassIdx++;
                            }
                            if (sopIdx % 4 === 0) {
                                var block = progression[blockIdx % progression.length];
                                var chord = block[chordIdx % block.length];
                                chord.forEach(function (f, i) {
                                    return playVoice({ f: f, beats: 2 }, 0.07 - i * 0.01, "triangle", i === 0 ? -4 : i === 2 ? 4 : 0);
                                });
                                chordIdx++;
                                if (chordIdx % block.length === 0) {
                                    blockIdx++;
                                }
                            }
                            sopIdx++;
                        }, beatMs);
                        return [2 /*return*/];
                }
            });
        });
    };
    SoundManager.prototype.startGameOverTheme = function () {
        var _this = this;
        this.ensureContext();
        this.resumeIfNeeded();
        if (!this.ctx)
            return;
        if (this.currentTheme === "gameover")
            return;
        this.stopMusic();
        this.currentTheme = "gameover";
        var bpm = 72;
        var beatMs = 60000 / bpm;
        var motif = [
            { f: 262, beats: 1 }, { f: 247, beats: 1 }, { f: 233, beats: 1 }, { f: 220, beats: 2 },
            { f: 196, beats: 1 }, { f: 174, beats: 1 }, { f: 165, beats: 1 }, { f: 147, beats: 2 },
        ];
        var idx = 0;
        var playNote = function (note, vol, type) {
            if (!_this.ctx || !_this.master)
                return;
            var osc = _this.ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = note.f;
            var gain = _this.ctx.createGain();
            gain.gain.value = vol;
            var now = _this.ctx.currentTime;
            gain.gain.setValueAtTime(vol, now);
            gain.gain.linearRampToValueAtTime(0.0001, now + (note.beats * beatMs) / 1000);
            osc.connect(gain);
            gain.connect(_this.master);
            osc.start();
            osc.stop(now + (note.beats * beatMs) / 1000);
        };
        this.musicTimer = window.setInterval(function () {
            playNote(motif[idx % motif.length], 0.12, "sine");
            idx++;
        }, beatMs);
    };
    SoundManager.prototype.stopMusic = function () {
        if (this.musicTimer !== undefined) {
            clearInterval(this.musicTimer);
            this.musicTimer = undefined;
        }
        this.currentTheme = null;
        // Passive one-shots auto-stop; nothing persistent to clear beyond timer.
    };
    SoundManager.prototype.boop = function (freq, duration, type, volume, noise, glide) {
        if (noise === void 0) { noise = false; }
        if (glide === void 0) { glide = 0; }
        if (!this.ctx || !this.master)
            return;
        var osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        if (glide > 0) {
            osc.frequency.linearRampToValueAtTime(freq * 0.92, this.ctx.currentTime + glide);
        }
        var gain = this.ctx.createGain();
        gain.gain.value = volume;
        var decay = 0.12;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration + decay);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        osc.stop(this.ctx.currentTime + duration + decay);
    };
    return SoundManager;
}());
exports.SoundManager = SoundManager;


/***/ }),

/***/ 861:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Nave = void 0;
var colision_1 = __webpack_require__(124);
var config_1 = __webpack_require__(913);
var tools_1 = __webpack_require__(594);
var Nave = /** @class */ (function () {
    function Nave(game, services) {
        if (services === void 0) { services = tools_1.services; }
        var _this = this;
        this.flashesRemaining = 0;
        this.services = services;
        this.shots = config_1.Config.naveShots;
        this.x = 0;
        this.prevX = this.x;
        this.lastDrawX = this.x;
        this.lastDrawY = config_1.Config.canvas.height - config_1.Config.naveHeight;
        this.life = config_1.Config.naveLife;
        this.y = this.lastDrawY;
        this.game = game;
        this.paint();
        window.onkeydown = function (event) { _this.move(event); };
        window.onmousedown = function () { _this.startAutoFire(); };
        window.onmouseup = function () { _this.stopAutoFire(); };
        window.onmouseleave = function () { _this.stopAutoFire(); };
        window.onmouseout = function () { _this.stopAutoFire(); };
        window.onmousemove = function (event) { _this.move(event); };
        window.addEventListener("touchstart", function (event) {
            var _a;
            event.preventDefault();
            var x = (_a = event.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX;
            if (x !== undefined) {
                _this.handleTouchMovement(x);
            }
            _this.startAutoFire();
        }, { passive: false });
        window.addEventListener("touchmove", function (event) {
            var _a;
            event.preventDefault();
            var x = (_a = event.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX;
            if (x !== undefined) {
                _this.handleTouchMovement(x);
            }
        }, { passive: false });
        window.addEventListener("touchend", function () { _this.stopAutoFire(); }, { passive: true });
        window.addEventListener("touchcancel", function () { _this.stopAutoFire(); }, { passive: true });
    }
    Nave.prototype.startAutoFire = function () {
        var _this = this;
        this.fire();
        if (this.fireIntervalId !== undefined)
            return;
        this.fireIntervalId = window.setInterval(function () { return _this.fire(); }, 180);
    };
    Nave.prototype.stopAutoFire = function () {
        if (this.fireIntervalId !== undefined) {
            clearInterval(this.fireIntervalId);
            this.fireIntervalId = undefined;
        }
    };
    Nave.prototype.fire = function () {
        if (!this.game.paused) {
            this.shots = this.services.countProjectiles('player');
            if (this.shots < config_1.Config.naveMaxshots) {
                this.shots++;
                var width = 3;
                var height = 12;
                var startX = this.x + (config_1.Config.naveWidth - width) / 2;
                var startY = this.y - height;
                this.services.playShoot("player");
                this.directionFire(startX, startY, width, height);
            }
        }
    };
    Nave.prototype.directionFire = function (x, y, width, height) {
        var _this = this;
        var speed = -500; // px/s upward
        this.services.addProjectile({
            x: x,
            y: y,
            vx: 0,
            vy: speed,
            width: width,
            height: height,
            color: "#7fff00",
            owner: "player",
            onStep: function (p) {
                var enemyIndex = colision_1.Colision.checkColision(p.x, p.y, width, height, _this.game.enemies.items);
                if (enemyIndex !== -1) {
                    var enemy = _this.game.enemies.items[enemyIndex];
                    if (enemy) {
                        _this.services.explode(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, undefined, enemy.getColor());
                    }
                    _this.game.enemies.remove(enemyIndex);
                    _this.game.enemies.paint();
                    _this.shots = Math.max(0, _this.shots - 1);
                    return false;
                }
                if (p.y + height < 0) {
                    _this.shots = Math.max(0, _this.shots - 1);
                    return false;
                }
                return true;
            }
        });
    };
    Nave.prototype.paint = function () {
        var ctx = config_1.Config.context;
        var bandMargin = 8;
        // Wipe a horizontal band where the nave moves to guarantee no trails.
        ctx.clearRect(0, this.y - bandMargin, config_1.Config.canvas.width, config_1.Config.naveHeight + bandMargin * 2 + 4);
        // Also clear the same band on the projectile layer in case a stale pixel landed there.
        config_1.Config.projectileContext.clearRect(0, this.y - bandMargin, config_1.Config.canvas.width, config_1.Config.naveHeight + bandMargin * 2 + 4);
        this.lastDrawX = this.x;
        this.lastDrawY = this.y;
        this.services.paintNave(this.x, this.y);
    };
    Nave.prototype.moveLeft = function (step) {
        this.prevX = this.x;
        this.x -= config_1.Config.naveWidth / step;
        if (this.x <= 0)
            this.x = 0;
        this.paint();
    };
    Nave.prototype.moveRight = function (step) {
        this.prevX = this.x;
        this.x += config_1.Config.naveWidth / step;
        if (this.x + config_1.Config.naveWidth >= config_1.Config.canvas.width)
            this.x = config_1.Config.canvas.width - config_1.Config.naveWidth;
        this.paint();
    };
    Nave.prototype.move = function (event) {
        if (this.isPauseEvent(event)) {
            this.game.pause(!this.game.paused);
        }
        else if (!this.game.paused) {
            if (event instanceof MouseEvent) {
                this.handleMouseMovement(event);
            }
            else if (event instanceof KeyboardEvent) {
                this.handleKeyboardMovement(event);
            }
        }
    };
    Nave.prototype.flashHit = function () {
        var _this = this;
        this.flashesRemaining = 6;
        var blink = function () {
            if (_this.flashesRemaining <= 0) {
                _this.flashTimeout = undefined;
                _this.paint();
                return;
            }
            var hitFrame = _this.flashesRemaining % 2 === 0;
            _this.services.paintNave(_this.x, _this.y, hitFrame ? "#ff4d4d" : "#7fff00");
            _this.flashesRemaining--;
            _this.flashTimeout = window.setTimeout(blink, 80);
        };
        if (this.flashTimeout) {
            clearTimeout(this.flashTimeout);
        }
        blink();
    };
    Nave.prototype.isPauseEvent = function (event) {
        return event instanceof KeyboardEvent && event.code == 'KeyP';
    };
    Nave.prototype.handleMouseMovement = function (event) {
        var mouseXaux = event.clientX;
        this.prevX = this.x;
        if (this.game.mouseX > mouseXaux) {
            this.moveLeft(5);
        }
        else if (this.game.mouseX < mouseXaux) {
            this.moveRight(5);
        }
        this.game.mouseX = mouseXaux;
    };
    Nave.prototype.handleTouchMovement = function (clientX) {
        var rect = config_1.Config.canvas.getBoundingClientRect();
        var relativeX = ((clientX - rect.left) / rect.width) * config_1.Config.canvas.width - config_1.Config.naveWidth / 2;
        this.prevX = this.x;
        this.x = Math.max(0, Math.min(config_1.Config.canvas.width - config_1.Config.naveWidth, relativeX));
        this.game.mouseX = clientX;
        this.paint();
    };
    Nave.prototype.handleKeyboardMovement = function (event) {
        if (event.code === 'ArrowLeft') {
            this.moveLeft(2);
        }
        else if (event.code === 'ArrowRight') {
            this.moveRight(2);
        }
        else if (event.code === 'ControlLeft' || event.code === 'Space') {
            this.fire();
        }
    };
    Object.defineProperty(Nave.prototype, "velocityX", {
        get: function () {
            return this.x - this.prevX;
        },
        enumerable: false,
        configurable: true
    });
    return Nave;
}());
exports.Nave = Nave;
;


/***/ }),

/***/ 799:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShieldManager = void 0;
var config_1 = __webpack_require__(913);
var Shield = /** @class */ (function () {
    function Shield(x, y) {
        this.x = x;
        this.y = y;
        this.cells = [];
        var pattern = [
            "   #########   ",
            "  ###########  ",
            " ############# ",
            " ############# ",
            " ###       ### ",
            " ###       ### ",
            " ###       ### ",
            " ###       ### ",
        ];
        var cols = pattern[0].length;
        var rows = pattern.length;
        this.patternWidth = cols;
        this.patternHeight = rows;
        // Keep shields compact: total width ~ 3x nave width.
        // Make shield pixels comparable to enemy/nave pixels.
        var pixel = Math.max(3, Math.round(config_1.Config.enemyWidth / 6));
        this.cellWidth = pixel;
        this.cellHeight = pixel;
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (pattern[row][col] !== " ") {
                    this.cells.push({
                        x: this.x + col * this.cellWidth,
                        y: this.y + row * this.cellHeight,
                        alive: true,
                    });
                }
            }
        }
    }
    Shield.prototype.draw = function (ctx) {
        ctx.fillStyle = "#7fff00";
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell.alive) {
                ctx.fillRect(cell.x, cell.y, this.cellWidth, this.cellHeight);
            }
        }
    };
    Shield.prototype.intersects = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (!cell.alive)
                continue;
            var intersects = px < cell.x + this.cellWidth &&
                px + pw > cell.x &&
                py < cell.y + this.cellHeight &&
                py + ph > cell.y;
            if (intersects) {
                return cell.x + this.cellWidth / 2;
            }
        }
        return null;
    };
    Shield.prototype.hit = function (px, py, pw, ph) {
        var aliveCells = this.cells.filter(function (c) { return c.alive; });
        for (var _i = 0, aliveCells_1 = aliveCells; _i < aliveCells_1.length; _i++) {
            var cell = aliveCells_1[_i];
            if (!cell.alive)
                continue;
            var intersects = px < cell.x + this.cellWidth &&
                px + pw > cell.x &&
                py < cell.y + this.cellHeight &&
                py + ph > cell.y;
            if (intersects) {
                this.destroyCluster(cell, aliveCells);
                return true;
            }
        }
        return false;
    };
    Shield.prototype.destroyCluster = function (center, aliveCells) {
        var _this = this;
        // Remove the hit cell plus the 3 closest neighbors to mimic chunk damage.
        var impactX = center.x + this.cellWidth / 2;
        var impactY = center.y + this.cellHeight / 2;
        var victims = aliveCells
            .filter(function (c) { return c.alive; })
            .sort(function (a, b) {
            var da = Math.hypot(impactX - (a.x + _this.cellWidth / 2), impactY - (a.y + _this.cellHeight / 2));
            var db = Math.hypot(impactX - (b.x + _this.cellWidth / 2), impactY - (b.y + _this.cellHeight / 2));
            return da - db;
        })
            .slice(0, 4);
        for (var _i = 0, victims_1 = victims; _i < victims_1.length; _i++) {
            var victim = victims_1[_i];
            victim.alive = false;
            config_1.Config.context.clearRect(victim.x, victim.y, this.cellWidth, this.cellHeight);
        }
    };
    Object.defineProperty(Shield.prototype, "cellSize", {
        get: function () {
            return { width: this.cellWidth, height: this.cellHeight };
        },
        enumerable: false,
        configurable: true
    });
    return Shield;
}());
var ShieldManager = /** @class */ (function () {
    function ShieldManager() {
        this.shields = [];
        var count = 4;
        var spacing = config_1.Config.canvas.width / (count + 1);
        var y = config_1.Config.canvas.height - config_1.Config.naveHeight * 8;
        // Use a temporary shield to compute shared height for bounds metadata.
        var tempShield = new Shield(0, y);
        this.shieldTop = y;
        this.shieldBottom = y + tempShield.patternHeight * tempShield.cellSize.height;
        this.shields = Array.from({ length: count }, function (_v, i) {
            var x = spacing * (i + 1) - config_1.Config.naveWidth * 1.5;
            return new Shield(x, y);
        });
    }
    ShieldManager.prototype.draw = function () {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            shield.draw(config_1.Config.context);
        }
    };
    ShieldManager.prototype.hit = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            if (shield.hit(px, py, pw, ph)) {
                return true;
            }
        }
        return false;
    };
    ShieldManager.prototype.collidesBody = function (px, py, pw, ph) {
        for (var _i = 0, _a = this.shields; _i < _a.length; _i++) {
            var shield = _a[_i];
            var hit = shield.intersects(px, py, pw, ph);
            if (hit !== null)
                return true;
        }
        return false;
    };
    ShieldManager.prototype.getGaps = function () {
        return this.shields.map(function (s) { return s.x + (config_1.Config.enemyWidth * 2); }).sort(function (a, b) { return a - b; });
    };
    ShieldManager.prototype.getTop = function () {
        return this.shieldTop;
    };
    ShieldManager.prototype.getBottom = function () {
        return this.shieldBottom;
    };
    ShieldManager.prototype.getGapCenters = function () {
        return this.shields.map(function (s) { return s.x + (s.patternWidth * s.cellSize.width) / 2; });
    };
    return ShieldManager;
}());
exports.ShieldManager = ShieldManager;


/***/ }),

/***/ 594:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.services = exports.Tool = void 0;
var config_1 = __webpack_require__(913);
var canvasCleaner_1 = __webpack_require__(639);
var explosionRenderer_1 = __webpack_require__(814);
var hudRenderer_1 = __webpack_require__(688);
var projectileManager_1 = __webpack_require__(75);
var soundManager_1 = __webpack_require__(544);
var Tool = /** @class */ (function () {
    function Tool() {
        this.hudHeight = 28;
        this.projectiles = new projectileManager_1.ProjectileManager();
        this.explosions = new explosionRenderer_1.ExplosionRenderer();
        this.hud = new hudRenderer_1.HudRenderer();
        this.cleaner = new canvasCleaner_1.CanvasCleaner(this.hudHeight);
        this.sound = new soundManager_1.SoundManager();
    }
    Tool.prototype.randomRange = function (min, max) {
        return Math.round((Math.random() * (max - min) + min) / 5) * 5;
    };
    Tool.prototype.paintNave = function (x, y, color) {
        if (color === void 0) { color = "#7fff00"; }
        var ctx = config_1.Config.context;
        var pattern = [
            "     ##     ",
            "    ####    ",
            "    ####    ",
            " ########## ",
            "############",
            "############",
            "############",
            "############",
        ];
        var cols = pattern[0].length;
        var rows = pattern.length;
        // Keep sprite fully inside nave bounding box to avoid overdraw artifacts.
        var pixel = Math.max(2, Math.floor(Math.min(config_1.Config.naveWidth / cols, config_1.Config.naveHeight / rows)));
        var drawWidth = pixel * cols;
        var drawHeight = pixel * rows;
        var offsetX = Math.floor(x + (config_1.Config.naveWidth - drawWidth) / 2);
        var offsetY = Math.floor(y + (config_1.Config.naveHeight - drawHeight) / 2);
        // Clear the bounding box of the nave to avoid trails.
        ctx.clearRect(x - 2, y - 2, config_1.Config.naveWidth + 4, config_1.Config.naveHeight + 4);
        ctx.fillStyle = color;
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (pattern[row][col] !== " ") {
                    ctx.fillRect(offsetX + col * pixel, offsetY + row * pixel, pixel, pixel);
                }
            }
        }
    };
    Tool.prototype.printMessage = function (messageContent) {
        var ctx = config_1.Config.context;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, config_1.Config.canvas.width, config_1.Config.canvas.height);
        var x = config_1.Config.canvas.width / 2;
        var y = config_1.Config.canvas.height / 2;
        ctx.font = "30px Courier New";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(messageContent, x, y);
        ctx.restore();
    };
    Tool.prototype.addProjectile = function (projectile) {
        this.projectiles.add(projectile);
    };
    Tool.prototype.forEachProjectile = function (fn) {
        this.projectiles.forEach(fn);
    };
    Tool.prototype.countProjectiles = function (owner) {
        return this.projectiles.count(owner);
    };
    Tool.prototype.removeEnemies = function () {
        this.cleaner.clearEnemiesArea();
    };
    Tool.prototype.drawHud = function (level, score, lives) {
        this.hud.draw(level, score, lives);
    };
    Tool.prototype.clearAll = function () {
        this.cleaner.clearAll();
        this.projectiles.clear();
        this.explosions.clear();
    };
    Tool.prototype.explode = function (x, y, radius, color) {
        if (radius === void 0) { radius = 30; }
        this.explosions.trigger(x, y, radius, color);
        this.sound.playExplosion();
    };
    Tool.prototype.playShoot = function (owner) {
        this.sound.playShoot(owner);
    };
    Tool.prototype.playExplosion = function () {
        this.sound.playExplosion();
    };
    Tool.prototype.playEnemyDestroyed = function () {
        this.sound.playEnemyDestroyed();
    };
    Tool.prototype.playPlayerDestroyed = function () {
        this.sound.playPlayerDestroyed();
    };
    Tool.prototype.playPauseSound = function () {
        this.sound.playPause();
    };
    Tool.prototype.startIntroTheme = function () {
        this.sound.startIntroTheme();
    };
    Tool.prototype.startGameOverTheme = function () {
        this.sound.startGameOverTheme();
    };
    Tool.prototype.stopMusic = function () {
        this.sound.stopMusic();
    };
    Tool.prototype.unlockAudio = function () {
        this.sound.unlock();
    };
    return Tool;
}());
exports.Tool = Tool;
exports.services = new Tool();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var config_1 = __webpack_require__(913);
var enemies_1 = __webpack_require__(749);
var game_1 = __webpack_require__(769);
var nave_1 = __webpack_require__(861);
var tools_1 = __webpack_require__(594);
var gameLoop_1 = __webpack_require__(137);
var collision_1 = __webpack_require__(874);
function sizeCanvases() {
    var playfield = document.getElementById("playfield");
    var projectiles = document.getElementById("projectiles");
    if (!playfield || !projectiles)
        return;
    var maxWidth = Math.min(480, Math.max(320, window.innerWidth - 20));
    var aspect = 500 / 480; // original canvas aspect after recent change
    var maxHeight = Math.min(640, window.innerHeight - 40);
    var height = Math.min(maxHeight, Math.max(400, Math.round(maxWidth * aspect)));
    playfield.width = maxWidth;
    playfield.height = height;
    projectiles.width = maxWidth;
    projectiles.height = height;
    var gameContainer = document.getElementById("game");
    if (gameContainer) {
        gameContainer.style.width = "".concat(maxWidth, "px");
        gameContainer.style.height = "".concat(height, "px");
    }
}
function attachAudioUnlock() {
    var unlock = function () {
        tools_1.services.unlockAudio();
        tools_1.services.startIntroTheme();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
}
window.onload = function () {
    sizeCanvases();
    config_1.Config.init();
    // Attempt to start audio immediately; fallback unlock remains for browsers that still require gesture.
    tools_1.services.unlockAudio();
    tools_1.services.startIntroTheme();
    attachAudioUnlock();
    var game = new game_1.Game(tools_1.services);
    game.enemies = new enemies_1.Enemies(game, tools_1.services);
    game.nave = new nave_1.Nave(game, tools_1.services);
    var collisions = new collision_1.CollisionSystem(game, tools_1.services);
    var loop = new gameLoop_1.GameLoop();
    loop.start(function (dt) {
        game.update(dt);
        collisions.tick();
    });
};

})();

/******/ })()
;