class AlarmModel{
	constructor(){

	}
	newAlarmResponseModel(data){
		data.forEach((e)=>{
			e.time =e.time.substring(0,e.time.indexOf('.'));
			e.level=this.toLevelStr(e.level);
			e.cata=this.toCataStr(e.cata)+"/"+this.toSubCataStr(e.subcata);
			
			switch(e.subcata){
				case "capture":
				case "monitor":
				case "search":
				    /*e.alarm_content=e.data.t_name+"在"+e.data.camera+"摄像机上,"+e.data.t_desc;*/
					e.task_url="#/app/"+e.subcata+"/"+e.data.tid+"/info";
					e.camera_url="#/dev/camera/"+e.data.cid+"/info";
					e.url_content ="#/app/"+e.subcata+"/"+e.data.tid+"/view";
					break;
				case "camera":
					e.alarm_content = e.data.t_name+"被操作";
					e.url_content = "#/dev/camera/"+e.data.tid+"/info";
					break;
				case "user":
					e.alarm_content = "用户"+e.data.t_name+",完成此操作"
					e.url_content = "#/setting/user/"+e.data.tid+"/info";
					break;
				default:
					break;
			}
		})
		return data
	}
	/* 1代表INFO级别的   2代表WARNING级别   3代表ERROR级别  4代表FATAL */
	toLevelStr(level){
		var level1;
		switch(level){
			case 1:
				level1="INFO";
				break;
			case 2:
				level1="WARNING";
				break;
			case 3:
				level1="ERROR";
				break;
			case 4:
				level1="FATAL";
				break;
			default:
				level1="无";
				break;
		}
		return level1;
	}

	toCataStr(module){
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

	toSubCataStr(module){
		var module1;
		switch(module){
			case "monitor":
				module1="布控";
				break;
			case "capture":
				module1="采集";
				break;
			default:
				module1="无";
				break;
		}
		return module1;
	}
}