var App = function() {
};

var isViewAll = false;

function mix(x, y, a) {
	return x * (1.0 - a) + y * a;
}

function mixColors(x, y, a) {
	return new Cesium.Color(mix(x.red, y.red, a), mix(x.green, y.green, a), mix(x.blue, y.blue, a), mix(x.alpha, y.alpha, a));
}

App.prototype.getSampleCZML = function(sample) {
	var avail;
	var jsDateStart = sample.start, jsDateStop = sample.stop;

	avail = jsDateStart.toISOString() + '/' + jsDateStop.toISOString();

	var a = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
	var b = new Cesium.Color(1.0, 1.0, 1.0, 1.0);

	var normSeverity = sample.severity;

	var c = mixColors(a, b, normSeverity);
	var scale = mix(0.2, 0.4, normSeverity);

	// only add a label if we're in '24' mode
	var label;
	var alpha = 1.0;

	if (isViewAll) {
		alpha = 0.5;
		// scale *= 0.5;
	} else {
		label = {
			"fillColor" : [ {
				// "interval" : avail,
				"rgba" : [ 255, 255, 255, 255 ]
			} ],
			"font" : "10px sans-serif",
			"horizontalOrigin" : "CENTER",
			"outlineColor" : {
				"rgba" : [ 0, 0, 0, 255 ]
			},
			"pixelOffset" : {
				"cartesian2" : [ 0.0, 40.0 * (0.5 + 0.5 * normSeverity) ]
			},
			"scale" : 1.0,
			"show" : [ {
				"boolean" : true
			} ],
			"style" : "FILL",
			"text" : sample.id.toString(),
			"verticalOrigin" : "CENTER"
		};
	}

	return {
		"id" : sample.id,
		"availability" : avail,
		"billboard" : {
			"color" : {
				"rgba" : [ Cesium.Color.floatToByte(c.red), Cesium.Color.floatToByte(c.green), Cesium.Color.floatToByte(c.blue),
						Cesium.Color.floatToByte(alpha) ]
			},
			"eyeOffset" : {
				"cartesian" : [ 0.0, 0.0, 0.0 ]
			},
			"horizontalOrigin" : "CENTER",
			"image" : "images/icon.png",
			"pixelOffset" : {
				"cartesian2" : [ 0.0, 0.0 ]
			},
			"scale" : scale,
			"show" : [ {
				"boolean" : true
			} ],
			"verticalOrigin" : "BOTTOM"
		},
		"label" : label,
		"position" : {
			"cartographicDegrees" : [ sample.lon, sample.lat, 10.0 ]
		}
	};
};

App.prototype.getCZML = function(data, viewer) {
	var samples = data.occurrences;
	// alert('found: ' + samples.length + ' samples');
	var scene = viewer.scene;

	var czml = [];

	for ( var i = 0; i < samples.length; ++i) {
		var s = samples[i];

		var detail = {};
		detail.lat = s.decimalLatitude;
		detail.lon = s.decimalLongitude;
		detail.id = s.uuid;
		detail.severity = 0.5;
		detail.start = new Date(s.eventDate);
		detail.stop = new Date(detail.start.getTime() + 3.15569e10);

		if (!isNaN(detail.start)) {
			czml.push(this.getSampleCZML(detail));
			//console.log('start time: ' + detail.start);
		}
	}

	// Process the CZML, which populates a collection with DynamicObjects
	var dataSourceCollection24 = new Cesium.DataSourceCollection();
	var visualizers24 = new Cesium.DataSourceDisplay(scene, dataSourceCollection24);
	var czmlDataSource24 = new Cesium.CzmlDataSource();
	czmlDataSource24.process(czml);
	dataSourceCollection24.add(czmlDataSource24);
	var dynamicObjectCollection24 = czmlDataSource24.getDynamicObjectCollection();

	// Figure out the time span of the data
	var availability = dynamicObjectCollection24.computeAvailability();

	var timeline = viewer.timeline;
	var clock = viewer.clock;

	clock.startTime = availability.start.clone();
	clock.currentTime = availability.start.clone();
	clock.stopTime = availability.stop.clone();
	timeline.zoomTo(clock.startTime, clock.stopTime);

	scene.base_render = scene.render;
	scene.render = function(date) {
		visualizers24.update(date);
		scene.base_render(date);
	};

};

App.prototype.addLayer = function(viewer) {

	var description = {
		url : 'http://geospace.research.nicta.com.au:8080/admin_bnds/ows?',
		layers : 'admin_bnds_abs:LGA_2011_AUST',
		credit : 'NICTA',
		parameters : {
			transparent : 'true',
			format : 'image/png'
		}
	};
	var layer = new Cesium.WebMapServiceImageryProvider(description);
	var layers = viewer.centralBody.getImageryLayers();
	var provider = layers.addImageryProvider(layer);
	provider.alpha = 0.5;
};

App.prototype.setCam = function(viewer) {
	var scene = viewer.scene;
	//Set the camera to look at Australia
	var e = new Cesium.Cartesian3(-5802994.915164497, 5694926.250766534, -5132847.621559966);
	var v = new Cesium.Cartesian3(0.5481376741150558, -0.5487699126893898, 0.6311867181291257);
	var u = new Cesium.Cartesian3(-0.49546208477586695, 0.394948245543276, 0.7736492783502353);
	scene.getCamera().controller.lookAt(e, Cesium.Cartesian3.add(e, v), u);
};

App.prototype.init = function() {
	var options = {
		timeline : true,
		animation : true
	};
	var viewer = new Cesium.Viewer('cesiumContainer', options);
	this.setCam(viewer);

	var n = 10000;
	var url = 'http://biocache.ala.org.au/ws/occurrences/search?wkt=POLYGON((150.93 -33.78,151.42 -33.80,151.43 -33.51,151.05 -33.54,150.93 -33.78))&q=matched_name:"Strepera graculina"&fq=rank:species&flimit='
			+ n + '&pageSize=' + n + '&foffset=0&&facets=names_and_lsid';

	var that = this;
	function requestSuccess(data) {
		that.getCZML(data, viewer);
	}

	this.addLayer(viewer);

	$.getJSON(url, requestSuccess);
};
