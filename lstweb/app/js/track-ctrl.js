angular.module("myApp")

.controller("funcTrackCtrl", ['$scope', '$http', '$state', '$window',function($scope, $http,$state,$window){
	var bump = new FuncTrack()
	var proc = new TrackModel()
	$scope.model = {}

	bump.loadMap(location.search)

	var Pager = new PagerModel();
	$scope.pager = Pager.getPagerInfo();
	$scope.goto = function(){
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size);
		$scope.activeTaskInfo($scope.task);
	};
	$scope.gotoFirst = function(){
		Pager.setPagerTo(1, $scope.pager.page_size);
		$scope.activeTaskInfo($scope.task);
	};
	$scope.gotoPrev = function(){
		Pager.setPagerNext(false, $scope.pager.page_size);
		$scope.activeTaskInfo($scope.task);
	};
	$scope.gotoNext = function(){
		Pager.setPagerNext(true, $scope.pager.page_size);
		$scope.activeTaskInfo($scope.task);
	};
	$scope.gotoTail = function(){
		Pager.setPagerTo(1000000, $scope.pager.page_size);
		$scope.activeTaskInfo($scope.task);
	};


	$scope.getSearchTaskList = function() {
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/searchs/track?filter=list&page=0&pagesize=1000'
		}).then(function successCallback(response) {
			if(response.data.status == false){
				$scope.searchs = [];
				$.LstTips(response.data.reason);
				return
			}
			$scope.searchs = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}

	$scope.addSearchTask = function() {
		$scope.loadTaskQueryResult($scope.model.task_id)
	}

	$scope.loadTaskData = function(task_ids){
		var task_id = task_ids
		if(task_ids == undefined) {
			return
		}
		if(task_ids instanceof Array){
			if(task_ids.length > 0) {
				task_id = task_ids[0]
			} else {
				return
			}
		}

		$http({
			method: "get",
			url: "/controller/search/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.model_task = proc.convertTaskMeta(data)
		})
	}

	$scope.loadTaskQueryResult = function(task_ids){
		var task_id = task_ids
		if(task_ids instanceof Array){
			if(task_ids.length > 0) { task_id = task_ids[0] }
			else { return }
		}

		$http({
			method: "get",
			url: "/controller/track/" + task_id+"?filter=all",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response){
			var results = proc.convertTaskResult($scope.model_task_result, response.data)
			bump.showPositionLayer(results)
			$scope.model_task_result = results;

			if(results && results.tasks && results.tasks.length) {
				if (results.tasks[0].results.length > 0) {
					var r1 = results.tasks[0].results[0].pos;
					bump.setCenter(r1.lng, r1.lat)
				}
			}
		},function(res){

		});
	}

	$scope.hlTaskInfo = function(task_id, hl){
		bump.highlightTaskInfo(task_id, hl)
	}

	$scope.activeTaskInfo = function(task, $event){
		if(!$scope.task || $scope.task.task_id!==task.task_id){
			$scope.task = task;
			$scope.task_length = task.length;
			Pager.setPagerInfo($scope.pager.page, 12, $scope.task_length);
		}
		$http({
			method: "get",
			url: "/controller/track/" + task.task_id + "/result?filter=all&"+ Pager.getPagerParams(),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function (response) {
			$scope.current_task = response.data;
			$scope.current_task.task_id = task.task_id;
			$scope.current_task.task_name = task.task_name;
			$scope.pager = Pager.getPagerInfo();

			bump.activeTaskInfo(task.task_id);
			bump.getLocationForTaskResults(response.data, (rs_index, addr, pt)=>{
				//console.log("task[ '"+task.task_id+"' ] parse ok: (lng: "+pt.lng +", lat: "+pt.lat+") "+addr)
				$scope.current_task[rs_index].addr = addr;
				$scope.$digest()
			});
			$("table[name='pannel']").each(function(){
				$(this).hide()
			})
			$('#taskList').hide()
			$('#taskRouteList').show();
		}, function (res) {

		});
		// switch data tray
		/* DECODE geo location of route point */
	}


	$scope.hlTaskRoutePoint = function(task_id, rs_id, hl){
		bump.highlightTaskRoutePoint(task_id, rs_id, hl)
		$scope.movePicture()
	}
	$scope.activeTaskRoutePoint = function(task_id, rs_id, task_name){
		bump.activeTaskRoutePoint(task_id, rs_id);
		sessionStorage.setItem('search_task_name',task_name);
		$state.go('app.search.searchview',{searchid: task_id})
	}

	$scope.showTaskList = function(){
		Pager.setPagerInfo(1, 12, $scope.task_length);
		$("table[name='pannel']").each(function(){
			$(this).hide()
		})
		$("#taskRouteList").hide();
		$('#taskList').show()
	}
	$scope.showTaskMeta = function(task_id,$event){
		$event.stopPropagation();
		$("table[name='pannel']").each(function(){
			$(this).hide()
		})
		$('#taskList').hide()
		$('#taskMeta').show()

		$scope.model_task_result.tasks.forEach(task => {
			if(task.task_id == task_id) {
				$scope.current_task = task
				return false
			}
		})
	}

	$scope.togglePhotoList = function(){
		var list = $("#id_photo_gallery")
		if(list.css("display") == "none"){
			list.css("display", "block")
		} else {
			list.css("display", "none")
		}
	}
	$scope.toggleTaskSearchBar = function(){
		var list = $("#id_search_bar")
		if(list.css("display") == "none"){
			list.css("display", "block")
		} else {
			list.css("display", "none")
		}
	}

	$scope.movePicture = function(dir){
		var task =	$scope.current_task
		if(task == undefined){
			return
		}
		var len_results = $scope.current_task.length
		var max_size = 8

		var photo_container = document.getElementById("photo_container");
		if(photo_container.offsetWidth > 74*8+35){
			max_size = 8
		}else if(photo_container.offsetWidth > 74*7+50){
			max_size = 7
		}else if(photo_container.offsetWidth > 74*6+35){
			max_size = 6
		}else if(photo_container.offsetWidth > 74*5+35){
			max_size = 5
		}else{
			max_size = 4
		}

		if($scope.index == undefined){
			$scope.index = 0
		}
		if(dir == 0){
			$scope.index--
			if($scope.index < 0){
				$scope.index = 0
				$scope.gotoPrev();
			}
		} else if(dir == 1){
			$scope.index++
			if($scope.index + max_size > len_results){
				//$scope.index--
				$scope.index = 0
				$scope.gotoNext();
			}
		}
		$scope.current_results = $scope.current_task.slice($scope.index, $scope.index+max_size)
	}
	$scope.windowOnLoad = function(){
		$("table[name='pannel']").each(function(){
			$(this).hide()
		})
		$("#taskRouteList").hide();
		$('#taskList').show()
		resizeViewLayout()
	}

	function resizeViewLayout(e){
		/*var h = $window.innerHeight
		var w = $window.innerWidth

		$('#allmap').css('height', h+'px')
		$('#allmap').css('width', w+'px')*/
		$('#allmap').css({"width":"100%","height":"100%"});
		$scope.$digest()

		var jbox = $('.major-data-tray-box')
		var jcont = $('.major-data-tray')
		/*bump.resizeDataTrayLayout(jbox.get(0), jcont.get(0), {
			minHeight: 0.3, maxHeight: 0.7
		})*/
	}
	angular.element($window).bind('resize',resizeViewLayout)
	angular.element($window).bind('load', $scope.windowOnLoad)

	$("table[name='pannel']").each(function(){
		$(this).hide()
	})
	$("#taskRouteList").hide();
	$('#taskList').show()

	$scope.loadTaskData(bump.getTaskList())
	//$scope.loadTaskQueryResult(bump.getTaskList())
	$scope.getSearchTaskList()
}])

