var World = function World(ctx, bounds, data) {
  this.ctx = ctx;
  this.bounds = bounds;

  this.width = bounds[1]-bounds[0];
  this.height = bounds[3]-bounds[2];

  this.data = data || {
    obstacles: [
      { type: 'box', pos: [ 0.1, 0.1 ], size: [ 0.3, 0.3 ], name:  'Big Box' },
      { type: 'box', pos: [ 0.39, 0.1 ], size: [ 0.03, 1 ], name:  'Big Box' },
      { type: 'box', pos: [ 0.5, 0.6 ], size: [ 0.2, 0.01 ], c: '#a62121', name: 'Skinny Plank' },
      { type: 'box', pos: [ 0.8, 0 ], size: [ 0.4, 0.8 ], name: 'Tall Box' }
    ]
  };

  this.data.obstacles = this.data.obstacles || [ ];

  // Always add floor and walls
  this.data.obstacles.push({ type: 'box', pos: [ -0.1, 0 ], size: [ 0.1, 2 ], name: 'Left Wall' });
  this.data.obstacles.push({ type: 'box', pos: [ 1, 0 ], size: [ 0.1, 2 ], name: 'Right Wall' });
  this.data.obstacles.push({ type: 'box', pos: [ -0.1, 0 ], size: [ 200, 0.01 ], name: 'Floor' });

  this.transformCoords();
};

World.prototype.transformCoords = function() {
  for (var i=0; i<this.data.obstacles.length; i++) {
    var o = this.data.obstacles[i];


    o.pos[0] = Math.floor(o.pos[0]*this.width);
    o.pos[1] = Math.floor(o.pos[1]*this.height);

    o.size[0] = Math.floor(o.size[0]*this.width);
    o.size[1] = Math.floor(o.size[1]*this.height);

    o.pos[1] = this.bounds[3]-o.pos[1]-o.size[1];

    console.log('OBJ '+i+': '+JSON.stringify(o));
  }
};

World.prototype.update = function(delta, playerPosition) {
  for (var i=0; i<this.data.obstacles.length; i++) {
    var o = this.data.obstacles[i];
    this.ctx.fillStyle = o.c || '#181818';
    this.ctx.beginPath();
    this.ctx.rect(o.pos[0], o.pos[1], o.size[0], o.size[1]);
    this.ctx.fill();
  }
};

World.prototype.convertObjY = function(y) {
  return this.bounds[3]-y;
};

World.prototype.checkCollision = function(previousMovement, nextMovement, size) {
  nextMovement.hit = { t: 0, r: 0, b: 0, l: 0 };
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

  for (var i=0; i<this.data.obstacles.length; i++) {
    var o = this.data.obstacles[i];

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
      }
    }

    if (nextMovement.v[0] && pPos.prev.l > oPos.r && pPos.now.l < oPos.r) {
      yIntercept = (pPos.prev.t+size[1]/2)+(oPos.r-pPos.prev.l)*slope;
      if (yIntercept < oPos.b+size[1]/2 && yIntercept > oPos.t-size[1]/2) {
        // console.log('RIGHT-SIDE:  '+o.name);
        nextMovement.p[0] = oPos.r+1;
        nextMovement.v[0] = 0;
        nextMovement.hit.r = 1;
      }
    }

    if (pPos.prev.t > oPos.b && pPos.now.t < oPos.b) {
      xIntercept = (oPos.b-pPos.prev.t)/slope+(pPos.prev.l+size[0]/2);
      if (xIntercept > oPos.l-size[0]/2 && xIntercept < oPos.r+size[0]/2) {
        // console.log('BOTTOM-SIDE: '+o.name);
        nextMovement.p[1] = oPos.b;
        nextMovement.v[1] = 0;
        nextMovement.hit.b = 1;
      }
    }

    if (pPos.prev.r < oPos.l && pPos.now.r > oPos.l) {
      yIntercept = (pPos.prev.t+size[1]/2)+(oPos.l-pPos.prev.r)*slope;
      if (yIntercept < oPos.b+size[1]/2 && yIntercept > oPos.t-size[1]/2) {
        // console.log('LEFT-SIDE:   '+o.name);
        nextMovement.p[0] = oPos.l-size[0]-1;
        nextMovement.v[0] = 0;
        nextMovement.hit.l = 1;
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

