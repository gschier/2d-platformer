var Scene = function Scene(ctx, cameraBounds, type) {
  this.WIDTH = cameraBounds[2]-cameraBounds[0];
  this.HEIGHT = cameraBounds[3]-cameraBounds[1];
  this.BOUNDS = cameraBounds;
  this.MAX_DROPS = 300;

  this.TYPE = type;

  console.log('Initializing scene of type "'+this.TYPE+'"...');

  this.ctx = ctx;
  this.drops = [ ];

  var that = this;
  var dropStartOffsetToAccountForWind = this.WIDTH*0.5;

  this.fillDropPool();

  setInterval( function() {
    for (var i=0; i<3; i++) {
      that.drops.push(that.createDrop(
        that.ctx,
        that.BOUNDS[0]+Math.random()*(that.WIDTH+dropStartOffsetToAccountForWind*2)-dropStartOffsetToAccountForWind,
        that.BOUNDS[3],
        that.HEIGHT/100,
        that.TYPE
      ));
    }
  }, 100);
};

/** Fill up the Object pool */
Scene.prototype.fillDropPool = function() {
  for (var i=0; i<this.MAX_DROPS; i++) {
    this.drops.push(new Drop());
  }
};

/** Recycle Drop from Object pool */
Scene.prototype.createDrop = function() {
  var drop = this.drops.splice(0, 1)[0];
  drop.init.apply(drop, arguments);
  return drop;
};

Scene.prototype.update = function(delta) {
  for (var i=0; i<this.drops.length; i++) {
    this.drops[i].update(delta);
  }
};

Scene.prototype.draw = function(positionOffset) {
  for (var i=0; i<this.drops.length; i++) {
    this.drops[i].draw(positionOffset);
  }
};
