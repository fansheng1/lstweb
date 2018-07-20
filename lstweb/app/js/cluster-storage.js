angular.module('myApp')
    .controller('clusterStorageCtrl',['$scope','$http',function($scope,$http){
        var parser = new stroageModel();

        $scope.model = {};
        $scope.cluster_stat = {};

        //请求文件容量数据
        function getClusterCount(){
            $http({
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/stat/cluster/file'
            }).then(function(response){
                $scope.cluster_stat = parser.clusterFileResult(response.data);
                getClusterDisk();
            },function(){
                $.LstTips("连接失败");
            })
        }
        //请求磁盘容量数据
        function getClusterDisk(){
            $http({
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/stat/cluster/disk'
            }).then(function(response){
                var disk_total = response.data.disk_total;
                var disk_alloc = response.data.disk_alloc;
                $scope.cluster_stat.disk_total = disk_total;
                $scope.cluster_stat.disk_use = disk_alloc;
                $scope.cluster_stat.disk_not_used = disk_total-disk_alloc;
                draw();        //绘制饼图
            },function(){
                $.LstTips("连接失败");
            })
        };
        getClusterCount();

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
                        name: '文件容量占比',
                        radius: [0,'80%'],          //半径
                        center:['50%','50%'],
                        minAngle: 3,
                        avoidLabelOverlap: true,
                        hoverOffset: 15,            //扇区偏移距离
                        labelLine: {                  //标签视觉引导线
                            normal: {
                                show:false
                            }
                        },
                        itemStyle:{
                            normal:{
                                label:{
                                    show: true,
                                    color: '#fff',
                                    position: 'inner',       //标签的位置
                                    formatter: '{c}%'
                                },
                                shadowColor: 'rgba(0, 0, 0, 0.6)',  //阴影
                                shadowBlur: 80                       //阴影宽度
                            }
                        },
                        data:(function(){
                            var pie_data=[];
                            var data=[
                                {name: '视频', value: $scope.cluster_stat.file_size_video,
                                    itemStyle:{
                                        normal:{color: '#111f6b'}
                                    },
                                    label:{
                                        normal: {padding:[-60,0,0,20] }
                                    }
                                },
                                {name: '全景照片', value: $scope.cluster_stat.file_size_scene,
                                    itemStyle:{
                                        normal:{color: '#5e1b62'}
                                    },
                                    label:{
                                        normal: {padding:[0,0,0,20] }
                                    }
                                },
                                {name: '目标照片', value: $scope.cluster_stat.file_size_face,
                                    itemStyle:{
                                        normal:{color: '#0f6cae'}
                                    },
                                    label: {
                                        normal: {padding:[10,0,0,0] }
                                    }
                                },
                                {name: '其他', value: $scope.cluster_stat.file_size_other,
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
                            if(pie_data.length == 0 || $scope.cluster_stat.file_size_total==0){
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
                    formatter:'{b}:{d}%',
                    position: ['40%','50%']
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
                        data:(function(){
                            var pie_data = [];
                            var data = [
                                {name: '已使用磁盘', value: $scope.cluster_stat.disk_use,
                                    itemStyle:{
                                        normal:{color: '#216738'}
                                    }
                                },
                                {name: '剩余磁盘', value:$scope.cluster_stat.disk_not_used,
                                    itemStyle:{
                                        normal:{color: '#3876a8'}
                                    }
                                }
                            ];
                            if($scope.cluster_stat.disk_total > 0){
                                pie_data = data;
                            }else{
                                pie_data.push({name: '已使用磁盘', value: 0, itemStyle:{normal:{color: '#216738'}} })
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
                url: "/controller/stat/cluster/"+"?"+delUrlParmas,
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

angular.module('myApp')
    .controller('clusterStorageListCtrl',['$scope', '$http', '$state', '$interval', 'RefreshManager', 'i18nService',function($scope, $http, $state,$interval, RefreshManager, i18nService){
        i18nService.setCurrentLang("zh-cn");

        var parser = new stroageModel();
        $scope.search_mode = false;
        $scope.search_key = "";

        function rowTemplate(num){
            return `<div ng-click="grid.appScope.showDetail(row.entity,$event)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{'ui-grid-row-header-cell': col.isRowHeader }" ui-grid-cell=""></div>`
        }
        $scope.showDetail = (entity, $event) =>{
            $event.stopPropagation();
            $state.go('setting.clusterstorage.detail',{cid:entity.cid});
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
                {field: 'name', displayName: '摄像机名称', width:'18%'},
                {field: 'mac', displayName: 'MAC地址', width:'18%'},
                {field: 'ip', displayName: 'IP地址'},
                {field: 'online', displayName: '状态',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.formatStatus(row.entity.online)}}</div>'
                },
                {field: 'cluster_stat.file_size_used', displayName: '已使用(%)'},
                {field: 'cluster_stat.file_total', displayName: '文件个数'},
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
                    getClusterData(new_page, page_size);
                });
            }
        };

        $scope.cameraList = [];
        function getWord () {
            $scope.searchWord = $scope.searchWord ? $scope.searchWord : ''
        }
        //总数
        function getNumOfCameras(){
            getWord ();
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
        function getClusterData(page=1, size=20){
            getWord ();
            var url = "";
            if($scope.searchWord=="" || $scope.searchWord==undefined){
                url = '/controller/cameras?filter=all&page='+ page + '&pagesize=' + size
            }else{
                url = '/controller/cameras?name='+ $scope.searchWord + '&filter=all&page='+ page + '&pagesize=' + size
            }
            $http({
                method: 'GET',
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                url: url
            }).then(function(response){
                $scope.cameraList = parser.clusterFileCount(response.data);
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
            getClusterData(1, $scope.cameraStroageOptions.paginationPageSize);
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
                    if(!$scope.searchWord || $scope.searchWord==""){
                        url ='/controller/cameras?'+'filter=all&page='+ $scope.cameraStroageOptions.paginationCurrentPage + "&pagesize=" + $scope.cameraStroageOptions.paginationPageSize
                    }else{
                        url = '/controller/cameras?name='+ $scope.searchWord +'&filter=all&page='+ $scope.cameraStroageOptions.paginationCurrentPage + "&pagesize=" + $scope.cameraStroageOptions.paginationPageSize
                    }
                    $.ajax({
                        url: url,
                        type: "get",
                        success: function(response) {
                            $scope.cameraList = parser.clusterFileCount(response.data);
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
    .controller('clusterStorageDetailCtrl',['$scope', '$http', '$stateParams',function($scope,$http,$stateParams){
        var parser = new stroageModel();
        var cid = $stateParams.cid;

        $scope.device_stat = {};
        $scope.model = {};

        $scope.getDeviceCount = function(){
            $http({
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/stat/cluster/camera/'+cid
            }).then(function(response){
                $scope.device_stat = parser.clusterCamFile(response.data);
                draw();
            },function(){
                $.LstTips("连接失败");
            })
        };
        $scope.getDeviceCount();

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
                    bottom: "0",
                    textStyle: {
                        color: '#fff'
                    },
                    selectedMode: false,
                    data: ['视频','全景照片','其他','目标照片','已使用']           //图例的数据数组。
                },
                series: [
                    {
                        type: 'pie',
                        name: '文件容量占比',
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
                                        normal:{color: '#720819'}
                                    },
                                    label:{
                                        normal: {padding:[-60,0,0,20] }
                                    }
                                },
                                {name: '全景照片', value: $scope.device_stat.file_size_scene,
                                    itemStyle:{
                                        normal:{color: '#a913b2'}
                                    },
                                    label:{
                                        normal: {padding:[0,0,0,0] }
                                    }
                                },
                                {name: '目标照片', value:$scope.device_stat.file_size_face,
                                    itemStyle:{
                                        normal:{color: '#0e68a6'}
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
                                pie_data = [];
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
                    text: '文件个数占比',       //标题文字
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
                    formatter:'{b}:{d}%'
                },
                legend:{                          //图例组件。
                    orient: 'horizontal',       //图例列表的布局朝向。
                    left: 'center',
                    bottom: 0,
                    textStyle: {
                        color: '#fff'
                    },
                    selectedMode: false,
                    data: ['视频','全景照片','其他','目标照片','已有文件']           //图例的数据数组。
                },
                series: [
                    {
                        type: 'pie',
                        name: '文件个数占比',
                        radius: [0,'80%'],          //半径
                        minAngle: 3,
                        avoidLabelOverlap: true,
                        label: {                          //文本标签
                            normal: {
                                show: true,
                                position: 'inside',       //标签的位置
                                formatter: '{d}%({c})'         //格式化文本
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
                                shadowBlur: 80
                            }
                        },
                        data:(function(){
                            var pie_data=[];
                            var data=[
                                {name: '视频', value: $scope.device_stat.file_video,
                                    itemStyle:{
                                        normal:{color: '#26733f'}
                                    },
                                    label:{
                                        normal: {padding:[-60,0,0,20] }
                                    }
                                },
                                {name: '全景照片', value: $scope.device_stat.file_scene,
                                    itemStyle:{
                                        normal:{color: '#a00b35'}
                                    },
                                    label:{
                                        normal: {padding:[60,0,0,0] }
                                    }
                                },
                                {name: '目标照片', value: $scope.device_stat.file_face,
                                    itemStyle:{
                                        normal:{color: '#947f0d'}
                                    },
                                    label: {
                                        normal: {padding:[20,0,0,20] }
                                    }
                                },
                                {name: '其他', value: $scope.device_stat.file_other,
                                    itemStyle:{
                                        normal:{color: '#9b340b'}
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
                            if(pie_data.length == 0){
                                pie_data.push({name: '已有文件', value: 0, itemStyle:{normal:{color: '#0825b7'}}, label:{normal:{formatter: '{b}:{d}({c})' }} })
                            }
                            return pie_data;
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
                url: "/controller/stat/cluster/camera/"+cid+"?"+delUrlParmas,
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
