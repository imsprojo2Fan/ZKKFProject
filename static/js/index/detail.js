$(function () {

    //熏染信息
    $('.parameter').html(info.parameter);
    $('.feature').html(info.feature);
    $('.range').html(info.range);
    $('.achievement').html(info.achievement);
    let imgSrc = info.img;
    if(imgSrc){
        imgSrc = imgSrc.split(",")[0];
        $('.blog-details__image').find("img").attr("src","/img/"+imgSrc);
    }
    $('#type').html(info.typeName);
    let time = info.created.substring(0,19);
    time = time.replace("T"," ");
    $('#created').html(time);
    $('#view').html(info.view);

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

    $('#submitBtn').on("click",function () {
        let loginFlag = $('#loginFlag').val();
        if(loginFlag==="0"){
            swal("系统提示","该操作需用户登录，请先登录！","warning");
            return false
        }
        add();
    });

    $('.preloader').fadeOut(200);

});

function add(){
    let date = $('#dateInput').val().trim();
    let timeId = $('#dateWrap').find(".timeItemActive").attr("mydata");
    let message = $('#message').val().trim();
    if (!timeId){
        swal("系统提示",'您未选择任何预约时间！',"warning");
        return;
    }

    //let formData = formUtil('addForm');
    let formData = {};
    formData["deviceId"] = $('#deviceId').val();
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["message"] = message;
    $.ajax({
        url : "/reservation/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            $('.preloader').fadeIn(200);
        },
        success : function(r) {
            if (r.code == 1) {
                renderTime();
                $('#message').val("");
                swal("系统提示",r.msg+",客服将尽快与您联系！","success");
            }else{
                swal("系统提示",r.msg,"error");
            }

        },
        complete:function () {
            $('.preloader').fadeOut(200);
        }
    });
}

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
                        wrapObj.append('<span title="已过期或已被预约" mydata="'+id+'" class="timeItem-disabled">'+time+'</span>');
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