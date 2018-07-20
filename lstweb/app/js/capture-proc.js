class CaptureTaskModel {
	constructor(){
		this.imagesArray = []
	}

	taskmodel(taskInfo) {
		var task_data = taskInfo.task_data
		var model = null;

		try{
			model = {
				task_id: taskInfo.task_id,
				task_name: taskInfo.task_name,
				task_desc: taskInfo.task_desc,
				group_id: taskInfo.cam_group_id,
				startTime: task_data.start_time,
				endTime: task_data.stop_time,
				forever: task_data.forever
			}
			
		} catch(e){
			console.log(e)
		}

		return model
	}

	procTasks(tasks){
		tasks.forEach(task => {
			task.statusStr = "就绪"
			if(task.running) {
				task.statusStr = "正在运行"
			} else if(task.finished) {
				task.statusStr = "已完成"
			} else if(task.viewed) {
				task.statusStr = "已查看"
			} else if(task.deleted) {
				task.statusStr = "已删除"
			}
		})
		return tasks
	}
	procTasksResult(tasks){
		tasks.forEach(task => {
			if(task.ts != undefined) {
				task.ts = task.ts.substring(0, 19);
			}
		})
		return tasks
	}
	procCaptureResult(results){
		results.forEach(task => {
			if(task.ts != undefined) {
				task.ts = task.ts.substring(0, 19);
			}
		})
		return results
	}
	procMonitorResult(results){
		results.forEach(task => {
			task.forEach((task)=>{
				seq.similarity = parseInt(seq.similarity * 10000)/100.0 + "%"
			})
		})
		return tasks
	}
	setNewTaskData(model){
		var task_data = {
			task_id:model.task_id,
			t_name: model.task_name,
			t_desc: model.task_desc
		};

		task_data.cam_group_id = model.group_id;
		task_data.taskData = {
			start_time: model.startTime,
			stop_time: model.endTime,
			forever: model.forever,
		};
		return task_data;
	}

	newTaskResponseModel(data){
		var model = {};

		if (data.status == true) {
			model.task_id = data.task_id
			model.task_name = data.task_name
			model.task_desc =data.task_desc
			model.group_id = data.group_id
			model.startTime = data.start_time
			model.endTime = data.stop_time
			model.forever = data.forever
		}
		return model;
	}

	procCaptureResult(results, conf){
		var image_seqence = []
		var max_list_item = conf.max_list_item

		if(results.length > 0){
			results.forEach((seq)=>{
				seq.similarity = parseInt(seq.similarity * 10000)/100.0 + "%"
				seq.ts=seq.ts.substring(0,19);
			})
		}

		if (this.imagesArray.length == 0) {
			var max = (results.length < max_list_item) ? results.length : max_list_item;
			for (var n = 0; n < max; n++) {
				this.imagesArray[n] = results[n];
			}
			image_seqence = this.imagesArray
		} else {
			this.imagesArray = results.concat(this.imagesArray);
			if (this.imagesArray.length > max_list_item) {
				this.imagesArray.splice(max_list_item - 1);
			}
			image_seqence = this.imagesArray
		}
		return image_seqence;
	}
}