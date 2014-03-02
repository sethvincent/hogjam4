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
  .add('images/zombie-baby.png')
  .add('images/tan-baby.png')
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