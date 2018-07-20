class CameraModel {
	constructor(){
	}

	Cameramodel(camera) {
		var model = null;

		try{
			model = {
				cid: camera.cid,
				ip: camera.ip,
				cname: camera.name,
				mac: camera.mac,
				stream: camera.stream,
				groupID: camera.groupID,
				groupName: camera.groupName,
				longitude:camera.pos.longitude,
				lat:camera.pos.latitude,
				site:camera.site,
				type:camera.type,
				nvr:{
					ip:camera.nvr.ip,
					user:camera.nvr.user,
					passwd:camera.nvr.passwd,
					chid:camera.nvr.chid
				}
			}

		} catch(e){
			console.log(e)
		}

		return model
	}

	setNewCameraData(model){
		var camera_data = {
			mac: model.mac,
			cname: model.cname,
			longitude: model.longitude,
			lat: model.lat,
			type:model.type,
			site:model.site,
			nvr:{
				ip:model.nvr.ip,
				user:model.nvr.user,
				passwd:model.nvr.passwd,
				chid:model.nvr.chid
			}
		};
		return camera_data;
	}
	procCamerasInfo(results){
		results.forEach(camera => {
			camera.temperature=camera.temperature+'℃';
			camera.up_to_time = this.convertToReadableTime(camera.up_to_time)
		})
		return results;
	}
	convertToReadableTime(uptime){
		var uptime = parseInt(uptime)
		var d = Math.floor(uptime / (3600*24))
		var h = Math.floor((uptime - (d*3600*24))/3600)
		var m = Math.floor((uptime - (d*3600*24) - (h*3600))/60)
		var s = uptime - (d*3600*24) - (h*3600) - m*60

		if(d > 0){
			return d+'天'+h+'小时'+m+'分'+s+'秒'
		}
		if(h > 0){
			return h+'小时'+m+'分'+s+'秒'
		}
		if(m > 0){
			return m+'分'+s+'秒'
		}
		if(s>0){
			return s+'秒'
		}
	}
	setNewCameraAddr(model){
		var stream={
			stream_addr:model.stream_addr
		}
	}
}