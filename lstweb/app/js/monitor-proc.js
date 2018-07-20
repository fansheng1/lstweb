
// ES6
class MonitorTaskModel {
	constructor(){
		this.imagesArray = []
		this.meta_uploaded_image = {}
		this.task_spec = null
	}
	procGetMonitorTaskModel(taskInfo) {
		var task_data = taskInfo.task_data
		var model = null;

		this.task_spec = taskInfo.task_data
		try{
			model = {
				task_id: taskInfo.task_id,
				task_name: taskInfo.task_name,
				task_desc: taskInfo.task_desc,
				group_id: taskInfo.cam_group_id,
				db_id:taskInfo.db_id,
				similarity: task_data.similarity,
				startTime: task_data.start_time,
				endTime: task_data.stop_time,
				objects: []
			}
			if (task_data.files) {
				task_data.files.forEach(function(t, index) {
					model.objects[index] = {}
					model.objects[index].mime = t.file_ext
					model.objects[index].url = task_data.path + "/" + t.file_uuid
				})
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
			task.similarity = parseInt(task.similarity * 10000)/100.0 + "%"
			if(task.age==0){
				task.age=''
			}
		})
		return tasks
	}

	uploadTaskPicModel(data, fn){
		var model = {}
		if (data.status == true) {
			model.objects = []

			if(this.task_spec == undefined) {
				this.task_spec = {files:[]}
				this.task_spec.path = data.dir
			}
			data.files.forEach((e) => {
				this.task_spec.files = this.task_spec.files == undefined ? []:this.task_spec.files
				this.task_spec.files.push({file_uuid: e[0], file_ext: e[1]})
			})

			if(this.task_spec) {
				this.task_spec.files.forEach((e)=>{
					model.objects.push({
						url: this.task_spec.path + "/" + e.file_uuid
					})				
				})
			}
			if(fn){
				fn()
			}

		} else {
			console.log(">> upload task image failure.");
		}
		return model
	}

	setNewTaskData(model,is_new_task){
		var task_data = {
			task_id: model.task_id,
			t_name: model.task_name,
			t_desc: model.task_desc,
			db_id:model.db_id
		};
		var db_id= parseInt(model.db_id)
		if(db_id > 0){
			task_data.cam_group_id = model.group_id;
			task_data.taskData = {
				start_time: $("#mon_start_time").val(),
				stop_time: $("#mon_stop_time").val(),
				similarity: $("#mon_similarity").val(),
				maxResultSetLength: 50,
			};
		}else{
			task_data.cam_group_id = model.group_id;
			task_data.dir = this.task_spec.path //uploaded_image.dir;
			task_data.files = this.task_spec.files //files_data;
			task_data.taskData = {
				start_time: $("#mon_start_time").val(),
				stop_time: $("#mon_stop_time").val(),
				similarity: $("#mon_similarity").val(),
				maxResultSetLength: 50
			};
		}
		return task_data;
	}

	newTaskResponseModel(data){
		var model = {};
		if(data.db_id > 0){
			if (data.status == true) {
				model.task_id = data.task_id
				model.task_name = data.task_name
				model.task_desc = data.task_desc
				model.similarity = data.similarity
				model.group_id = data.group_id
				model.startTime=data.start_time
				model.endTime=data.stop_time
				model.db_id=data.db_id
				model.objects = []
			}
			return model;
		}else{
			if (data.status == true) {
				model.task_id = data.task_id
				model.task_name = data.task_name
				model.task_desc = data.task_desc
				model.similarity = data.similarity
				model.group_id = data.group_id
				model.db_id=data.db_id
				model.objects = []
				this.task_spec.files.forEach( file => {
					model.objects.push({url: data.dir + '/' + file.file_uuid})
				})
			}
			return model;
		}
	}

	procMonitorResult(data, conf){
		var image_seqence = []
		var jsons = data;
		var max_list_item = conf.max_list_item
		if(data.length > 0){
			data.forEach((seq)=>{
				seq.similarity = parseInt(seq.similarity * 10000)/100.0 + "%";
				if(seq.age==0){
					seq.age='';
				}
			})
		}
		if (this.imagesArray.length == 0) {
			var max = (jsons.length < max_list_item) ? jsons.length : max_list_item;
			for (var n = 0; n < max; n++) {
				this.imagesArray[n] = jsons[n];
			}
			image_seqence = this.imagesArray
		} else {
			this.imagesArray = jsons.concat(this.imagesArray);
			if (this.imagesArray.length > max_list_item) {
				this.imagesArray.splice(max_list_item - 1);
			}
			image_seqence = this.imagesArray
		}
		image_seqence = $.uniqKeys(image_seqence,"monitor_id"); // 针对  monitor_id  数组去重
		return image_seqence;
	}

	removeFileFromTask(file_uuid){
		var a_index = -1
		this.task_spec.files.forEach(function(t, index) {
			if(t.file_uuid == file_uuid){
				a_index = index
			}
		})
		if(a_index > -1){
			this.task_spec.files.splice(a_index,1)
		}
	}
	updatePhotoMeta(model, meta){
		var objects=model.objects;
		for(var i=0;i<objects.length;i++){
			var posId = objects[i].url.lastIndexOf('/');
			var fileUuid= objects[i].url.substring(posId+1);
			if(fileUuid == meta.id){
				objects[i].meta = meta
				return true
			}
		}
		return false
	}
}