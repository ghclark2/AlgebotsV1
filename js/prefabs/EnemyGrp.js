var ZPlat = ZPlat || {};

ZPlat.EnemyGrp = function(state) {
	this.state = state
	this.game = state.game;
	Phaser.Group.call(this, this.game);
	this.enableBody = true;
	this.immovable = true;
	this.allowGravity = false;
	this.botPosition = {
		x: 0,
		y: 0
	};

	//give the group a unique name (botPartID) and increment the botPartIDCounter
	this.name = this.state.botPartIDCounter++;
	// console.log('grp' + this.name);
	this.botLetters = null;
	this.botNumber = null;
	this.botPositive = true;
	this.botGroup = true;

	//give the group a position relative to the overall enemy
	this.botX = 0;
	this.botY = 0;

	//set .initial section coordinates relative to overall enemy. These are used for animations.
	this.botOldX = 0;
	this.botOldY = 0;

};

ZPlat.EnemyGrp.prototype = Object.create(Phaser.Group.prototype);
ZPlat.EnemyGrp.prototype.constructor = ZPlat.EnemyGrp;

ZPlat.EnemyGrp.prototype.stringEnemy = function() {

	var algebotGrp = this;
    var stringEnemy = '';
    stringEnemy += '([' + algebotGrp.botPartType;
    if(algebotGrp.botPartType == 'grpMult' && algebotGrp.botCondensed) {stringEnemy += '*'}
    stringEnemy += ']';

    algebotGrp.children.forEach(function(element, index) {
      
      //if the element is a group then run stringEnemy on it
      if(element.botPartType != 'section') {
        stringEnemy += element.stringEnemy();
        
      } else {
      
        stringEnemy += element.labelText;
      }

    }, this);

    stringEnemy += ')';

    return stringEnemy;
    
};

ZPlat.EnemyGrp.prototype.collapseUnnecessaryGrp = function() {
	//if length of this = 1 then delete this and collapse groups up.
	if(this.length == 1) {
		var thisIndex = this.parent.getIndex(this);
		var parent = this.parent;
		parent.addAt(this.getChildAt(0), thisIndex);
		this.botKillGrp();
		if(parent.botPartType == 'grpMult') {
			parent.botUpdateLettersAndNumbers();
		}
		parent.enemy.checkIsSolved();
	}

};

//calls method on all child groups and sprites
ZPlat.EnemyGrp.prototype.callAllRecursive = function(funcName, ...args) {

    this.callAll(funcName, null, ...args);
    this.children.forEach(function(element, index) {
      
      //if the element is a group then run stringEnemy on it
      if(element.botPartType != 'section') {
        element.callAllRecursive(funcName, ...args);
      }

    }, this);
    
};

//calls method on all child sprites recursively
ZPlat.EnemyGrp.prototype.callAllChildren = function(funcName, ...args) {

    this.children.forEach(function(element, index) {
      
      //if the element is a group then run stringEnemy on it
      if(element.botPartType != 'section') {
        element.callAllChildren(funcName, args);
      } else {
    	element.callMethod(funcName, ...args);
      }

    }, this);
    
};

ZPlat.EnemyGrp.prototype.shapeEnemy = function() {

	var widths = 0;
	var heights = 0;
	
	this.children.forEach(function(element, index) {
		
		//if the element is a group then run shapeEnemy on it and wait for its width and height to be set.
		if(!element.key) {
			element.shapeEnemy();
			
		}

		widths += element.width;
		heights += element.height;
		
	}, this);
	
	var currentW = - widths / 2;
	var currentH = 0;
	
	if(this.botPartType == 'grpDiv') {

		// align all the parts horizontally
		this.setAll('x', 0);
		// shrink the divide line to size 1 so that it doesn't mess up calculating the new width.
		this.children[1].scale.setTo(1, 1);

		//reposition each element vertically
		this.children.forEach(function(element, index) {
			if(index == 0) {
				currentH = -element.height / 2;
			}
			element.y = currentH + element.height / 2;
			currentH += element.height;
		}, this);

		//rescale the divide line to the width of the group
		this.children[1].scale.setTo(this.width / 32, 1);

		// check and update whether it is vulnerable
		this.checkVulnerability();

	} else {
		// align all the parts vertically
		this.setAll('y', 0);
		//reposition each element horizontally
		this.children.forEach(function(element, index) {
			element.x = currentW + element.width / 2;
			currentW += element.width;
		}, this);
	}

};

ZPlat.EnemyGrp.prototype.updateBotOldXY = function() {
	this.botOldX = this.botX;
	this.botOldY = this.botY;
};

ZPlat.EnemyGrp.prototype.updateBotXY = function() {
	this.botX = this.x + this.parent.botX;
	this.botY = this.y + this.parent.botY;
	// console.log('X for group ' + this.name + ':' + this.x);
	// console.log('parent BotX for group ' + this.name + ':' + this.parent.botX);
	// console.log('BotX for group ' + this.name + ':' + this.botX);
	// console.log('BotOldX for group ' + this.name + ':' + this.botOldX);
};

ZPlat.EnemyGrp.prototype.debugCentre = function(colour) {

    switch(colour) {
    	case 'magenta':
    		colour = '0xFF00FF';
    		break;
    	case 'blue':
    		colour = '0x00FFFF';
    		break;
    	case 'yellow':
    		colour = '0xFFFF00';
    		break;
    }

    var graphics = this.game.add.graphics(0, 0);
    // draw a circle
    graphics.beginFill(colour, 0.5);
    graphics.drawCircle(this.enemy.x + this.botX, this.enemy.y + this.botY, 100);
    graphics.endFill();
};

ZPlat.EnemyGrp.prototype.getEnemySection = function(state, x, y, health, labelText, sectionType, enemy) {
	var enemySection = state.enemySectionPool.getFirstExists(false) || new ZPlat.EnemySection(state, x, y);

	enemySection.reset(x, y, health, labelText, sectionType, enemy);

	return enemySection;
};

