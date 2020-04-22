var ZPlat = ZPlat || {};

//calculate dimensions of the game so that 100% of the screen is occupied

ZPlat.getGameLandscapeDimensions = function(maxW, maxH) {
	//get both w and h of the screen (they might exchange)
	var w = window.innerWidth * window.devicePixelRatio;
	var h = window.innerHeight * window.devicePixelRatio;

	//make sure width is the maximum of the above 2.
	var landW = Math.max(w, h);
	var landH = Math.min(w, h);

	//do we need to scale to fit in width
	if(landW > maxW) {
		var ratioW = maxW / landW;
		landW *= ratioW;
		landH *= ratioW;
	}

	//do we need to scale to fit in height
	if(landH > maxH) {
		var ratioH = maxH / landH;
		landW *= ratioH;
		landH *= ratioH;
	}

	return {
		width: landW,
		height: landH
	}
}