var ZPlat = ZPlat || {};

//An equals group has 3 children. Child 0 is the left hand side, child 1 is the equality/inequality symbol, child 2 is the right hand side.
ZPlat.EnemyGrpEqual = function(state, enemy) {
	this.state = state;
	this.game = state.game;
	ZPlat.EnemyGrp.call(this, this.state);

	this.botPartType = 'grpEqual';

};

ZPlat.EnemyGrpEqual.prototype = Object.create(ZPlat.EnemyGrp.prototype);
ZPlat.EnemyGrpEqual.prototype.constructor = ZPlat.EnemyGrpEqual;

ZPlat.EnemyGrpEqual.prototype.botResetGrp = function(enemy) {
	this.enemy = enemy;
};

ZPlat.EnemyGrpEqual.prototype.alignOnEquals = function() {
	this.x = -this.children[1].x;
};

ZPlat.EnemyGrpEqual.prototype.getRightSide = function() {
	return this.children[2];
};

ZPlat.EnemyGrpEqual.prototype.getLeftSide = function() {
	return this.children[0];
};

ZPlat.EnemyGrpEqual.prototype.botKillGrp = function() {
	this.state.enemyGrpEqualPool.add(this);
};

ZPlat.EnemyGrpEqual.prototype.botKillGrp = function() {
	this.state.enemyGrpEqualPool.add(this);
};