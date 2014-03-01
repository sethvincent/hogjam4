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
  })
}

Camera.prototype.update = function(){
  var following = this.following;
  var followPoint = this.followPoint;

  if (following != null){   
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
  
} 

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
  this.height = height || this.height
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
}

Rectangle.prototype.within = function(rectangle) {
  return (
    rectangle.left <= this.left && 
    rectangle.right >= this.right &&
    rectangle.top <= this.top && 
    rectangle.bottom >= this.bottom
  );
}   

Rectangle.prototype.overlaps = function(rectangle) {
  return (
    this.left < rectangle.right && 
    this.right > rectangle.left && 
    this.top < rectangle.bottom &&
    this.bottom > rectangle.top
  );
}