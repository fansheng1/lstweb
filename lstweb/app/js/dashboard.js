angular.module('myApp')
.directive('div1',function(){
	return{
		restrict:'E',
		templateUrl:'temp/theme/top-nav.html'
	};
})
.directive('div2',function(){
	return{
		restrict:'E',
		templateUrl:'cont_center',
	};
})
.directive('div3',function(){
	return{
		restrict:'E',
		templateUrl:'cont',
	};
})

.controller('sysStatCtrl', function($scope, $http) {
	var parser = new CameraModel()

	$http({method: 'GET', url: '/controller/systemSketchs', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		$scope.systemSketchs = data
		$scope.systemSketchs.forEach((systemSketch)=>{
				systemSketch.up_to_time = parser.convertToReadableTime(systemSketch.up_to_time)
		})
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$scope.model = {sysconf:[], sysconf2:[]}

	$http({method: 'GET', url: '/controller/sysconf/all', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		$scope.model.sysconf2 = data
	}, function errorCallback(response) {
		// 请求失败执行代码
	});


	$http({method: 'GET', url: '/controller/cameras/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:0, name:"系统注册摄像机数量",total:data.count}
		$scope.model.sysconf.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$http({method: 'GET', url: '/controller/cameragroups/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:1, name:"摄像机配置分组",total:data.count}
		$scope.model.sysconf.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$http({method: 'GET', url: '/controller/users/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:2, name:"系统用户/角色",total:data.count}
		$scope.model.sysconf.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
	$http({method: 'GET', url: '/controller/roles/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:3, name:"系统用户分组",total:data.count}
		$scope.model.sysconf.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
    /*任务使用情况摘要*/
    $scope.model1 = {tasks:[]}

	$http({method: 'GET', url: '/controller/captures/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:0, name:"采集任务",total:data.count}
		$scope.model1.tasks.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
	
	$http({method: 'GET', url: '/controller/monitors/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:1, name:"布控任务",total:data.count}
		$scope.model1.tasks.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$http({method: 'GET', url: '/controller/searchs/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:2, name:"搜索任务",total:data.count}
		$scope.model1.tasks.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});

	$http({method: 'GET', url: '/controller/camappgroups/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:3, name:"业务逻辑分组",total:data.count}
		$scope.model1.tasks.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
	$http({method: 'GET', url: '/controller/timeSearch/count', headers: {'Content-Type':'application/json; charset=utf-8'}})
	.then(function successCallback(response) {
		var data = response.data
		var task = {order:4, name:"以时间/地点条件搜索",total:data.count}
		$scope.model1.tasks.push(task)
	}, function errorCallback(response) {
		// 请求失败执行代码
	});
})

.controller('statCtrl', function($scope, $http) {
	
})

