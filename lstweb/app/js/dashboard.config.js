angular.module('myApp')

.config(function($stateProvider, $urlRouterProvider){
	
	$stateProvider
		.state('dashboard',{
			url:'/dashboard',
			views:{
				'':{
					templateUrl:'pages/frm/main-top-bottom.html'
				},
				'topbar@dashboard':{
					templateUrl:'pages/nav-topbar.html'
				},
				'bottom@dashboard':{
					controller:'sysStatCtrl',
					templateUrl:'pages/dashboard/dashboard.html'
				}
			}
		})
})