(function($){
    function createTips(){
        $("body").append("<div class=\"LstModal\"><div id=\"tipsBox\"><div class=\"alertBody\"></div></div></div>");
    }
    function createInquiry(msg,Fun){
        window.inquiry = function(){
          Fun();
          $.hiddenInquiry();
        };
        $("[ui-view]").append(`<div class=\"LstInquiry\" onclick="$.hiddenInquiry()">
                            <div class="LstInquiryContext" onclick="event.stopImmediatePropagation();">
                                <div class="LstInquiryBody">
                                    `+msg+`
                                </div>
                                <div class="LstInquiryFooter">
                                    <button onclick="inquiry()">确定</button>
                                    <button onclick="$.hiddenInquiry()">取消</button>
                                </div>
                            </div>
                          </div>`);
    }
    $.extend({
        LstTips:function(msg,during=2000){
            setTimeout(function(){
                createTips();
                if(!msg){
                    $(".alertBody").text("请开发人员检查语法");
                    $.closeTips();
                }else{
                    $(".alertBody").text(msg)
                }
            },20);
            setTimeout(function(){
                $.closeTips();
            },during);
        },
        closeTips:function(){
            $(".LstModal").remove();
        },
        LstDialog:function (elm,width=800,top=20,controller=true){
            let elmen = $(elm);
            elmen[0].onclick = function(event){
                event.stopImmediatePropagation();  //阻止冒泡
            };
            elmen.attr("dialog","true");
            let str = elm + '_dialog_wrap'
            if($(str).length==0){
                let notDotStr = str.slice(1,str.length)
                let elmstr = "<div class="+ notDotStr+" dialog-toggle='true' style='position:fixed;top:0;bottom:0;right:0;left:0;background:rgba(0,0,0,0.5);z-index:800'></div>";
                elmen.wrapAll(elmstr);
            }else{
                $(str).attr("dialog-toggle","true");
            }
            elmen.css({background:"#fff",margin:"20px auto"});
            elmen.css("marginTop",top+ 'px');
            elmen.css("width",width + 'px');
            let arr = $('[dialog-toggle]');
            for(let i = 0;i<arr.length;i++){
                let notDotStr = str.slice(1,str.length);
                let RegStr = new RegExp(notDotStr);
                if(!RegStr.test(arr[i].className)){
                    arr[i].onclick = function(event){
                        event.stopImmediatePropagation();  //阻止冒泡
                        $.hiddenDialog(arr[i],'built-in');
                    }
                }else if(controller){
                    arr[i].onclick = function(event){
                        event.stopImmediatePropagation();  //阻止冒泡
                        $.hiddenDialog(arr[i],'built-in');
                    }
                }
            }
        },
        hiddenDialog:function(el,code){
            if(code == 'built-in'){
                if(el.nodeName == "DIV"){
                    $(el).attr("dialog-toggle","false");
                }else{
                    $(el.offsetParent).attr("dialog-toggle","false");
                }
            }else{
                let str = el + '_dialog_wrap'
                $(str).attr("dialog-toggle","false");
            }
        },
        LstInquiry:function(msg,Fun){
            createInquiry(msg,Fun);
        },
        hiddenInquiry:function(){
            $(".LstInquiry").remove();
            window.inquiry = null;
        }
    });
     $.extend({
         uniq:function(array){ //数组不改变原对象去重,如果要改变原数组，用$.unqueued(arr)的方法
             let temp = [];
             for(let i = 0; i < array.length; i++) {//如果当前数组的第i项在当前数组中第一次出现的位置是i，才存入数组；否则代表是重复的
                 array.indexOf(array[i]) == i ? temp.push(array[i]) : undefined;
             }
             return temp;
         },
         uniqKeys:function(arr,key){ // 针对数组对象中的某个KEY值去重,传入key
             let hash = {};
             arr = arr.reduce(function(item, next) {
                 hash[next[key]] ? '' : hash[next[key]] = true && item.push(next);
                 return item
             }, []);
             return arr
         }
     })
})(jQuery);