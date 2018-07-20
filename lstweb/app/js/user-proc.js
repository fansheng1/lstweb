class UserModel {
	constructor(){
	}

	Usermodel(UserInfo) {
		var model = null;

		try{
			model = {
				user_id: UserInfo.user_id,
				user_name: UserInfo.user_name,
				u_name: UserInfo.u_name,
				u_passwd:UserInfo.passwd,
				u_age:UserInfo.age,
				u_phone:UserInfo.phone,
				u_address:UserInfo.address,
				role_id:UserInfo.role_id
			}
			
		} catch(e){
			console.log(e)
		}

		return model
	}

	setNewUserData(model){
		var user_data = {
			user_name: model.user_name,
			u_name: model.u_name,
			u_passwd: model.u_passwd,
			u_age: model.u_age,
			u_phone: model.u_phone,
			u_address: model.u_address,
			role_id:model.role_id
		};
		return user_data;
	}

	newUserResponseModel(data){
		var model = {};

		if (data.status == true) {
			model.user_id = data.user_id
			model.user_name = data.user_name
			model.u_name = data.u_name
			model.u_passwd = data.passwd
			model.u_age = data.age
			model.u_phone = data.phone
			model.u_address = data.address
			model.role_id =data.role_id
		}
		return model;
	}

}