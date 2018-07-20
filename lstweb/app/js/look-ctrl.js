angular.module('myApp')

.factory('factory_data', function() {
/*
	var data = {
		cid: ''
	}
*/
	var data = {}
	return {
		getter: function() {
			return data
		},
		setter: function(s) {
			data = s
		}
	}
})

.controller('lookctrl', function($scope, $http, $interval, factory_data, RefreshManager,$state) {
	/* 检查是否为UC浏览器 */
	var IsUC=function(){
		if(navigator.userAgent.indexOf('UBrowser') != -1) {
		    //是uc浏览器
		    $scope.isUC=true;
		}else{
			$scope.isUC=false;
		}
	}
	IsUC();
	/* 检查是否为UC浏览器 end */
	
	/* 实时采集图片 图标刷新部分 */
	$scope.showPicInfo= () =>{
		$("#pic-info").css({"display":"block"});
		$scope.picInfo = $scope.conf.refresh?"停止刷新":"开启刷新";
	}
	$scope.hiddenPicInfo=() => $("#pic-info").css({"display":"none"});
	/* 实时采集图片 图标刷新部分 end */
	var Pager = new PagerModel()
	$scope.conf
	$scope.search_mode = false
	$scope.search_key = ""

	$scope.$on('$destroy', function(){
		RefreshManager.cancel()
		$scope.conf.refresh = false
	})

	$scope.keyDown=($event)=>{
		if($event.keyCode==13){
			$scope.searchCameraByName();
		}
	}
	$scope.camActive=function(camera){
		$(".look-left-ul a").on('click',function(){
			$(".look-left-ul a").removeClass('camActive');
			$(this).addClass('camActive');
		});
		$("[class='div-left-video current-video']").css("display","none");
		$("[class='div-left-video current-video']").css("display","block");
		$scope.camera = camera
		var vlc = document.getElementById("vlc")
		var log = document.getElementById("log")

		log.value = vlc.versionInfo()
		log.value += "\nplay stream URL: "+camera.stream

		vlc.playlist.stop()
		vlc.playlist.items.clear()
		var item_id = vlc.playlist.add(camera.stream, "live",':network-caching=350')
		log.value += "\nPlaying item #"+item_id
		vlc.playlist.playItem(item_id)
	}
	$scope.getCameraList = () => {
			"use strict";
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url: '/controller/cameras/cameraNames'
			}).then(function successCallback(response) {
				$scope.cameras = response.data;
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}
	$scope.getCameraList();
	$scope.cameraList=function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/cameras?filter=list' + '&' + 'page=1&pagesize=10000'
		}).then(function successCallback(response) {
			$scope.cameras = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.searchCameraByName = function() {
		var c_name = $("#c_name").val()
		if(!c_name) {
			$scope.getCameraList();
			return;
		}
		$scope.search_mode = true
		$scope.search_key = c_name

		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/cameras/nameList/' + c_name
		}).then(function successCallback(response) {
			$scope.cameras = response.data;
		}, function errorCallback(response) {
			// 请求失败执行代码
		});		
	}	

	$scope.conf = {
		max_list_item: 9,
		refresh: false,
		refresh_interval: 1000,
		refersh_timer: null
	}
	var parser = new MonitorTaskModel()
	var parser1 = new CaptureTaskModel();

	$scope.toggleRefreshLookResult = function(interval) {
		var conf = $scope.conf
		if (conf.refresh == false){
		$scope.conf.refresh = true
		RefreshManager.interval($interval, function() {
			$.ajax({
				url: "/controller/monitors/result",
				type: "get",
				success: function(msg) {
					$scope.image_seqence_monitor = parser.procMonitorResult(msg, $scope.conf)
					factory_data.setter($scope.image_seqence_monitor);
				}
			});
			$.ajax({
				url: "/controller/captures/result"+"?delta=30",
				type: "get",
				success: function(msg) {
					if(msg.status == false){
						return
					}
					$scope.image_seqence_capture = parser1.procCaptureResult(msg, $scope.conf)
					$scope.image_seqence_capture = $.uniqKeys($scope.image_seqence_capture,"id"); // 去重
					if(Array.isArray($scope.image_seqence_capture) && $scope.image_seqence_capture.length > 5){ //美化
						$scope.image_seqence_capture.length = 5
					}
				}
			});
		}, conf.refresh_interval);
		}else{
			RefreshManager.cancel()
			$scope.conf.refresh = false
		}
	}
	$scope.toggleRefreshLookResult();

/*
	$scope.goCaptureView=function(id){
		$state.go('app.capture.captureview', {captureid:id, info:'view'})
	}
*/
	$scope.goMonitorView = function(monitorInfo){
		factory_data.setter(monitorInfo);
		sessionStorage.setItem("monitor_task_name", monitorInfo.task_name)
		$state.go('app.monitor.monitorview',{monitorid:monitorInfo.task_id})
	}
})
