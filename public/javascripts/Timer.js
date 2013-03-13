var Timer = function Timer(ctx, width, height) {
  this.WIDTH = width;
  this.HEIGHT = height;
  this.ctx = ctx;

  this.timerStart = 0;
  this.timerEnd = 0;
  this.timeLeft = 0;
  this.percent = 0;
  this.color = [ 0, 0, 0 ];
  this.height = 0;
};

Timer.prototype.set = function(time) {
  this.timerStart = Date.now();
  this.timerEnd = this.timerStart+time;
  console.log('Started timer for '+time);
};

Timer.prototype.update = function(delta) {
  this.timeLeft = this.timerEnd-Date.now();
  this.percent = (this.timeLeft)/(this.timerEnd-this.timerStart);
  this.height = -this.percent*this.HEIGHT;

  this.color = [
    Math.ceil(50*(1-this.percent)),
    Math.ceil(60*this.percent),
    Math.ceil(80*this.percent)
  ];
};

Timer.prototype.drawBackground = function() {
  if (this.timeLeft < 0) { this.timerStart = this.timerEnd = 0; return; }

  var width = this.WIDTH/100;

  this.ctx.beginPath();
  this.ctx.rect(0, this.HEIGHT, width, this.height);
  this.ctx.fillStyle = 'rgb('+this.color[0]+', '+this.color[1]+', '+this.color[2]+')';
  this.ctx.fill();

  this.ctx.beginPath();
  this.ctx.rect(this.WIDTH-width, this.HEIGHT, width, this.height);
  this.ctx.fillStyle = 'rgb('+this.color[0]+', '+this.color[1]+', '+this.color[2]+')';
  this.ctx.fill();
};

Timer.prototype.drawForeground = function() {
  if (this.timeLeft < 0) { this.timerStart = this.timerEnd = 0; return; }

  this.ctx.beginPath();
  this.ctx.rect(0, this.HEIGHT, this.WIDTH, this.height);
  this.ctx.fillStyle = 'rgba('+this.color[0]+', '+this.color[1]+', '+this.color[2]+', 0.2)';
  this.ctx.fill();
};