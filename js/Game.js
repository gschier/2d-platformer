var Game = function Game(ctx, width, height) {
  this.ctx = ctx;
  this.DEBUG = true;
  this.FONT_SIZE = 10;
  this.FONT_COLOR = '#888';
  this.FONT_PADDING = 4;
  // this.timeScale = 0.5;
  this.timeScale = 1;


  var bounds = [ 0, width, 0, height ];

  this.player = new Player(ctx, bounds);
  this.world = new World(ctx, bounds);
  
  this.w = width;
  this.h = height;

  this.start = Date.now();

  var that = this;
  this.keyHandler = new KeyHandler({ }, function(action, isPress) {
    that.handleAction(action, isPress);
  });

  this.lastTick = Date.now();

  // For frame rate calculation
  this.frameRate = 60;
  this.frames = 0;
  this.framesTime = Date.now();
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

Game.prototype.convertPosition = function(position) {
  return [ position[0], this.h-position[1]-this.player.getSize()[1] ];
};

Game.prototype.update = function() {
  this.ctx.clearRect(0, 0, this.w, this.h);
  var delta = (Date.now()-this.lastTick)*this.timeScale;

  // Draw scenery
  this.world.update(delta);

  // Check Player movement
  var movement = this.player.move(delta);

  // Check if player hit something
  this.checkCollision(movement, delta);

  this.checkFrameRate();
  var position = this.convertPosition(this.player.getPosition());
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

Game.prototype.checkCollision = function(movement, delta) {
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
  if (action === 'jump') { this.player.jump(isPress); this.update(); }
  if (action === 'left') { this.player.left(isPress); this.update(); }
  if (action === 'right') { this.player.right(isPress); this.update(); }
};
