
// ES6
class SearchTaskModel {
	constructor(){
		this.imagesArray = []
		this.task_spec = {files:[]}
	}

	toModelObjects(base_uri, files){
		var objects = []
		if(files){
			files.forEach(file => {
				var type_name = file.file_ext.split("/")[0];
				var type = (type_name == "video") ? "video" : "image"
				
				objects.push({
					mime: file.file_ext, type : type, url: base_uri + "/" + file.file_uuid
				})
			})
		}
		return objects
	}
	task2model(taskInfo) {
		var task_data = taskInfo.task_data
		var model = {};

		this.task_spec = taskInfo.task_data

		try{
			model = {
				task_desc:taskInfo.task_desc,
				task_id: taskInfo.task_id,
				task_name: taskInfo.task_name,
				similarity: task_data.similarity,
				startTime: task_data.start_time,
				endTime: task_data.stop_time,
				group_id: taskInfo.cam_group_id,
				picture: task_data.picture,
				video: task_data.video,
				objects: this.toModelObjects(this.task_spec.path, this.task_spec.files)
			}
			return model
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
			} else if(task.removed) {
				task.statusStr = "已删除"
			}
		})
		return tasks
	}
	viewProcTasks(results){
		results.forEach(task => {
			task.similarity = parseInt(task.similarity * 10000)/100.0 + "%"
			if(task.cam_video_file){
				if(task.cam_video_file.includes("rtsp://")){
					task.cam_video_file_name = "NVR";
				}else{
					var pos = task.cam_video_file.lastIndexOf("/")
					task.cam_video_file_name = task.cam_video_file.substr(pos+1)
				}
			}
		})
		return results
	}
	uploadTaskPicModel(data, fn){
		var model = { objects: [] }
		if (data.status == true) {
			this.task_spec.path = data.dir
			data.files.forEach((file)=>{
				this.task_spec.files.push({file_uuid: file[0], file_ext: file[1]})
			})

			model.objects = this.toModelObjects(this.task_spec.path, this.task_spec.files)
			if(fn){
				fn()
			}
		} else {
			console.log(">> upload task image failure.");
		}
		return model
	}

	setNewTaskData(model, is_new_task){
		var task_data = {
			task_id: model.task_id,
			t_name: model.task_name,
			t_desc: model.task_desc
		};

		task_data.cam_group_id = $("#group_id").val();

		task_data.dir = this.task_spec.path;
		task_data.files = this.task_spec.files;
		task_data.taskData = {
			start_time: model.startTime,
			stop_time: model.endTime,
			similarity: model.similarity,
			maxResultSetLength: 50,
			picture: (model.picture == undefined) ? false : model.picture,
			video: (model.video == undefined) ? false : model.video
		};

		return task_data;
	}

	setNewTimeTaskData(model){
		var task_data = {
			t_name: $("#t_name").val()
		};

		task_data.cam_group_id = $("#group_id").val();
		task_data.taskData = {
			start_time: $("#start_time").val(),
			stop_time: $("#stop_time").val(),
			similarity: $("#similarity").val(),
			maxResultSetLength: 50
		};
		return task_data;
	}

	newTaskResponseModel(data){
		var model = {};

		if (data.status == true) {
			model.task_desc = data.task_desc,
			model.task_id = data.task_id
			model.task_name = data.task_name
			model.similarity = data.similarity
			model.group_id = data.group_id
			model.picture = data.picture
			model.video = data.video
			model.startTime = data.start_time
			model.endTime = data.stop_time
			this.task_spec.path = data.dir
			model.objects = this.toModelObjects(this.task_spec.path, this.task_spec.files)
		}else{
			model.task_desc = data.task_desc, // 4
			model.task_id = data.task_id
			model.task_name = data.task_name
			model.similarity = data.similarity // 3
			model.group_id = data.group_id // 1
			model.picture = data.picture // 2
			model.video = data.video // 7
			model.startTime = data.start_time // 6
			model.endTime = data.stop_time // 5
			this.task_spec.path = data.dir
			if(this.task_spec.path && this.task_spec.files){
				model.objects = this.toModelObjects(this.task_spec.path, this.task_spec.files)
			}
		}
		return model;
	}

	procSearchResultChanged(results){
		if(this.imagesArray.length==0){
			return true
		}
		if(results.length==0){
			return false
		}
		if(this.imagesArray[0].cam_file == results[0].cam_file){
			return false
		}
		return true
	}
	procSearchResult(results, conf){
		var image_seqence = []
		var max_list_item = conf.max_list_item
		results.forEach((seq)=>{
			seq.similarity = parseInt(seq.similarity * 10000)/100.0 + "%"
			if(seq.cam_video_file){
				if(seq.cam_video_file.includes("rtsp://")){
					seq.cam_video_file_name = "NVR";
				}else{
					var pos = seq.cam_video_file.lastIndexOf("/")
					seq.cam_video_file_name = seq.cam_video_file.substr(pos+1)
				}
			}
			/*if(seq.cam_video_file == ""){
				seq.cam_video_file_name == ""
			}else if(seq.cam_video_file.substring(0,7)=="rtsp://"){
				seq.cam_video_file_name = "NVR";
			} else{

			}*/
		})

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
