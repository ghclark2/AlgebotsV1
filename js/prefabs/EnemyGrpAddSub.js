var ZPlat = ZPlat || {};

ZPlat.EnemyGrpAddSub = function(state, enemy) {
	this.state = state;
	this.game = state.game;
	ZPlat.EnemyGrp.call(this, this.state);

	this.botPartType = 'grpAddSub';

};

ZPlat.EnemyGrpAddSub.prototype = Object.create(ZPlat.EnemyGrp.prototype);
ZPlat.EnemyGrpAddSub.prototype.constructor = ZPlat.EnemyGrpAddSub;

ZPlat.EnemyGrpAddSub.prototype.botResetGrp = function(enemy) {
	this.enemy = enemy;
};

ZPlat.EnemyGrpAddSub.prototype.botKillGrp = function() {
	this.state.enemyGrpAddSubPool.add(this);
};

ZPlat.EnemyGrpAddSub.prototype.botKillGrp = function() {
	this.state.enemyGrpAddSubPool.add(this);
};