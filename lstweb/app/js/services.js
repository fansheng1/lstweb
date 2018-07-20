var services=angular.module('app.services',[]);
services.service('appService',['$document',function($document){
	/* 拖拽函数 */
	this.drag=function(object,child, moveparent){
		var obj = $document[0].getElementById(object);
		if(arguments.length == 1){
			var pWidth = window.self.innerWidth;
			var pHeight = window.self.innerHeight;
			var moveNode = $document[0].getElementById(object);
		}else if(arguments.length == 2){
			obj = $document[0].getElementById(child);
			var moveNode = $document[0].getElementById(child);
			var pWidth = $document[0].getElementById(object).offsetWidth;
			var pHeight = $document[0].getElementById(object).offsetHeight;
		}else if(arguments.length == 3){
			if(moveparent){
				obj = $document[0].getElementById(child);
				var moveNode = $document[0].getElementById(object);
				var pWidth = window.self.innerWidth;
				var pHeight = window.self.innerHeight;
			}
		}
		obj.onmousedown = function(ev){
			var ev = ev || event;
			var disX = ev.clientX - moveNode.offsetLeft;
			var disY = ev.clientY - moveNode.offsetTop;

			var maxRight = pWidth - moveNode.offsetWidth;
			var maxBottom = pHeight - moveNode.offsetHeight;
			//阻止冒泡事件
			ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;

			$document[0].onmousemove = function(ev){
				var ev = ev || event;
				moveNode.style.left = ev.clientX - disX + 'px';
				moveNode.style.top = ev.clientY - disY+ 'px';
				//左侧
				if(moveNode.offsetLeft <=0){
					moveNode.style.left = 0;
				}
				//右侧
				if(moveNode.offsetLeft >= maxRight){
					moveNode.style.left = maxRight + 'px';
				}
				//上面
				if(moveNode.offsetTop <= 0){
					moveNode.style.top = 0;
				}
				//下面
				if(moveNode.offsetTop >= maxBottom){
					moveNode.style.top = maxBottom + 'px';
				}
			};
			$document[0].onmouseup = function(ev){
				$document[0].onmousemove = $document[0].onmouseup = null;
			};
		};
		return false;
	};
	/* 拖拽函数 End */
	/* 左侧二级导航展开函数 */
	this.Open=function(){
		$(".max-screen").css({"display":"block"});
		$(".min-screen").css({"display":"none"}); 
	  	$("#sidebar-left").css({"width":"232px"});
		$("#main-right").css({"padding-left":"242px"});
	}
	/* 左侧二级导航展开函数 End */
	/* 左侧二级导航关闭函数 */
	this.Close=function(){
		$(".max-screen").css({"display":"none"});
		$(".min-screen").css({"display":"block"}); 
	  	$("#sidebar-left").css({"width":"50px"});
		$("#main-right").css({"padding-left":"79px"});    
	}
	/* 左侧二级导航关闭函数 End */
}]);

