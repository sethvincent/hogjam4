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
