var ZPlat = ZPlat || {};

//x and y possibly unnecessary as handled by shapeEnemy, labelText is what is displayed, sectionType can be number/alpha/sign
ZPlat.Player = function(state, weapons) {
	this.state = state
	this.game = state.game;
	
    var playerArr = this.state.findObjectsByType('player', this.state.map, 'objectsLayer');
    Phaser.Sprite.call(this, this.game, playerArr[0].x, playerArr[0].y, 'player', 3);
	  this.game.add.existing(this);

    this.anchor.setTo(0.5);
    this.animations.add('walking', [0, 1, 2, 1], 6, true);
    this.game.physics.arcade.enable(this);
    this.customParams = {};
    this.body.collideWorldBounds = true;
    
    //follow player with the camera
    this.game.camera.follow(this, this.game.camera.FOLLOW_PLATFORMER, 0.5, 0.5, 0, -60);

    //set up weapon
    this.weapon = this.game.add.weapon(-1, 'missile')
        .trackSprite(this);
    this.weapon.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
    this.weapon.bulletClass = ZPlat.Missile;
    this.weapon.bullets.children[0].destroy();
    this.weapon.bulletGravity.y = -1000;

    this.currentWeapon = 0;
    this.currentWeaponNumber = 0;

    this.health = 100;

    this.keysOwned = {
      blue: false,
      green: false,
      red: false,
      yellow: false
    };

    this.weaponsArray = [
        {
            weaponMethod: this.weaponEquals,
            weaponSymbol: '=',
            weaponName: 'weaponEquals',
            bulletSpeed: 600,
            fireRate: 150
        },
        {
            weaponMethod: this.weaponDivide,
            weaponSymbol: '÷',
            weaponName: 'weaponDivide',
            bulletSpeed: 300,
            fireRate: 500
        },
        {
            weaponMethod: this.weaponMultiply,
            weaponSymbol: '×',
            weaponName: 'weaponMultiply',
            bulletSpeed: 300,
            fireRate: 500
        }

    ];

    this.setWeaponProperties();

    this.weaponNumbersArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
};

ZPlat.Player.prototype = Object.create(Phaser.Sprite.prototype);
ZPlat.Player.prototype.constructor = ZPlat.Player;

ZPlat.Player.prototype.kill = function() {
    // Phaser.Sprite.prototype.kill.call(this);
    alert('Game Over!');
    this.state.gameOver();
};

ZPlat.Player.prototype.update = function() {
    this.body.velocity.x = 0;

    if(this.state.cursors.left.isDown || this.customParams.isMovingLeft || this.state.wasdCursors.left.isDown) {
      this.body.velocity.x = -this.state.RUNNING_SPEED;
      this.scale.setTo(1, 1);
      this.play('walking');
    }
    else if(this.state.cursors.right.isDown || this.customParams.isMovingRight || this.state.wasdCursors.right.isDown) {
      this.body.velocity.x = this.state.RUNNING_SPEED;
      this.scale.setTo(-1, 1);
      this.play('walking');
    }
    else {
      this.animations.stop();
      this.frame = 3;
    }

    if((this.state.cursors.up.isDown || this.customParams.mustJump || this.state.wasdCursors.up.isDown) && (this.body.blocked.down || this.body.touching.down)) {
      this.body.velocity.y = -this.state.JUMPING_SPEED;
      this.customParams.mustJump = false;
    }

    //kill player if falls off world
    if(this.bottom == this.game.world.height) {
      this.state.gameOver();
    }

    if(this.game.input.activePointer.leftButton.isDown || this.state.wasdCursors.fire.isDown) {
      this.weapon.fireAtPointer();
    }
};

ZPlat.Player.prototype.weaponDivide = function(player, bullet, enemySection) {

    var enemy = enemySection.enemy;
    var eqGrp = enemy.children[0];
    enemy
        .botDiv(eqGrp.getLeftSide(), player.weaponNumbersArray[bullet.currentWeaponNumber], false, null)
        .botDiv(eqGrp.getRightSide(), player.weaponNumbersArray[bullet.currentWeaponNumber], false, null)
        .animateEnemy(1000);
};

ZPlat.Player.prototype.weaponMultiply = function(player, bullet, enemySection) {

    var enemy = enemySection.enemy;
    var eqGrp = enemy.children[0];
    enemy
        .botMult(eqGrp.getLeftSide(), player.weaponNumbersArray[bullet.currentWeaponNumber], false, null)
        .botMult(eqGrp.getRightSide(), player.weaponNumbersArray[bullet.currentWeaponNumber], false, null)
        .animateEnemy(1000);
};

ZPlat.Player.prototype.weaponEquals = function(player, bullet, enemySection) {
    enemySection.botDamage(10);
};

ZPlat.Player.prototype.changeWeaponNumberWithWheel = function(event) {

    if(event.wheelDelta >= 0) {
        this.currentWeaponNumber == this.weaponNumbersArray.length - 1 ? this.currentWeaponNumber = 0 : this.currentWeaponNumber ++;
    } else {
        this.currentWeaponNumber == 0 ? this.currentWeaponNumber = this.weaponNumbersArray.length - 1 : this.currentWeaponNumber --;       
    }

    this.state.updateHUDWeaponNumber(this.weaponNumbersArray[this.currentWeaponNumber]);
};

ZPlat.Player.prototype.changeWeaponForward = function() {
    this.currentWeapon == this.weaponsArray.length - 1 ? this.currentWeapon = 0 : this.currentWeapon ++;
    this.state.updateHUDWeapon(this.weaponsArray[this.currentWeapon].weaponSymbol);
    // if the currentWeapon is Equals then hide the WeaponNumberHUD
    this.currentWeapon == 0 ? this.state.weaponNumberHUD.sendToBack() : this.state.weaponNumberHUD.bringToTop();
    this.setWeaponProperties();
};

ZPlat.Player.prototype.setWeaponProperties = function() {
    var weaponData = this.weaponsArray[this.currentWeapon];
    this.weapon.fireRate = weaponData.fireRate;
    this.weapon.bulletSpeed = weaponData.bulletSpeed;
};

ZPlat.Player.prototype.getMissileText = function() {
    return this.weaponsArray[this.currentWeapon].weaponName == 'weaponEquals' ? '' : this.weaponsArray[this.currentWeapon].weaponSymbol + this.weaponNumbersArray[this.currentWeaponNumber];
};
