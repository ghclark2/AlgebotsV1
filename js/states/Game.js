var ZPlat = ZPlat || {};

ZPlat.GameState = {

  init: function(level) {    

    this.currentLevel = level || 'level1';

    //constants
    this.RUNNING_SPEED = 180;
    this.JUMPING_SPEED = 500;
    this.POWERUPS = {
      YELLOWKEY: 0,
      GREENKEY: 1,
      REDKEY: 2,
      BLUEKEY: 3,
      HEALTH: 4,
      AMMO: 5
    };

    //gravity
    this.game.physics.arcade.gravity.y = 1000;    
    
    //cursor keys to move the player
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //create botPartIDcounter so all the bot parts have a unique id
    this.botPartIDCounter = 0;

    // this.areSectionsHit = false
    // this.sectionsHit = {
    //   sectionList: [],
    //   currentWeapon: null
    // };

    this.performanceCounter = 0;

  },

  create: function() {

    //create background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    this.game.world.sendToBack(this.background);
    this.background.fixedToCamera = true;

    //load current level
    this.loadLevel();

    this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
        .onDown.add(function(){this.player.changeWeaponForward();}, this);

    this.wasdCursors = {
        up: this.input.keyboard.addKey(Phaser.KeyCode.W),
        left: this.input.keyboard.addKey(Phaser.KeyCode.A),
        down: this.input.keyboard.addKey(Phaser.KeyCode.S),
        right: this.input.keyboard.addKey(Phaser.KeyCode.D),
        fire: this.input.keyboard.addKey(Phaser.KeyCode.SHIFT)
    };
    // this.game.input.activePointer.leftButton
    //     .onDown.add(function(){this.player.weapon.fireAtPointer();}, this);
    
    this.game.input.mouse.callbackContext = this.player;
    this.game.input.mouse.mouseWheelCallback = this.player.changeWeaponNumberWithWheel;
    // show on-screen touch controls
    // this.createOnscreenControls();   
    this.createHUD(); 
  }, 

  loadLevel: function() {

    this.map = this.add.tilemap(this.currentLevel);

    //join map to json data
    this.map.addTilesetImage('tiles_spritesheet', 'gameTiles');

    //create layers
    // this.backgroundLayer = this.map.createLayer('backgroundLayer');
    this.collisionLayer = this.map.createLayer('collisionLayer');
    this.game.world.sendToBack('backgroundLayer');

    //activate collisions with collisionLayer
    this.map.setCollisionBetween(1, 160, true, 'collisionLayer');

    //resize the world to match layer size
    this.collisionLayer.resizeWorld();

    //create goal
    var goalArr = this.findObjectsByType('goal', this.map, 'objectsLayer');
    this.goal = this.add.sprite(goalArr[0].x, goalArr[0].y, goalArr[0].properties.key);
    this.game.physics.arcade.enable(this.goal);
    this.goal.body.allowGravity = false;
    this.goal.nextLevel = goalArr[0].properties.nextLevel;

    //create player
    this.player = new ZPlat.Player(this, null);

    //create pools
    this.enemyGrpDivPool = this.add.group();
    this.enemyGrpMultPool = this.add.group();
    this.enemyGrpEqualPool = this.add.group();
    this.enemyGrpAddSubPool = this.add.group();
    this.enemySectionPool = this.game.add.group();
    this.sectionExplosionEmitterPool = this.game.add.group();
    this.missileExplosionEmitterPool = this.game.add.group();
    this.powerUpsPool = this.game.add.group();
    this.powerUpsPool.enableBody = true;

    // Create enemy weapons array
    this.enemyWeaponsArray = [
        {
            weaponMethod: this.weaponBomb,
            weaponName: 'weaponBomb',
            bulletSpeed: 0,
            bulletGravity: 1000,
            fireRate: 500
        },
        {
            weaponMethod: this.weaponEnergy,
            weaponName: 'weaponEnergy',
            bulletSpeed: 300,
            bulletGravity: 0,
            fireRate: 500
        },
        {
            weaponMethod: this.weaponMissile,
            weaponName: 'weaponMissile',
            bulletSpeed: 300,
            bulletGravity: 0,
            fireRate: 500
        }

    ];



    //create collisionArray for enemySections
    this.enemySectionArray = [];
    
    //create enemies
    this.enemySprites = this.add.group();

    // this.enemySprite = new ZPlat.EnemySprite(this, 300, 200, this.convertTextInstructions('x=2|30,*'));

    var enemiesArr = this.findObjectsByType('enemy', this.map, 'objectsLayer');

    // Each enemy contributes to the keycount of a specific colour - once all enemies of that colour have been destroyed the last enemy will drop the key.
    this.keysCount = {
      blue: 0,
      green: 0,
      red: 0,
      yellow: 0
    };

    enemiesArr.forEach(function(enemyData, index) {
      this.enemySprites.add(new ZPlat.EnemySprite(this, enemyData.x, enemyData.y, this.convertTextInstructions(enemyData.properties.instructionString), enemyData.properties));
      this.keysCount[enemyData.properties.keyColour] += 1;
    }, this); 

    alert('Controls: a=left, d=right, w = jump, space=change weapon, mouseleft=fire at pointer, mousewheel=change weapon number');
  },

  update: function() {
    // this.performanceCounter += 1;


    this.game.physics.arcade.collide(this.player, this.collisionLayer, this.unlockDoor, null, this);
    this.game.physics.arcade.overlap(this.player, this.goal, this.changeLevel, null, this); 
    this.game.physics.arcade.collide(this.player.weapon.bullets, this.collisionLayer, this.shotCollisionLayer, null, this);
    this.game.physics.arcade.collide( this.enemySectionArray, this.player.weapon.bullets, this.shotEnemy, this.checkCollide, this);
    this.enemySprites.forEach(function(enemySprite) {
        this.game.physics.arcade.collide(enemySprite.weapon.bullets, this.collisionLayer, this.shotCollisionLayer, null, this);
        this.game.physics.arcade.collide(this.player, enemySprite.weapon.bullets, this.shotPlayer, null, this);
    }, this);
    this.game.physics.arcade.collide(this.powerUpsPool, this.collisionLayer);
    this.game.physics.arcade.collide(this.player, this.powerUpsPool, this.collectPowerUp, null, this);
  },

  render: function(){
    // this.game.debug.body(this.player.hitbox); //shows the bounding box
    if(this.sectionDiv) {
      this.game.debug.body(this.sectionDiv); //shows the bounding box
    }
    // this.game.debug.bodyInfo(this.player.hitbox, 0, 30); //shows info on this.hitbox

    this.game.time.advancedTiming = true;
    this.game.debug.text(this.game.time.fps, 2, 14, '#00ff00');
  },

  checkCollide: function(enemySection, bullet) {
    switch(this.player.weaponsArray[bullet.currentWeapon].weaponName) {
      case 'weaponEquals':
        return enemySection.vulnerable && (enemySection.sectionType == 'sign' || enemySection.sectionType == 'signDiv');

      break;

      default:
        return true;

    }
  },

  shotEnemy: function(enemySection, bullet) {
    if(enemySection.enemy.invulnerable == false) {
      this.player.weaponsArray[bullet.currentWeapon].weaponMethod(this.player, bullet, enemySection);
    }
    bullet.explode();
  },

  shotPlayer: function(player, bullet) {
    player.damage(bullet.power);
    this.updateHUDHealth();
    bullet.explode();
  },

  shotCollisionLayer: function(bullet, tile) {
    bullet.explode();

    if(tile.index == 25) {

      // don't seem to be able to get tileHealth property from Tiled so if not defined set it yourself.
      if(tile.properties.tileHealth == undefined) {
        tile.properties.tileHealth = 30;
      } else {
        tile.properties.tileHealth -= bullet.power;
      }

      if(tile.properties.tileHealth <=0) {
          //remove tile
          this.map.removeTile(tile.x, tile.y, this.collisionLayer);

      }

    }
  },

  collectPowerUp: function(player, powerUp) {
    switch(powerUp.type) {
      case this.POWERUPS.GREENKEY:
        powerUp.x -= this.camera.x;
        powerUp.y -= this.camera.y;
        powerUp.fixedToCamera = true;

        var newKeyMovement = this.game.add.tween(powerUp.cameraOffset);
        newKeyMovement.to({
          x: 200,
          y: 20
        }, 1000, Phaser.Easing.Linear.None, true);

        this.player.keysOwned.green = true;
        break;

      case this.POWERUPS.BLUEKEY:
        powerUp.x -= this.camera.x;
        powerUp.y -= this.camera.y;
        powerUp.fixedToCamera = true;

        var newKeyMovement = this.game.add.tween(powerUp.cameraOffset);
        newKeyMovement.to({
          x: 230,
          y: 20
        }, 1000, Phaser.Easing.Linear.None, true);

        this.player.keysOwned.blue = true;
        break;

    }
    // powerUp.kill();
  },

  unlockDoor: function(player, tile) {
    switch(tile.index) {
      case 91:
        if(player.keysOwned.blue) {
          this.map.removeTile(tile.x, tile.y, this.collisionLayer);
        }
        break;
      case 98:
        if(player.keysOwned.green) {
          this.map.removeTile(tile.x, tile.y, this.collisionLayer);
        }
        break;
    }
  },

  createHUD: function(){

    var style = {
        font: 'bold 32px sans serif',
        fill: '#000000',
        align: 'center'
        //strokeThickness: 1     
    };

    this.weaponHUD = this.game.add.text(this.game.width - 50, 20, this.player.weaponsArray[this.player.currentWeapon].weaponSymbol, style);
    this.weaponNumberHUD = this.game.add.text(this.game.width - 28, 20, this.player.weaponNumbersArray[this.player.currentWeaponNumber], style);
    // first weapon is Equal so weaponNumberHUD needs to be hidden to begin with.
    this.weaponNumberHUD.sendToBack();
    this.healthHUD = this.game.add.text(28, 20, this.player.health, style);

    this.weaponHUD.fixedToCamera = true;
    this.weaponNumberHUD.fixedToCamera = true;
    this.healthHUD.fixedToCamera = true;
  },

  updateHUDWeapon: function(currentWeapon) {
      this.weaponHUD.text = currentWeapon;
  },

  updateHUDWeaponNumber: function(currentWeaponNumber) {
      this.weaponNumberHUD.text = currentWeaponNumber;
  },

  updateHUDHealth: function() {
      this.healthHUD.text = this.player.health;
  },

  createOnscreenControls: function(){
    this.leftArrow = this.add.button(20, this.game.height - 60, 'arrowButton');
    this.rightArrow = this.add.button(110, this.game.height - 60, 'arrowButton');
    this.actionButton = this.add.button(this.game.width - 100, this.game.height - 60, 'actionButton');

    this.leftArrow.alpha = 0.5;
    this.rightArrow.alpha = 0.5;
    this.actionButton.alpha = 0.5;

    this.leftArrow.fixedToCamera = true;
    this.rightArrow.fixedToCamera = true;
    this.actionButton.fixedToCamera = true;

    this.actionButton.events.onInputDown.add(function(){
      this.player.customParams.mustJump = true;
    }, this);

    this.actionButton.events.onInputUp.add(function(){
      this.player.customParams.mustJump = false;
    }, this);

    //left
    this.leftArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);

    this.leftArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);

    this.leftArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);

    this.leftArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);

    //right
    this.rightArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);

    this.rightArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);

    this.rightArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);

    this.rightArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);
  },

  findObjectsByType: function(targetType, tilemap, layer) {
    //this method gets objects of the targetType and adds them to a result array. It also corrects the y coord error between phaser and tiled.
    var result = [];

    tilemap.objects[layer].forEach(function(element, index) {
      if(element.type == targetType) {
        element.y -= tilemap.tileHeight;
        result.push(element);
      }
    }, this)

    return result;
  },

  changeLevel: function(player, goal) {
    alert('You win! Feedback please :)');
    this.gameOver();
    // this.state.start('Game', true, false, goal.nextLevel);
  },

  gameOver: function() {
    this.state.start('Game', true, false, this.currentLevel);
  },
   
  randInt: function (min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  },

  getFactors: function (integer) {
    
    //get the square root of the integer and add it to factors array if is itself and integer.
    //then iterate down from the root to one, adding i to the beginning of the factors array and
    //quotient to the end of the factors array. Produces an ordered array of factors.

    var factors = [];
    var quotient = 0;
    var root = Math.floor(Math.sqrt(integer));

    if (root * root == integer) {
      factors.push(root);
      root--;
    }

    for(var i = root; i >= 1; i--){
      quotient = integer/i;

      if(quotient === Math.floor(quotient)){
        factors.unshift(i);
        factors.push(Math.floor(quotient)); 
      }
    }

    return factors;
  },
  getNewOp: function(oldOp) {
    switch(oldOp) {
      case 'x':
        return '/';
      case '/':
        return 'x';
      case '+':
        return '-';
      case '-':
        return '+';
    }
  },

  recursiveOverlap: function(item, group, func, callBackFunc, context) {
    this.game.physics.arcade.overlap(item, group, func, callBackFunc, context);
    // // console.log(group.getAll('name', 'group')); //.forEach(this.recursiveOverlap(player, group, func, callBackFunc, context), this);
    group.getAll('botGroup', true).forEach(function(element, index) {
      this.recursiveOverlap(item, element, func, callBackFunc, context);
    }, this);
  },

  recursiveCollide: function(item, group, func, callBackFunc, context) {
    this.game.physics.arcade.collide(item, group, func, callBackFunc, context);
    // // console.log(group.getAll('name', 'group')); //.forEach(this.recursiveOverlap(player, group, func, callBackFunc, context), this);
    group.getAll('botGroup', true).forEach(function(element, index) {
      this.recursiveCollide(item, element, func, callBackFunc, context);
    }, this);
  },

  debugGroup: function(group) {
    var graphics = this.game.add.graphics(0, 0);
    
    // draw a rectangle
    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(group.left + group.parent.x, group.top + group.parent.y, group.width, group.height);
  },

  //take a string of instructions for creating an enemy and turn it into an array of objects for the Enemy.constructEnemy method to read.
  convertTextInstructions: function(textInstructions) {
    var instructions = [];
    var randArray = [];
    var curEqValue;
    var factors = [];
    var rerunFlag = true;
    
    textInstructions = textInstructions.split(',');

    // the function will do up to 20 attempts to create an enemy. If successful rerunFlag remains false and for loop finishes.
    // example reason for fail is failing to find a factor to divide by.
    for(var i = 1; i <= 20 && rerunFlag; i++) {

      rerunFlag = false;
      instructions.length = 0;

      textInstructions.forEach(function(textInstruction, index) {
        var instructionObj = {};
        
        //get the operation, trim it off the textInstruction and assign it to .op
        switch (textInstruction.charAt(0)) {
          case 'x':
            instructionObj.op = 'x=';
            textInstruction = textInstruction.slice(2);
            break;

          case '*':
            instructionObj.op = '*';
            textInstruction = textInstruction.slice(1);
            break;
            
          case '/':
            instructionObj.op = '/';
            textInstruction = textInstruction.slice(1);
            break;
            
          case '+':
            instructionObj.op = '+';
            textInstruction = textInstruction.slice(1);
            break;
            
          case '-':
            instructionObj.op = '-';
            textInstruction = textInstruction.slice(1);
            break;
            
        }

        //if no value given, apply default random values. 
        //Otherwise search for the | to see if a random number is needed. If so set its parameters, otherwise set the byNum value.
        if(textInstruction == '') {
          instructionObj.byRand = true;
          instructionObj.randMin = 2;
          instructionObj.randMax = instructionObj.op == 'x=' ? 20 : 10;
        
        } else if(textInstruction == 'f') {
          factors = this.getFactors(curEqValue);

          rerunFlag = factors.length < 3 ? true : false;
          instructionObj.byNum = factors[this.randInt(1, factors.length - 2)];

        } else if(textInstruction.indexOf('|') >= 0) {
          randArray = textInstruction.split('|');
          instructionObj.byRand = true;
          instructionObj.randMin = +randArray[0];
          instructionObj.randMax = +randArray[1];

        } else {
          instructionObj.byRand = false;
          instructionObj.byNum = textInstruction;
        }

        //set byNum if it needs generation from random numbers
        instructionObj.byNum = instructionObj.byRand ? this.randInt(instructionObj.randMin, instructionObj.randMax) : instructionObj.byNum;

        switch (instructionObj.op) {
          case 'x=':
            curEqValue = instructionObj.byNum;
            break;

          case '*':
            curEqValue *= instructionObj.byNum;
            break;
            
          case '/':
            curEqValue /= instructionObj.byNum;
            break;
            
          case '+':
            curEqValue += instructionObj.byNum;
            break;
            
          case '-':
            curEqValue -= instructionObj.byNum;
            break;
            
        }

        instructions.push(instructionObj);
      }, this);

    }

    return instructions;
  },

  getGrpMult: function(enemy) {
    // this.enemyGrpMultPool.forEach(function(element, index) {
    //   console.log('pool element: ' + index + ' = ' + element.name);
    // }, this);
    var grp = this.enemyGrpMultPool.getTop() || new ZPlat.EnemyGrpMult(this, enemy);
    grp.botResetGrp(enemy);
    // console.log('GrpID created: ' + grp.name);

    return grp;
  },

  getGrpDiv: function(enemy) {
    var grp = this.enemyGrpDivPool.getTop() || new ZPlat.EnemyGrpDiv(this, enemy);
    grp.botResetGrp(enemy);
    return grp;
  },

  getGrpAddSub: function(enemy) {
    var grp = this.enemyGrpAddSubPool.getTop() || new ZPlat.EnemyGrpAddSub(this, enemy);
    grp.botResetGrp(enemy);
    return grp;
  },

  getGrpEquals: function(enemy) {
    var grp = this.enemyGrpEqualPool.getTop() || new ZPlat.EnemyGrpEqual(this, enemy);
    grp.botResetGrp(enemy);
    return grp;
  },

  getSectionExplosionEmitter: function(x, y) {
    var emitter = this.sectionExplosionEmitterPool.getFirstExists(false) 

    if(!emitter) {
      emitter = this.sectionExplosionEmitterPool.add(this.game.add.emitter(x, y, 200));
      emitter.makeParticles('explode');
      emitter.minParticleSpeed.setTo(-100, -400);
      emitter.maxParticleSpeed.setTo(100,0);
      emitter.lifespan = 2000;
      emitter.gravity = 0;
      emitter.setAlpha(1, 0, 2000,
        Phaser.Easing.Linear.InOut);
    } else {
      emitter.x = x;
      emitter.y = y;
    }

    return emitter;
  },

  getMissileExplosionEmitter: function(x, y) {
    var emitter = this.missileExplosionEmitterPool.getFirstExists(false) 

    if(!emitter) {
      emitter = this.missileExplosionEmitterPool.add(this.game.add.emitter(this.game, x, y));
      emitter.makeParticles('missile');
      emitter.minParticleSpeed.setTo(-100, -100);
      emitter.maxParticleSpeed.setTo(100, 100);
      emitter.gravity = -1000;
      emitter.lifespan = 500;
      emitter.setAlpha(1, 0, 500,
        Phaser.Easing.Linear.InOut);
      emitter.blendMode = PIXI.blendModes.ADD;
    } else {
      emitter.x = x;
      emitter.y = y;
    }

    return emitter;
  },

  getPowerUp: function(x, y, type) {
    var powerUp = this.powerUpsPool.getFirstExists(false) 

    if(!powerUp) {
      powerUp = this.powerUpsPool.add(this.game.add.sprite(x, y, 'powerUps', type));
    } else {
      powerUp.frame = type;
      powerUp.revive();
    }

    powerUp.type = type;
    return powerUp;
  }
}