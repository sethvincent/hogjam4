var Preloader = require('imagepreloader');
var Game = require('crtrdg-gameloop');
var Mouse = require('crtrdg-mouse');
var Keyboard = require('crtrdg-keyboard');

var Player = require('./player');
var NPC = require('./npc');

var Sprite = require('./util/sprite');
var MathUtil = require('./util/math');

var Camera = require('./camera');
var Map = require('./map');

var game = new Game();
var mouse = new Mouse(game);
var keyboard = new Keyboard(game);
var keysDown = keyboard.keysDown;

var imageArray = ['tan-baby.png', 'brown-baby.png', 'white-baby.png'];

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

/*
* THE NPCs i.e. non-player characters
*/

// Why pass in game to npc objects?
var npcArray = [];

for(var i = 0; i < 10; i++){
  npcArray[i] = new NPC({
    game: game,
    map: map,
    camera: camera,
    position: { x: MathUtil.randomInt(0, 1000), y: MathUtil.randomInt(0, 1000) },
    path: MathUtil.randomInt(0, 3)
  }).addTo(game);
}

var preload = new Preloader;
preload
  .add('images/zombie-baby.png')
  .add('images/tan-baby.png')
  .success(function(images){ 
    
    player.image = new Sprite({
      entity: player,
      image: images['zombie-baby.png'],
      frames: 4,
      fps: 16
    });

    for(var i = 0; i < 10; i++){
      npcArray[i].image = new Sprite({
        entity: npcArray[i],
        image: images['tan-baby.png'],
        frames: 4,
        fps: 16
      });
    }

    game.start();
    console.log(images)
  })
  .error(function(err){ console.log(error) })
  .done();