var Drop = function Drop(ctx, x, y, width, type) {
  this.ctx = ctx;
  this.p = [ x, y ];

  if (type === 'snow') {
    this.v = [ (Math.random()+1)/8, (Math.random()+1)/8 ];
    this.color = [ 255, 255, 255 ];
    this.size = (width/400)*(Math.random()+4);
    this.alpha = Math.random()/10;
  } else { // Default to rain
    this.v = [ -width/10000, width/20000*(Math.random()+10) ];
    this.color = [ 0, 200, 255 ];
    this.size = Math.max(4, width*(Math.random()+5)/2000);
    this.alpha = (Math.random()+3)/20;
  }
};

Drop.prototype.move = function(delta) {
  for (var i=0; i<2; i++) { this.p[i] += this.v[i]*delta; }
};

Drop.prototype.update = function(delta) {
  this.move(delta);
  this.ctx.beginPath();
  this.ctx.rect(this.p[0], this.p[1], this.size, this.size);
  this.ctx.fillStyle = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+','+this.alpha+')';
  this.ctx.fill();
};