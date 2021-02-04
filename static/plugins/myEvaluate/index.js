let lastStr = "";
let evaMode = "edit";
let myEva = {
    init :function () {
        $('.satisfiedWrap .picItem div').on("click",function () {
            if(evaMode==="read"){
                return false;
            }
            let data = $(this).parent().attr("data");
            data = parseInt(data);
            let backTxt = $(this).css("background");
            let arr = backTxt.split("px");
            if(parseInt(arr[1])!==0){
                return false;
            }
            //全部置灰
            $('.satisfiedWrap .picItem div').each(function () {
                let data = $(this).parent().attr("data");
                data = parseInt(data);
                if(data===0){
                    $(this).css("background","url(../static/plugins/myEvaluate/starts.png) -274px -0px no-repeat");
                }else{
                    let p = data*90-270;
                    $(this).css("background","url(../static/plugins/myEvaluate/starts.png) "+p+"px -0px no-repeat");
                }
            });
            if(data===0){
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) -274px -94px no-repeat");
            }else{
                let p = parseInt(data)*90-270;
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) "+p+"px -92px no-repeat");
            }
            $('#evaluateModal .picItem').removeClass("satisfiedActive");
            //添加选中
            $(this).parent().addClass("satisfiedActive");
        });
        $('.satisfiedTxtWrap span').on("click",function () {
            if(evaMode==="read"){
                return false;
            }
            if($(this).hasClass("satisfiedTxtActive")){
                $(this).removeClass("satisfiedTxtActive");
            }else{
                $(this).addClass("satisfiedTxtActive");
            }
            let newStr = "";
            $('.satisfiedTxtActive').each(function () {
                newStr += "，"+$(this).html();
            })
            if(newStr){
                newStr = newStr.substring(1,newStr.length);
            }
            let tVal = $('.contentWrap textarea').val();
            tVal = tVal.replace(lastStr,"");
            tVal = newStr+tVal;
            $('.contentWrap textarea').val(tVal);
            lastStr = newStr;
        });
    },
    setMode:function(mode){
        evaMode = mode;
    },
    reset:function () {
        $('.satisfiedWrap .picItem div').each(function () {
            $(this).parent().removeClass("satisfiedActive");
            let data = $(this).parent().attr("data");
            data = parseInt(data);
            if(data===0){
                $(this).parent().addClass("satisfiedActive");
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) -274px -0px no-repeat");
            }else{
                let p = data*90-270;
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) "+p+"px -0px no-repeat");
            }
        });
        $('.satisfiedTxtWrap span').removeClass("satisfiedTxtActive");
        $('.contentWrap textarea').val("");
        $('.satisfiedTxtWrap span').removeClass("satisfiedTxtDisabled");
        $('.evaluateWrap textarea').removeAttr("disabled");
    },
    render:function(satisfied,content){
        this.reload();
        satisfied = parseInt(satisfied);
        $('.contentWrap textarea').val(content);
        $('.satisfiedWrap div').each(function () {
            let data = $(this).parent().attr("data");
            if(parseInt(data)===satisfied){
                $(this).click();
            }
        });
    },
    disabled:function () {
        evaMode = "read";
        $('.satisfiedTxtWrap span').addClass("satisfiedTxtDisabled");
        $('.evaluateWrap textarea').attr("disabled","disabled");
    },
    reload:function () {
        evaMode = "edit";
        $('.satisfiedWrap .picItem div').each(function () {
            $(this).parent().removeClass("satisfiedActive");
            let data = $(this).parent().attr("data");
            data = parseInt(data);
            if(data===0){
                $(this).parent().addClass("satisfiedActive");
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) -274px -94px no-repeat");
            }else{
                let p = data*90-270;
                $(this).css("background","url(../static/plugins/myEvaluate/starts.png) "+p+"px -0px no-repeat");
            }
        });
        $('.satisfiedTxtWrap span').removeClass("satisfiedTxtActive");
        $('.contentWrap textarea').val("");
        $('.satisfiedTxtWrap span').removeClass("satisfiedTxtDisabled");
        $('.evaluateWrap textarea').removeAttr("disabled");
    }
}
