var ZPlat = ZPlat || {};

ZPlat.WeaponBlast = function(state, parent, target, weaponProperties) {
	this.state = state
	this.game = state.game;
	
    Phaser.Weapon.call(this, this.game, this.game.plugins);
    this.game.plugins.add(this);

    this.trackSprite(parent);
    
    // this.createBullets(1, 'missile');
    Object.assign(this, {
        bulletKillType:  Phaser.Weapon.KILL_CAMERA_BOUNDS,
        _bulletClass:    ZPlat.Missile,
        bulletGravity:   {x: 0, y: -1000},
        autofire:        false,
        target:          target,
        fireRate:        2000,
        bulletSpeed:     300 
    });

    // this.bullets.children[0].destroy();
    this.createBullets(2, 'missile');

};


ZPlat.WeaponBlast.prototype = Object.create(Phaser.Weapon.prototype);
ZPlat.WeaponBlast.prototype.constructor = ZPlat.WeaponBlast;

// this is a hack of a protected method in order to make the weapon autofire at the target.
ZPlat.WeaponBlast.prototype.update = function () {

    if (this._bulletKillType === Phaser.Weapon.KILL_WEAPON_BOUNDS)
    {
        if (this.trackedSprite)
        {
            this.trackedSprite.updateTransform();
            this.bounds.centerOn(this.trackedSprite.worldPosition.x, this.trackedSprite.worldPosition.y);
        }
        else if (this.trackedPointer)
        {
            this.bounds.centerOn(this.trackedPointer.worldX, this.trackedPointer.worldY);
        }
    }

    if (this.autofire)
    {
        this.fire(null, this.target.x, this.target.y);
    }

};
