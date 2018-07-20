angular.module('myApp')
    .controller('monitorManageCtrl',['$scope', '$http', '$location','$state','i18nService',function ($scope, $http,$location,$state,i18nService){
        i18nService.setCurrentLang("zh-cn");
        $scope.selectRowsItem = [];
        $scope.keyDown=$event=>$event.keyCode==13 ? $scope.searchTackByName():"";
        $scope.searchTackByName = function(){
            getData(1,$scope.pageSize);
        };
        $scope.detail  = (entity) =>  window.location.href = '#/app/monitorManage/edit/' + entity.extlib_id + '/' + entity.src_id + '/' + entity.extlib_name+ '/' + entity.extlib_desc ;


        $scope.edit = (entity) =>  window.location.href = '#/app/monitorManage/detail/' + entity.extlib_id


        $scope.delete = (entity) => {
            $.LstInquiry("确认删除 \"" +entity.extlib_name+ "\" 吗？",function(){
                $http({
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    url:'/controller/extlib/'+entity.extlib_id //extlib?id_extlib=
                }).then(function(res){
                    if(res.data.status == 304){
                        $.LstTips("布控库正在运行,删除失败",4000);
                    }else if(res.data.status == 200){
                        $.LstTips("删除成功")
                    }
                    getData(1,$scope.pageSize);
                },function (res) {
                    $.LstTips("删除失败");
                });
            });
        };
        $scope.deleteSelect = () => {
            $.LstInquiry("确认删除选中的布控库吗？",function(){
                let str = $scope.selectRowsItem.join(',');
                $http({
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    url: '/controller/extlib/'+str //extlib?id_extlib=
                }).then(function(res){
                    if(res.data.status == 304){
                        $.LstTips("选择的布控库中存在“正在使用”状态,删除失败",4000);
                    }else if(res.data.status == 200){
                        $.LstTips("删除成功")
                    }
                    getData(1,$scope.pageSize);
                },function (res) {
                    $.LstTips("删除失败");
                });
            });
        };
        $scope.formatStatus = entity => {
            let arr =  ['空闲','正在使用'];
            return arr[entity.extlib_status];
        };
        $scope.monitorManageOptions = {
            defaultClick: entity => $scope.detail(entity),
            showIndexHeader : true,
            enableSorting: false, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: false, //是否显示grid    菜单
            //showGridFooter: false, //是否显示grid footer 项目要求不显示
            enableColumnMenus:false,
            enableHorizontalScrollbar : 1, //grid水平滚动条是否显示, 0-不显示  1-显示
            enableVerticalScrollbar : 1, //grid垂直滚动条是否显示, 0-不显示  1-显示
            //enablePagination: true, //是否分页，默认为true
           // enablePaginationControls: true, //使用默认的底部分页
            paginationPageSizes: [10,20,30,50,75], //每页显示个数可选项
            // paginationCurrentPage:10, //当前页码
            paginationPageSize: 20, //
            //paginationTemplate:"<div></div>", //自定义底部分页代码
            useExternalPagination: true,//是否使用分页按钮
            columnDefs: [
                { field: 'extlib_name',
                    displayName: '布控库名称',
                    enableHiding: false,
                    suppressRemoveSort: true,
                    //enableCellEdit: false, // 是否可编辑
                    cellTooltip:true //本来想写function的，但是源码说true就OK了
                },
                { field: "src_id", displayName:'布控库ID',cellTooltip:true,width:150},
                { field: "extlib_status", displayName:'状态',cellTooltip:true,cellTemplate:'<div class="ui-grid-cell-contents">{{grid.appScope.formatStatus(row.entity)}}</div>'},
                { field: "extlib_create_time",displayName:"创建时间",cellTooltip:true},
                { field: "extlib_desc",displayName:"说明",cellTooltip:true},
                {
                    field: "操作",
                    cellTemplate:`
                        <div style="text-align: center">
                            <i class="edit-icon tasklist-action-btn" ng-click="grid.appScope.edit(row.entity);$event.stopPropagation()" title="编辑"></i>
                            <i class="detail-icon tasklist-action-btn" ng-click="grid.appScope.detail(row.entity);$event.stopPropagation()" title="查看"></i>
                            <i class="delete-icon tasklist-action-btn" ng-click="grid.appScope.delete(row.entity);$event.stopPropagation()" title="删除"></i>
                        </div>
                    `
                }
            ],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {
                    $scope.newPage = newPage;
                    $scope.pageSize = pageSize;
                    getData(newPage,pageSize);
                });
                //行选中事件
                $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    //var a  =  $scope.gridApi.selection.getSelectAllState();
                    //调用这个方法可以判断是否全选，返回正则类型
                    $scope.selectRowsItem = $scope.gridApi.selection.getSelectedGridRows();
                    getRowsID($scope.selectRowsItem);
                });
                //全选行事件
                gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
                    //gridApi.grid.selection.selectAll==false //  判断全选的API，有延迟，第一种方法
                    if(!$scope.gridApi.selection.getSelectAllState()){  // 判断全选的API，有延迟，第二种方法
                        $scope.selectRowsItem = $scope.gridApi.selection.getSelectedGridRows()
                        getRowsID($scope.selectRowsItem)
                    }else{
                        $scope.selectRowsItem = [];
                    }
                });
                function getRowsID (arr) {
                    let IDs = [];
                    arr.forEach((item,key)=>{
                        IDs.push(item.entity.extlib_id)
                    });
                    $scope.selectRowsItem = IDs;
                }
            }
        };
        function getData(page = 1,size = 20) {
            $scope.searchName = $scope.searchName || '';
            let url =  '/controller/extlibs?page='+ page+'&pagesize=' + size
            if($scope.searchName){
                url =  '/controller/extlibs?extlib_name=' + $scope.searchName + '&page='+ page+'&pagesize=' + size
            }
            $scope.monitorManageOptions.paginationCurrentPage = page;
            $http({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url
            }).then(function(res){
                if(res.data===""){
                    $scope.monitorManageOptions.data = [];
                    $scope.monitorManageOptions.totalItems = 0;
                }else{ // 有信息就放上去
                    $scope.monitorManageOptions.data = res.data.extlibrarys;
                    $scope.monitorManageOptions.totalItems = res.data.count;
                }
            },function (res) {
                $.LstTips("连接失败");
                $scope.monitorManageOptions.data = [];
            });
        }
        getData();
}]);
angular.module('myApp')
    .controller('monitorManageDetailCtrl',['$scope','$stateParams','$http',function($scope,$stateParams,$http){
        $scope.edit_extlib_name = true;
        $scope.edit_extlib_desc = true;
        $scope.extlib_id = $stateParams.id ;
        $http({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json: charset=utf-8'
            },
            url: '/controller/extlib/'+ $scope.extlib_id
        }).then(function(res){
            $scope.data = res.data.extLibrary
            $scope.blackCount = res.data.blackCount
            $scope.percent = res.data.percent;
            $scope.task_id = res.data.task_id;
            $scope.t_name = res.data.t_name;
            if($scope.task_id == ""&&$scope.t_name == "无关联任务"){
                $(".jump").attr("href",window.location.href);
            }
        },function (res) {
            $.LstTips("请求失败")
        });
        $scope.editExtlib = () => {
            let obj = {};
            obj.extlib_name = $scope.data.extlib_name;
            obj.extlib_desc = $scope.data.extlib_desc;
            obj.extlib_id = $scope.data.extlib_id;
            $http({
                method: 'PUT',
                url:'/controller/extlib/'+ $scope.extlib_id,
                data:obj
            })
        }
        $scope.deleteTask = (id) => {
            if (id && id.length > 0) {
                $http({
                    method: "delete",
                    url: "/controller/monitor/" + id,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json; charset=utf-8'
                    }
                }).then(function(response) {
                    window.location.href = "#/app/monitorManage"
                });
            }
        }
        $scope.hideEl = () => {
            $scope.edit_extlib_name = true;
            $scope.edit_extlib_desc = true;
        }
    }]);
angular.module('myApp')
    .controller('monitorManageEditCtrl',['$scope','$stateParams','$http','i18nService',function($scope,$stateParams,$http,i18nService){
        i18nService.setCurrentLang("zh-cn");
        $scope.isToggle = false;
        $scope.showSearchFrom = function () {
            $scope.isToggle =!$scope.isToggle;
            for(var i in $scope.searchForm){
                $scope.searchForm[i] = undefined;
            }
            $scope.searchForm = null;
        };
        $scope.extlib_id = $stateParams.id;
        $scope.src_id = $stateParams.src_id;
        $scope.extlib_name = $stateParams.name;
        $scope.extlib_meno = $stateParams.meno;
        $scope.gridOptionsEdit = {
            rowHeight:5,  //欺骗系统的参数
            showLstViewPort:true,  //显示LST自定义样式
            showLstViewItemWidth:"130px", //自定义宽高
            showLstViewItemHeight:"180px",//自定义宽高
            enableRowSelection: true,//是否显示选中checkbox框 ,默认为true
            enableSelectAll: false,
            headerTemplate:'<div style="display: none"></div>',
            showIndexHeader : true,  //是否显示公司自定义的地步分页样式
            enableSorting: false, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: false, //是否显示grid    菜单
            enableColumnMenus:false,
            enableHorizontalScrollbar : 0, //grid水平滚动条是否显示, 0-不显示  1-显示
            enableVerticalScrollbar : 1, //grid垂直滚动条是否显示, 0-不显示  1-显示
            paginationPageSizes: [20,40,60], //每页显示个数可选项
            paginationCurrentPage:1, //当前页码
            paginationPageSize: 40, //每页显示个数
            //paginationTemplate:"<div></div>", //自定义底部分页代码
            useExternalPagination: true,//是否使用分页按钮
            enableRowHeaderSelection:false,
            columnDefs: [
                {
                    field: "b_id",
                    cellClass: 'blockItem',
                    cellTooltip: function(row, col) {
                        return 'b_id: ' + row.entity.b_id ;
                    },
                    cellTemplate:`
                        <div class="monitor-cell-item"><!--要记得设定options.自定义宽高,-->
                            <div ng-click="grid.appScope.detailInfo(row)">
                                <i ng-click="grid.appScope.deleteItem(row,$event)"></i>
                                <div>
                                <div>
                                 <b ng-if="grid.appScope.getItemBoolean(row)"></b>
                                    <img ng-src="{{grid.appScope.getImageUrl(row)}}" style="max-width:110px;max-height:130px; ">
                                </div>
                                </div>
                                <p>{{grid.appScope.getItemTime(row)}}</p>
                            </div>
                        </div>
                    `
                },
            ],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope,function(newPage, pageSize) {//分页按钮事件
                    $scope.newPage = newPage;
                    $scope.pageSize = pageSize;
                    getData(newPage,pageSize);
                });
                $scope.gridApi.selection.on.rowSelectionChanged($scope,function(row){//行选中事件

                });
            }
        };
        $scope.getItemTime = row => row.entity.gen_time;
        $scope.getItemBoolean = row => row.entity.haveInfo;
        $scope.getImageUrl = row => $scope.imgUrl + '/' +  row.entity.image_name;
        $scope.deleteItem = function (row,e){
            let item = row.entity.b_id;
            $.LstInquiry("确认删除吗？",function(){
                $http({
                    method:'DELETE',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    url:'/controller/extlib/'+$scope.extlib_id+'/object/'+ item
                }).then(function (res) {
                    $.LstTips("删除成功");
                    getData(1,$scope.pageSize);
                },function(res){
                    $.LstTips("删除失败");
                });
            });
            e.stopImmediatePropagation();
        };
        function getData( page = 1,size = 40){
            if($scope.searchForm){
                $scope.searchData($scope.searchForm);
                return
            }
            $scope.gridOptionsEdit.paginationCurrentPage = page;
            $http({
                method: 'GET',
                /*headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },*/
                url:'/controller/extlib/'+$scope.extlib_id+'/object?page='+page+'&pagesize='+ size
            }).then(function(res){
                $scope.gridOptionsEdit.data = res.data.blackList;
                $scope.gridOptionsEdit.totalItems = res.data.blackCount;
                $scope.imgUrl = res.data.url;
                $scope.isToggle = false;
            },function (res) {
                $scope.gridOptionsEdit.data =[];
                $.LstTips("连接失败");
            });
        }
        getData();
        //搜索框Start
        $scope.searchData = (form) => {
            if(!form){
                getData(1,$scope.pageSize);
                return
            }
            form['extlib_id'] = $scope.extlib_id;
            form.page = $scope.newPage || 1
            form.pagesize = $scope.pageSize || 40
            $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/extlib/'+$scope.extlib_id+'/condition',
                data:form
            }).then(function(res){
                $scope.gridOptionsEdit.data = res.data.blackList;
                $scope.gridOptionsEdit.totalItems = res.data.blackCount;
                if(res.data.blackCount == 0){
                    $.LstTips("查询结果为空");
                    for(var i in $scope.searchForm){
                        $scope.searchForm[i] = undefined;
                    }
                    $scope.searchForm = null;
                    getData(1,$scope.pageSize);
                }else{
                    $scope.imgUrl = res.data.url;
                    $scope.isToggle = false;
                }

            },function (res) {
                $.LstTips("连接失败");
            });
        };

        //导入框start
        $scope.importCSV = () =>{
            $.LstDialog(".importModel",500,150,false);
            $scope.fileOptions.data = [];
            $(".importModel .monitor-file input[type='file']")[0].value = "";//文件为空
            $(".showFileName").html('');
            $scope.isToggle = false;
        };
        $scope.fileOptions = {
            multiSelect: false ,// 是否可以选择多个,默认为true;
            enableSorting: false, //是否排序
            useExternalSorting: false, //是否使用自定义排序规则
            enableGridMenu: false, //是否显示grid    菜单
            enableColumnMenus:false,
            enableHorizontalScrollbar : 0, //grid水平滚动条是否显示, 0-不显示  1-显示
            enableVerticalScrollbar : 1, //grid垂直滚动条是否显示, 0-不显示  1-显示
            enableRowHeaderSelection:false,
            columnDefs: [
                {field: "csv_name",displayName:"csv文件字段名"},
                {
                    field: "db_name",
                    displayName:"数据库字段名",
                    cellTemplate:`
                        <div>
                            <select ng-model="item" ng-options="item.name for item in grid.appScope.optionData" ng-change="row.entity.db_name=item.code;" ng-click="$event.stopPropagation();"></select>
                        </div> 
                    `
                },
                {
                    field: "imageName",
                    displayName:"关联照片名",
                    cellTemplate:`
                        <div style="position:relative;z-index=0">
                            <input type="radio" ng-checked="row.entity.imageName">
                        </div> 
                    `
                }
            ],
            onRegisterApi: function(gridFileApi) {
                $scope.gridFileApi = gridFileApi;
                $scope.gridFileApi.selection.on.rowSelectionChanged($scope,function(row){//行选中事件
                    $scope.row = row;
                    $scope.hashkey = row.entity.$$hashKey;
                    for(var i in $scope.fileOptions.data){
                        if($scope.fileOptions.data[i].$$hashKey == $scope.hashkey){
                            $scope.fileOptions.data[i].imageName =  true
                            $scope.index = i;
                        }else{
                            $scope.fileOptions.data[i].imageName =  false
                        }
                    }
                });
            }
        };
        $scope.getItem = function () {
            let arr = [];
            $scope.columnNames.forEach(function(item,key){
                arr[key] = {};
                arr[key].csv_name = item.columnName;
                arr[key].csv_index = parseInt(item.index);
                arr[key].db_name = undefined;
            });
            for(let i  in arr){
                for(let j in $scope.fileOptions.data){
                    if($scope.fileOptions.data[j].db_name!='' && $scope.fileOptions.data[j].csv_name == arr[i].csv_name){
                        arr[i].db_name = $scope.fileOptions.data[j].db_name
                    }
                }
            }
            arr.forEach(function(item,key){
                if(!item.db_name){
                    arr[key].db_name = 'N';
                }
            });
            let haveT_image = false;
            let sortArr = [];
            for(var i in $scope.fileOptions.data){
                if($scope.fileOptions.data[i].db_name){
                    sortArr[sortArr.length] = $scope.fileOptions.data[i].db_name;
                }
                if($scope.fileOptions.data[i].db_name == 't_image'&&$scope.fileOptions.data[i].imageName == true){
                    haveT_image = true;
                }
            }
            let uniqueArr =$.uniq(sortArr);
            if(sortArr.length !== uniqueArr.length ){
                return $.LstTips("“数据库字段名”中存在重复值，请检查",3000)
            }
            if(haveT_image == false){
                return $.LstTips("请把“csv文件字段名”中的图片名关联字段  和 “数据库字段名”中的“照片名”关联起来",5000)
            }
            arr.forEach(function(item,key){
                delete arr[key]['csv_name']
            });
            let arrArr = [];
            arr.forEach(function (item, key) {
                if(item['db_name']!='N'){
                    arrArr.push(item)
                }
            })
            arr = JSON.stringify(arrArr);
            let obj = {list:arr,filename:$scope.file_name,src_id:$scope.src_id,index:parseInt($scope.index)};
            $http({
                method:'post',
                url:'/controller/extlib/'+ $scope.extlib_id +'/meta',
                data:obj
            }).then(function (res) {
                $.hiddenDialog('.importModel')
                $scope.pageSize = $scope.pageSize || 40;
                getData(1, $scope.pageSize);
            },function(){
                $.LstTips("请求失败");
            })
        };
        $scope.fileOptions.data = [];
        $scope.optionData = [];
        $(".importModel .monitor-file").on("change","input[type='file']",function(){ //filename
            $scope.optionData.length = 0;
            var filePath=$(this).val();
            if(filePath === ""){ //filePath 为空值
                return false
            }else if(filePath.includes("csv")){
                $(".showFileName").html("");
                var arr=filePath.split('\\');
                var fileName=arr[arr.length-1];
                $(".showFileName").html(fileName);
                var formData = new FormData(document.getElementById("fileForm"));
                $http({
                    method:'post',
                    url: "/controller/extlib/uploads",
                    data:formData,
                    headers : {'Content-Type' : undefined},  //angularjs设置文件上传的content-type修改方式
                    transformRequest : angular.identity
                }).then(function (res) {
                    let data = res.data;
                    $scope.file_name = data.filename;
                    $scope.columnNames = data.columnNames;
                    for(let i in data.columnTargetsName.dblineList){
                        if(data.columnTargetsName.dblineList[i]!='b_id' && data.columnTargetsName.dblineList[i]!='t_create_time' && data.columnTargetsName.dblineList[i]!='src_id' && data.columnTargetsName.dblineList[i]!='t_last_modify'){
                            $scope.optionData[$scope.optionData.length] = {
                                code:data.columnTargetsName.dblineList[i],
                                name:data.columnTargetsName.dbnames[i]
                            };
                        }
                    }
                    for(let i in data.columnNames){
                        $scope.fileOptions.data[i] = {
                            csv_name:data.columnNames[i].columnName,
                            csv_key:data.columnNames[i].index,
                            db_name:undefined,
                            imageName:false
                        }
                    }
                },function(){
                    $.LstTips("请求失败");
                })
            }else{
                $.LstTips("请选择csv文件");
                return false
            }
        });
        $scope.addPerson = function () {
            $scope.isToggle = false;
            $.LstDialog(".addPerson",775,150);
            $scope.putForm = {};
            $scope.imgLength = false;
            if($(".addPerson .monitor-file")[0].children["0"].files.length ==1){
                $(".addPerson .monitor-file")[0].children["0"].files["0"] = new FileList();
            }
            $scope.haveImg = true;
        };
        $(".addPerson .monitor-file").on("change","input[type='file']",function(){
            var filePath=$(this).val();
            //filePath 为空值
            if(filePath === ""){
                return false
            }else if(filePath.includes("jpg")||filePath.includes("jpeg")||filePath.includes("png")){
                var file = $(this)[0].files[0];
                r = new FileReader();  //本地预览
                r.onload = function(){
                    $scope.imgPath = r.result;
                    $scope.putForm.imageString = $scope.imgPath;
                    $scope.putForm.src_id = $scope.src_id;
                    $scope.imgLength = true;
                    $scope.haveImg = false;
                    $scope.$apply();
                };
                r.readAsDataURL(file);    //Base64
                $(this).val("");
            }else{
                $.LstTips("请选择jpg/jpeg/png文件");
                $(this).val("");
                return false
            }
        });
        $scope.addPersonInfo = function (code) {
            if(code===false){
                $http({
                method:'post',
                url:'/controller/extlib/'+$scope.extlib_id+'/object',
                data:$scope.putForm
            }).then(function (res) {
                $.LstTips("添加成功");
                $.hiddenDialog('.addPerson');
                $scope.pageSize = $scope.pageSize || 40;
                getData(1,$scope.pageSize);

            },function(){
                $.LstTips("请求失败");
                $.hiddenDialog('.addPerson')
            })
            }else{
                $.LstTips('照片/姓名必填')
            }
        };
        //编辑
        $scope.editRank = () =>{
            $.LstDialog(".editRank",500,150);
        };
        $scope.editItem = function (invalid) {
            if(invalid === false){
                if(undefined===$scope.personDetail['detailImg']||null===$scope.personDetail['detailImg']){
                    $.LstTips("该用户没有身份信息");
                }
                $http({
                    method:'PUT',
                    url:'/controller/extlib/'+$scope.extlib_id+'/object/' + $scope.personDetail.b_id,
                    data:$scope.personDetail
                }).then(function (res) {
                    $.LstTips("编辑成功");
                    $.hiddenDialog('.editInfo');
                    $scope.pageSize = $scope.pageSize || 40;
                    getData(1,$scope.pageSize);
                },function(){
                    $.LstTips("编辑失败");
                    $.hiddenDialog('.editInfo');
                })
            }
        };
        //查看界面
        $scope.detailInfo = function (row) {
            $http({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url:'/controller/extlibs/' + $scope.extlib_id + '/photo/'+row.entity.b_id+'/info'
            }).then(function(res){
                if(!res.data){
                    $scope.personDetail = {};
                    $scope.personDetail.b_id = row.entity.b_id;
                    $scope.personDetail.t_image = row.entity.image_name;
                }else{
                    $scope.personDetail = res.data
                    $scope.personDetail.t_image = row.entity.image_name;
                }
                $scope.personDetail.detailImg =  $scope.getImageUrl(row);
            },function (res) {
                $.LstTips("连接失败");
            });
            $.LstDialog('.lookInfo',775,150);
        };
        $scope.editInfo = function(){
            $.hiddenDialog('.lookInfo');
            $.LstDialog('.editInfo',775,150);
        };
    }]);