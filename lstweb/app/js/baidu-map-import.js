

function loadMap(div,vendor, center, locationSuccess) {	
	var map = new BMap.Map(div);

	var geoc = new BMap.Geocoder();   //地址解析对象  
	var markersArray = [];
	var geolocation = new BMap.Geolocation();

	//添加选择城市的控件  
	var size = new BMap.Size(50, 20);  
	map.addControl(new BMap.CityListControl({  
	anchor: BMAP_ANCHOR_TOP_RIGHT,  
	offset: size,   
	}));

	if(center == undefined || center == null) {
		// 添加定位控件
		var geolocationControl = new BMap.GeolocationControl({enableAutoLocation:true,showAddressBar:true});
		geolocationControl.addEventListener("locationSuccess", function(e){
			//创建坐标点
			var point = new BMap.Point(e.point.lng, e.point.lat); 
			map.centerAndZoom(point, 15);
			if(locationSuccess) {
				locationSuccess(e);
			}
		});
		geolocationControl.addEventListener("locationError",function(e){
			// 定位失败事件
			conosle.log(e.message);
		});
		map.addControl(geolocationControl);
		geolocationControl.location();
	}
	//启用地图滚轮放大缩小
	map.enableScrollWheelZoom();
	//切换地图类型的控件    
	map.addControl(new BMap.MapTypeControl());
	
	var point = new BMap.Point(center.lng, center.lat); 
	map.centerAndZoom(point, 15);
	addContextMenu(map);

	return map;
}

function addContextMenu(map){
	var menu = new BMap.ContextMenu();

	menu.addItem(new BMap.MenuItem("设置为当前摄像机位置", function(){
		var geolocation = new BMap.Geolocation();

		geolocation.getCurrentPosition(function (r) {
			if (this.getStatus() == BMAP_STATUS_SUCCESS) {
				console.log(r.point);
			} else {
				alert('failed' + this.getStatus());
			}
		}, {enableHighAccuracy: true, width:100})

		map.addControl(geolocation);
	}))

	menu.open = function(ev){
		alert(ev.type);
		alert(ev.target);
		alert(ev.point);
		alert(ev.pixel);
	}

	map.addContextMenu(menu);
}

function addMapEventHander(map, event, callback){
	map.addEventListener(event, callback)
}

function setCameraPos(map, pos, desc){
	var point = new BMap.Point(pos.lng, pos.lat);
	// var icon = new BMap.Icon('img/map-marker-icon.png', new BMap.Size(20, 32)/*, {
	// 	anchor: new BMap.Size(10, 30)
	// }*/);
	var marker = new BMap.Marker(point, {title:desc});

	map.addOverlay(marker);
	return marker;
}

function unsetCameraPos(map, marker){
	map.removeOverlay(marker);
	marker = null;
}

function cleanMap(map){
	// Event listener
	// Context Menu
	// MAP
}