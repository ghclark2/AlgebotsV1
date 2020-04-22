var ZPlat = ZPlat || {};

ZPlat.Missile = function(game, x, y, key, frame) {
	this.game = game;
	this.state = this.game.state.getCurrentState();

	Phaser.Bullet.call(this, game, x, y, key, frame);

    // power is amount of damage bullet does
    this.power = 10;

    this.smokeEmitter = this.game.add.emitter(0, 0, 100);
    this.addChild(this.smokeEmitter);
    // Set motion paramters for the emitted particles
    this.smokeEmitter.gravity = -1000;
    this.smokeEmitter.setXSpeed(-120, -50);
    this.smokeEmitter.setYSpeed(0, 0); // make smoke drift upwards

    // Make particles fade out after 500ms
    this.smokeEmitter.setAlpha(1, 0, 500,
        Phaser.Easing.Linear.InOut);

    // Create the actual particles
    this.smokeEmitter.makeParticles('missile');

    // Start emitting smoke particles one at a time (explode=false) with a
    // lifespan of this.SMOKE_LIFETIME at 50ms intervals
    this.smokeEmitter.start(false, 500, 50);

    this.smokeEmitter.blendMode = PIXI.blendModes.ADD;


	var style = {
        font: 'bold 16px sans serif',
        fill: '#000000',
        align: 'center'
        //strokeThickness: 1     
    };

	this.missileText = this.game.add.text(0, 0, '', style);
	this.missileText.anchor.setTo(0.5, 0.4);
	this.game.physics.arcade.enable(this.missileText);
	this.reset(x, y);

};

ZPlat.Missile.prototype = Object.create(Phaser.Bullet.prototype);
ZPlat.Missile.prototype.constructor = ZPlat.Missile;

ZPlat.Missile.prototype.reset = function(x, y, health) {
	Phaser.Bullet.prototype.reset.call(this, x, y, health);
	this.missileText.text = this.state.player.getMissileText();
	this.currentWeapon = this.state.player.currentWeapon;
	this.currentWeaponNumber = this.state.player.currentWeaponNumber;
    this.scale.setTo(this.state.player.weaponsArray[this.state.player.currentWeapon].weaponName == 'weaponEquals' ? 0.5 : 1);
    this.missileText.bringToTop();

};

ZPlat.Missile.prototype.update = function() {
	Phaser.Bullet.prototype.update.call(this);

    // If this missile is dead, don't do any of these calculations
    // Also, turn off the smoke emitter
    if (!this.alive) {
        this.smokeEmitter.on = false;
        return;
    } else {
        this.smokeEmitter.on = true;
    }

    // // Position the smoke emitter at the center of the missile
    // this.smokeEmitter.x = this.x;
    // this.smokeEmitter.y = this.y;

    this.missileText.x = this.x;
    this.missileText.y = this.y;
    this.missileText.body.velocity = this.body.velocity;
    this.missileText.body.allowGravity = false;

};

ZPlat.Missile.prototype.explode = function() {
    var newEmitter = this.state.getMissileExplosionEmitter(this.x, this.y);
    newEmitter.width = this.width;
    newEmitter.height = this.height;
    newEmitter.start(true, newEmitter.lifespan, null, 100);

    // kill the emitter once it has finished firing to allow pooling
    this.game.time.events.add(newEmitter.lifespan + 200, function() {
        newEmitter.kill();
    }, this);   

    this.kill();
    this.missileText.sendToBack();
};