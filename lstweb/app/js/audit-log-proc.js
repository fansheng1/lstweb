class LogModel{
	constructor(){

	}
	LogModel(LogInfo) {
		LogInfo.time=LogInfo.time.substring(0,LogInfo.time.indexOf('.'));
		//LogInfo.module=this.toModuleStr(LogInfo.module);
		LogInfo.is_success=this.toSuccessStr(LogInfo.is_success);
		return LogInfo;
	}
	newUserResponseModel(data){
		data.forEach((e)=>{
			switch(e.module){
				case "capture":
				case "monitor":
				case "search":
					e.log_content = e.content.name+"被操作";
					e.url_content ="#/app/"+e.module+"/"+e.content.id+"/info";
					break;
				case "camera":
					e.log_content = e.content.name+"被操作";
					e.url_content = "#/dev/camera/"+e.content.id+"/info";
					break;
				case "user":
					e.log_content = "用户"+e.content.name+",完成此操作";
					e.url_content = "#/setting/user/"+e.content.id+"/info";
					break;
				default:
					break;
			}

			e.module = this.toModuleStr(e.module);
			e.is_success = this.toSuccessStr(e.is_success);
			e.time =e.time.substring(0,e.time.indexOf('.'));
			e.action = this.toActionStr(e.action);

		})
		return data
	}
	toSuccessStr(is_success){
		if(is_success){
			return "成功";
		}
		else{
			return "失败";
		}
	}
	toModuleStr(module){
		var module1;
		switch(module){
			case "task":
				module1="任务管理";
				break;
			case "camera":
				module1="摄像机管理";
				break;
			case "user":
				module1="用户管理";
				break;
			default:
				module1="无";
				break;
		}
		return module1;
	}
	toActionStr(action){
		var action1;
		switch (action){
			case "login":
				action1="登录";
				break;
			case "start":
				action1="开始";
				break;
			case "stop":
				action1="停止";
				break;
			case "add":
				action1="添加";
				break;
			case "view":
				action1="查看";
				break;
			case "update":
				action1="修改";
				break;
			case "delete":
				action1="删除";
				break;
			default:
				action1="";
				break;
		}
		return action1;
	}
}