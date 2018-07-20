$(function(){
	var toggleFun=function(){
		console.log("1");
		console.log($(".toggle-btn").html());
		if(toggleBtn){
			toggleBtn.click(function(){
				console.log("1");
			});
		}
	}
	toggleFun();
})