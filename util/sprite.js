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
};
