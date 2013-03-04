var Player = function Player(ctx, bounds) {
  this.NUM_AIR_JUMPS = 3;
  this.GRAVITY = 8;
  this.ACCELERATION = bounds[3]*this.GRAVITY/1E6;
  this.JUMP_VELOCITY = -this.ACCELERATION*200;
  this.MOVE_VELOCITY = this.JUMP_VELOCITY/3;
  this.MAX_Y_VELOCITY = -this.JUMP_VELOCITY*2;
  // this.SIZE = bounds[3]/50;
  this.SIZE = bounds[3]/30;

  this.ctx = ctx;
  this.bounds = bounds; // [ xMin, xMax, yMin, yMax ]
  this.v = [ 0, 0.1 ];
  this.pendingV = [ 0, 0 ]; // Velocity disregarding blocking obstacles
  this.p = [ bounds[1]/20, bounds[3]*0.3 ];
  this.fallHeight = 0;
  this.airJumps = 0;
  this.previousMovement = null;

  // For managing horizontal direction
  // Ex. Holding down left and right at the same time
  this.vXBuff = { l: 0, r: 0 };
};

Player.prototype.move = function(delta) {
  // arr.slice(0) makes a copy
  var movement = {
    p: this.p.slice(0),
    v: this.v.slice(0),
    pendingV: this.pendingV.slice(0)
  };

  for (var i=0; i<2; i++) {
    movement.p[i] += movement.v[i]*delta;
  }
  return movement;
};

Player.prototype.update = function(movement, delta) {
  this.p = movement.p;
  this.v = movement.v;
  this.fallHeight = movement.height || 0;

  if (this.v[1]) { this.v[1] += this.ACCELERATION*delta; }
  if (movement.hit.t) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Get extra jump if hit a wall
  if (movement.hit.r || movement.hit.l) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Enforce max fall velocity
  if (movement.v[1] > 0 && movement.v[1] > this.MAX_Y_VELOCITY) {
    movement.v[1] = this.MAX_Y_VELOCITY;
  }

  this.draw();

  this.previousMovement = movement;
};

Player.prototype.draw = function() {
  this.ctx.beginPath();
  this.ctx.rect(this.p[0], this.p[1], this.SIZE, this.SIZE);
  this.ctx.fillStyle = '#444';
  this.ctx.fill();
};

Player.prototype.jump = function(isPress) {
  if (isPress && this.airJumps) {
    this.v[1] = this.JUMP_VELOCITY;
    this.airJumps--;
  }
};

Player.prototype.left = function(isPress) {
  if (isPress) { this.vXBuff.l = this.pendingV[0] = this.v[0] = this.MOVE_VELOCITY; }
  else {
    this.vXBuff.l = 0;
    this.v[0] = this.pendingV[0] = this.vXBuff.r;
  }
};

Player.prototype.right = function(isPress) {
  if (isPress) { this.vXBuff.r = this.pendingV[0] = this.v[0] = -this.MOVE_VELOCITY; }
  else {
    this.vXBuff.r = 0;
    this.v[0] = this.pendingV[0] = this.vXBuff.l;
  }
};

// GETTERS
Player.prototype.getSize = function() { return [ this.SIZE, this.SIZE ]; };
Player.prototype.getPosition = function() { return this.p; };
Player.prototype.getVelocity = function() { return this.v; };
Player.prototype.getPendingVelocity = function() { return this.pendingV; };
Player.prototype.getAirJumps = function() { return this.airJumps; };
Player.prototype.getPreviousMovement = function() { return this.previousMovement; };
Player.prototype.getFallHeight = function() { return this.fallHeight; };
