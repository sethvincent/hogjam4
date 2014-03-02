(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
*
* Camera
*
* options: {
*   map: map,
*   follow: player,
*   followPoint: { x: game.width / 2, y: game.height / 2 },
*   cameraStartPosition: { x: 0, y: 0 },
*   viewport: { width: 25, height: 25 }
* }
*
*/

module.exports = Camera;

function Camera(options){
  var self = this;

  this.map = options.map;
  this.game = options.game;
  this.following = options.follow;
  this.following.camera = this;

  this.followPoint = {
    x: options.followPoint.x || null,
    y: options.followPoint.y || null
  };

  this.position = options.cameraStartPosition || { x: 0, y: 0 };
  
  this.deadZone = options.deadZone || { x: options.viewport.width / 2, y: options.viewport.height / 2 };
  
  this.viewport = options.viewport;
    
  this.viewportRect = new Rectangle(this.position.x, this.position.y, this.viewport.width, this.viewport.height);
            
  this.worldRect = new Rectangle(this.position.x, this.position.y, this.map.width, this.map.height);

  this.game.on('update', function(){
    self.update();
  });
}

Camera.prototype.update = function(){
  var following = this.following;
  var followPoint = this.followPoint;

  if (following !== null){
    if (followPoint.x !== null){
      
      if(following.position.x - this.position.x + this.deadZone.x > this.viewport.width){
        this.position.x = following.position.x - (this.viewport.width - this.deadZone.x);
      }

      else if(following.position.x - this.deadZone.x < this.position.x){
        this.position.x = following.position.x - this.deadZone.x;
      }
    }

    if (followPoint.y !== null){
      if(following.position.y - this.position.y + this.deadZone.y > this.viewport.height){
        this.position.y = following.position.y - (this.viewport.height - this.deadZone.y);
      }

      else if(following.position.y - this.deadZone.y < this.position.y) {
        this.position.y = following.position.y - this.deadZone.y;
      }
    }
  }

  this.viewportRect.set(this.position.x, this.position.y, this.viewport.width, this.viewport.height);

  if(!this.viewportRect.within(this.worldRect)){

    if(this.viewportRect.left < this.worldRect.left){
      this.position.x = this.worldRect.left;
    }

    if(this.viewportRect.top < this.worldRect.top){
      this.position.y = this.worldRect.top;
    }

    if(this.viewportRect.right > this.worldRect.right){
      this.position.x = this.worldRect.right - this.viewport.width;
    }

    if(this.viewportRect.bottom > this.worldRect.bottom){
      this.position.y = this.worldRect.bottom - this.viewport.height;
    }

  }

};

function Rectangle(left, top, width, height){
  this.left = left || 0;
  this.top = top || 0;
  this.right = left + width || 0;
  this.bottom = top + height || 0;
}

Rectangle.prototype.set = function(left, top, width, height){
  this.left = left;
  this.top = top;
  this.width = width || this.width;
  this.height = height || this.height;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
};

Rectangle.prototype.within = function(rectangle) {
  return (
    rectangle.left <= this.left &&
    rectangle.right >= this.right &&
    rectangle.top <= this.top &&
    rectangle.bottom >= this.bottom
  );
};

Rectangle.prototype.overlaps = function(rectangle) {
  return (
    this.left < rectangle.right &&
    this.right > rectangle.left &&
    this.top < rectangle.bottom &&
    this.bottom > rectangle.top
  );
};
},{}],2:[function(require,module,exports){
var Preloader = require('imagepreloader');
var Game = require('crtrdg-gameloop');
var Mouse = require('crtrdg-mouse');
var Keyboard = require('crtrdg-keyboard');

var Player = require('./player');
var Sprite = require('./util/sprite');
var Camera = require('./camera');
var Map = require('./map');

var game = new Game();
var mouse = new Mouse(game);
var keyboard = new Keyboard(game);
var keysDown = keyboard.keysDown;

mouse.on('click', function(){});

game.on('start', function(){
  console.log('started');
});

game.on('update', function(interval){
	//console.log(map, camera);
});

game.on('draw', function(context){
	map.draw(context, camera);
});

game.on('pause', function(){
  console.log('paused');
});

game.on('resume', function(){
  console.log('resumed');
});

var preload = new Preloader;
preload
  .add('/images/the-baby.png')
  .success(function(images){ 
    player.image = new Sprite({
      entity: player,
      image: images['the-baby.png'],
      frames: 4,
      fps: 16
    });
    game.start();
    console.log(images)
  })
  .error(function(err){ console.log(error) })
  .done();


/*
* THE PLAYER
*/

var player = new Player({
  game: game,
  keysDown: keysDown,
  camera: camera,
  position: { x: 100, y: 100 }
}).addTo(game);


/*
*
* MAP & CAMERA
*
*/

var map = new Map(game, 5000, 5000);
map.generate();

var camera = new Camera({
  game: game,
  follow: player,
  followPoint: { x: game.width / 2, y: game.height / 2 },
  viewport: { width: game.width, height: game.height },
  map: map
});
},{"./camera":1,"./map":3,"./player":18,"./util/sprite":20,"crtrdg-gameloop":7,"crtrdg-keyboard":10,"crtrdg-mouse":13,"imagepreloader":15}],3:[function(require,module,exports){
var randomRGBA = require('./util/math').randomRGBA;

module.exports = Map;

function Map(game, width, height){
  this.game = game;
  this.width = width;
  this.height = height;
  this.image = null;
}

Map.prototype.generate = function(ticks){
  var context = document.createElement('canvas').getContext('2d');

  context.canvas.width = this.width;
  context.canvas.height = this.height;

  var size = 30;
  var columns = this.width / size;
  var rows = this.height / size;

  for (var x = 0, i = 0; i < columns; x+=size, i++){
    for (var y = 0, j=0; j < rows; y+=size, j++){
      context.fillStyle = randomRGBA(0, 255, 0, 255, 0, 255, 1);
      context.fillRect(x, y, size, size);
    }
  }

  this.image = new Image();
  this.image.src = context.canvas.toDataURL("image/png");

  context = null;
};

// draw the map adjusted to camera
Map.prototype.draw = function(context, camera) {
  context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -camera.position.x, -camera.position.y, this.image.width, this.image.height);
};

},{"./util/math":19}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],5:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = Entity;
inherits(Entity, EventEmitter);

function Entity(){}

Entity.prototype.addTo = function(game){
  this.game = game || {};

  if (!this.game.entities) this.game.entities = [];

  this.game.entities.push(this);
  this.game.findEntity = this.findEntity;
  this.initializeListeners();
  this.exists = true;

  return this;
};

Entity.prototype.initializeListeners = function(){
  var self = this;
  this.findEntity(this, function(exists, entities, index){
    if (exists){
      self.game.on('update', function(interval){
        self.emit('update', interval)
      });

      self.game.on('draw', function(context){
        self.emit('draw', context);
      });
    }
  });
};

Entity.prototype.remove = function(){
  this.removeAllListeners('update');
  this.removeAllListeners('draw');

  this.findEntity(this, function(exists, entities, index){
    if (exists) entities.splice(index, 1);
  });

  this.exists = false;
};

Entity.prototype.findEntity = function(entity, callback){
  var exists = false;
  var entities;
  if (this.game) entities = this.game.entities;
  else entities = this.entities
  var index;

  if (entities){
    for (var i=0; i<entities.length; i++){
      if (entities[i] === entity) {
        exists = true;
        index = i;
      }
    }
  }

  callback(exists, entities, index);
};

},{"events":4,"inherits":6}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var requestAnimationFrame = require('raf');
var inherits = require('inherits');

module.exports = Game;
inherits(Game, EventEmitter);

function Game(options){
  var options = options || {};

  EventEmitter.call(this);
  var self = this;
  
  if (!options.canvas){
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game';
    document.body.appendChild(this.canvas);
  } else if (typeof options.canvas === 'string'){
    this.canvas = document.getElementById(options.canvas);
  } else if (typeof options.canvas === 'object' && options.canvas.tagName) {
    this.canvas = options.canvas
  }

  this.context = this.canvas.getContext('2d');
  this.width = this.canvas.width = options.width || window.innerWidth;
  this.height = this.canvas.height = options.height || window.innerHeight;

  this.ticker = requestAnimationFrame(this.canvas);
  this.paused = false;

  if (options.maxListeners) this.setMaxListeners(options.maxListeners);
  else this.setMaxListeners(0);

  //window.addEventListener('load', function(){
  //  self.start();
  //});
}

Game.prototype.start = function(){
  var self = this;
  this.emit('start');
  this.ticker.on('data', function(interval) {
    self.update(interval);
    self.draw();
  });
};

Game.prototype.pause = function(){
  this.paused = true;
  this.ticker.pause();
  this.emit('pause');
};

Game.prototype.resume = function(){
  var self = this;
  
  this.paused = false;
  this.ticker = requestAnimationFrame(this.canvas);
  this.ticker.on('data', function(interval) {
    self.update(interval);
    self.draw();
  });

  this.emit('resume');
};

Game.prototype.update = function(interval){
  this.emit('update', interval);
};

Game.prototype.draw = function(){
  this.context.clearRect(0, 0, this.width, this.height);
  this.emit('draw-background', this.context);
  this.emit('draw', this.context);
  this.emit('draw-foreground', this.context);
};
},{"events":4,"inherits":8,"raf":9}],8:[function(require,module,exports){
module.exports=require(6)
},{}],9:[function(require,module,exports){
module.exports = raf

var EE = require('events').EventEmitter
  , global = typeof window === 'undefined' ? this : window
  , now = global.performance && global.performance.now ? function() {
    return performance.now()
  } : Date.now || function () {
    return +new Date()
  }

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

function raf(el) {
  var now = raf.now()
    , ee = new EE

  ee.pause = function() { ee.paused = true }
  ee.resume = function() { ee.paused = false }

  _raf(iter, el)

  return ee

  function iter(timestamp) {
    var _now = raf.now()
      , dt = _now - now
    
    now = _now

    ee.emit('data', dt)

    if(!ee.paused) {
      _raf(iter, el)
    }
  }
}

raf.polyfill = _raf
raf.now = now


},{"events":4}],10:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var vkey = require('vkey');

module.exports = Keyboard;
inherits(Keyboard, EventEmitter);

function Keyboard(game){
  this.game = game || {};
  this.keysDown = {};
  this.initializeListeners();
}

Keyboard.prototype.initializeListeners = function(){
  var self = this;

  document.addEventListener('keydown', function(e){
    self.emit('keydown', vkey[e.keyCode]);
    self.keysDown[vkey[e.keyCode]] = true;

    if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 32) {
      e.preventDefault();
    }
  }, false);

  document.addEventListener('keyup', function(e){
    self.emit('keyup', vkey[e.keyCode]);
    delete self.keysDown[vkey[e.keyCode]];
  }, false);
};
},{"events":4,"inherits":11,"vkey":12}],11:[function(require,module,exports){
module.exports=require(6)
},{}],12:[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 107; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}],13:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = Mouse;
inherits(Mouse, EventEmitter);

function Mouse(game){
  this.game = game || {};
  this.el = game.canvas;
  this.initializeListeners();
}

Mouse.prototype.initializeListeners = function(){
  var self = this;

  this.el.addEventListener('click', function(e){
    e.preventDefault();
    
    self.calculateOffset(e, function(location){
      self.emit('click', location);
    });
    return false;
  }, false);

  this.el.addEventListener('mousedown', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mousedown', location);
    });
    return false;
  }, false);

  this.el.addEventListener('mouseup', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mouseup', location);
    });

    return false;
  }, false);

  this.el.addEventListener('mousemove', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mousemove', location);
    });
    return false;
  }, false);
};

Mouse.prototype.calculateOffset = function(e, callback){
  var canvas = e.target;
  var offsetX = canvas.offsetLeft - canvas.scrollLeft;
  var offsetY = canvas.offsetTop - canvas.scrollTop;

  var location = {
    x: e.pageX - offsetX,
    y: e.pageY - offsetY
  };

  callback(location);
}

},{"events":4,"inherits":14}],14:[function(require,module,exports){
module.exports=require(6)
},{}],15:[function(require,module,exports){
;(function (exports) {
    var ImageSet = function(params) {
        if (params === undefined) 
            params = {}
        var list = params.obj || [];
        var success = params.fn || undefined;
        var error = params.fn2 || undefined;
        var count = 0;
        if (params.Image !== undefined)
            Image = params.Image;
        var myimages = {};
        this.add = function(src) {
            list.push(src);
            return this
        }
        this.success = function(fn) {
            success = fn;
            return this
        }
        this.error = function(fn) {
            error = fn;
            return this
        }
        this.loaded = function() {
            count++;
            if (count === list.length) {
                success(myimages);
            }
        };
        this.done = function() {
            if (success !== undefined)
                list.forEach(function(src) {
                    var that = this;
                    var img = new Image();
                    img.onerror = function() {
                        if (error !== undefined) error("image load error!");
                    };
                    img.onabort = function() {
                        if (error !== undefined) error("image load abort!");
                    };
                    img.onload = function() {
                        that.loaded();
                    };
                    img.src = src;
                    img.name = src.slice(src.lastIndexOf('/')+1);
                    myimages[img.name] = img;
                },this);
        };
    };
    if (exports.Window !== undefined) {
        exports.Preloader = ImageSet;
    } else if ((module !== undefined) && (module.exports !== undefined)) {
        exports = module.exports = ImageSet;
    }
})(typeof exports === 'undefined' ?  this : exports)

},{}],16:[function(require,module,exports){
module.exports=require(6)
},{}],17:[function(require,module,exports){
/*
 * tic
 * https://github.com/shama/tic
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

function Tic() { this._things = []; }
module.exports = function() { return new Tic(); };

Tic.prototype._stack = function(thing) {
  var self = this;
  self._things.push(thing);
  var i = self._things.length - 1;
  return function() { delete self._things[i]; }
};

Tic.prototype.interval = Tic.prototype.setInterval = function(fn, at) {
  return this._stack({
    fn: fn, at: at, args: Array.prototype.slice.call(arguments, 2),
    elapsed: 0, once: false
  });
};

Tic.prototype.timeout = Tic.prototype.setTimeout = function(fn, at) {
  return this._stack({
    fn: fn, at: at, args: Array.prototype.slice.call(arguments, 2),
    elapsed: 0, once: true
  });
};

Tic.prototype.tick = function(dt) {
  var self = this;
  self._things.forEach(function(thing, i) {
    thing.elapsed += dt;
    if (thing.elapsed > thing.at) {
      thing.elapsed -= thing.at;
      thing.fn.apply(thing.fn, thing.args || []);
      if (thing.once) {
        delete self._things[i];
      }
    }
  });
};

},{}],18:[function(require,module,exports){
var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Player;

function Player(options){
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.keysDown = options.keysDown;
  this.camera = options.camera;

  this.size = { x: 64, y: 64 };
  this.velocity = { x: 0, y: 0 };
  this.position = options.position;

  this.speed = 18;
  this.friction = 0.4;
  this.health = 100;
  this.strength = 5;
  this.visible = true;
  this.points = 0;



  this.on('update', function(interval){
    self.input(self.keysDown);
    self.move();
    self.velocity.x *= self.friction;
    self.velocity.y *= self.friction;
    self.boundaries();
  });

  this.on('draw', function(c){
    c.save();
    self.image.draw(c)
    //c.drawImage(
    //  self.image, 
    //  self.position.x - self.camera.position.x,
    //  self.position.y - self.camera.position.y, 
    //  self.image.width, 
    //  self.image.height);
    c.restore();
  });
}

inherits(Player, Entity);

Player.prototype.move = function(){
  this.position.x += this.velocity.x * this.friction;
  this.position.y += this.velocity.y * this.friction;
};


Player.prototype.boundaries = function(){
  if (this.position.x <= 0){
    this.position.x = 0;
  }

  if (this.position.x >= this.camera.map.width - this.size.x){
    this.position.x = this.camera.map.width - this.size.x;
  }

  if (this.position.y <= 0){
    this.position.y = 0;
  }

  if (this.position.y >= this.camera.map.height - this.size.y){
    this.position.y = this.camera.map.height - this.size.y;
  }
};

Player.prototype.input = function(){
  if ('W' in this.keysDown){
    this.velocity.y -= this.speed;
    this.direction = "up";
  }

  if ('S' in this.keysDown){
    this.velocity.y += this.speed;
    this.direction = "down";
  }

  if ('A' in this.keysDown){
    this.velocity.x -= this.speed;
    this.direction = "left";
  }

  if ('D' in this.keysDown){
    this.velocity.x += this.speed;
    this.direction = "right";
  }
};
},{"crtrdg-entity":5,"inherits":16}],19:[function(require,module,exports){
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomRGBA(rmin, rmax, gmin, gmax, bmin, bmax, alpha){
  var r = randomInt(rmin, rmax);
  var g = randomInt(gmin, gmax);
  var b = randomInt(bmin, bmax);
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

function randomGray(min, max){
  var num = randomInt(min, max);
  return 'rgb(' + num + ', ' + num + ', ' + num + ')';
}

function randomGrayAlpha(min, max, alpha){
  var num = randomInt(min, max);
  return 'rgb(' + num + ', ' + num + ', ' + num + ', ' + alpha + ')';
}

function randomRGB(rmin, rmax, gmin, gmax, bmin, bmax){
  var r = randomInt(rmin, rmax);
  var g = randomInt(gmin, gmax);
  var b = randomInt(bmin, bmax);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

module.exports = {
  randomInt: randomInt,
  randomRGB: randomRGB,
  randomRGBA: randomRGBA,
  randomGray: randomGray,
  randomGrayAlpha: randomGray
};
},{}],20:[function(require,module,exports){
var tic = require('tic')();

module.exports = Sprite;

/*

var sprite = new Sprite({
	entity: player,
	image: image,
	frames: 4,
	fps: 20,
})

*/

function Sprite(options) {

	this.fps = options.fps;
	this.image = options.image;
	this.frames = options.frames;
	this.entity = options.entity;

  this.currentFrame = 0;
  this.timeSinceLastFrame = 0;
	this.frameWidth = this.image.width / this.frames;
	this.timeBetweenFrames = 1/this.fps;
	this.timeSinceLastFrame = this.timeBetweenFrames;

	var self = this;

	tic.interval(function(wat) {
		self.currentFrame += 1;
		if (self.currentFrame == self.frames) self.currentFrame = 0;
	}, 1000 / this.fps, 'Every');

	this.entity.on('update', function(dt){
		tic.tick(dt);
	});
}

Sprite.prototype.draw = function(context){
	var frame = this.frameWidth * this.currentFrame;
  context.drawImage(
  	this.image, 
  	this.frameWidth * this.currentFrame,
  	0,
  	this.frameWidth, 
  	this.image.height, 
  	this.entity.position.x - this.entity.camera.position.x,
  	this.entity.position.y - this.entity.camera.position.y,
  	this.frameWidth, 
  	this.image.height
  );
      //c.drawImage(
    //  self.image, 
    //  self.position.x - self.camera.position.x,
    //  self.position.y - self.camera.position.y, 
    //  self.image.width, 
    //  self.image.height);
};

},{"tic":17}]},{},[2])