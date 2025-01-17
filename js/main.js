var ZPlat = ZPlat || {};

// ZPlat.dim = ZPlat.getGameLandscapeDimensions(1000, 700)

ZPlat.game = new Phaser.Game(480, 360, Phaser.AUTO);

(function() {
  var Phaser, _boot, _follow, _unfollow;

  Phaser = this.Phaser;

  _boot = Phaser.Camera.prototype.boot;

  _follow = Phaser.Camera.prototype.follow;

  _unfollow = Phaser.Camera.prototype.unfollow;

  Phaser.Camera.prototype.boot = function() {
    _boot.apply(this, arguments);
    this.targetOffset = new Phaser.Point;
    return this;
  };

  Phaser.Camera.prototype.follow = function(target, style, lerpX, lerpY, offsetX, offsetY) {
    var result;
    result = _follow.call(this, target, style, lerpX, lerpY);
    if ((offsetX != null) && (offsetY != null)) {
      this.targetOffset.set(offsetX, offsetY);
    }
    return result;
  };

  Phaser.Camera.prototype.unfollow = function() {
    var result;
    result = _unfollow.call(this, arguments);
    this.targetOffset.set(0);
    return result;
  };

  Phaser.Camera.prototype.updateTarget = function() {
    this._targetPosition.x = this.view.x + this.target.worldPosition.x;
    this._targetPosition.y = this.view.y + this.target.worldPosition.y;
    this._targetPosition.x += this.targetOffset.x;
    this._targetPosition.y += this.targetOffset.y;
    if (this.deadzone) {
      this._edge = this._targetPosition.x - this.view.x;
      if (this._edge < this.deadzone.left) {
        this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.deadzone.left, this.lerp.x);
      } else if (this._edge > this.deadzone.right) {
        this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.deadzone.right, this.lerp.x);
      }
      this._edge = this._targetPosition.y - this.view.y;
      if (this._edge < this.deadzone.top) {
        this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.deadzone.top, this.lerp.y);
      } else if (this._edge > this.deadzone.bottom) {
        this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.deadzone.bottom, this.lerp.y);
      }
    } else {
      this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.view.halfWidth, this.lerp.x);
      this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.view.halfHeight, this.lerp.y);
    }
    if (this.bounds) {
      this.checkBounds();
    }
    if (this.roundPx) {
      this.view.floor();
    }
    this.displayObject.position.x = -this.view.x;
    this.displayObject.position.y = -this.view.y;
  };

}).call(this);

ZPlat.game.state.add('Boot', ZPlat.BootState); 
ZPlat.game.state.add('Preload', ZPlat.PreloadState); 
ZPlat.game.state.add('Game', ZPlat.GameState);

ZPlat.game.state.start('Boot'); 
