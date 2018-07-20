class stroageModel{
    constructor(){

    }
    cameraFileCount(data){
        if(data.length == 0){
            return data
        }
        data.forEach((cam)=>{
            if(cam.camera_stat.disk_alloc){
                cam.camera_stat.file_size_used = Math.floor(parseFloat(cam.camera_stat.disk_alloc)/parseFloat(cam.camera_stat.disk_total)*10000)/100 + "%";
            }else{
                cam.camera_stat.file_size_used = 0+"%";
            }
        });
        return data
    }
    clusterFileCount(data){
        if(data.length == 0){
            return data
        }
        data.forEach((cam)=>{
            cam.cluster_stat.file_size_used = 'n/a';
        });
        return data
    }
    fileTasksResult(data){
        var result_data = {};
        var file_face = data.file_face ? data.file_face : 0;
        var file_size_face = data.file_size_face ? data.file_size_face : 0;
        var file_size_other = data.file_size_total - (data.file_size_video + data.file_size_scene + file_size_face);
        result_data = {
            camera: data.camera,
            disk_total: data.disk_total,
            disk_alloc:data.disk_alloc,
            disk_use: data.disk_alloc,
            disk_not_used: data.disk_total - data.disk_alloc,
            file_total: data.file_total,
            file_video: data.file_video,
            file_scene: data.file_scene,
            file_face: file_face,
            file_size_total: data.file_size_total,
            file_size_scene: Math.round((data.file_size_scene/data.file_size_total)*10000)/100,  //转为百分比，保留小数点后两位
            file_size_video: Math.round((data.file_size_video/data.file_size_total)*10000)/100,
            file_size_face: Math.round((file_size_face/data.file_size_total)*10000)/100,
            file_size_other: Math.round((file_size_other/data.file_size_total)*10000)/100
        };
        for(var key in result_data){
            if(isNaN(result_data[key]) && result_data[key]!==data.camera){
                result_data[key] = 0;
            }
        }
        return result_data;
    }
    clusterFileResult(data){
        var result_data = {};
        var file_other = data.file_total - (data.file_video + data.file_scene + data.file_face);
        var file_size_other = data.file_size_total - (data.file_size_video + data.file_size_scene + data.file_size_face);
        result_data = {
            file_total: data.file_total,
            file_video: data.file_video,
            file_scene: data.file_scene,
            file_extlib: data.file_extlib,
            file_face: data.file_face,
            file_monitor: data.file_monitor,
            file_search: data.file_search,
            file_other: file_other,
            file_size_total: data.file_size_total,
            file_size_scene: Math.round((data.file_size_scene/data.file_size_total)*10000)/100,
            file_size_video: Math.round((data.file_size_video/data.file_size_total)*10000)/100,
            file_size_face: Math.round((data.file_size_face/data.file_size_total)*10000)/100,
            file_size_other: Math.round((file_size_other/data.file_size_total)*10000)/100
        };
        for(var key in result_data){
            if(isNaN(result_data[key])){
                result_data[key] = 0;
            }
        }
        return result_data;
    }
    clusterCamFile(data){
        var result_data = {};
        var file_other = data.file_total - (data.file_video + data.file_scene + data.file_face);
        var file_size_other = data.file_size_total - (data.file_size_video + data.file_size_scene + data.file_size_face);
        result_data = {
            camera: data.camera,
            file_total: data.file_total,
            file_video: data.file_video,
            file_scene: data.file_scene,
            file_face: data.file_face,
            file_other: file_other,
            file_size_total: data.file_size_total,
            file_size_scene: Math.round((data.file_size_scene/data.file_size_total)*10000)/100,  //转为百分比，保留小数点后两位
            file_size_video: Math.round((data.file_size_video/data.file_size_total)*10000)/100,
            file_size_face: Math.round((data.file_size_face/data.file_size_total)*10000)/100,
            file_size_other: Math.round((file_size_other/data.file_size_total)*10000)/100
        };
        for(var key in result_data){
            if(isNaN(result_data[key]) && result_data[key]!==data.camera){
                result_data[key] = 0;
            }
        }
        return result_data;
    }
    formatDate(){
        //格式化日期格式
        Date.prototype.format = function(fmt) {
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        };
        var day=new Date();
        var nowTime = new Date().format("yyyy-MM-dd hh:mm:ss");
        var agoTime=new Date(day.getTime() - 7*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
        return {
            nowTime: nowTime,
            agoTime: agoTime
        }
    }
}

angular.module('myApp')
    .controller('cameraStorageCtrl',['$scope', '$http', '$state', 'RefreshManager', '$interval', 'i18nService',function($scope, $http, $state, RefreshManager, $interval, i18nService){
        i18nService.setCurrentLang("zh-cn");
        var parser = new stroageModel();

        $scope.cameraList = [];
        $scope.search_mode = false;
        $scope.search_key = "";

        function rowTemplate(num){
            return `<div ng-click="grid.appScope.showDetail(row.entity,$event)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{'ui-grid-row-header-cell': col.isRowHeader }" ui-grid-cell=""></div>`
        }
        $scope.showDetail = (entity, $event) =>{
            $event.stopPropagation();
            $state.go('dev.camerastorage.detail',{cid:entity.cid});
        };
        $scope.formatStatus = function(num){
            return num==1 ? "在线" : "不在线"
        };
        $scope.cameraStroageOptions = {
            enableGridMenu: true, //是否显示grid    菜单
            paginationPageSizes: [12,20,30,50,75],    //每页显示个数可选项
            paginationPageSize: 20,  //每页显示个数
            enablePagination: true,
            useExternalPagination: true,    //是否使用分页按钮
            enableSorting: false, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableColumnMenus:false,
            columnDefs: [
                {field: 'name', displayName: '摄像机名称', width:'18%',cellTooltip:true},
                {field: 'mac', displayName: 'MAC地址', width:'18%',cellTooltip:true},
                {field: 'ip', displayName: 'IP地址',cellTooltip:true},
                {field: 'online', displayName: '状态',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.formatStatus(row.entity.online)}}</div>'
                },
                {field: 'camera_stat.file_size_used', displayName: '已使用(%)',cellTooltip:true},
                {field: 'camera_stat.file_total', displayName: '文件个数',cellTooltip:true},
                {field: 'operation', displayName: '操作',
                    cellTemplate: `
                        <div style="text-align: center">
                            <i class="detail-icon" title="查看" ng-click="grid.appScope.showDetail(row.entity,$event)"></i>
                        </div>
                    `
                }
            ],
            rowTemplate: rowTemplate(),
            onRegisterApi:function(gridApi){
                $scope.gridApi = gridApi;
                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope,function(new_page,page_size){
                    $scope.newPage = new_page;
                    $scope.pageSize = page_size;
                    getNumOfCameras();
                    getCamerasStat(new_page, page_size);
                });
            }
        };
        //======================================================================

        function getWord () {
            $scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
        }
        //总数
        function getNumOfCameras(){
            getWord();
            var url = "";
            if($scope.searchWord=="" || $scope.searchWord==undefined){
                url = '/controller/cameras/count'
            }else{
                url = '/controller/cameras/count?name=' + $scope.searchWord
            }
            $http({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url: url
            }).then(function successCallback(response) {
                $scope.cameraStroageOptions.totalItems = response.data.count;
            }, function errorCallback(response) {
                // 请求失败执行代码
                $.LstTips("连接失败");
            });
        }
        function getCamerasStat(page=1, size=20){
            getWord();
            var url = "";
            if($scope.searchWord=="" || $scope.searchWord==undefined){
                url = '/controller/cameras?'+ 'filter=all&page='+ page + '&pagesize=' + size
            }else{
                url = '/controller/cameras?name=' + $scope.searchWord + '&filter=all&page='+ page + '&pagesize=' + size
            }
            $http({
                method: 'GET',
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                url: url
            }).then(function(response){
                $scope.cameraList = parser.cameraFileCount(response.data);
                $scope.cameraStroageOptions.data = $scope.cameraList;
                $scope.cameraStroageOptions.paginationCurrentPage = page;
                $scope.cameraStroageOptions.paginationPageSize = size;
            },function(){
                $.LstTips("连接失败");
            });
        }
        //搜索
        $scope.searchCameraByName = function(){
            getNumOfCameras();
            getCamerasStat(1, $scope.cameraStroageOptions.paginationPageSize);
        };
        $scope.keyDown=function($event){
            if($event.keyCode==13){
                $scope.searchCameraByName();
            }
        };
        $scope.searchCameraByName();

        //10分钟刷新一次======================================================================================
        $scope.conf = {
            max_list_item: 21,
            refresh: false,
            refresh_interval: 600000,
            refresh_timer: null
        };
        $scope.toggleRefreshCameraResult = function() {
            var conf = $scope.conf;
            if (conf.refresh == false) {
                $scope.conf.refresh = true;
                RefreshManager.interval($interval, function() {
                    getWord ();
                    var url = "";
                    if($scope.searchWord=="" || $scope.searchWord==undefined){
                        url= '/controller/cameras?'+'filter=all&page='+ $scope.cameraStroageOptions.paginationCurrentPage + '&pagesize=' + $scope.cameraStroageOptions.paginationPageSize
                    }else{
                        url= '/controller/cameras?name='+ $scope.searchWord +'&filter=all&page='+ $scope.cameraStroageOptions.paginationCurrentPage + '&pagesize=' + $scope.cameraStroageOptions.paginationPageSize
                    }
                    $.ajax({
                        url: url,
                        type: "get",
                        success: function(response) {
                            $scope.cameraList = parser.cameraFileCount(response.data);
                            $scope.cameraStroageOptions.data = $scope.cameraList;
                        }
                    });
                }, conf.refresh_interval);
            } else {
                RefreshManager.cancel();
                $scope.conf.refresh = false;
            }
        };

        $scope.$on('$destroy', function(){
            RefreshManager.cancel();
            $scope.conf.refresh = false
        });
        $scope.toggleRefreshCameraResult();


    }]);


angular.module('myApp')
    .controller('cameraStorageDetailCtrl',['$scope', '$http', '$stateParams',function($scope,$http,$stateParams){
        var parser = new stroageModel();
        var cid = $stateParams.cid;

        $scope.device_stat = {};
        $scope.model = {};

       function getDeviceCount(){
            $http({
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/stat/camera/'+cid
            }).then(function(response){
                $scope.device_stat = parser.fileTasksResult(response.data);
                draw();
            },function(){
                $.LstTips("连接失败");
            })
        }
        getDeviceCount();
        //绘制饼图
        function draw(){
            // 指定图表的配置项和数据
            var pie1_option = {
                title: {                             //标题组件
                    show: true,                    //是否显示标题组件
                    text: '文件容量占比',       //标题文字
                    left: 'center',               //左部距离
                    top: "5%",                    //顶部距离
                    textStyle: {                   //文字样式
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'normal',
                        fontFamily: 'Microsoft YaHei'
                    }
                },
                tooltip:{                      //提示框组件
                    show: true,               //是否显示提示框组件
                    trigger: 'item',           //触发类型
                    formatter:'{b}:{c}%'
                },
                legend:{                          //图例组件。
                    orient: 'horizontal',       //图例列表的布局朝向。
                    left: 'center',
                    bottom: "5%",
                    textStyle: {
                        color: '#fff'
                    },
                    selectedMode: false,
                    data: ['视频','全景照片','目标照片','其他','已使用']           //图例的数据数组。
                },
                series: [
                    {
                        type: 'pie',
                        name: '文件类型占比',
                        radius: [0,'80%'],          //半径
                        hoverOffset: 15,
                        minAngle: 3,
                        label: {                          //文本标签
                            normal: {
                                show: true,
                                position: 'inside',       //标签的位置
                                formatter: '{c}%'         //格式化文本
                            }
                        },
                        labelLine: {                  //标签视觉引导线
                            normal: {
                                show:false
                            }
                        },
                        itemStyle:{
                            normal:{
                                shadowColor: 'rgba(0, 0, 0, 0.6)',  //阴影
                                shadowBlur: 80                       //阴影宽度
                            }
                        },
                        data:(function(){
                            var pie_data=[];
                            var data=[
                                {name: '视频', value: $scope.device_stat.file_size_video,
                                    itemStyle:{
                                        normal:{color: '#761613'}
                                    },
                                    label:{
                                        normal: {padding:[-60,0,0,20] }
                                    }
                                },
                                {name: '全景照片', value: $scope.device_stat.file_size_scene,
                                    itemStyle:{
                                        normal:{color: '#0a761e'}
                                    },
                                    label:{
                                        normal: {padding:[60,0,0,0] }
                                    }
                                },
                                {name: '目标照片', value:  $scope.device_stat.file_size_face,
                                    itemStyle:{
                                        normal:{color: '#1e96a6'}
                                    },
                                    label: {
                                        normal: {padding:[20,0,0,20] }
                                    }
                                },
                                {name: '其他', value: $scope.device_stat.file_size_other,
                                    itemStyle:{
                                        normal:{color: '#0825b7'}
                                    },
                                    label: {
                                        normal: {padding:[-20,0,0,20]}
                                    }
                                }
                            ];
                            for(var i=0; i<data.length; i++){
                                if(data[i].value!==0 && !isNaN(data[i].value)){
                                    pie_data.push(data[i]);
                                }
                            }
                            if(pie_data.length == 0 || $scope.device_stat.file_size_total==0){
                                pie_data.push({name: '已使用', value: 0, itemStyle:{normal:{color: '#0825b7'}}, label:{normal:{formatter: '{b}:{c}%' }} })
                            }
                            return pie_data;
                        })()
                    }
                ]
            };
            var pie2_option = {
                title: {                             //标题组件
                    show: true,                    //是否显示标题组件
                    text: '磁盘使用占比',       //标题文字
                    left: 'center',               //左部距离
                    top: '5%',                    //顶部距离
                    textStyle: {                   //文字样式
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'normal',
                        fontFamily: 'Microsoft YaHei'
                    }
                },
                tooltip:{                      //提示框组件
                    show: true,               //是否显示提示框组件
                    trigger: 'item',           //触发类型
                    position: ['30%', '55%'],
                    formatter:'{b}:{d}%'
                },
                legend:{                          //图例组件。
                    orient: 'vertical',       //图例列表的布局朝向。
                    left: '20%',
                    bottom: 0,
                    textStyle: {
                        color: '#fff'
                    },
                    selectedMode: false,
                    data: ['已使用磁盘','剩余磁盘']           //图例的数据数组。
                },
                series: [
                    {
                        type: 'pie',
                        name: '磁盘使用占比',
                        radius: [0,'80%'],          //半径
                        minAngle: 3,
                        label: {                          //文本标签
                            normal: {
                                show: true,
                                position: 'inside',       //标签的位置
                                formatter: '{d}%'         //格式化文本
                            }
                        },
                        labelLine: {                  //标签视觉引导线
                            normal: {
                                show:false
                            }
                        },
                        itemStyle: {
                            normal: {
                                shadowColor: 'rgba(0, 0, 0, 0.8)',
                                shadowBlur: 50
                            }
                        },
                        data: (function(){
                            var pie_data = [];
                            var data = [
                                {name: '已使用磁盘', value: $scope.device_stat.disk_use,
                                    itemStyle:{
                                        normal:{color: '#ce4715'}
                                    }
                                },
                                {name: '剩余磁盘', value:$scope.device_stat.disk_not_used,
                                    itemStyle:{
                                        normal:{color: '#356891'}
                                    }
                                }
                            ];
                            if($scope.device_stat.disk_total > 0){
                                pie_data = data;
                            }else{
                                pie_data.push({name: '已使用磁盘', value: 0, itemStyle:{normal:{color: '#ce4715'}} })
                            }
                            return pie_data
                        })()
                    }
                ]
            };
            // 基于准备好的dom，初始化echarts实例
            var myChart1 = echarts.init(document.getElementsByClassName('pie-container1')[0]);
            // 使用指定的配置项和数据显示图表。
            myChart1.setOption(pie1_option);
            // 基于准备好的dom，初始化echarts实例
            var myChart2 = echarts.init(document.getElementsByClassName('pie-container2')[0]);
            // 使用指定的配置项和数据显示图表。
            myChart2.setOption(pie2_option);
        }

        //格式化初始日期格式
        $scope.model.startTime = parser.formatDate().agoTime;
        $scope.model.endTime = parser.formatDate().nowTime;
        var delUrlParmas = '';

        var checkedBtn = $(".manage-container input[name='date']:checked");
        $scope.delFile = function(event){
            checkedBtn = $(".manage-container input[name='date']:checked");
            switch (checkedBtn[0].className){
                case 'all-file':
                    $scope.model.message = '删除全部文件';
                    delUrlParmas = 'all=all';
                    $scope.confirmDel();
                    break;
                case 'n-file':
                    var val = $(".manage-container input.num-input").val();
                    if(val==0){
                        return $.LstTips("请选择时间段");
                    }
                    $scope.model.message = '只保留 '+ val +' 天文件存储信息';
                    delUrlParmas = "day="+val;
                    $scope.confirmDel();
                    break;
                case 'time-file':
                    $scope.model.startTime = $('#file_retrieval_start').val();
                    $scope.model.endTime = $('#file_retrieval_end').val();
                    if(compareDatetime($scope.model.startTime, $scope.model.endTime)>=0){
                        return $.LstTips("任务开始时间大于或等于结束时间，请重新设置！")
                    }
                    $scope.model.message = $scope.model.startTime+ ' 到 ' +$scope.model.endTime;
                    delUrlParmas = "start_time=" + $scope.model.startTime + "&end_time=" + $scope.model.endTime;
                    $.LstDialog('.delFile',480,300);
                    break;
            }
        };
        $scope.confirmDel = function(){
            $http({
                method: "delete",
                url: "/controller/stat/camera/"+cid+"?"+delUrlParmas,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json; charset=utf-8'
                }
            }).then(function(response){
                if(response.data.status==true){
                    $.LstTips("文件已删除")
                }else{
                    $.LstTips("文件删除失败");
                }
            },function(response){
                $.LstTips("文件删除失败");
            });
            $.hiddenDialog(".delFile");
        }
    }]);
