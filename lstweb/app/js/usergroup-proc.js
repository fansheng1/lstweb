class RoleModel {
	constructor(){
		this.module_names = []
		this.name_set = new Set()
	}

	sortRightsList(list){
		var m = new Map()
		list.forEach((e)=>{
			var names = e.name.split("/")
			var module_name = names[0];

			var a = m.get(module_name)
			if(a == undefined){
				a = []
			}
			a.push(e)
			m.set(module_name, a)
		})

		var LIST = []
		m.forEach((v,k)=>{
			LIST = LIST.concat(v)
		})
		return LIST
	}

	Rolemodel(Role) {
		var model = null;

		try{
			model = {
				id: Role.role_id,
				name: Role.role_name,
				desc: Role.role_desc,
				rights: []
			}

			Role.rights.forEach((e)=>{
				model.rights.push({
					id: e.id, name: e.name, read: e.read, write: e.write, exec: e.exec
				})
			})

			model.rights = this.sortRightsList(model.rights)
			
		} catch(e){
			console.log(e)
		}

		return model
	}

	Rightsmodel(ApiRoleRights) {
		var model = null;

		try{
			model = {
				id: ApiRoleRights.id,
				name: ApiRoleRights.name,
				desc: ApiRoleRights.desc,
				short_name: ApiRoleRights.short_name,
				rights: ApiRoleRights.rights
			}
			
		} catch(e){
			console.log(e)
		}

		return model
	}

	setNewRoleData(model){
		var role_data = {
			role_name: $("#role_name").val(),
			role_remark: $("#role_remark").val(),
		};
		return role_data;
	}

	setNewRightsData(model){
		var rights_data = {
			name: model.name,
			desc: model.desc,
			short_name:model.short_name,
			id: "",
			rights: model.rights
		};
		return rights_data;
	}

	newRoleResponseModel(data){
		var model = {};

		if (data.status == true) {
			model.role_id = data.role_id
			model.role_name = data.role_name
			model.role_remark = data.role_remark
		}
		return model;
	}

	newRightsResponseModel(data){
		var model = {};

		if (data.status == true) {
			model.id = data.id
			model.name = data.name
			model.desc = data.desc
			model.short_name = data.short_name
			model.rights = data.rights
		}
		return model;
	}

}