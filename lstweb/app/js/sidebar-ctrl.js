angular.module('myApp')
.controller('sidebarCtrl',['$scope','myConstant','appService',function($scope,myConstant,appService){
	/*console.log(myConstant.sidebarBarOpen);*/
	$scope.leftBarClose=function(){
		myConstant.sidebarBarOpen=false;
		appService.Close();
		/*console.log($("#main-right").css("padding-left"));*/
	}
	$scope.leftBarOpen=function(){
		myConstant.sidebarBarOpen=true;
		appService.Open();
		console.log("after:"+$("#main-right").css("padding-left"));
	}
}]);