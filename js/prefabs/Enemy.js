var ZPlat = ZPlat || {};

ZPlat.Enemy = function(state, x, y, instructions) {
	this.state = state;
	this.game = state.game;
	ZPlat.EnemyGrp.call(this, this.state);
	this.enableBody = true;
	this.immovable = true;
	this.allowGravity = false;
	this.x = 0;
	this.y = 0;
	this.botPartType = 'enemy';
	this.enemy = this;
	this.invulnerable = true;

	this.constructEnemy(instructions);

};

ZPlat.Enemy.prototype = Object.create(ZPlat.EnemyGrp.prototype);
ZPlat.Enemy.prototype.constructor = ZPlat.Enemy;

//iterate through all the instructions in instructions array
ZPlat.Enemy.prototype.constructEnemy = function (instructions) {

	var eqGrp;
	var newNum;


	instructions.forEach(function(instruction, index) {

		//generate the newNum if random or get if specified
		// newNum = instruction.byRand ? this.state.randInt(instruction.randMin, instruction.randMax) : instruction.byNum;
		newNum = instruction.byNum;

		// console.log(instruction.op + newNum);
		switch (instruction.op) {
			case 'x=':
				//if by has been specified as a random number, generate it with the limits given, otherwise use the number pass 
				this.xVal = newNum;
				eqGrp = this.state.getGrpEquals(this); 

				eqGrp.add(this.getEnemySection(this.state, 0, 0, 100, 'x', 'alpha', this));
				eqGrp.add(this.getEnemySection(this.state, 0, 0, 100, '=', 'sign', this));
				eqGrp.add(this.getEnemySection(this.state, 0, 0, 100, newNum, 'number', this))
				this.add(eqGrp);

				eqGrp.children[1].vulnerable = false;

				break;

			case '/':
				// console.log('/left');
				this.botDiv(eqGrp.getLeftSide(), newNum, true, null);
				// console.log('/right');
				this.botDiv(eqGrp.getRightSide(), newNum, true, null);
				break;
				
			case '*':
				// console.log('left');
				this.botMult(eqGrp.getLeftSide(), newNum, true, null);
				// console.log('right');
				this.botMult(eqGrp.getRightSide(), newNum, true, null);

				break;
				
			case '+':

			case '-':
				// console.log('+-');

		}

	}, this);

	this.animateEnemy(1000);
};

// this method runs shapeEnemy, updates the botXY coordinates and then runs botAnimate on all groups and sprites.
// botAnimate will check to see which bot parts have moved and then animate them.
// if a special section is specified that will get a tractor beam animation instead.
// invulnerability is activated
// a timer is set for 500ms after the animation is finished. This:
//		deactivates invulnerability
//		updates the oldBotXY coordinates
ZPlat.Enemy.prototype.animateEnemy = function (duration, specialID, specialX, specialY, specialDuration) {
    
	this.invulnerable = true;
 	this.game.time.events.add((specialDuration || duration) + 500, this.removeInvulnerability, this);	
    this.game.lockRender = true;
	this.shapeEnemy();
	
	if(this.children[0].botPartType == 'grpEqual') {
		this.children[0].alignOnEquals();		
	}

	this.callAllRecursive('updateBotXY');
	this.callAllRecursive('botAnimate', duration, specialID, specialX, specialY, specialDuration);
    this.game.lockRender = false;
	this.callAllChildren('animations.play', 'invulnerable');
};

//remove the invulnerability and stop the invulnerability animation
ZPlat.Enemy.prototype.removeInvulnerability = function() {
	this.invulnerable = false;
	this.callAllChildren('stopAnimation');
	this.callAllRecursive('updateBotOldXY');
}

//botMult multiplies a group or sprite (existingChild) by a number (byNum) or movedChild. 
//If sumOnComplete is true then the function will complete the sum, if false it will leave the x sign in.
//movedChild is a reference to a child group or sprite if it is being moved from one side to the other.
ZPlat.Enemy.prototype.botMult = function(existingChild, byNum, sumOnComplete, movedChild) {

	var newParent;
	var newChild;
	var existingParent;
	var existingChildPosition;

	//select side to work on.
	existingParent = existingChild.parent;

	existingChildPosition = existingParent.getChildIndex(existingChild);
	
	//if existingChild is a GrpDiv then iterate into the numerator and recheck //THIS ASSUMES THAT THERE CAN ONLY BE ONE DEPTH OF GRPDIV
	if(existingChild.botPartType == 'grpDiv') {
		existingParent = existingChild;
		existingChild = existingParent.children[0];
		existingChildPosition = 0;
	}

	//if an movedChild exists, label it newChild. Otherwise create a new EnemySection.
	if(movedChild) {
		newChild = movedChild;
	} else {
		newChild = this.getEnemySection(this.state, 0, 0, 100, byNum, 'number', this);
	}

	//If existingChild is already a grpMult and botCondensed is false then newParent = existingChild. Otherwise insert newParent as new grpMult in existingParent and add existingChild to it.
	if(existingChild.botPartType == 'grpMult' && !existingChild.botCondensed) {
		newParent = existingChild;
	} else {
		newParent = this.state.getGrpMult(this);
		newParent.add(existingChild);
		existingParent.addAt(newParent, existingChildPosition);
	}

	newParent.add(this.getEnemySection(this.state, 0, 0, 100, '*', 'sign', this));
	newParent.add(newChild);


	//if sumOnComplete then condense the new multiple made.
	if(sumOnComplete) {
		newParent.botCondenseAll(false);
	}

	return this;
};

//botDiv divides a group or sprite (existingChild) by a number (byNum) or movedChild. 
//If sumOnComplete is true then the function will complete the sum, if false it will leave the / sign in.
//movedChild is a reference to a child group or sprite if it is being moved from one side to the other.
ZPlat.Enemy.prototype.botDiv = function(existingChild, byNum, sumOnComplete, movedChild) {

	var newParent;
	var newChild;
	var existingParent;
	var existingChildPosition;

	//select side to work on.
	existingParent = existingChild.parent;

	existingChildPosition = existingParent.getChildIndex(existingChild);
	
	//if existingChild is a GrpDiv then run botMult on the denominator 
	if(existingChild.botPartType == 'grpDiv') {
		this.botMult(existingChild.children[2], byNum, sumOnComplete, movedChild);
	} else {

		//if an movedChild exists, label it newChild. Otherwise create a new EnemySection.
		if(movedChild) {
			newChild = movedChild;
		} else {
			newChild = this.getEnemySection(this.state, 0, 0, 100, byNum, 'number', this);
		}

		//insert newParent as new grpDiv in existingParent and add existingChild to it.
		newParent = this.state.getGrpDiv(this);
		newParent.add(existingChild);
		existingParent.addAt(newParent, existingChildPosition);

		newParent.add(this.getEnemySection(this.state, 0, 0, 100, '', 'signDiv', this));
		newParent.add(newChild);

		//if sumOnComplete then condense the new div group made.
		if(sumOnComplete) {
			newParent.checkVulnerability();
			if(newParent.children[1].vulnerable) {
				newParent.botCondense(1, false);
			}
		}

	}

	return this;
};

ZPlat.Enemy.prototype.checkIsSolved = function() {
	if(this.children[0].getLeftSide().botPartType == 'section' && this.children[0].getRightSide().botPartType == 'section') {
		this.parent.vibrate();
	}
};