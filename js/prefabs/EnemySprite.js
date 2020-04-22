var ZPlat = ZPlat || {};

//x and y possibly unnecessary as handled by shapeEnemy, labelText is what is displayed, sectionType can be number/alpha/sign
ZPlat.EnemySprite = function(state, x, y, instructions, properties) {
	this.state = state
	this.game = state.game;
	Phaser.Sprite.call(this, this.game, x, y, 'enemySprite');
	this.properties = properties;

	this.initialPosition = {
		x: x,
		y: y
	}

	this.anchor.setTo(0.5);

	this.game.physics.arcade.enableBody(this);
	this.body.immovable = true;
	this.body.allowGravity = false;

	//give the section a unique botPartID in the name property and increment the botPartIDCounter
	this.name = this.state.botPartIDCounter++;
	this.botPartType = 'enemySprite';
	this.botGroup = false;

	this.enemy = new ZPlat.Enemy(this.state, x, y, instructions);
	this.addChild(this.enemy);

	this.body.maxVelocity.x = 190;

	// this sets the random offset for the vibrate function.
	this.randPosition = 0;

    //set up weapon
    // this.weapon = this.game.add.weapon(-1, 'missile')
    //     .trackSprite(this);
    // this.weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
    // // this.weapon.bulletClass = ZPlat.Missile;
    // this.weapon.bullets.children[0].destroy();
    // this.weapon.fireRate = 2000;
    // this.weapon.bulletSpeed = 0;
    // this.weapon.autofire = true;
    this.weapon = new ZPlat.WeaponBlast(this.state, this, this.state.player);

    // does this enemysprite start chasing the player?
    this.chaseFlag = false;

};

ZPlat.EnemySprite.prototype = Object.create(Phaser.Sprite.prototype);
ZPlat.EnemySprite.prototype.constructor = ZPlat.EnemySprite;

ZPlat.EnemySprite.prototype.reset = function(x, y, enemy) {
	Phaser.Sprite.prototype.reset.call(this, x, y);

	this.enemy = enemy;
};

ZPlat.EnemySprite.prototype.update = function() {
    if(this.randPosition != 0) {
      this.x = this.botOldX + this.state.randInt(-this.randPosition, this.randPosition);
      this.y = this.botOldY + this.state.randInt(-this.randPosition, this.randPosition);
    }

    if(!this.chaseFlag && Math.abs(this.state.player.x - this.x) < 300 && this.state.player.y - this.y > 0 && this.state.player.y - this.y < 300) {
    	this.chaseFlag = true;
    	this.weapon.autofire = true;
    }

    if(this.chaseFlag) {
    	this.chasePlayer();
    }

};

ZPlat.EnemySprite.prototype.vibrate = function() {
	this.botOldX = this.x;
	this.botOldY = this.y;

    var enemyExplodeMovement = this.game.add.tween(this);
    enemyExplodeMovement.to({
      	randPosition: 5
    }, 1000);
    enemyExplodeMovement.onComplete.add(function(){
    	randPosition = 0;
    	this.explode();
    }, this);                        //'this' context is passed in here so that this.isMoving may be called within the function.
    enemyExplodeMovement.start();

};

ZPlat.EnemySprite.prototype.explode = function() {

	this.weapon.autofire = false;
	this.enemy.children[0].children[2].explode();	
	this.enemy.children[0].children[1].explode();	
	this.enemy.children[0].children[0].explode();	
	this.enemy.children[0].botKillGrp();
	
	if(this.state.keysCount[this.properties.keyColour] == 1) {
		this.dropKey(this.properties.keyColour);
	} else { 
		this.state.keysCount[this.properties.keyColour] -= 1;
	}

	this.kill();
};

ZPlat.EnemySprite.prototype.dropKey = function(colour) {
	switch (colour) {
		case 'blue':
			this.state.getPowerUp(this.x, this.y, this.state.POWERUPS.BLUEKEY);
			break;
		case 'green':
			this.state.getPowerUp(this.x, this.y, this.state.POWERUPS.GREENKEY);
			break;
	}
};

ZPlat.EnemySprite.prototype.chasePlayer = function() {

	this.body.velocity.x = (this.state.player.x - this.x) / 2;

};

