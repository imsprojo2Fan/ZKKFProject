$(function () {

    //判断是否支持localstorage
    if(window.Storage && window.localStorage && window.localStorage instanceof Storage){
        // ....
    }else{
        alert("您的浏览器版本太旧，请更换谷歌或火狐!");
        return
    }

    //熏染信息
    let imgSrc = localStorage.getItem("t-imgSrc");
    if(imgSrc){
        imgSrc = imgSrc.split(",")[0];
        $('.blog-details__image').find("img").attr("src","/img/"+imgSrc);
    }
    $('#type').html(localStorage.getItem("t-type"));
    let name = localStorage.getItem("t-name");
    $('.itemHead').html("<h4>"+name+"</h4>");
    $('.sketch').html(localStorage.getItem("t-sketch"));
    $('.parameter').html(localStorage.getItem("t-parameter"));
    $('.feature').html(localStorage.getItem("t-feature"));
    $('.range').html(localStorage.getItem("t-range"));
    $('.achievement').html(localStorage.getItem("t-achievement"));
    $('#created').html(dateUtil.getNow());
    $('#view').html(1);
    $('.btnWrap').hide();
    $('#dateWrap').hide();

    //初始化时间选择插件
    $("#dateInput").datepicker({
        language: 'zh-CN', //设置语言
        autoclose: true, //选择后自动关闭
        clearBtn: true,//清除按钮
        format: "yyyy-mm-dd",//日期格式
        //todayHighlight: true,
        todayBtn: 'linked',
        defaultViewDate: dateUtil.getNow(),
        startDate:dateUtil.getNow()
    });
    $("#dateInput").val(dateUtil.getNow());
    $("#dateInput").datepicker().on('hide', function (e) {
        if(!$("#dateInput").val()){
            $("#dateInput").val(dateUtil.getNow());
        }
        renderTime();
    });

    //熏染可预约时间
    renderTime();

    $('.myBtn').on("click",function () {
        if($(this).hasClass("thm-btnActive")){
            return false
        }
        $('.btnWrap').find("button").removeClass("thm-btnActive");
        $(this).addClass("thm-btnActive");
        if($(this).html()==="预约设备"){
            $('#dateWrap').show();
        }else{
            $('#dateWrap').hide();
        }
    });
    $('.preloader').fadeOut(200);

});

function renderTime(){
    let deviceId;
    let date;
    let wrapObj;
    deviceId = $('#deviceId').val();
    date = $('#dateInput').val();
    wrapObj = $(".timeWrap");
    let nowDate = dateUtil.getNow();
    let useFlag = dateUtil.compareDate(date,nowDate);
    //loading(true,2);
    $.post("/reservation/timeQuery",{_xsrf:$("#token", parent.document).val(),deviceId:deviceId,date:date},function (res) {
        if(res.code===1){
            //loading(false,2);
            let tList = res.data;
            if(tList){
                wrapObj.html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let isUse = item.isUse;
                    let id = item.tId;
                    let time = item.time;
                    //判断是否该时段早于当前时间
                    let timeFlag = dateUtil.compareTime(date+" "+time.substring(0,2)+":00:00");
                    //当前预约日期小于当前日期时则禁用选择
                    if(!useFlag||!timeFlag||isUse===1){
                        wrapObj.append('<span mydata="'+id+'" class="timeItem-disabled">'+time+'</span>');
                    }else{
                        wrapObj.append('<span mydata="'+id+'" class="timeItem">'+time+'</span>');
                    }
                }
                $('.timeItem').on("click",function () {
                    $('.timeItemActive').addClass("timeItem");
                    $('.timeItemActive').removeClass("timeItemActive");
                    $(this).addClass("timeItemActive");
                });
            }else{
                wrapObj.html('');
                wrapObj.append('<span style="color: red;display: block;margin-top: 6px">暂无可选时间，请先添加!</span>');
            }
        }
    });

}