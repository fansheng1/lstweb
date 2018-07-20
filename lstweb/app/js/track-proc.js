
class TrackModel {
	constructor(){
	}

	convertTaskMeta(data){
		var model = {
			task_id: '',
			task_name: 'ABCD',
			results: [
				{image: '', ts: '2017-06-12 00:00:00', pos: {lng:114.025973657,lat:22.5460535462}},
				{image: '', ts: '2017-06-14 00:00:00', pos: {lng:114.025973657,lat:22.5470535462}},
				{image: '', ts: '2017-06-15 00:00:00', pos: {lng:114.025973657,lat:22.5480535462}},
				{image: '', ts: '2017-06-23 00:00:00', pos: {lng:114.025973657,lat:22.5490535462}},
				{image: '', ts: '2017-06-28 00:00:00', pos: {lng:114.025973657,lat:22.543021123}},
			]
		}

		return model
	}

	convertTaskResult(model, data){
		if(model && model.tasks) {
			var is_duplication_task = false
			model.tasks.forEach( task => {
				if(task.task_id == data[0].id) {
					is_duplication_task = true
					return false
				}
			})
			if(is_duplication_task){
				return model
			}
		}
		var task_list = {
			task_id: data[0].id,
			task_name: data[0].task_name,
			task_uri: data[0].uri,
			length: data[0].length,
			task_ready_to_show: false,
			results: data[0].cameraInfo
		}
		if(model == undefined) {
			model = {
				view_name: '案件视图',
				tasks: [task_list]
			}
		} else {
			model.tasks.push(task_list);
		}

		return model
	}

}

/*
  [Server] -------> [TrackModel] => [FuncTrack]
*/
class FuncTrack {
	constructor(){
		this.qs = {}
		this.map = null
		this.def_label_style = {
			backgroundColor: 'gray', color:'white', borderRadius: '5px', border: 'gray solid 2px'
		}
		this.def_polyline_style = {
			strokeColor:"gray", strokeWeight:2, strokeOpacity:0.7
		}
		this.hl_polyline_style = {
			strokeColor:"blue", strokeWeight:4, strokeOpacity:0.5
		}
		this.def_active_task_style = {}
		this.active_task_id = undefined
		this.active_point_id = undefined
		/* some symbol */
		this.Normal = 0
		this.Active = 1
		this.Highlight = 2

		this.store_overlays = new Map()	// per-task marker data
		this.store_task_rs = {}
	}
	getUrlParams(url) {
		var theRequest = new Object(); 
		if (url.indexOf("?") != -1) { 
			var str = url.substr(1); 
			var strs = str.split("&"); 
			for(var i = 0; i < strs.length; i ++) { 
				theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]); 
			}
		}
		return theRequest;
	}
	getTaskList(){
		if(this.qs && this.qs.task_id) {
			return [this.qs.task_id]
		}
		return [];
	}
	loadMap(url){
		this.qs = this.getUrlParams(url);

		// 百度地图API功能  
		var map = new BMap.Map("allmap");
		//创建坐标点
		var point = new BMap.Point(114.025973657,22.5460535462); 
		map.centerAndZoom(point, 17);
		map.enableScrollWheelZoom();//启用地图滚轮放大缩小

		// 添加带有定位的导航控件
		var navigationControl = new BMap.NavigationControl({
			// 靠左上角位置
			anchor: BMAP_ANCHOR_TOP_LEFT,
			// LARGE类型
			type: BMAP_NAVIGATION_CONTROL_LARGE,
			// 启用显示定位
			enableGeolocation: true, // 会多出一个点
			showZoomInfo:true
		});

		map.addControl(navigationControl);
		//地图导航控件    
		var nav_size = new BMap.Size(10,10);//地图导航控件的参数    
		var map_Control = new BMap.NavigationControl({
			anchor:BMAP_ANCHOR_TOP_RIGHT,
			offset:nav_size,
			type:BMAP_NAVIGATION_CONTROL_SMALL,
		});
		map.addControl(map_Control);

		this.map = map
	}

	markInterstPoint(pos, meta) {
		var point = new BMap.Point(pos.lng, pos.lat);
		// var icon = new BMap.Icon('img/map-face-yellow.jpg', new BMap.Size(20, 32)/*, {
		// 	anchor: new BMap.Size(10, 30)
		// }*/);
		var marker = new BMap.Marker(point, {
			//icon: icon,
			enableClicking: true,
			title: meta.title
		});

		var label = new BMap.Label(meta.title, {
			offset: {width: 15, height: -10},
			position: point
		})
		label.setStyle(this.def_label_style)

		var circle = new BMap.Circle(point, {
			fillColor: ''
		})
		circle.setRadius(20)

		this.map.addOverlay(marker)
		marker.setLabel(label)
		//this.map.addOverlay(circle)

		return {marker, label, circle};
	}

	setCenter(lng, lat){
		var point = new BMap.Point(lng,lat); 
		this.map.centerAndZoom(point, 17);
	}

	cancelInterstPoint(map, m){
		var marker = m.marker

		this.map.removeOverlay(m.marker)
		//this.map.removeOverlay(m.circle)
		m.label = null
		m.circle = null
		m.marker = null
	}

	// mark task query result set
	showPositionLayer(rs){
		this.list_task_rs = rs

		rs.tasks.forEach(task => {
			if(task.task_ready_to_show) {
				return;
			}

			if(this.active_task_id){
				this.setTaskViewStyle(this.active_task_id, this.Normal)
			}

			var markers = []
			var polylines = [];
			var drive_points =[];
			var _this = this;

			//新的
			for(let k=0; k<task.results.length; k++){
				var m = _this.markInterstPoint(task.results[k].pos, {
					title: task.task_name,
					task_id: task.task_id,
					result_id: task.results[k].id,	/* compare result index id */
					image: task.results[k].cam_file,
					ts: task.results[k].ts
				});
				m.id = task.results[k].cid;
				markers.push(m);
				drive_points.push(new BMap.Point(task.results[k].pos.lng, task.results[k].pos.lat));
			}

			//路线导航 方案一  根据导航画折线
			var driving = new BMap.DrivingRoute(this.map, {
				renderOptions: {map: this.map, autoViewport: true},
				onPolylinesSet:function(routes) {
					let searchRoute = routes[0].getPolyline();//导航路线
					_this.map.removeOverlay(searchRoute);
				},
				onMarkersSet: function (routes) {
					_this.map.removeOverlay(routes[0].marker); //删除起点
					_this.map.removeOverlay(routes[1].marker);//删除终点
				}
			});
			if(drive_points.length>1){
				for(var i=0; i<=drive_points.length-2; i++){
					driving.search(drive_points[i], drive_points[i+1]);
					//检索结束后的回调函
					driving.setSearchCompleteCallback(function(){
						var pts = driving.getResults().getPlan(0).getRoute(0).getPath();    //通过驾车实例，获得一系列点的数组

						var polyline = new BMap.Polyline(pts, {
							strokeColor:"blue", strokeWeight:4, strokeOpacity:0.5
						});
						_this.map.addOverlay(polyline);
						polylines.push(polyline);
					})
				}
			}

			//var polyline = new BMap.Polyline(points, this.def_polyline_style)
			//this.map.addOverlay(polyline)
			this.store_overlays.set(task.task_id, {markers,polylines});
			this.active_task_id = task.task_id;
			this.setTaskViewStyle(this.active_task_id, this.Active);
			task.task_ready_to_show = true
		})
	}
	// task data show style
	/* status: 0 - normal, 1 - active, 2 - hilight */
	setTaskViewStyle(task_id, status) {
		if(task_id == undefined) {
			return
		}

		var overlays = this.store_overlays.get(task_id)
		var label_style = this.def_label_style
		var polyline_color = this.def_polyline_style.strokeColor
		var polyline_opacity = this.def_polyline_style.strokeOpacity
		var polyline_weight = this.def_polyline_style.strokeWeight
		var hl_polyline_color = this.hl_polyline_style.strokeColor
		var hl_polyline_opacity = this.hl_polyline_style.strokeOpacity

		if(status == this.Active){
			label_style = Object.assign({}, this.def_label_style, {
				backgroundColor: '#4863A0', border: 'white solid 2px'
			})
			polyline_color = 'blue'
			polyline_weight = 6
		} else if(status == this.Highlight) {
			label_style = Object.assign({}, this.def_label_style, {
				backgroundColor: 'orange', color: 'black', border: 'orange solid 2px'
			})
			polyline_color = 'orange'
			polyline_weight = 6
		}else if(status == this.Normal){
			polyline_color = 'gray';
			polyline_opacity = 0.7
		}

		if(overlays) {
			overlays.markers.forEach(m => {
				var label = m.label
				label.setStyle(label_style)
			})

			//折线样式
			overlays.polylines.forEach(polyline => {
				polyline.setStrokeColor(polyline_color);
				polyline.setStrokeOpacity(polyline_opacity);
			})
			//overlays.polyline.setStrokeColor(polyline_color)
			//overlays.polyline.setStrokeWeight(polyline_weight)
		}
	}

	/* Mouse move feedback for task route */
	highlightTaskInfo(task_id, hl){
		if(this.active_task_id && this.active_task_id == task_id){
			return
		}
		this.setTaskViewStyle(task_id, hl ? this.Highlight : this.Normal)
	}

	activeTaskInfo(task_id) {
		if(this.active_task_id) {
			this.setTaskViewStyle(this.active_task_id, this.Normal)
			if(this.active_task_id == task_id) {
				/* toggle it */
				this.setTaskViewStyle(task_id, this.Active)
				return
			}
		}		

		if(task_id) {
			this.setTaskViewStyle(task_id, this.Active)
			this.active_task_id = task_id
		}
	}

	getLocationForTaskResults(task_n, fn){
		var task = null
		var array_pt = []
		var array_rs_index = []

		task = task_n;
		task.forEach((r, index) => {
			array_pt.push(new BMap.Point(r.pos.lng, r.pos.lat))
			array_rs_index.push(index)
		})
		var geoc = new BMap.Geocoder()
		var geoSearch = function () {
			var pt = array_pt.shift()
			var index = array_rs_index.shift()
			if (pt) {
				geoc.getLocation(pt, function (rs) {
					var addComp = rs.addressComponents;

					for(let addkey in addComp){
						switch (addkey){
							case "province":
								addComp.province=addComp.province+",";
								break;
							case "city":
								addComp.city=addComp.city+",";
								break;
							case "district":
								addComp.district=addComp.district+",";
								break;
							case "street":
								addComp.street=addComp.street+",";
								break;
							case "streetNumber":
								addComp.streetNumber=addComp.streetNumber;
								break;
							default:
								addComp[addkey] = "";
								break;
						}
					}
					var addr = addComp.province + addComp.city  + addComp.district + addComp.street + addComp.streetNumber
					fn(index, addr, pt)
				})
				setTimeout(geoSearch, 50);
			}
		}
		geoSearch()
	}


	/* mouse move feedback for task route */
	setTaskRoutePointViewStyle(task_id, rs_id, status) {
		if(task_id == undefined || rs_id == undefined) {
			return
		}
		var overlays = this.store_overlays.get(task_id)

		// create a hl label infor
		var style = this.def_label_style

		if(status == this.Highlight){
			style = Object.assign({}, this.def_label_style, {backgroundColor:'#E0FFFF',color:'black'})
		} else if(status == this.Active){
			style = Object.assign({}, this.def_label_style, {backgroundColor:'blue'})
		}

		overlays.markers.forEach(m => {
			if(rs_id == m.id && m.label) {
				m.label.setStyle(style)
			}
		})

	}
	highlightTaskRoutePoint(task_id, id, hl){
		var _task_id = this.active_task_id
		var _pt_id = this.active_point_id

		if(task_id != _task_id){
			return
		}
		if(_pt_id && _pt_id == id){
			return
		}

		this.setTaskRoutePointViewStyle(task_id, id, hl ? this.Highlight : this.Normal)
	}
	activeTaskRoutePoint(task_id, id){
		var _task_id = this.active_task_id
		var _pt_id = this.active_point_id

		if(task_id != _task_id){
			return
		}

		if(_pt_id) {
			this.setTaskRoutePointViewStyle(task_id, _pt_id, this.Normal)
			if(_pt_id == id) {
				/* toggle it */
				this.active_point_id = undefined
				return
			}
		}

		if(id) {
			this.setTaskRoutePointViewStyle(task_id, id, this.Active)
			this.active_point_id = id
		}
	}

	/* adjust layout */
	resizeDataTrayLayout(box, client, limit){
		var minH = window.innerHeight * limit.minHeight
		var maxH = window.innerHeight * limit.maxHeight

		box.style.height = maxH + 'px'
		client.style.height = (maxH - 10) + 'px'
	}
}