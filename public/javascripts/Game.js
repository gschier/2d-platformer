var Game = function Game(ctx, width, height, doneCallback) {
  this.ctx = ctx;
  this.DEBUG = true;
  this.FONT_SIZE = 10;
  this.FONT_COLOR = '#888';
  this.FONT_PADDING = 4;
  this.WIDTH = width;
  this.HEIGHT = height;

  this.timeScale = 1.0;

  var initialBounds = [ 0, this.WIDTH, 0, this.HEIGHT ]; // [ x1, x2, y1, y2]

  var that = this;
  this.keyHandler = new KeyHandler({ }, function(action, isPress) {
    that.handleAction(action, isPress);
  });


  var levelRoot;
  var level = 'playground';

  // HACK so that it works on Github Pages without Node.js
  if (window.location.href.indexOf('gschier.github.com') !== -1) {
    levelRoot = './public/levels/';
  } else {
    levelRoot = 'levels/';
  }

  console.log('Loading level "'+level+'"...');

  $.getJSON(levelRoot+level+'.json', function(levelData) {
    console.log('Initializing world...');

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

    that.world  = new World(ctx, that.WIDTH, that.HEIGHT, levelData);
    that.camera = new Camera(cameraBounds, that.WIDTH, that.HEIGHT);
    that.player = new Player(ctx, that.WIDTH, that.HEIGHT, playerStart);
    that.scene  = new Scene(ctx, cameraBounds, levelData.scene);

    // For frame rate calculation
    that.frameRate = 60;
    that.frames = 0;
    that.framesTime = Date.now();

    that.start = Date.now();
    console.log('Starting game!');
    doneCallback();
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

Game.prototype.update = function(delta) {
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
    'TIME:       '+(Math.round((Date.now()-this.start)/100)/10).toFixed(1)+'s',
    'TIME_SCALE: '+this.timeScale.toFixed(1),
    'HEIGHT:     '+this.player.getFallHeight().toFixed(1),
    'POS_X:      '+position[0].toFixed(1),
    'POS_Y:      '+position[1].toFixed(1),
    'JUMPS:      '+this.player.getAirJumps()
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

Game.prototype.handleAction = function(action, isPress) {
  // console.log((isPress ? '! ' : '# ')+action);
  if (action === 'jump') { this.player.jump(isPress); }
  if (action === 'left') { this.player.left(isPress); }
  if (action === 'right') { this.player.right(isPress); }
};
