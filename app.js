var App = function() {
};

App.prototype.getCZML = function() {
	
};


App.prototype.init = function() {
	var options = {
		timeline : true,
		animation : true
	};
	var cesiumWidget = new Cesium.Viewer('cesiumContainer', options);


	var url = 'http://biocache.ala.org.au/ws/occurrences/search?wkt=POLYGON((150.93 -33.78,151.42 -33.80,151.43 -33.51,151.05 -33.54,150.93 -33.78))&q=matched_name:"Strepera graculina"&fq=rank:species&flimit=10&pageSize=1&foffset=0&&facets=names_and_lsid';
	
	function requestSuccess(data) {
		console.log(JSON.stringify(data));
		
	}
	
	var json = $.getJSON(url, requestSuccess);

	$.ajax({
		dataType: "jsonp",
		url: url,
		//data: data,
		success: requestSuccess
		});


};
