var KeyHandler = function KeyHandler(controls, eventCallback) {
  this.eventCallback = eventCallback;
  this.controls = {
    jump: 32,   // Space
    right: 83,  // A
    left: 65    // S
  };
  this.controlsLookup = { };
  this.pressed = { };

  this.setControls(controls);
  console.log('Controls set to ', this.controls);
  this.setControlMappings();
  this.addListeners();
};

KeyHandler.prototype.setControls = function(controls) {
  controls = controls || { };
  for (var command in controls) {
    if (controls.hasOwnProperty(command)) {
      this.controls[command] = controls[command].toString();
    }
  }
};

KeyHandler.prototype.setControlMappings = function() {
  for (var command in this.controls) {
    if (this.controls.hasOwnProperty(command)) {
      this.controlsLookup[this.controls[command].toString()] = command;
    }
  }
};

KeyHandler.prototype.getAction = function(key) {
  return this.controlsLookup[key];
};

KeyHandler.prototype.addListeners = function() {
  var that = this;
  $('body').on('keydown', function(e) {
    var action = that.getAction(e.which);
    if (action && !that.pressed[action]) {
      that.eventCallback(action, true);
      that.pressed[action] = 1;
    }
  }).on('keyup', function(e) {
    var action = that.getAction(e.which);
    if (action) {
      that.eventCallback(action, false);
      that.pressed[action] = 0;
    }
  });
};
