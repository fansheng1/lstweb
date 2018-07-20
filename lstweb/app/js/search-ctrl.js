angular.module('myApp')

// inter-controller communication
.factory('factory_data', function() {
	var data = {
		task_id: ''
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

.controller('newSearchTaskCtrl', function($scope, $http, $location, factory_data, $interval,$stateParams,appService,$timeout,$state,RefreshManager) {
		RefreshManager.interval($interval, function() {
			if($scope.model){
				$scope.model.startTime = $("#start_time")[0].value
				$scope.model.endTime = $("#stop_time")[0].value
			}
		},200)
		$scope.$on('$destroy', function(){
			RefreshManager.cancel();
		})
	var task_id = factory_data.getter().task_id;
	task_id=$stateParams.searchid;
	var type=$stateParams.type;
	var imagesArray = []
	var parser = new SearchTaskModel();
	$scope.model = {};
	$scope.picMeta={};

	$scope.gotoBigMap = function() {
		var url = "Map.html";
		var task_id = $scope.model.task_id

		if (task_id.length > 0) {
			url += "?taskid=" + task_id;
		}

		window.open(url, "_blank"
		);
	}

	var meta_uploaded_image = {};
	var search_task_name = "";
	$scope.getSearchTask = function(task_id){
		$http({
			method: "get",
			url: "/controller/search/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$scope.model = parser.task2model(data)
			if(response.data.cam_group_id == "error"){
				$.LstTips("请确认逻辑组中子设备的数量是否为0",5000);
			}
			$scope.model = parser.task2model(data);
			search_task_name = $scope.model.task_name;
		});
	}
	$scope.uploadTaskPic = function(is_new_task) {
		var file_box = $('#_idFiles1')[0]
		if(file_box.files.length > 0) {
			$("#up").ajaxSubmit({
				success: function(data) {
					$scope.model = parser.uploadTaskPicModel(data, function(){
						$scope._addSearchTask(is_new_task)
					})
					_idFiles1.value = null
				}
			});
		} else {
			$scope._addSearchTask(is_new_task)
		}
	};

	$scope.updateSearchTask = function(bool){
		var task_id = $scope.model.task_id
		$scope.uploadTaskPic((task_id == undefined)?true:false);
	};
	$scope.deleteSearchPicture=function(url,$event){
		var uid = url.lastIndexOf('/')
		var file = url.substring(uid+1)
		if(file.length > 0){
			parser.removeFileFromTask(file)
		}
		$($event.target).parent().remove()
	};
	$scope._addSearchTask = function(is_new_task) {
		$scope.model.startTime = $('#start_time').val()
		$scope.model.endTime = $('#stop_time').val()
		if(compareDatetime($scope.model.startTime, $scope.model.endTime)>=0){
			return $.LstTips("任务开始时间大于或等于结束时间，请重新设置！")
		}
		var task_data = parser.setNewTaskData($scope.model, is_new_task);
		var url = (is_new_task) ? "/controller/search" :
			"/controller/search/"+task_data.task_id
		$http({
			method: is_new_task ? "post" : "put",
			url: url,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: task_data
		}).then(function(response) {
			if(response.data.reason){
				$.LstTips(response.data.reason,4000)
				return
			}
			var data = response.data;
			$scope.model = parser.newTaskResponseModel(data)
			if(is_new_task == false) {
				$scope.getSearchTask(data.task_id)
			}
		}, null);
	};


	$scope.startSearch = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/search/" + $scope.model.task_id + "/start",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$('#taskStatus').text(data.status ? "开始搜索中" : "失败" + ": "+data.reason);
		}, null);
	};

	$scope.stopSearch = function() {
		if ($scope.model.task_id == undefined) {
			return;
		}

		$http({
			method: "get",
			url: "/controller/search/" + $scope.model.task_id + "/stop",
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			$('#taskStatus').text(data.status ? "已停止检索" : "失败");
		}, null);
	};

	$scope.goSearchView=function(model){
		if(model.task_id){
			sessionStorage.setItem("search_task_name",search_task_name);
			$state.go('app.search.searchview', {searchid:model.task_id});
		}
	};

	$scope.showSearchPicture=function(object){
		$("#popup").css({"top":"30%","right":"20%"});
		appService.drag("popup");
		if(object==undefined){
			return
		}
		var posId = object.url.lastIndexOf('/')
		var photoId= object.url.substring(posId+1)
		if(photoId == undefined){
			return
		}
		$http({
			method: "get",
			url: "/controller/standard/photo/"+photoId,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response) {
			var data = response.data;
			if (data.status == undefined) {
				object.meta = data
				$scope.picMeta=object.meta
				$scope.picMeta.id=photoId
				$scope.picMeta.first = false
				$(".popup").css("display","block");
			}else{
				if(object && object.meta==undefined){
					object.meta = {}
				}
				$scope.picMeta=object.meta
				$scope.picMeta.id=photoId
				$scope.picMeta.first = true
				$(".popup").css("display","block");
			}
		}, function(resp){
			if(object && object.meta==undefined){
				object.meta = {}
			}
			$scope.picMeta=object.meta
			$scope.picMeta.id=photoId
			$scope.picMeta.first = true
			$(".popup").css("display","block");
		})
	}
	$scope.closeInfo=function(){
		$(".popup").css("display","none");
	}
	$scope.savePictureMeta=function(){
		$scope.picMeta.age = parseInt($scope.picMeta.age)
		var photo_meta = $scope.picMeta
		var method = "post"
		var request = "/controller/standard/photo"

		parser.updatePhotoMeta($scope.model, $scope.picMeta);
		if(photo_meta.first == false){
			method = "put"
			request += "/"+photo_meta.id
		}
		delete photo_meta.first

		$http({method: method, url: request,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			},
			data: photo_meta
		}).then(function(response) {
			var data = response.data;
			if (data.status ) {

			}
		})
		$(".popup").css("display","none");
	}
	$scope.conf={
		refresh: false
	}
	if (task_id && task_id.length > 10 && type=="info") {
		$scope.edit_status="编辑任务详情";
		$scope.getSearchTask(task_id)
	}else{
		$scope.conf.refresh =true
		$scope.edit_status="新建任务详情";
	}
})


.controller('searchTaskListCtrl', ['$scope', '$http', '$location', 'factory_data', 'i18nService',function($scope, $http, $location, factory_data, i18nService) {
		$scope.formatStatus = e => e == true ? '运行中' : '未运行'
		$scope.formatStatusClass = e => e == true ? 'coinGreenInline':'coinRedInline'

		i18nService.setCurrentLang("zh-cn");
		$scope.edit = entity => {
			window.location.href = '#/app/search/' + entity.task_id + '/info'
		}
		$scope.detail = entity => {
			sessionStorage.setItem("search_task_name",entity.task_name);
			window.location.href = '#/app/search/' + entity.task_id + '/view'
		}
		var parser = new SearchTaskModel();
		$scope.task_id_arr = [];

		$scope.gridOptions = {
			defaultClick: entity => $scope.detail(entity),
			LstPagination:true,
			paginationPageSizes: [10,20,30,50,75], //每页显示个数可选项
			paginationPageSize: 20, //
			paginationCurrentPage: 1,
			enableGridMenu: true,
			enablePagination: true,
			useExternalPagination: true,
			enableSorting: false,
			enableColumnMenus:false,
			columnDefs: [
				{field: 'task_name', displayName: '任务名称',cellTooltip:true},
				{field: 'running', displayName: '状态',cellTemplate:`
					<div class="ui-grid-cell-contents">
						<span class={{grid.appScope.formatStatusClass(row.entity.running)}}></span>{{grid.appScope.formatStatus(row.entity.running)}}
					</div>
				`},
				{field: 'create_time', displayName: '创建时间',cellTooltip:true},
				{field: 'task_desc', displayName: '说明',cellTooltip:true},
				{
					field: "操作",
					cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="detail-icon tasklist-action-btn" ng-click="grid.appScope.detail(row.entity);$event.stopPropagation()" title="查看"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.deleteSearchTask(row.entity.task_id);$event.stopPropagation()" title="删除"></i>
                        </div>
                    `
				}
			],
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
				//分页按钮事件
				gridApi.pagination.on.paginationChanged($scope,(new_page,page_size)=>{
					//清空全选
					gridApi.selection.clearSelectedRows();
					if(new_page==1 || new_page==parseInt($scope.gridOptions.totalItems/page_size)+1){
						$scope.getNumOfSearchs();
					}
					$scope.SearchTask(new_page,page_size);
				});
				//行选中事件
				gridApi.selection.on.rowSelectionChanged($scope,function(row){
					$scope.task_id_arr = [];
					var rows = $scope.gridApi.selection.getSelectedGridRows();
					rows.forEach((item)=>{
						$scope.task_id_arr.push(item.entity.task_id)
					});
				});
				//全选事件
				gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
					var selectionAll  =  $scope.gridApi.selection.getSelectAllState();
					//调用这个方法可以判断是否全选，返回正则类型
					if(!selectionAll){
						$scope.task_id_arr = [];
						var rows = $scope.gridApi.selection.getSelectedGridRows();
						rows.forEach((item)=>{
							$scope.task_id_arr.push(item.entity.task_id)
						})
					}else{
						$scope.task_id_arr = [];
					}
				});
			}
		}
		function getName() {
			$scope.taskName = $scope.taskName ? $scope.taskName :''
		}
		$scope.getNumOfSearchs = function(){
			getName();
			let url = '/controller/searchs/count'
			if($scope.taskName){
				url = '/controller/searchs/count?name=' + $scope.taskName
			}
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url
			}).then(function successCallback(response) {
				$scope.gridOptions.totalItems = response.data.count;
			}, function errorCallback(response) {
				// 请求失败执行代码
			});
		}

		$scope.SearchTask=function(current_page, page_size){
			$scope.gridOptions.paginationCurrentPage = current_page
			getName();
			let url = '/controller/searchs?page='+ current_page + "&pagesize=" + page_size
			if($scope.taskName){
				url = '/controller/searchs?name='+ $scope.taskName  + "&page="+ current_page + "&pagesize=" + page_size
			}
			$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				url
			}).then(function successCallback(response) {
				$scope.getNumOfSearchs()
				var data = response.data
				if(data.status != undefined && data.status == false){
					$.LstTips(data.reason)
					return
				}
				$scope.gridOptions.data =  parser.procTasks(response.data);
			}, function errorCallback(response) {
				// 请求失败执行代码
			});

		}
		$scope.getSearchList = () => {
			$scope.getNumOfSearchs()
			$scope.SearchTask(1,$scope.gridOptions.paginationPageSize)
		}

		$scope.getSearchList();

		//编辑操作
		$scope.editSearchTask = function(task_id, $event) {
			factory_data.setter({
				task_id: task_id
			});
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/search-new")
		}

		//查询操作
		$scope.viewSearchTaskInfo = function(task_id, $event) {
			factory_data.setter({
				task_id: task_id
			});
			if($event && $event.srcElement.tagName == 'INPUT' ){
				return
			}
			$location.path("/search-view")
		}

		$scope.removeTasks = function(){
			if($scope.task_id_arr == []){
				return
			}
			$scope.task_id_arr.forEach(function(e){
				//console.log("removed task ID: "+e)
				$scope.deleteSearchTask(e)
			})
		}

		$scope.deleteSearchTask = function(task_id) {
			if (task_id && task_id.length > 0) {
				$http({
					method: "delete",
					url: "/controller/search/" + task_id,
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					var data = response.data;
					if(data.status){
						$scope.SearchTask($scope.gridOptions.paginationCurrentPage, $scope.gridOptions.paginationPageSize)
					}
				});
			}
		}

		$scope.keyDown=function($event){
			if($event.keyCode==13){
				$scope.SearchTask(1,$scope.gridOptions.paginationPageSize)
			}
		}
	}])

.controller('viewSearchInfoCtrl', function($scope, $http, factory_data, $interval, DB, RefreshManager,$stateParams,appService){

	$scope.orderby = "ts-desc";
	$scope.checkout = (str,num) => { // 过滤 条件
		let arr = ["ts-asc","ts-desc"]
		$scope.orderby = $scope.orderby== str ? arr[num] : str;
		if ($scope.conf.refresh == false) {
			$scope.viewSearchResult($scope.orderby);
		}
	}
	var task_id = factory_data.getter().task_id;
	task_id = $stateParams.searchid;
	if(sessionStorage.getItem('search_task_name') !== null){
		$scope.task_name = "["+sessionStorage.getItem('search_task_name')+"]";
	}
	$scope.running = false
	$scope.getStatus = () => {
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/search/'+ task_id + '/status'
		}).then(function(res){
			$scope.running = res.data.running
		})
	}
	$scope.getStatus()
	$scope.haveimage = false;
	$scope.getType = () => {
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/search/'+ task_id + '/haveimage'
		}).then(function(res){
			$scope.haveimage = res.data.haveimage
		})
	}
	$scope.getType();
	var parser = new SearchTaskModel();
	var Pager = new PagerModel();
	var isRefresh = false;
	$scope.player = new FlashPlayer("rtspPlayer")


	$scope.goto = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo($scope.pager.page, $scope.pager.page_size);
		$scope.viewSearchResult()
	}
	$scope.gotoFirst = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo(1, $scope.pager.page_size);
		$scope.viewSearchResult()
	}
	$scope.gotoPrev = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerNext(false, $scope.pager.page_size);
		$scope.viewSearchResult()
	}
	$scope.gotoNext = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerNext(true, $scope.pager.page_size);
		$scope.viewSearchResult()
	}
	$scope.gotoTail = function(){
		if(isRefresh){
			return
		}
		Pager.setPagerTo(1000000, $scope.pager.page_size);
		$scope.viewSearchResult()
	}

	$scope.getNumOfViewSearchs = function(){
		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: '/controller/searchs/history/count/'+task_id
		}).then(function successCallback(response) {
			var data = response.data
			$scope.viewSearchResult()
			Pager.setPagerInfo(1, 7, data.count)
			$scope.pager = Pager.getPagerInfo()
			$scope.getStatus()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}

	$scope.getNumOfViewSearchs();

	var vlc2 = document.getElementById("vlc2");
	var inter;
	$scope.myClose=function(){    //   ////////////////////////////////////关闭模态框
		vlc2.src = "";
		if(vlc2 && vlc2.playlist){
			vlc2.playlist.stop();
			vlc2.playlist.items.clear();
		}
		$(".modals").css("display",'none');
		RefreshManager.cancel();
		clearInterval(inter);
		if($scope.conf.refresh == true){
			intervalFunc($scope.conf);
		}
	}
		function intervalFunc(confs) {
			let conf = confs
			var max_list_item = $scope.conf.max_list_item;
			$scope.conf.refresh = true;
			$(".active-img").css("display","block");
			$(".active-img-right").css("display","none");

			RefreshManager.interval($interval, function() {  // 定时器
				var request_url = "/controller/search/" + task_id + "/result?delta=0&page=1&pagesize=8&orderby=" + $scope.orderby
				/*if($scope.image_seqence && $scope.image_seqence.length > 0){
				 request_url += "&last_time="+$scope.image_seqence[0].ts
				 }*/

				$.ajax({
					url: request_url,
					type: "get",
					success: function(msg) {
						$scope.image_seqence = parser.procSearchResult(msg.results, $scope.conf)
						$scope.getStatus()
					}
				});
			}, conf.refresh_interval)
			isRefresh = true
		}

	$scope.playVideo=function(seq){   // //////////////////////////////////////////////////////////开启模态框
		//var vlc2
		vlc2 = document.getElementById("vlc2");
		$scope.myClose();
		$(".modals").css("display",'block');
		if(vlc2 && vlc2.playlist){
			vlc2.playlist.stop();
			vlc2.playlist.items.clear();
		}
		if(seq.cam_video_file_name == 'NVR'){
			$(".rtspVideo").css({"top":"30%","left":"30%"});
			$(".modals").css({"top":"25%","left":"30%","display":'none'});
			$(".modals").css({"top":"25%","left":"30%","display":'block'});
			appService.drag("modal-div");
			if(vlc2.input.state > 4 ){
				vlc2.playlist.stop();
				vlc2.playlist.items.clear();
			}
			var item_ids = vlc2.playlist.add(seq.cam_video_file);
			vlc2.playlist.playItem(item_ids);
		}else if(seq){
			$(".rtspVideo").css({"top":"30%","left":"30%"});
			$(".modals").css({"top":"25%","left":"30%","display":'none'});
			$(".modals").css({"top":"25%","left":"30%","display":'block'});
			appService.drag("modal-div");
			if(typeof(inter) == 'number'){
				console.log(inter)
				clearInterval(inter)
			}
			RefreshManager.cancel();
			RefreshManager.interval($interval, function() {
				$http({
					method: 'GET',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					url:'/controller/search/video/' + seq.id
				}).then(function (res){ // cam_video_file
					if(res.data.video_status){
						vlc2.src = res.data.cam_video_file;
						vlc2.playlist.stop();
						vlc2.playlist.items.clear();
						var item_ids = vlc2.playlist.add(res.data.cam_video_file);
						vlc2.playlist.playItem(item_ids);
						vlc2.playlist.play();
						inter = setInterval(function(){
							$(".modals").css({"display":'none'});
							$(".modals").css({"display":'block'});
							console.log(vlc2.input.state)
							if(vlc2.input.state > 4){
								vlc2.src = res.data.cam_video_file;
								vlc2.playlist.stop();
								vlc2.playlist.items.clear();
								var item_ids = vlc2.playlist.add(res.data.cam_video_file);
								vlc2.playlist.playItem(item_ids);
								vlc2.playlist.play();
								console.log(vlc2.input.state)
							}else if(vlc2.input.state == 3){
								console.log(vlc2.input.state)
								clearInterval(inter)
							}
						},3000)
						RefreshManager.cancel(); //
						$scope.showImg = false
					}else{
						$scope.showImg = true
					}
				},function(){
					$.LstTips('获取视频失败');
				})
			}, 3000)
		}

	}
		$scope.$on('$destroy',function(){
			sessionStorage.removeItem("search_task_name");
			if(typeof(inter) == 'number'){
				clearInterval(inter);
			}
		})
		$scope.fp_play = function(){ $scope.player.play() }
	$scope.fp_pause = function(){ $scope.player.pause() }
	$scope.fp_continue = function(){ $scope.player.continue() }
	$scope.fp_stop = function(){ $scope.player.stop() }
	$scope.fp_setSlide = function(){ $scope.player.setSlide() }
	$scope.fp_alertTotalTime = function(){ $scope.player.alertTotalTime() }

	$scope.viewSearchResult=function(str){ // http://10.10.92.233/controller/search/history/{id}/result?delta=0&page=1&pagesize8&orderby=
		$scope.orderby = str||"ts-desc";
		var request_url = '/controller/search/history/'+task_id +'/result'+'?' + Pager.getPagerParams($scope.orderby)

		$http({
			method: 'GET',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			url: request_url
		}).then(function successCallback(response) {
			var data = response.data
			if(data.status != undefined && data.status == false){
				console.log(data.reason)
				return
			}
			//$scope.image_seqence = parser.procSearchResultHistory(data.results,$scope.conf)
			$scope.image_seqence = parser.viewProcTasks(data.results,$scope.conf)
			$scope.pager = Pager.getPagerInfo()
		}, function errorCallback(response) {
			// 请求失败执行代码
		});
	}
	$scope.conf = {
		max_list_item: 8,
		refresh: false,
		refresh_interval: 1000,
		refersh_timer: null
	}
	$scope.visible=false;
	if($scope.visible){
		$scope.visible=true;
	}

	$scope.download = function (cid, ts) {
		$http({
			method: "post",
			url: "/controller/search/download/" + cid + "/" + ts + "/" + task_id,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'Accept': 'application/json; charset=utf-8'
			}
		}).then(function(response){
			var data = response.data;
			if(data.status){
			 console.log("下载成功")
			 } else {
			 console.log("下载失败")
			 }
			$('#taskStatus').text(data.status ? "下载成功" : "失败" + ": "+data.reason);
		});
	}

	$scope.toggleRefreshSearchResult = function(intv) {
		if (intv != undefined && intv >= 1000) {
			$scope.conf.refresh_interval = intv
		}
		if(task_id == undefined){
			return
		}
		if ($scope.conf.refresh == false) {
			intervalFunc($scope.conf);
		} else {
			RefreshManager.cancel();
			isRefresh = false
			$scope.conf.refresh = false;
			$(".active-img").css("display","none");
			$(".active-img-right").css("display","block");
			$scope.getNumOfViewSearchs();
		}
	}

	$scope.$on('$destroy', function(){
		RefreshManager.cancel()
		$scope.conf.refresh = false
	})

	$scope.toggleRefreshSearchResult();
})



