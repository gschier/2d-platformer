var Player = function Player(ctx, width, height, startPosition) {
  this.NUM_AIR_JUMPS = 3;
  this.GRAVITY = 12;
  this.WIDTH = width;
  this.HEIGHT = height;
  this.ACCELERATION = this.HEIGHT*this.GRAVITY/1E7;
  this.JUMP_VELOCITY = -this.ACCELERATION*500;
  this.MOVE_VELOCITY = this.JUMP_VELOCITY/2;
  this.MAX_Y_VELOCITY = -this.JUMP_VELOCITY*1.5;
  this.RESET_POSITION = startPosition;
  this.RESET_VELOCITY = [ 0, 0.1 ];
  this.SIZE = this.HEIGHT/40;
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

/**
 * Handles any actions the player's last move may
 * have triggered
 */
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

Player.prototype.move = function(delta) {
  // Calculate velocity for next frame
  if (this.v[1]) { this.v[1] += this.ACCELERATION*delta; }

  var movement = {
    p: this.p.slice(0), // .slice() makes a copy
    v: this.v.slice(0),
    pendingV: this.pendingV.slice(0)
  };

  for (var i=0; i<2; i++) { movement.p[i] += movement.v[i]*delta; }
  return movement;
};

Player.prototype.update = function(movement, delta) {
  this.p = movement.p;
  this.v = movement.v;

  this.fallHeight = movement.height || 0;

  this.previousMovement = movement;

  this.checkActions(movement.performActions);

  // Reset air jump count if player lands on top of an object
  if (movement.hit.t) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Reset air jump count if player hits a wall
  if (movement.hit.r || movement.hit.l) { this.airJumps = this.NUM_AIR_JUMPS; }

  // Enforce max fall velocity
  if (movement.v[1] > 0 && movement.v[1] > this.MAX_Y_VELOCITY) {
    movement.v[1] = this.MAX_Y_VELOCITY;
  }
};

Player.prototype.draw = function(relativePosition) {
  this.ctx.beginPath();
  this.ctx.rect(relativePosition[0], relativePosition[1], this.SIZE, this.SIZE);
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
