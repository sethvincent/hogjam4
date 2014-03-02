var Preloader = require('imagepreloader');
var Game = require('crtrdg-gameloop');
var Mouse = require('crtrdg-mouse');
var Keyboard = require('crtrdg-keyboard');

var Player = require('./player');
var NPC = require('./npc');

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
* TBD Possibly an array of NPCs
*/

// Why pass in game to npc1?
// Test creating 3 diff NPCs with each path option, horizontal, vert and static
var npc1 = new NPC({
  game: game,
  map: map,
  position: { x: 100, y: 200 },
  path: 1
}).addTo(game);

npc1.move();

var npc2 = new NPC({
  game: game,
  map: map,
  position: { x: 250, y: 250 },
  path: 0
}).addTo(game);

npc2.move();

var npc3 = new NPC({
  game: game,
  map: map,
  position: { x: 130, y: 300 },
  path: 2
}).addTo(game);

npc3.move();


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

    //npc1.image = new Sprite({
    //  entity: npc1,
    //  image: images['tan-baby.png'],
    //  frames: 4,
    //  fps: 16
    //});

    game.start();
    console.log(images)
  })
  .error(function(err){ console.log(error) })
  .done();