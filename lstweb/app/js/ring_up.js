angular.module('myApp', ['ngRoute'])

.directive('div1', function() {
	return {
		restrict: 'E',
		templateUrl: 'enter',
	};
})

//登录路由界面
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/map', {
			templateUrl: ''
		})
}])

.controller('loginCtrl', function($scope, $http) {

	$scope.login = function() {
		var user_name = $("#user_name").val();
		var u_passwd = $("#u_passwd").val()
		$http({
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/login/user/' + user_name,
			data: {
				user_name: user_name,
				u_passwd: u_passwd
			}
		}).then(function successCallback(response) {
			$scope.modle = response.data;
			if ($scope.modle.status == true) {
				sessionStorage.user = JSON.stringify(response.data)
				//window.location.href = "dashboard.html"
				window.location.href = "index.html#/dashboard"
			} else {
				window.location.href = "login.html"
			}
		}, function errorCallback(response) {

		});
	}

	$scope.keyDown = function($event){
		if($event.keyCode==13){
			$scope.login();
		}
	}

})

.controller('cityListCtrl', function($scope, $http) {
})

