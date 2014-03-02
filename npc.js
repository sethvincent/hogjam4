var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = NPC;

function NPC(options) {
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;

  this.size = {
    x: 50,
    y: 50
  };
  this.velocity = {
    x: 0,
    y: 0
  };
  this.position = options.position;

  /* Set boundary width/height for NPC to walk in between */
  this.boundary = {
    x: this.position.x,
    y: this.position.y,
    width: (this.size.x * 6) + this.position.x,
    height: (this.size.y * 7) + this.position.y
  };

  this.speed = 18;
  this.friction = 0.2;
  this.health = 100;
  this.strength = 5;
  this.color = '#ff0099';
  this.visible = true;
  this.points = 0;
  this.direction = "up";
  this.paths = ['horizontal', 'vertical', 'static'];

  // Verify received valid path or default to horizontal
  if (options.path > -1 && options.path < 3) {
    this.path = this.paths[options.path];
  } else {
    this.path = 'horizontal';
  }

  this.on('update', function(interval) {
    self.move();
    self.velocity.x *= self.friction;
    self.velocity.y *= self.friction;
    self.boundaries();
  });

  this.on('draw', function(c) {
    c.save();

    if (self.image){
      self.image.draw(c);
    }

    else {
      c.fillStyle = self.color;
      c.fillRect(
        self.position.x,
        self.position.y,
        self.size.x,
        self.size.y
      );
    }
    c.restore();
  });
}

inherits(NPC, Entity);

/*
 * move function - Kicks off moving NPC in intial direction when NPC is created.
 * Note during game play, NPC be redirected by boundary function. e.g. hit boundary
 */
NPC.prototype.move = function() {
  if (this.path === 'horizontal') {
    if (this.direction === 'right') {
      this.moveRight();
    } else {
      this.moveLeft();
    }
  } else if (this.path === 'vertical') {
    if (this.direction === 'up') {
      this.moveUp();
    } else {
      this.moveDown();
    }
  } else {
    this.moveStop();
  }

  this.position.x += this.velocity.x * this.friction;
  this.position.y += this.velocity.y * this.friction;
};

/* 
 * NPC will walk between boundaries or edge of map
 */
NPC.prototype.boundaries = function() {
  /* Moving Horizontal Left and went out of bounds */
  if (this.position.x <= this.boundary.x) {
    if (this.position.x <= 0) {
      this.position.x = 0;
    } else {
      this.position.x = this.boundary.x;
    }
    this.moveRight();
  }

  /* Moving Horizontal Right and went out of bounds */
  if ((this.position.x >= this.boundary.width - this.size.x) || (this.position.x >= this.map.width - this.size.x)) {
    this.position.x = this.boundary.width - this.size.x;
    this.moveLeft();
  }

  /* Moving Vertical Up and went out of bounds */
  if (this.position.y <= this.boundary.y) {
    if (this.position.y <= 0) {
      this.position.y = 0;
    } else {
      this.position.y = this.boundary.y;
    }
    this.moveDown();
  }

  /* Moving Vertical Down and went out of bounds */
  if ((this.position.y >= this.boundary.height - this.size.y) || (this.position.y >= this.map.height - this.size.y)) {
    this.position.y = this.boundary.height - this.size.y;
    this.moveUp();
  }
};

/* Stops NPC and sets path to static i.e. stopped */
NPC.prototype.moveStop = function() {
  this.path = "static";
};

NPC.prototype.moveUp = function() {
  this.velocity.y -= this.speed;
  this.direction = "up";
};

NPC.prototype.moveDown = function() {
  this.velocity.y += this.speed;
  this.direction = "down";
};

NPC.prototype.moveLeft = function() {
  this.velocity.x -= this.speed;
  this.direction = "left";
};

NPC.prototype.moveRight = function() {
  this.velocity.x += this.speed;
  this.direction = "right";
};