
(function() {
	var timer = setTimeout(function(){
		var un = document.getElementById("topUserName")
		if(un == undefined) {
			return
		}

		if(sessionStorage.user == undefined) {
			un.innerText = "未登录"
		} else {
			var user = JSON.parse(sessionStorage.user)
			un.innerText = user.name
		}
		clearTimeout(timer)
	}, 1000);
})()

var browser = (function(){
	var userAgent = navigator.userAgent,
	ua = userAgent.toLowerCase(),
	browserList = {
		msie : /(?:msie\s|trident.*rv:)([\w.]+)/i,
		firefox : /Firefox\/([\w.]+)/i,
		chrome : /Chrome\/([\w.]+)/i,
		safari : /version\/([\w.]+).*Safari/i,
		opera : /(?:OPR\/|Opera.+version\/)([\w.]+)/i
	},
	kernels = {
		MSIE: /(compatible;\smsie\s|Trident\/)[\w.]+/i,
		Camino: /Camino/i,
		KHTML: /KHTML/i,
		Presto: /Presto\/[\w.]+/i,
		Gecko : /Gecko\/[\w.]+/i,
		WebKit: /AppleWebKit\/[\w.]+/i
	},
	browser = {
		kernel : 'unknow',
		version : 'unknow'
	}
	// 检测浏览器
	for(var i in browserList){
		var matchs = ua.match(browserList[i]);
		browser[i] = matchs ? true : false;
		if(matchs){
			browser.version = matchs[1];
		}
	}
	// 检测引擎
	for(var i in kernels){
		var matchs = ua.match(kernels[i]);
		if(matchs){
			browser.kernel = matchs[0];
		}
	}
	// 系统
	var os = ua.match(/(Windows\sNT\s|Mac\sOS\sX\s|Android\s|ipad.*\sos\s|iphone\sos\s)([\d._-]+)/i);
	browser.os = os!==null ? os[0] : false;
	// 是否移动端
	browser.mobile = ua.match(/Mobile/i)!==null ? true : false;
	return browser;
}());


(function(){
	if(browser.chrome || browser.firefox) {
		return
	}
	alert("本应用需要火狐或chrome浏览器支持。请点击本页链接下载 谷歌浏览器 (chrome) 或者 火狐浏览器(firefox)");
}());

//在线
function networkOnline(){
	var baiduMapImpot = document.createElement("script");
	baiduMapImpot.type = "text/javascript";
	baiduMapImpot.src = "app/js/baidu-map-import.js";
	document.body.appendChild(baiduMapImpot);
}
//离线
function networkOffline(){
	var offlineScript =  document.createElement("script");
	offlineScript.src = " ";
	offlineScript.type = "text/javascript";
	document.body.appendChild(offlineScript);
}

function checkTableTdItem(td, event){
	var event = event||arguments.callee.caller.arguments[0]

	if(td == null){
		return
	}

	td.childNodes.forEach((e)=>{
		if(e.tagName == 'INPUT'){
			if(event.target != e){
				e.checked = !e.checked
			}
		}
	})
}

function checkTableTrItem(tr, event){
	var event = event||arguments.callee.caller.arguments[0];
	var index = 0, td_index = -1;

	if(tr == null){
		return
	}
	tr.childNodes.forEach((td, i)=>{
		if(td.nodeName != 'TD')
			return;
		td_index++;
		
		if(td_index == index) {
			td.childNodes.forEach((e)=>{
				if(e.tagName == 'INPUT'){
					if(event.target != e){
						e.checked = !e.checked;
					}
				}
			})
		}
	})
}

// date test function
// d1 > d2, return >0
// d1 = d2, return 0
// d1 < d2, return <0
function compareDatetime(dt1, dt2){
	var d1 = new Date(dt1);
	var d2 = new Date(dt2);

	var delta = (d1.getFullYear() - d2.getFullYear());
	if(delta != 0){
		return delta;
	}
	delta = d1.getMonth()-d2.getMonth();
	if(delta != 0){
		return delta;
	}
	delta = d1.getDate()-d2.getDate();
	if(delta != 0){
		return delta;
	}
	delta = d1.getHours()-d2.getHours();
	if(delta != 0){
		return delta;
	}
	delta = d1.getMinutes()-d2.getMinutes();
	if(delta != 0){
		return delta;
	}
	delta = d1.getSeconds()-d2.getSeconds();
	return delta;
}

//进度条
function progre(timer){
	var time=setInterval(function(){
		var  v=progress.value;
		if(v>0){
			$("#progress").css("display","block");
		}
		v=parseFloat(v);
		v+=10;
		progress.value=v;
		if(v>=100){
			clearInterval(time);
			progress.remove();
		}
	},300);
}

class FlashPlayer {
	constructor(player_id){
		this.player_name = player_id
		this.video_url = ""
	}
	getFlexApp(appName) {
		if (navigator.appName.indexOf ("Microsoft") !=-1) {
			return window[appName];
		} else {
			return document[appName];
		}
	}

	play(video_url){
		if(video_url) {
			this.video_url = video_url
		}
		if(this.video_url == ""){
			return
		}
		this.getFlexApp(this.player_name).myPlayed(this.video_url);
	}
	pause(){
		this.getFlexApp(this.player_name).myPause();
	}
	stop(){
		this.getFlexApp(this.player_name).myStop();
	}
	continue(){
		this.getFlexApp(this.player_name).myContinue();
	}
	setSlide(){
		this.getFlexApp(this.player_name).mySlide(10);
	}
	alertTotalTime(){
		alert(this.getFlexApp(this.player_name).myTotalTime());
	}
}

