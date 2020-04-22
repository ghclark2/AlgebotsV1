var ZPlat = ZPlat || {};

//x and y possibly unnecessary as handled by shapeEnemy, labelText is what is displayed, sectionType can be number/alpha/sign
ZPlat.EnemySection = function(state, x, y) {
	this.state = state
	this.game = state.game;
	Phaser.Sprite.call(this, this.game, x, y, 'enemySection', 0);

	// add this section to the collision array so can be tested in collide functions
	this.state.enemySectionArray.push(this);

	// set a default sectionType - will be updated by reset method
	this.sectionType = 'number';

	this.anchor.setTo(0.5);

	this.game.physics.arcade.enableBody(this);
	this.body.immovable = true;
	this.body.allowGravity = false;
	// this.inputEnabled = true;
	// this.input.enableDrag();

	//give the section a unique botPartID in the name property and increment the botPartIDCounter
	this.name = this.state.botPartIDCounter++;
	this.botPartType = 'section';
	// console.log(this.botPartType + this.name);
	this.botGroup = false;
	this.scale.setTo(1, 1);

	var style = {
        font: 'bold 20px sans serif',
        fill: '#FFFFFF',
        align: 'center'
        //strokeThickness: 1     
    };

	// set initial scale to 1;
	this.botOldScale = 1;
	this.botScale = 1;

	//add the label as a child of the sprite so that it's position and angle etc. remain matched.
	this.label = this.addChild(this.game.add.text(0, 0, '', style));
	this.label.anchor.setTo(0.5, 0.4);

	this.animations.add('invulnerable', [0, 2], 4, true);
	this.animations.add('damaged', [1, 0], 10, false);

};

ZPlat.EnemySection.prototype = Object.create(Phaser.Sprite.prototype);
ZPlat.EnemySection.prototype.constructor = ZPlat.EnemySection;

ZPlat.EnemySection.prototype.reset = function(x, y, health, labelText, sectionType, enemy) {
	Phaser.Sprite.prototype.reset.call(this, x, y, health);

	//give the sprite a position relative to the overall enemy
	this.botX = 0;
	this.botY = 0;

	//set .initial section coordinates relative to overall enemy. These are used for animations.
	this.botOldX = x;
	this.botOldY = y;

	this.tractoring = false;

	this.vulnerable = true;

	// check whether the new section is a signdiv or regular section and if it has changed, swap the texture
	
	// swap to regular section
	if(this.sectionType == 'signDiv' && sectionType != 'signDiv') {
		this.loadTexture('enemySection', 0);
		this.body.setSize(this.width, this.height);
		this.scale.setTo(1, 1);

		// set initial scale to 1;
		this.botOldScale = 1;
		this.botScale = 1;
	// swap to signDiv
	} else if (this.sectionType != 'signDiv' && sectionType == 'signDiv') {
		this.loadTexture('enemySectionDiv', 0);
		this.body.setSize(this.width, this.height);
		this.scale.setTo(0.1, 1);

		//set initial scale to 0.1;
		this.botOldScale = 0.1;
		this.botScale = 0.1;
	}

	this.sectionType = sectionType;
	this.updateLabel(labelText, sectionType);

	this.enemy = enemy;
};

ZPlat.EnemySection.prototype.botDamage = function(amount) {
	this.health -= amount;
	this.animations.play('damaged');

	if(this.health <= 0) {
		this.parent.botCondense(this.parent.getChildIndex(this), true);
		this.enemy.animateEnemy(1000);
	}
};

ZPlat.EnemySection.prototype.kill = function() {
	Phaser.Sprite.prototype.kill.call(this);
	this.state.enemySectionPool.add(this);
};

ZPlat.EnemySection.prototype.explode = function() {
    var newEmitter = this.state.getSectionExplosionEmitter(this.world.x, this.world.y);
    newEmitter.width = this.width;
    newEmitter.height = this.height;
    newEmitter.start(true, newEmitter.lifespan, null, 100);

    // kill the emitter once it has finished firing to allow pooling
 	this.game.time.events.add(newEmitter.lifespan + 200, function() {
 		newEmitter.kill();
 	}, this);	

    this.kill();
};

ZPlat.EnemySection.prototype.update = function() {
	// this.label.x = this.world.x;
	// this.label.y = this.world.y;
	// this.label.rotation = this.rotation;

	if(this.tractoring) {
		this.drawTractorBeam();
	}
};

ZPlat.EnemySection.prototype.updateLabel = function(labelText, sectionType) {
	switch(sectionType) {
		case 'number':
			this.botLetters = '1';
			this.botLetter = '1';
			this.botNumber = Math.abs(labelText);
			this.botPositive = labelText / Math.abs(labelText) == 1 ? true : false;
			break;

		case 'alpha':
			this.botLetters = labelText;
			this.botLetter = labelText;
			this.botNumber = 1;
			this.botPositive = true;
			break;

		case 'sign':
			break;

		case undefined:
			// console.log('error updateLabel has no sectionType');

	}

	this.sectionType = sectionType;

	//adjust x to mathematical x and * to mean times.
	switch(labelText) {
		case 'x':
			this.labelText = '𝑥';
			break;

		case '*':
			this.labelText = '×';
			break;

		default:
			this.labelText = labelText;
	}

	this.label.text = this.labelText;
};

ZPlat.EnemySection.prototype.updateBotOldXY = function() {
	this.botOldX = this.botX;
	this.botOldY = this.botY;
	this.botOldScale = this.botScale;
	// console.log(this.botOldX);
}

ZPlat.EnemySection.prototype.updateBotXY = function() {
	this.botX = this.x + this.parent.botX;
	this.botY = this.y + this.parent.botY;

	this.botScale = this.scale.x;
	if(this.parent.botPartType == 'grpDiv') {
		// console.log('botOldScale: ' + this.botOldScale);
		// console.log('botScale: ' + this.botScale);
	}
	// console.log('X for ' + this.labelText + ':' + this.x);
	// console.log('parent BotX for ' + this.labelText + ':' + this.parent.botX);
	// console.log('BotX for ' + this.labelText + ':' + this.botX);
	// console.log('BotOldX for ' + this.labelText + ':' + this.botOldX);
};

// regular animations run in the duration. Special animations take 2 durations.
ZPlat.EnemySection.prototype.botAnimate = function(duration, specialID, specialX, specialY, specialDuration) {

	var offsetX, offsetY;
	//if this botPart has been selected as special, then tween it in the specialDirection before tractoring back in.
	if(this.name == specialID) {
		// console.log('special');
		offsetX = this.botX - this.botOldX;
		offsetY = this.botY - this.botOldY;

		this.x -= offsetX;
		this.y -= offsetY;

		// var newTimesMovement = this.game.add.tween(this);
		// newTimesMovement.to({x: this.x + offsetX, y: this.y + offsetY}, 1000, null, true);
		var newTimesMovement = this.game.add.tween(this);
		newTimesMovement.to({x: this.x + specialX * 0.67, y: this.y + specialY * 0.67, angle: '+540'}, 0.15 * specialDuration, Phaser.Easing.Linear.None, false);
		newTimesMovement.onComplete.add(function(){
			this.tractoring = true;
			var newTimesMovement2 = this.game.add.tween(this);
			newTimesMovement2.to({x: this.x + specialX * 0.33, y: this.y + specialY * 0.33, angle: '+180'}, 0.35 * specialDuration, Phaser.Easing.Quadratic.Out, false);

			newTimesMovement2.onComplete.add(function(){
				var newTimesMovement3a = this.game.add.tween(this);
				newTimesMovement3a.to({x: this.x - specialX + offsetX}, specialDuration / 2, null, false);
				var newTimesMovement3b = this.game.add.tween(this);
				newTimesMovement3b.to({y: this.y - specialY + offsetY}, specialDuration / 2, Phaser.Easing.Cubic.In, false);
				newTimesMovement3a.onComplete.add(function() {
					this.tractoring = false;
					this.tractorBeam.clear();
				}, this);

				newTimesMovement3a.start();
				newTimesMovement3b.start();
			}, this);
			newTimesMovement2.start();
		}, this);

		newTimesMovement.start();



	//if not special then if the botPart has moved give it the usual tween.
	} else {
		if(this.botX !== this.botOldX || this.botY !== this.botOldY) {
			offsetX = this.botX - this.botOldX;
			offsetY = this.botY - this.botOldY;

			this.x -= offsetX;
			this.y -= offsetY;

			this.game.add.tween(this)
				.to({x: this.x + offsetX, y: this.y + offsetY}, duration, null, true);

		}	

		if(this.botScale !== this.botOldScale) {
			this.scale.setTo(this.botOldScale, 1);
			this.game.add.tween(this.scale)
				.to({x: this.botScale}, duration, null, true);

		}	

	}
};

ZPlat.EnemySection.prototype.drawTractorBeam = function() {
    if(!this.tractorBeam) {
    	this.tractorBeam = this.game.add.graphics(0, 0);
    } else {
		this.tractorBeam.clear();	    	
    }

	this.tractorBeam.lineStyle(6, 0x00FF00, 1);    //this.tractorBeam.lineTo(100, 100);

	this.tractorBeam.moveTo(this.world.x, this.world.y);
	this.tractorBeam.lineTo(this.enemy.x, this.enemy.y);
	this.tractorBeam.lineStyle(2, 0xFFFFFF, 1);    //this.tractorBeam.lineTo(100, 100);

	this.tractorBeam.lineTo(this.world.x, this.world.y);
};

// this method returns an array of the objects between this section and the stopLevel
ZPlat.EnemySection.prototype.getEnemyStack = function(stopLevel) {
	var currentLevel = this;
	var enemyStack = [currentLevel];

	while(currentLevel.botPartType != stopLevel) {
		currentLevel = currentLevel.parent;
		enemyStack.unshift(currentLevel);
	}

	return enemyStack;
};

// this method allows you to call a method by name using square bracket notation. 
// Used by the callAllChildren methods in EnemyGrp
ZPlat.EnemySection.prototype.callMethod = function(funcName, ...args) {

    var obj = this,
    	parts = funcName.split('.'),
        last = parts.pop(),
        l = parts.length,
        i = 1,
        current = parts[0];

    while (i < l && (obj = obj[current]))
    {
        current = parts[i];
        i++;
    }

    if (obj)
    {
        obj[last](...args);
    }

};

ZPlat.EnemySection.prototype.stopAnimation = function() {
	this.animations.stop();
	this.frame = 0;
};
