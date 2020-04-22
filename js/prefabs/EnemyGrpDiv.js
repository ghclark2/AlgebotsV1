var ZPlat = ZPlat || {};

ZPlat.EnemyGrpDiv = function(state, enemy) {
	this.state = state
	this.game = state.game;
	ZPlat.EnemyGrp.call(this, this.state);

	this.botPartType = 'grpDiv';
};

ZPlat.EnemyGrpDiv.prototype = Object.create(ZPlat.EnemyGrp.prototype);
ZPlat.EnemyGrpDiv.prototype.constructor = ZPlat.EnemyGrpDiv;

ZPlat.EnemyGrpDiv.prototype.botResetGrp = function(enemy) {
	this.enemy = enemy;
	this.showFraction = true; //if false use a divide section rather than a fraction
};

// Check whether this grpDiv can have its numbers simplified. If so mark the divide section as vulnerable
ZPlat.EnemyGrpDiv.prototype.updateVulnerability = function(isVulnerable) {
	this.children[1].vulnerable = isVulnerable;
};

// Called from enemyGrp - sets up whether div section is vulnerable and the simplified version
ZPlat.EnemyGrpDiv.prototype.checkVulnerability = function() {

	// if can get a number from numerator and 
	// can get  number fromm denominator
	// if numerNum is bigger than denomNum then
	// if numerNum can be divided by denomNum to give integer, then update numerNum, kill denomNum and the fraction symbol and collapse the group
	// else numerNum smaller than denomNum, see if denomNum can be divided by numerNum perfectly. If so reduce numerNum to 1 and condense/collapse as necessary and 
	//   update denomNum.
	this.numerator = this.children[0];
	this.denominator = this.children[2];
	this.numerNum = 0;
	this.denomNum = 0;
	this.numerSection = null;
	this.denomSection= null;

	switch (this.numerator.botPartType) {
		case 'section':
			if(this.numerator.sectionType == 'number') {
				this.numerNum = this.numerator.botNumber;
				this.numerSection = this.numerator;
			}
			break;

		case 'grpMult':
			if(this.numerator.botCondensed && this.numerator.botNumber != 1) {
				this.numerNum = this.numerator.botNumber;
				this.numerSection = this.numerator.children[0];		
			}
			break;

	}

	switch (this.denominator.botPartType) {
		case 'section':
			if(this.denominator.sectionType == 'number') {
				this.denomNum = this.denominator.botNumber;
				this.denomSection = this.denominator;
			}
			break;
		// // this bit has been removed as this will be handled by the cancelling function.
		// case 'grpMult':
		// 	if(this.denominator.botCondensed && this.denominator.botNumber != 1) {
		// 		this.denomNum = this.denominator.botNumber;
		// 		this.denomSection = this.denominator.children[0];		
		// 	}
		// 	break;

	}

	if(this.numerNum == 0 || this.denomNum == 0) {
		this.updateVulnerability(false);
		return;
	}

	var diff = Math.abs(this.numerNum) - Math.abs(this.denomNum)
	if (diff == 0) {
		// numerator and denomintor are the same so both sections need killing.
		this.numerNum = 1;
		this.denomNum = 1; 
		this.updateVulnerability(true);

	} else if (diff > 0) {
		if (this.numerNum % this.denomNum == 0) {
			this.numerNum /= this.denomNum;
			this.denomNum = 1;
			this.updateVulnerability(true);
			return;
		} else {
			this.updateVulnerability(false);
		}
	} else {
		this.updateVulnerability(false);
	}


};

//botCondense takes two arguments, condenseIndex which is the index of the x sign to be condensed (i.e. 1st, 2nd) and a boolean isAnimated
ZPlat.EnemyGrpDiv.prototype.botCondense = function(condenseIndex, isAnimated) {
	
	this.numerSection.updateLabel(this.numerNum, 'number');
	if(this.numerator.botPartType == 'grpMult') {
		this.numerator.botUpdateLettersAndNumbers();
		this.numerator.botCondense1x();
	}
	this.children[1].explode();
	this.denomSection.explode();

	// collapse the killed grpDiv.
	this.collapseUnnecessaryGrp();

};

ZPlat.EnemyGrpDiv.prototype.botKillGrp = function() {
	this.state.enemyGrpDivPool.add(this);
};