var Scene = function Scene(ctx, cameraBounds, type) {
  this.WIDTH = cameraBounds[2]-cameraBounds[0];
  this.HEIGHT = cameraBounds[3]-cameraBounds[1];
  this.BOUNDS = cameraBounds;

  this.TYPE = type;

  console.log('Initializing scene of type "'+this.TYPE+'"');

  this.ctx = ctx;
  this.drops = [ ];

  var that = this;
  var dropStartOffsetToAccountForWind = this.WIDTH*0.5;
  setInterval( function() {
    for (var i=0; i<4; i++) {
      that.drops.push(new Drop(
        that.ctx,
        that.BOUNDS[0]+Math.random()*(that.WIDTH+dropStartOffsetToAccountForWind*2)-dropStartOffsetToAccountForWind,
        that.BOUNDS[3],
        that.WIDTH,
        that.TYPE
      ));

      that.drops = that.drops.slice(-200);
    }
  }, 100);
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
