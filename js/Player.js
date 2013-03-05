var Player = function Player(ctx, bounds) {
  this.NUM_AIR_JUMPS = 3;
  this.GRAVITY = 8;
  this.ACCELERATION = bounds[3]*this.GRAVITY/1E6;
  this.JUMP_VELOCITY = -this.ACCELERATION*200;
  this.MOVE_VELOCITY = this.JUMP_VELOCITY/3;
  this.MAX_Y_VELOCITY = -this.JUMP_VELOCITY*2;
  this.WIDTH = bounds[1]-bounds[0];
  this.HEIGHT = bounds[3]-bounds[2];
  this.RESET_POSITION = [ this.WIDTH/3, 0 ];
  this.RESET_VELOCITY = [ 0, 0.1 ];
  this.SIZE = bounds[3]/40;
  this.COLOR = '#40668B';

  this.ctx = ctx;

  this.reset();
};

Player.prototype.reset = function () {
  this.p = this.RESET_POSITION.slice(0);
  this.v = this.RESET_VELOCITY.slice(0);
  this.airJumps = 0;
  this.pendingV = [ 0, 0 ];
  this.previousMovement = null;
  this.fallHeight = 0;

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

Player.prototype.checkActions = function(actions) {
  if (!actions) { return; }
  var died = false;
  for (var i = 0; i<actions.length; i++) {
    var action = actions[i];
    if (action === 'die') { died = true; }
  }

  // Don't execute reset inside the loop to
  // make sure thing get reset properly
  if (died) {
    this.reset();
  }
};

Player.prototype.update = function(movement, delta) {
  this.p = movement.p;
  this.v = movement.v;
  this.fallHeight = movement.height || 0;
  this.previousMovement = movement;

  this.checkActions(movement.performActions);

  if (this.v[1]) { this.v[1] += this.ACCELERATION*delta; }
  if (movement.hit.t) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Get extra jump if hit a wall
  if (movement.hit.r || movement.hit.l) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Enforce max fall velocity
  if (movement.v[1] > 0 && movement.v[1] > this.MAX_Y_VELOCITY) {
    movement.v[1] = this.MAX_Y_VELOCITY;
  }

  this.draw();
};

Player.prototype.draw = function() {
  this.ctx.beginPath();
  this.ctx.rect(this.p[0], this.p[1], this.SIZE, this.SIZE);
  this.ctx.fillStyle = this.COLOR;
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
