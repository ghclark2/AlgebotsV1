var ZPlat = ZPlat || {};

//loading the game assets
ZPlat.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets    
    this.load.image('goal', 'assets/images/goal.png');
    this.load.image('explode', 'assets/images/explode.png');
    this.load.image('background', 'assets/images/Background.png');
    this.load.spritesheet('player', 'assets/images/player_spritesheet.png', 28, 30, 5, 1, 1); 
    this.load.spritesheet('enemySection', 'assets/images/equa2.png', 32, 32, 3, 0, 2);    
    this.load.spritesheet('enemySectionDiv', 'assets/images/divide.png', 32, 4, 3, 0, 2);    
    this.load.spritesheet('powerUps', 'assets/images/powerUps.png', 14, 14, 6, 0, 2);    
    this.load.image('equals', 'assets/images/equal.png');    
    this.load.image('enemySprite', 'assets/images/enemyTransparent.png');    
    this.load.image('arrowButton', 'assets/images/arrowButton.png');    
    this.load.image('actionButton', 'assets/images/actionButton.png');    
    this.load.spritesheet('missile', 'assets/images/missile.png', 20, 20, 2, 0, 2);    

    this.load.image('gameTiles', 'assets/images/tiles_spritesheet.png');
    this.load.tilemap('level1', 'assets/levels/demo-level-HC.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level2', 'assets/levels/demo-level-HC2.json', null, Phaser.Tilemap.TILED_JSON);


  },
  create: function() {
    this.state.start('Game');
  }
};