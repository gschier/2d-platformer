var World = function World(ctx, bounds, sceneType, data) {
  this.ctx = ctx;
  this.bounds = bounds;
  this.scene = new Scene(ctx, bounds, sceneType);

  this.width = bounds[1]-bounds[0];
  this.height = bounds[3]-bounds[2];

  this.data = data || {
    obstacles: [
      { type: 'box', pos: [ 0.1, 0.1 ], size: [ 0.3, 0.3 ], name: 'Big rectangle' },
      { type: 'box', pos: [ 0.39, 0.1 ], size: [ 0.03, 1 ], name :'Tall Middle Beam' },
      { type: 'box', pos: [ 0.099, 0.1 ], size: [ 0.01, 0.54 ], name: 'Far left wall' },
      { type: 'box', pos: [ 0.34, 0.8 ], size: [ 0.005, 0.1 ], name: 'Initial landing' },
      { type: 'box', pos: [ 0.3, 0.55 ], size: [ 0.005, 0.15 ], name: 'First wall squatter' },
      { type: 'box', pos: [ 0.25, 0.65 ], size: [ 0.005, 0.03 ], name: '2nd wall squatter' },
      { type: 'box', pos: [ 0.4, 0.6 ], size: [ 0.3, 0.02 ], name: 'Good Stalagtite ceiling' },
      { type: 'box', pos: [ 0.5, 0.51 ], size: [ 0.005, 0.1 ], name: 'Good Stalagtite 1' },
      { type: 'box', pos: [ 0.6, 0.51 ], size: [ 0.005, 0.1 ], name: 'Goog Stalagtite 2' },
      { type: 'box', pos: [ 0.68, 0.51 ], size: [ 0.005, 0.1 ], name: 'Goog Stalagtite 3' },
      { type: 'box', pos: [ 0.4, 0.26 ], size: [ 0.2, 0.01 ], name: 'Pole from big block' },
      { type: 'box', pos: [ 0.7, 0.7 ], size: [ 0.005, 0.1 ], name: 'Last landing' },
      { type: 'box', pos: [ 0.7, 0.01 ], size: [ 0.005, 0.1 ], name: 'Right death pike' },
      { type: 'box', pos: [ 0.8, 0 ], size: [ 0.4, 0.8 ], name: 'Big right block' },
      { type: 'box', pos: [ 0.109, 0.6 ], size: [ 0.092, 0.01 ], name: 'Left Floor beam', c: '#a62121', action: 'die' },
      { type: 'box', pos: [ 0.25, 0.5 ], size: [ 0.005, 0.15 ], name: '2nd wall squatter bad', c: '#a62121', action: 'die' },
      { type: 'box', pos: [ 0.39, 0.4 ], size: [ 0.005, 1 ], c: '#a62121', name :'Tall Middle Beam', action: 'die' },
      { type: 'box', pos: [ 0.109, 0.4 ], size: [ 0.285, 0.01 ], c: '#a62121', action: 'die', name: 'First death' },
      { type: 'box', pos: [ 0.6, 0.22 ], size: [ 0.005, 0.05 ], c: '#a62121', name: 'Stalagtite', action: 'die' },
      { type: 'box', pos: [ 0.5, 0.7 ], size: [ 0.3, 0.01 ], c: '#a62121', name: 'Last killer', action: 'die' },
      { type: 'box', pos: [ 0.45, 0.4 ], size: [ 0.351, 0.01 ], c: '#a62121', name: 'Cave floor', action: 'die' },
      { type: 'box', pos: [ 0.3, 0.7 ], size: [ 0.005, 0.4 ], name: 'First small red part', c: '#a62121', action: 'die' },
      { type: 'box', pos: [ 0.20, 0.6 ], size: [ 0.005, 0.19 ], name: 'Jump this', c: '#a62121', action: 'die' },
      { type: 'box', pos: [ 0.20, 0.9 ], size: [ 0.005, 0.2 ], name: 'Jump Under this', c: '#a62121', action: 'die' },
      { type: 'box', pos: [ 0.54, 0.01 ], size: [ 0.261, 0.01 ], name: 'Right death floor', action: 'die', c: '#a62121' },
      { type: 'box', pos: [ 0, 0.2 ], size: [ 0.035, 0.01 ], action: 'die', c: '#a62121', name: 'Small hole 1' },
      { type: 'box', pos: [ 0.06, 0.2 ], size: [ 0.04, 0.01 ], action: 'die', c: '#a62121', name: 'Small hole 2' },
      { type: 'box', pos: [ 0.35, 0.01 ], size: [ 0.04, 0.01 ], action: 'die', c: '#a62121', name: 'Small death 1' },
      { type: 'box', pos: [ 0.25, 0.01 ], size: [ 0.04, 0.01 ], action: 'die', c: '#a62121', name: 'Small death 2' },
      { type: 'box', pos: [ 0.14, 0.01 ], size: [ 0.04, 0.01 ], action: 'die', c: '#a62121', name: 'Small death 3' }
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

    o.action = o.action || 'barrier';

    o.pos[0] = Math.floor(o.pos[0]*this.width);
    o.pos[1] = Math.floor(o.pos[1]*this.height);

    o.size[0] = Math.floor(o.size[0]*this.width);
    o.size[1] = Math.floor(o.size[1]*this.height);

    o.pos[1] = this.bounds[3]-o.pos[1]-o.size[1];

    console.log('OBJ '+i+': '+JSON.stringify(o));
  }
};

World.prototype.update = function(delta, playerPosition) {
  this.scene.update(delta);
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

