var ZPlat = ZPlat || {};

ZPlat.EnemyGrpMult = function(state, enemy) {
	this.state = state;
	this.game = state.game;
	ZPlat.EnemyGrp.call(this, this.state);

	this.botPartType = 'grpMult';
};

ZPlat.EnemyGrpMult.prototype = Object.create(ZPlat.EnemyGrp.prototype);
ZPlat.EnemyGrpMult.prototype.constructor = ZPlat.EnemyGrpMult;

ZPlat.EnemyGrpMult.prototype.botResetGrp = function(enemy) {
	this.botCondensed = false;
	this.botLetters = null;
	this.botNumber = null;
	this.botPositive = true;
	this.enemy = enemy;

};

//botCondense takes two arguments, condenseIndex which is the childIndex of the x sign to be condensed (i.e. 1, 3, 5 etc) and a boolean isAnimated
ZPlat.EnemyGrpMult.prototype.botCondense1x = function(isAnimated) {
	if(this.children[0].botNumber == 1) {
		this.children[0].explode();
		this.collapseUnnecessaryGrp();
	}
};

ZPlat.EnemyGrpMult.prototype.botCondense = function(condenseIndex, isAnimated) {
	
	// console.log('Before condense: ' + this.parent.stringEnemy());
	//if already condensed, do nothing
	if(this.botCondensed) {
		// console.log('already condensed');
		return;
	}

	//extract two things to be condensed
	var multLeft = this.getChildAt(condenseIndex - 1);
	var multRight = this.getChildAt(condenseIndex + 1);

	//kill the condensed x sign.
	this.getChildAt(condenseIndex).explode();

	//if combined children are both section numbers => output will be a section number
	//if combined children are both sections or grpPower of same letter => output will be a grpPower,
		// unless sum of powers adds to 1 in which case section letter or adds to 0 in which case section number (1)
	//otherwise => condensed grpMult.
	if(multLeft.botLetters == '1' && multRight.botLetters == '1') {
		multRight.updateLabel(multLeft.botNumber * multRight.botNumber, 'number');
		multLeft.explode();
		// console.log('just numbers here');
		var newParent = multRight;

	} else if (multLeft.botLetter == multRight.botLetter && multLeft.botLetter != null) {
		//CODE HERE TO HANDLE POWERS
		// console.log('whoops');
	} else {
		var newParent = this.state.getGrpMult(this.enemy);
		newParent.botCondensed = true;

		//move the newly condensed multiples into the newParent grpMult - THIS ASSUMES THAT THEY ARE ONLY grpMult OR section TYPES.
		if(multLeft.botPartType == 'grpMult') {
			newParent.addMultiple(multLeft);
			//multLeft is now empty and not needed
			multLeft.botKillGrp();
		} else {
			newParent.add(multLeft);
		}

		if(multRight.botPartType == 'grpMult') {
			newParent.addMultiple(multRight);
			//multRight is now empty and not needed
			multRight.botKillGrp();
		} else {
			newParent.add(multRight);
		}
		
		//// console.log('newParent = ' + this.state.stringEnemy2(newParent));
		//add the newParent back into this grpMult.
		this.addAt(newParent, condenseIndex - 1);

		//sort the newParent children so that they have numbers first followed by alphabetised letters.
		newParent.sort('botLetters', Phaser.Group.SORT_ASCENDING);
		// console.log(newParent.stringEnemy());
		
		//iterate through the newParent children. Idea is that if find two numbers, multiply them and reassign as the second and kill the first.
		var currentChild = newParent.getChildAt(0);
		var nextChild = newParent.getChildAt(1);
		var i = 1;

		while(i < newParent.length) {
			nextChild = newParent.getChildAt(i);

			if(nextChild.botLetters == currentChild.botLetters) {
				if(nextChild.botLetters == '1') {
					// console.log(nextChild.botNumber + '*' + currentChild.botNumber);
					nextChild.updateLabel(nextChild.botNumber * currentChild.botNumber, 'number');
					// console.log('nextChild: ' + nextChild.botNumber + ' ' + nextChild.botLetters);
					currentChild.kill();

					} else {
					//NEED SOMETHING HERE TO COPE WITH POWERS IE IF WE HAVE TWO Xs
				}
			} else {

				//if haven't killed a child then need to increase i to continue moving through group
				i++;
			}

			currentChild = nextChild;
		}

		newParent.botUpdateLettersAndNumbers();
	}

	//if length of this = 1 then delete this and collapse groups up.
	this.collapseUnnecessaryGrp();

	//newParent.parent.botUpdateLettersAndNumbers();
	// console.log('After condense: ' + newParent.parent.stringEnemy());
	// console.log('botnumber: ' + newParent.botNumber);
	// console.log('botletters: ' + newParent.botLetters);

};

//repeat botCondense for all x operations.
ZPlat.EnemyGrpMult.prototype.botCondenseAll = function(isAnimated) {

	//if already condensed, do nothing
	if(this.botCondensed) {
		return;
	}

	var numToCondense = (this.length - 1) / 2;

	for(i = 1; i <= numToCondense; i++) {
		this.botCondense(1, isAnimated);
	}

};

//only run on condensed multiples
ZPlat.EnemyGrpMult.prototype.botUpdateLettersAndNumbers = function() {

	if(!this.botCondensed) {
		this.botLetters = null;
		this.botLetter = null;
		this.botNumber = null;

		// console.log("can't update letters as not condensed");
		return;
	}

	this.botLetters = '';
	this.botLetter = '';
	this.botNumber = '';

	var currentChild;
	for(var i = 0; i < this.length; i++) {
		currentChild = this.getChildAt(i);
		if(currentChild.botLetters == '1') {
			this.botNumber = currentChild.botNumber;
		} else {
			this.botLetters += currentChild.botLetters;

			//NEED TO ADD CODE HERE TO HANDLE POWERS
		}
	}

	this.botLetter = this.botLetters.length == 1 ? this.botLetters : null;
};

ZPlat.EnemyGrpMult.prototype.botKillGrp = function() {
	this.state.enemyGrpMultPool.add(this);
};