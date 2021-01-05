
let localOutArr;
$(function () {

    //判断是否支持localstorage
    if(window.Storage && window.localStorage && window.localStorage instanceof Storage){
        // ....
    }else{
        alert("您的浏览器版本太旧，请更换谷歌或火狐!");
        return
    }
    if(!info){
        //熏染本地信息
        let imgSrc = localStorage.getItem("t-imgSrc");
        if(imgSrc){
            imgSrc = imgSrc.split(",")[0];
            $('.blog-details__image').find("img").attr("src","/img/"+imgSrc);
        }
        $('#type').html(localStorage.getItem("t-type"));
        $('.name').html(localStorage.getItem("t-name"));
        $('.sketch').html(localStorage.getItem("t-sketch"));
        $('.parameter').html(localStorage.getItem("t-parameter"));
        $('.feature').html(localStorage.getItem("t-feature"));
        $('.range').html(localStorage.getItem("t-range"));
        $('.achievement').html(localStorage.getItem("t-achievement"));
        $('#created').html(dateUtil.getNow());
        $('#view').html(1);
        $('.btnWrap').hide();
        $('#dateWrap').hide();
        $('#messageWrap').hide();
    }else{
        //熏染线上信息
        $('.parameter').html(info.parameter);
        $('.feature').html(info.feature);
        $('.range').html(info.range);
        $('.achievement').html(info.achievement);
        if(info.is_order==="0"){
            $('#btnHead').html("预约设备");
            $('#submitBtn').html("提交预约");
            $('#dateWrap').show();
        }else{
            $('#lib').hide();
        }
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
        //熏染本地存储
        renderModalLib();
    }

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
        if($(this).html()==="提交预约"){
            add();
        }else{
            addOrder();
        }

    });

    $('#lib').on("click",function () {
        $('#deviceInfo').show();
        $('#serviceInfo').hide();
        $('#libModal').modal("show");
    });

    $('#orderBtn').on("click",function () {
        submitOrder();
    });

    $('.preloader').fadeOut(200);

});

function add(){
    let loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        swal("系统提示","该操作需用户登录，请先登录！","warning");
        return false
    }
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
                swal("系统提示",r.msg+"，客服将尽快确认！","success");
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

//[{"type":"test1","count":10,"data":[{"Name":"测试"}]}]
function addOrder() {
    let num = $('#lib').find("span").html();
    $('#lib').find("span").html(parseInt(num)+1);
    $('#lib').show();
    //获取本地存储
    let localLibTemp = localStorage.getItem("lib");
    let localOutArr = [];
    let localInnerArr = [];
    let outItem = {};
    if(localLibTemp){
        localOutArr = JSON.parse(localLibTemp);
        outItem = findByType(info.typeName,localOutArr);
        localInnerArr = outItem.Data;
    }
    if(!localOutArr){
        localOutArr = [];
    }
    if(!outItem){
        outItem = {};
    }
    if(!localInnerArr){
        localInnerArr = [];
    }
    let id = info.id;
    let innerItem = findById(id,localInnerArr);
    if(!innerItem){
        innerItem = {};
        innerItem.Name = info.name;
        innerItem.DeviceId = info.id;
        innerItem.Type = info.typeName;
        innerItem.Count = 1;
        localInnerArr.push(innerItem);
    }else{
        innerItem.Count = innerItem.Count+1;
        //localInnerArr.splice(1,1,innerItem);
        localInnerArr = replaceItemById(innerItem,localInnerArr);
    }

    if(outItem.Type){
        outItem.Count = outItem.Count+1;
        outItem.Data = localInnerArr;
        //localOutArr.splice(1,1,outItem);
        localOutArr = replaceItemByType(outItem,localOutArr);
    }else{
        outItem.Tid = info.tid;
        outItem.Type = info.typeName;
        outItem.Count = 1;
        outItem.Data = localInnerArr;
        localOutArr.push(outItem);
    }

    localStorage.setItem("lib",JSON.stringify(localOutArr));
    swal("本地已成功加入实验计划","提示：需提交订单方可确认","success");
    renderModalLib();
}

function submitOrder() {
    let loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        swal("系统提示","该操作需用户登录，请先登录！","warning");
        return false;
    }
    let localLibTemp = localStorage.getItem("lib");
    if(!localLibTemp){
        showTip("当前未选中任何项目！")
        return false;
    }
    localOutArr = JSON.parse(localLibTemp);
    if(localOutArr.length===0){
        showTip("当前未选中任何项目！")
        return false;
    }

    let htmlTxt = $('#orderBtn').html();
    if(htmlTxt.indexOf("服务协议")!==-1){
        $('#deviceInfo').hide();
        $('#serviceInfo').show();
        $('#libModal').modal("hide");
    }else{
        let formData = {};
        formData["data"] = localLibTemp;
        formData["_xsrf"] = $("#token", parent.document).val();
        $.ajax({
            url : "/order/add",
            type : "POST",
            dataType : "json",
            cache : false,
            data : formData,
            beforeSend:function(){
                $('.preloader').fadeIn(200);
            },
            success : function(r) {
                if (r.code == 1) {
                    localStorage.setItem("lib","");
                    $('#libModal').modal('hide');
                    $('#lib').find("span").html(0);
                    $('#lib').hide();
                    $('.back').click();
                    swal("系统提示",r.msg+",客服将尽快确认！","success");
                }else{
                    swal("系统提示",r.msg,"error");
                }

            },
            complete:function () {
                $('.preloader').fadeOut(200);
            }
        });
    }

}

function renderModalLib() {
    let localLibTemp = localStorage.getItem("lib");
    if(localLibTemp){
        localOutArr = JSON.parse(localLibTemp);
        let count = 0;
        let errData = false;
        for(let i=0;i<localOutArr.length;i++){
            let outItem = localOutArr[i];
            let localCount = outItem.Count;
            let innerArr = outItem.Data;
            let continueFlag = false;
            //防止项目数据为空
            for(let j=0;j<innerArr.length;j++){
                if(!innerArr[j].Name){
                    localOutArr.pop(outItem);
                    continueFlag = true;
                    errData = true;
                    break
                }
            }
            if(!continueFlag){
                count += localCount;
            }
        }
        if(errData){
            localStorage.setItem("lib",JSON.stringify(localOutArr));
        }
        if(localOutArr&&localOutArr.length===0){
            return false;
        }
        $('#lib').find("span").html(count);
        $('#lib').show();
        //熏染modal
        $('.libItemWrap').html("");
        for(let i=0;i<localOutArr.length;i++){
            let outItem = localOutArr[i];
            let tid = outItem.Tid;
            let typeName = outItem.Type;
            let innerArr = outItem.Data;
            $('.libItemWrap').append('' +
                '<div class="typeItem">\n' +
                '   <div class="typeName">'+typeName+'</div>\n' +
                '   <hr>\n' +
                '<div class="dWrap'+tid+'"></div>'+
                '</div>');
            for(let j=0;j<innerArr.length;j++){
                let dName = innerArr[j].Name;
                let title = dName;
                dName = stringUtil.maxLength(dName,40);
                let dId = innerArr[j].Id;
                let count = innerArr[j].Count;
                if(count<10){
                    count = "0"+count;
                }
                $('.dWrap'+tid).append('<div class="dItem">\n<input type="hidden" value="'+dId+'" class="id">\n<i class="fa fa-files-o" aria-hidden="true"></i>\n<span class="dName" title="'+title+'">'+dName+'</span>\n<div class="countWrap" my-data="'+typeName+'" my-id="'+dId+'">\n<span class="cac cac1">-</span>&nbsp;&nbsp;<span class="count">'+count+'</span>&nbsp;&nbsp;<span class="cac cac2">+</span>\n</div>\n</div>');
            }
        }
    }
    $('.cac').on("click",function () {
        let count = $(this).parent().find(".count").html();
        count = parseInt(count);
        if($(this).hasClass("cac1")){
            if(count===0){
                return
            }
            count = count-1;
        }else{
            count = count+1;
        }
        let countTxt = count;
        if(count<10){
            countTxt = "0"+count;
        }
        let type = $(this).parent().attr("my-data");
        let id = $(this).parent().attr("my-id");
        let outItem = findByType(type,localOutArr);
        let innerItem = findById(id,outItem.Data);
        innerItem.Count = count;
        let innerArr = replaceItemById(innerItem,outItem.Data);
        outItem.Data = innerArr;
        outItem.Count = count;
        let outArr = replaceItemByType(outItem,localOutArr);
        localStorage.setItem("lib",JSON.stringify(outArr));
        $(this).parent().find(".count").html(countTxt);
        $('#lib').find("span").html(count);
    });
}

function findByType(type,localArr) {
    if(!localArr||localArr.length===0){
        return false
    }
    let backItem = "";
    for(let i=0;i<localArr.length;i++){
        let item = localArr[i];
        let localType = item.Type;
        if(type===localType){
            backItem = item;
            break
        }
    }
    return backItem;
}

function findById(id,localArr) {
    if(!localArr||localArr.length===0){
        return false
    }
    let backItem = "";
    for(let i=0;i<localArr.length;i++){
        let item = localArr[i];
        let localId = item.DeviceId;
        if(id===localId){
            backItem = item;
            break
        }
    }
    return backItem;
}

function replaceItemById(item,arr) {
    for(let i=0;i<arr.length;i++){
        if(item.Id==arr[i].Id){
            arr[i] = item;
            break
        }
    }
    return arr;
}

function replaceItemByType(item,arr) {
    for(let i=0;i<arr.length;i++){
        if(item.Type==arr[i].Type){
            arr[i] = item;
            break
        }
    }
    return arr;
}

function showTip(txt) {
    $('#modalTip').html(txt);
    setTimeout(function () {
        $('#modalTip').html("");
    },5000);
}