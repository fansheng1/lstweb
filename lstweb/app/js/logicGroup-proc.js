class CameraGroupModel {
	constructor(){
		this.cameraGroupData = null
		this.responseData=null
	}

	procAddCameraGroupResp(model, resp) {
		if(resp.status && resp.status == false){
			alert("添加业务逻辑组\""+model.name+"\" 失败！")
		}

		return model
	}

	setNewGroupData(model){
		var group = {
			id: model.id,
			name: model.name,
			desc: model.desc,
			cameras: model.cameras
		}
		return group;
	}
	addCameraToGroup(model, camera){
		var group = {
			id: model.id,
			name: model.name,
			desc: model.desc,
			cameras: model.cameras
		}

		group.cameras.push(camera)
		return group;
	}
	procMoveModel(model, move_cid){
		var member = model.cameras.filter(camera=>{
			if(move_cid.includes(camera.id))
				return false;
			else
				return true;
		})
		model.cameras = member
		return model
	}
	deleteNewCamera(model){
		var camera={
			id:model.id,
			name:model.name,
			cameras:model.cameras
		}
	}
	UniqCameraList(){
		if(this.cameraGroupData == null){
			return;
		}
	}
	procCameraGroupData(data){
		this.cameraGroupData = data;
		return data
	}
	removeCameraFromGroup(delete_camera_ids){
		delete_camera_ids.forEach((deleted)=>{
			this.cameraGroupData.cameras = this.cameraGroupData.cameras.filter((cam)=>{
				return (cam.id == deleted) ? false:true
			})
		})

		return this.cameraGroupData
	}
	deleteCameraName(model){
		var camera={
			id:model.id,
			name:model.name,
			cameras:model.cameras
		}
		return model
	}
}