var Game = function Game(ctx, width, height, doneCallback) {
  this.ctx = ctx;
  this.DEBUG = true;
  this.FONT_SIZE = 10;
  this.FONT_COLOR = '#888';
  this.FONT_PADDING = 4;
  this.WIDTH = width;
  this.HEIGHT = height;
  this.INITIAL_TIME_SCALE = 1.3;

  this.timeScale = this.INITIAL_TIME_SCALE;
  this.currentLevel = 0;

  var initialBounds = [ 0, this.WIDTH, 0, this.HEIGHT ]; // [ x1, x2, y1, y2]

  var that = this;
  this.keyHandler = new KeyHandler({ }, function(action, isPress) {
    that.handleAction(action, isPress);
  });

  // HACK so that it works on Github Pages without Node.js
  if (window.location.href.indexOf('gschier.github.com') !== -1) {
    this.levelRoot = './public/levels/';
  } else {
    this.levelRoot = 'levels/';
  }

  $.getJSON(this.levelRoot+'levelProgression.json', function(levelProgression) {
    that.levels = levelProgression.levels;

    that.loadLevel(0, function() {
      doneCallback();
    });
  });
};

Game.prototype.beatTheGame = function() {
  alert('You beat the game!');
  window.location.reload();
};

Game.prototype.loadLevel = function(increment, callback) {
  this.currentLevel += increment;

  var level = this.levels[this.currentLevel];

  if (!level) {
    return this.beatTheGame();
  }

  this.resetTimeScale();

  console.log('Loading level "'+level+'"...');

  var that = this;
  $.getJSON(this.levelRoot+level+'.json', function(levelData) {
    var cameraBounds = [
      that.WIDTH*levelData.camera_bounds[0],
      that.HEIGHT-(that.HEIGHT*levelData.camera_bounds[1]),
      that.WIDTH*levelData.camera_bounds[2],
      that.HEIGHT-(that.HEIGHT*levelData.camera_bounds[3])
    ];

    var playerStart = [
      that.WIDTH*levelData.player_start[0],
      that.HEIGHT-(that.HEIGHT*levelData.player_start[1])
    ];

    that.world  = new World(that.ctx, that.WIDTH, that.HEIGHT, levelData);
    that.camera = new Camera(cameraBounds, that.WIDTH, that.HEIGHT);
    that.scene  = new Scene(that.ctx, cameraBounds, levelData.scene);

    that.player = new Player(that.ctx, that.WIDTH, that.HEIGHT, playerStart, function(action, data) {
      that.handleAction(action, data);
    });

    // For frame rate calculation
    that.frameRate = 60;
    that.frames = 0;
    that.framesTime = Date.now();

    that.start = Date.now();
    console.log('Level started');

    if (typeof callback === 'function') { callback(); }
  });
};

Game.prototype.printStats = function(stats) {
  if (this.DEBUG) {
    this.ctx.fillStyle = this.FONT_COLOR;
    this.ctx.font = this.FONT_SIZE+'px Monospace';
    for (var i=0; i<stats.length; i++) {
      this.ctx.fillText(
        stats[i],
        this.FONT_PADDING,
        (this.FONT_SIZE+this.FONT_PADDING)*(i+1)
      );
    }
  }
};

Game.prototype.formatMemory = function(v) {
  return Math.round(v/1024/1024*100)/100+' MB';
};

Game.prototype.update = function(delta, memoryStats) {
  this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  delta *= this.timeScale;

  // Check if player hit something
  this.checkPlayerCollisions(this.player.move(delta), delta);
  this.scene.update(delta);

  this.camera.move(this.player.getPosition());

  // Draw everything
  this.scene.draw(this.camera.getPositionOffset());
  this.world.draw(this.camera.getPositionOffset());
  this.player.draw(this.camera.getPlayerDrawPosition(this.player.getPosition()));

  this.checkFrameRate();
  var position = this.player.getPosition();

  this.printStats([
    'FRAMERATE:  '+this.frameRate,
    'USED_MEM:   '+this.formatMemory(memoryStats.usedHeap),
    'TOTAL_MEM:  '+this.formatMemory(memoryStats.totalHeap),
    'LAST_GC:    '+this.formatMemory(memoryStats.lastGC),
    'TIME:       '+(Math.round((Date.now()-this.start)/100)/10).toFixed(1)+'s',
    'TIME_SCALE: '+this.timeScale.toFixed(1),
    // 'HEIGHT:     '+this.player.getFallHeight().toFixed(1),
    // 'POS_X:      '+position[0].toFixed(1),
    // 'POS_Y:      '+position[1].toFixed(1),
    'JUMPS:      '+this.player.getAirJumps(),
    'LEVEL:      '+this.currentLevel
  ]);

  this.lastTick = Date.now();
};

Game.prototype.checkPlayerCollisions = function(movement, delta) {
  var playerSize = this.player.getSize();
  movement = this.world.checkCollision(this.player.getPreviousMovement(), movement, playerSize);

  this.player.update(movement, delta);
};

Game.prototype.checkFrameRate = function() {
  if (this.frames++ > 10) {
    var now = Date.now();
    this.frameRate = Math.floor(this.frames/(now-this.framesTime)*1000);
    this.framesTime = Date.now();
    this.frames = 0;
  }
};

Game.prototype.resetTimeScale = function() {
  clearTimeout(this.timeScaleTimeout);
  this.timeScale = this.INITIAL_TIME_SCALE;
};

Game.prototype.alterTime = function(data) {
  this.resetTimeScale();
  this.timeScale *= data.scale || 0.4;

  var that = this;
  this.timeScaleTimeout = setTimeout( function() {
    that.resetTimeScale();
  }, data.length || 3000);
};

Game.prototype.handleAction = function(action, data) {
  if (action === 'jump') { this.player.jump(data); return; }
  if (action === 'left') { this.player.left(data); return; }
  if (action === 'right') { this.player.right(data); return; }

  if (action === 'barrier') { return; }

  console.log('Action: ', action, data);
  if (action === 'die') { this.loadLevel(0); return; }
  if (action === 'win') { this.loadLevel(1); return; }

  if (action instanceof Array && action.length) {
    if (action[0] === 'slow') {
      this.alterTime(action[1]);
      this.world.removeObstacle(data);
      return;
    }
  }
};
