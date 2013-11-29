var App = function() {
};

App.prototype.init = function() {
	var options = {
		timeline : true,
		animation : true
	};
	var cesiumWidget = new Cesium.Viewer('cesiumContainer', options);
};
