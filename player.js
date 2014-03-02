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