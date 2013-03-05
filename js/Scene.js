var Scene = function Scene(ctx, bounds, type) {
  console.log('Initializing scene of type '+type);

  this.ctx = ctx;
  this.width = bounds[1]-bounds[0];
  this.height = bounds[3]-bounds[2];
  this.types = [ 'rain', 'snow' ];
  this.type = type || this.types[Math.floor(Math.random()*this.types.length)];

  this.drops = [ ];

  var that = this;
  setInterval( function() {
    for (var i=0; i<4; i++) {
      that.drops.push(new Drop(that.ctx, Math.random()*that.width*2-that.width/2, 0, that.width, that.type));
      that.drops = that.drops.slice(-200);
    }
  }, 100);
};

Scene.prototype.update = function(delta) {
  // console.log(this.drops.length);
  for (var i=0; i<this.drops.length; i++) {
    this.drops[i].update(delta);
  }
};