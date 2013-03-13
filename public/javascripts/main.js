$( function() {
  var canvas = document.getElementById('canvas');

  // Setup canvases
  var maxWidth  = document.body.clientWidth;
  var maxHeight = document.body.clientHeight;

  var ASPECT = 21/9;

  var scaledHeight = maxWidth/ASPECT;
  var scaledWidth  = maxHeight*ASPECT;

  var w, h;

  if (scaledWidth < maxWidth) {
    w = Math.floor(scaledWidth);
    h = Math.floor(maxHeight);
  } else {
    w = Math.floor(maxWidth);
    h = Math.floor(scaledHeight);
  }

  canvas.width = w;
  canvas.style.width = w+'px';

  canvas.height = h;
  canvas.style.height = h+'px';

  console.log('Initialized canvas size to: '+w+'x'+h);

  var ctx = canvas.getContext('2d');

  var lastTick;
  var delta = 0;
  var now;

  var memoryStats = {
    totalHeap: 'N/A',
    usedHeap: 'N/A',
    lastGC: 'N/A'
  };

  var updateMemoryStats = function() {
    if (window.performance.memory.usedJSHeapSize < memoryStats.usedHeap) {
      memoryStats.lastGC = memoryStats.usedHeap-window.performance.memory.usedJSHeapSize;
    }

    if (window.performance && window.performance.memory) {
      memoryStats.totalHeap = window.performance.memory.totalJSHeapSize;
      memoryStats.usedHeap = window.performance.memory.usedJSHeapSize;
    }
  };

  updateMemoryStats();

  var game = new Game(ctx, w, h, function() {
    // setInterval( function() {
    //   now = Date.now();
    //   if (lastTick) { delta = now-lastTick; }
    //   lastTick = now;
    //   game.update(delta, memoryStats);
    // }, 50);
    var loop = function() {
      window.requestAnimFrame(loop);
      now = Date.now();
      if (lastTick) { delta = now-lastTick; }
      lastTick = now;
      game.update(delta, memoryStats);
    };

    setInterval(updateMemoryStats, 500);

    window.requestAnimFrame = function() {
      return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(a) { window.setTimeout(a, 1E3/60); };
    }();

    loop();
  });
});