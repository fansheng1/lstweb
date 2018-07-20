angular.module('myApp',['ui.router','logModule','logDetailModule','ngSanitize','app.services','alarmModule','cameraListModule','configGroupModule'])
/*.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
})*/
.run(function($rootScope, $state, $stateParams,myConstant,appService,$location) {
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
	$rootScope.$on('$viewContentLoaded', function(){
		/*console.log("执行一次"+myConstant.sidebarBarOpen);*/
		if(myConstant.sidebarBarOpen){
			appService.Open();
		}else{
			appService.Close();
		}
	});
	/*菜单选中样式*/
	$rootScope.$on('$locationChangeSuccess', function(e) {
		e.preventDefault();
		var url1=window.location.href.replace(/.*index\.html#\//,''),
			type=url1.replace(/\/.*/,'');
			index=0,
			appTabsIndex=0,
			devTabsIndex=0,
			settingTabsIndex=0;
			
		switch(type){
			case 'dashboard':
				index=0;
				break;
			case 'app':
				index=1;
				/*console.log(url1);*/
				var  appTabsType=url1.replace(type+'/','');
				appTabsType=appTabsType.replace(/\/.*/,'');
				/*console.log(appTabsType);*/
				switch(appTabsType){
					case 'view':
						appTabsIndex=0;
						break;
					case 'capture':
						appTabsIndex=1;
						break
					case 'monitor':
						appTabsIndex=2;
						break;
					case 'search':
						appTabsIndex=3;
						break;
					case 'track':
						appTabsIndex=4;
						break
					case 'timeline':
						appTabsIndex=5;
						break;
					case 'logicgroup':
						appTabsIndex=6;
						break;
                    case 'monitorManage':
                        appTabsIndex=7;
                        break;
					default:
						appTabsIndex=0;
						break;
					}
				break;
			case 'dev':
				index=2;
				var  devTabsType=url1.replace(type+'/','');
				devTabsType=devTabsType.replace(/\/.*/,'');
				switch(devTabsType){
					case 'camera':
						devTabsIndex=0;
						break;
					case 'cameragroups':
						devTabsIndex=1;
						break;
					case 'camerastorage':
						devTabsIndex=2;
						break;
					default:
						devTabsIndex=0;
						break;
					}
				break;
			case 'setting':
				index=3;
				var  settingTabsType=url1.replace(type+'/','');
				settingTabsType=settingTabsType.replace(/\/.*/,'');
				switch(settingTabsType){
					case 'user':
						settingTabsIndex=0;
						break;
					case 'role':
						settingTabsIndex=1;
						break;
					case 'logmanage':
						settingTabsIndex=2;
						break;
					case 'alarm':
						settingTabsIndex=3;
						break;
					case 'clusterstorage':
						settingTabsIndex=4;
						break;
					default:
						settingTabsIndex=0;
						break;
					}
				break;
			default:
				index=0;
				break;
		}
		$rootScope.selecteIndex=index;
		$rootScope.appTabsIndex=appTabsIndex;
		$rootScope.devTabsIndex=devTabsIndex;
		$rootScope.settingTabsIndex=settingTabsIndex;
		//判断用户是否登录
		var un = document.getElementById("topUserName");
		if(un == undefined) {
			return
		}

		if(sessionStorage.user == undefined) {
			un.innerText = "未登录";
		} else {
			var user = JSON.parse(sessionStorage.user);
			un.innerText = user.name
		}
		//判断用户是否登录 End
	});
})
/* 左侧导航初始化 */
.constant('myConstant',{"sidebarBarOpen":true})
.config(['$locationProvider', function($locationProvider) {
	$locationProvider.hashPrefix('')
}])

.config(function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise('/dashboard');
})
/* 头部左侧报警信息的隐藏与显示 */
.controller("toggleCtrl",['$scope',function($scope){
	$scope.toggleFun=function(){
		var toggleDiv=$("#toggle-div");
		if(toggleDiv.css('display')=="none"){
			toggleDiv.css({'display':'block'});
		}else{
			toggleDiv.css({'display':'none'});
		}
		
	}
}])
/*.directive("autoExtend", function($window){
	return {
		link: function(scope, element, attrs){
			function autoExtend(){
				var parent = element.parent()[0]
				var m = parent.children
				var width = 0;

				for(var i=0; i < m.length; i++) {
					var e = m[i]
					if(e != element[0]) {
						width = e.scrollWidth
					}
				}

				var ref_height = parent.clientHeight
				var ref_width = parent.clientWidth
				var ref_node = null

				if(attrs.refHeight){
					ref_node = document.getElementById(attrs.refHeight)
					ref_height = ref_node.clientHeight
				}
				if(attrs.refWidth){
					ref_node  = document.getElementById(attrs.refWidth)
					ref_width = ref_node.clientWidth
				}

				element.css("float", "right")
				element.css("display", "inline-block")
				element.css("width", (ref_width - width) +"px")
				element.css("height", ref_height+"px")
			}

			autoExtend()

			angular.element($window).bind('resize',function(){
				autoExtend()
				scope.$apply()
			})
		}
	}
})*/
.controller('myAppCtrl', ['$scope','$document','$interval', function($scope,$document,$interval) {
	var stompClient = null;
	var chan_alarm = "";
	var subscriber_chan_alarm = null;
	var user_id=JSON.parse(sessionStorage.user).user_id;
	var audio=$document[0].getElementById("audio");
	$scope.btnGroup={audioBtn:true,alarmBtn:true};
	function on_alarm(data){
		/*console.log("内容："+data.body);*/
		$("#no-alarm").css("display","none");
		$("#alarm-come").css("display","block");
		if($scope.btnGroup.audioBtn){
			audio.play();
		}else{
			audio.pause();
		}
	}
	$scope.audioBtnFun=function(){
		console.log("$scope.btnGroup.audioBtn:"+$scope.btnGroup.audioBtn);
		if($scope.btnGroup.audioBtn){
			console.log("打开声音");
		} else {
			audio.pause();
			console.log("关闭声音");
		}
	};

	$scope.alarmBtnFun=function(){
		if($scope.btnGroup.alarmBtn){
			console.log("打开告警通道");
			if(stompClient) {
				subscriber_chan_alarm = stompClient.subscribe(chan_alarm, function (data){
					/*console.log("内容："+data.body);*/
					$("#no-alarm").css("display","none");
					$("#alarm-come").css("display","block");
					if($scope.btnGroup.audioBtn){
						audio.play();
					}else{
						audio.pause();
					}
				})
			}
		} else {
			if(stompClient) {
				subscriber_chan_alarm.unsubscribe()
			}
			$scope.closeAduio();
			console.log("关闭告警通道");
		}
	}
	function connect() {
		var socket = new SockJS('/controller/websocket');
		stompClient = Stomp.over(socket);
		stompClient.connect({}, function(frame) {
			console.log("连接成功！！！");
			var user_id=JSON.parse(sessionStorage.user).user_id;
			console.log("user_id:"+user_id);
			if(user_id== undefined){

			}else{
				chan_alarm = '/topic/'+user_id
				if(subscriber_chan_alarm){
					subscriber_chan_alarm.unsubscribe();
                }
				if($scope.btnGroup.alarmBtn){
                    subscriber_chan_alarm = stompClient.subscribe(chan_alarm, function (data){
						/*console.log("内容："+data.body);*/
						$("#no-alarm").css("display","none");
						$("#alarm-come").css("display","block");
                        if($scope.btnGroup.audioBtn){
							audio.play();
						}else{
							audio.pause();
						}
					});
				}
			}
		},function(){
			console.log("重新连接")
            connect();
		});
	}
	$scope.closeAduio=function(){
		console.log("关闭声音");
		$("#no-alarm").css("display","block");
		$("#alarm-come").css("display","none");
		audio.pause();
	}
	function disconnect() {
		if (stompClient != null) {
			stompClient.disconnect();
		}
		console.log("Disconnected");
	}

	connect();
}])
//终端管理页面标题栏点击跟换背景颜色
.controller('active', ['$scope', function($scope) {
	$scope.isActive = function(i) {
		$scope.i = i;
	};
	$scope.i = 1;
}])

.controller('cameraGroupList', function($scope, $http, $stateParams) {
	var group_id=$stateParams.groupid;
	$scope.groupSearch = "";
	//$scope.names=['carol','runnoob','taobao'];
	$http({
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		url: '/controller/cameragroups?filter=list?page=0&pagesize=1000'
	}).then(function successCallback(response) {
		$scope.cameragroups = response.data;
		$scope.cameragroups = $scope.cameragroups.filter((cameragroup)=>{
			return group_id==cameragroup.id ? false : true
		});
		$scope.groupList = $scope.cameragroups;
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
})

.controller('cameraList', function($scope, $http) {
	var excludeCameraList = null;
	var cameraList = null;
	var filtered = false;

	$http({
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		//url: '/controller/cameras?filter=list&page=1&pagesize=10000'
		url: '/controller/allcameras'
	}).then(function successCallback(response) {
		cameraList = response.data;
		var c = $scope.uniqCameraList(excludeCameraList);
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
	$scope.uniqCameraList = function(filterCameras){
		if(cameraList == undefined){
			excludeCameraList = filterCameras;
			return false
		}
		if(filterCameras == undefined){
			$scope.cameras = cameraList;
			return false
		}
		$scope.cameras = cameraList.filter((c, index)=>{
			var len = filterCameras.length;
			var inFilter = false;
			for(var i=0; i<len; i++){
				if(filterCameras[i].id == c.cid){
					inFilter = true
				}
			}
			return !inFilter
		})
	}
})

// CameraGroup List component
.controller('camappGroupList', function($scope, $http, $stateParams) {
	var group_id=$stateParams.logicgroupid;
	$http({
		method: 'GET',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		url: '/controller/camappgroups?filter=list?page=1&pagesize=10000'
	}).then(function successCallback(response) {
		$scope.camappGroups = response.data;
		$scope.camappGroups = $scope.camappGroups.filter((camappGroup)=>{
			return group_id==camappGroup.id ? false : true
		});
		$scope.groupList = $scope.camappGroups;
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
})

.factory('DB', function() {
	var data = {
		task_id: '',
		enable_refresh:false,
		refresh_timers: [],
		timer: null,
		interval_service: null
	}
	return {
		getter: function() {
			return data
		},
		setter: function(s) {
			data = s
		}
	}
})

.service('RefreshManager', function(DB) {
	this.interval = function(interval_service, fn, timeout_value) {
		var data = DB.getter()

		if(data.interval_service){
			data.interval_service.cancel(data.timer)
			console.log("Cancel timer...")
		}

		data.interval_service = interval_service
		data.timer = interval_service(fn, timeout_value)
	}

	this.cancel = function() {
		var data = DB.getter()
		var interval_service = data.interval_service
		var refersh_timer = data.timer
		if(interval_service != null){
			interval_service.cancel(refersh_timer)
		}

		data.interval_service = null
		data.timer = null
	}
})