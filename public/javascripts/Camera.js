var Camera = function Camera(bounds, width, height) {
  this.BOUNDS = bounds;
  this.WIDTH = width;
  this.HEIGHT = height;
  this.WIDTH_OFFSET = Math.floor(this.WIDTH/2);
  this.HEIGHT_OFFSET = Math.floor(this.HEIGHT/4);

  this.positionOffset = [ 0, 0 ];
  this.offCenterOffset = [ 0, 0 ];
};

Camera.prototype.move = function(playerPosition) {
  var xOffset = playerPosition[0]-this.WIDTH_OFFSET;
  var yOffset = playerPosition[1]-this.HEIGHT_OFFSET;

  this.positionOffset[0] = xOffset;
  this.positionOffset[1] = yOffset;

  var offset;
  if (typeof this.BOUNDS[0] === 'number') {
    offset = this.BOUNDS[0]-xOffset;
    this.offCenterOffset[0] = (offset > 0) ? offset : 0;
  }
  if (typeof this.BOUNDS[2] === 'number' && this.offCenterOffset[0] === 0) {
    offset = this.BOUNDS[2]-(xOffset+this.WIDTH);
    this.offCenterOffset[0] = (offset < 0) ? offset : 0;
  }

  if (typeof this.BOUNDS[1] === 'number') {
    offset = this.BOUNDS[1]-(yOffset+this.HEIGHT);
    this.offCenterOffset[1] = (offset < 0) ? offset : 0;
  }
  if (typeof this.BOUNDS[1] === 'number' && this.offCenterOffset[1] === 0) {
    offset = this.BOUNDS[3]-yOffset;
    this.offCenterOffset[1] = (offset > 0) ? offset : 0;
  }
};

Camera.prototype.getPlayerDrawPosition = function(position) {
  return [ this.WIDTH_OFFSET-this.offCenterOffset[0], this.HEIGHT_OFFSET-this.offCenterOffset[1] ];
};

Camera.prototype.getPositionOffset = function() {
  var offset = [ this.positionOffset[0], this.positionOffset[1] ];
  offset[0] += this.offCenterOffset[0];
  offset[1] += this.offCenterOffset[1];
  // console.log(this.offCenterOffset[0]);
  return offset;
};
