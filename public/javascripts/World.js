var World = function World(ctx, width, height, levelData) {
  this.WIDTH = width;
  this.HEIGHT = height;

  this.ctx = ctx;
  this.levelData = levelData;

  this.levelData.obstacles = this.levelData.obstacles || [ ];

  this.transformCoords();
};

World.prototype.transformCoords = function() {
  for (var i=0; i<this.levelData.obstacles.length; i++) {
    var o = this.levelData.obstacles[i];

    // Default obstacle type to "barrier"
    o.action = o.action || 'barrier';

    // Convert the position to px
    o.pos[0] = Math.round(o.pos[0]*this.WIDTH);
    o.pos[1] = Math.round(o.pos[1]*this.HEIGHT);

    // Convert sizes to px
    o.size[0] = Math.round(o.size[0]*this.WIDTH);
    o.size[1] = Math.round(o.size[1]*this.HEIGHT);

    // Invert y-coordinate
    o.pos[1] = this.HEIGHT-o.pos[1]-o.size[1];

    // DEBUG
    // console.log('OBJ '+i+': '+JSON.stringify(o));
  }
};

World.prototype.update = function(delta) {
  // Nothing yet
};

World.prototype.draw = function(positionOffset) {
  var o;
  for (var i=0; i<this.levelData.obstacles.length; i++) {
    o = this.levelData.obstacles[i];
    this.ctx.fillStyle = o.c || '#181818';
    this.ctx.beginPath();
    this.ctx.rect(o.pos[0]-positionOffset[0], o.pos[1]-positionOffset[1], o.size[0], o.size[1]);
    this.ctx.fill();
  }
};

World.prototype.convertObjY = function(y) {
  return this.HEIGHT-y;
};

World.prototype.checkCollision = function(previousMovement, nextMovement, size) {
  nextMovement.hit = { t: 0, r: 0, b: 0, l: 0 };
  nextMovement.performActions = [ ];
  if (!previousMovement) { return nextMovement; }
  var pPos = {
    now: {
      t: nextMovement.p[1],
      r: nextMovement.p[0]+size[0],
      b: nextMovement.p[1]+size[1],
      l: nextMovement.p[0]
    },
    prev: {
      t: previousMovement.p[1],
      r: previousMovement.p[0]+size[0],
      b: previousMovement.p[1]+size[1],
      l: previousMovement.p[0]
    }
  };

  var yDelta = pPos.now.t-pPos.prev.t;
  var xDelta = pPos.now.l-pPos.prev.l;

  var yDirection = yDelta > 0 ? 1 : -1;
  var xDirection = xDelta > 0 ? 1 : -1;

  // Prevent perfect slopes
  if (!xDelta) { xDelta = 1E-99; }
  if (!yDelta) { yDelta = 1E-99; }

  var slope = yDelta/xDelta;
  var minHeight = null;

  // Where does the player path intercept the edge?
  var xIntercept, yIntercept;

  for (var i=0; i<this.levelData.obstacles.length; i++) {
    var o = this.levelData.obstacles[i];

    var oPos = {
      t: o.pos[1],
      r: o.pos[0]+o.size[0],
      b: o.pos[1]+o.size[1],
      l: o.pos[0]
    };

    if (pPos.now.r > oPos.l && pPos.now.l < oPos.r) {
      var h = oPos.t-pPos.now.b;
      if (h >= 0 && (minHeight === null || h < minHeight)) {
        minHeight = h;
      }
    }

    if (pPos.prev.b < oPos.t && pPos.now.b > oPos.t) {
      xIntercept = (oPos.t-pPos.prev.b)/slope+(pPos.prev.l+size[0]/2);
      if (xIntercept > oPos.l-size[0]/2 && xIntercept < oPos.r+size[0]/2) {
        // console.log('TOP-SIDE:    '+o.name);
        nextMovement.p[1] = oPos.t-size[1];
        nextMovement.v[1] = 0;
        minHeight = 0;
        nextMovement.hit.t = 1;
        nextMovement.performActions.push(o.action);
      }
    }

    if (nextMovement.v[0] && pPos.prev.l > oPos.r && pPos.now.l < oPos.r) {
      yIntercept = (pPos.prev.t+size[1]/2)+(oPos.r-pPos.prev.l)*slope;
      if (yIntercept < oPos.b+size[1]/2 && yIntercept > oPos.t-size[1]/2) {
        // console.log('RIGHT-SIDE:  '+o.name);
        nextMovement.p[0] = oPos.r+1;
        nextMovement.v[0] = 0;
        nextMovement.hit.r = 1;
        nextMovement.performActions.push(o.action);
      }
    }

    if (pPos.prev.t > oPos.b && pPos.now.t < oPos.b) {
      xIntercept = (oPos.b-pPos.prev.t)/slope+(pPos.prev.l+size[0]/2);
      if (xIntercept > oPos.l-size[0]/2 && xIntercept < oPos.r+size[0]/2) {
        // console.log('BOTTOM-SIDE: '+o.name);
        nextMovement.p[1] = oPos.b;
        nextMovement.v[1] = 0;
        nextMovement.hit.b = 1;
        nextMovement.performActions.push(o.action);
      }
    }

    if (pPos.prev.r < oPos.l && pPos.now.r > oPos.l) {
      yIntercept = (pPos.prev.t+size[1]/2)+(oPos.l-pPos.prev.r)*slope;
      if (yIntercept < oPos.b+size[1]/2 && yIntercept > oPos.t-size[1]/2) {
        // console.log('LEFT-SIDE:   '+o.name);
        nextMovement.p[0] = oPos.l-size[0]-1;
        nextMovement.v[0] = 0;
        nextMovement.hit.l = 1;
        nextMovement.performActions.push(o.action);
      }
    }
  }


  // Stick to walls
  if (!nextMovement.v[0] && nextMovement.pendingV[0]) { nextMovement.v[1] = 0; }

  // Continue moving horizontally after jump over wall or fall under wall
  if (!nextMovement.v[0]) { nextMovement.v[0] = nextMovement.pendingV[0]; }

  // Fall when you step off a cliff
  if (!nextMovement.v[1] && minHeight > 0) { nextMovement.v[1] = 1E-9; }

  nextMovement.height = minHeight;
  return nextMovement;
};

