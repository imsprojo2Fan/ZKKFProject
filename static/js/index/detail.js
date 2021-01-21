
let localOutArr;
let url = "http://"+window.location.host;
let signTimerIndex = 0;
let signCode = stringUtil.randomString(6);
let loginFlag = $('#loginFlag').val();
$(function () {
    //判断是否支持localstorage
    if(window.Storage && window.localStorage && window.localStorage instanceof Storage){
        // ....
    }else{
        alert("您的浏览器版本太低，请更换谷歌或火狐!");
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
        let name = localStorage.getItem("t-name");
        $('.deviceName').html("<h4>"+name+"</h4>");
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
        if(!info.parameter){
            $('.parameter').parent().remove();
        }else{
            $('.parameter').html(info.parameter);
        }
        if(!info.feature){
            $('.feature').parent().remove();
        }else{
            $('.feature').html(info.feature);
        }
        if(!info.range){
            $('.range').parent().remove();
        }else{
            $('.range').html(info.range);
        }
        if(!info.achievement){
            $('.achievement').parent().remove();
        }else{
            $('.achievement').html(info.achievement);
        }
        let standard = info.standard;
        if(standard){
            for(let i=0;i<standard.length;i++){
                let item = standard[i];
                let fileName = item.OriName;
                if(!fileName){
                    continue
                }
                $('.standard').append("<a title='点击下载' data='"+fileName+"' href='javascript:void(0);'>"+fileName+"</a><br>");
            }
        }else{
            $('.standard').parent().remove();
        }
        let drawing = info.drawing;
        if(drawing){
            for(let i=0;i<drawing.length;i++){
                let item = drawing[i];
                let fileName = item.OriName;
                if(!fileName){
                    continue
                }
                $('.drawing').append("<a title='点击下载' data='"+fileName+"' href='javascript:void(0);'>"+fileName+"</a><br>");
            }
        }else{
            $('.drawing').parent().remove();
        }
        if(info.is_order==="0"){
            $('#btnHead').html("预约设备");
            $('#submitBtn').html("提交预约");
            $('#dateWrap').show();
            //熏染可预约时间
            renderTime();
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
        if(loginFlag==="1"){
            renderInfo();
        }
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
        loginFlag = $('#loginFlag').val();
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
        loginFlag = $('#loginFlag').val();
        if(loginFlag==="0"){
            swal("系统提示","该操作需用户登录，请先登录！","warning");
            return false;
        }
        $('#protocolInfoTip').hide();
        //$('#pdfBtn').hide(200);
        $('#protocolInfo').hide(200);
        $('.submitBtn').hide(200);
        $('#signCode').hide(200);
        $('#deviceInfo').show(200);
        $('#searchWrap').show(200);
        if($(this).find("img").attr("src").indexOf("refresh")!==-1){
            $(this).find("img").attr("src","../static/img/lib.png");
        }else{
            $('#libModal').modal("show");
        }
    });

    makeCode("signCode",url+"/sign?code="+signCode,108,108);

    $('#orderBtn').on("click",function () {
        showProtocol();
    });

    $('.sign').on("click",function () {
        openWindow("/sign?code="+signCode,"签字板",1000,600);
    })

    $('.submitBtn').on("click",function () {
        let signImg = $('.sign img').attr("src");
        if(!signImg){
            swal("系统提示","请在甲方代表签字处签字","error");
            return false;
        }
        swal({
            title: "是否已确认提交信息?",
            text: '提交信息后将不可更改，请务必保存协议文件！',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff1200',
            cancelButtonColor: '#ff1200',
            confirmButtonText: '是',
            cancelButtonText:'否'
        },function(){
            submitOrder();
        });
    });

    $('#pdfBtn').on("click",function () {
        imgUtil.addWatermark("protocolInfo","中科科辅");
        imgUtil.domShot("protocolInfo",imgUtil.pagePdf,"中科科辅服务协议/"+dateUtil.nowTime());
    });

    $('.download a').on("click",function () {
        let fileName = $(this).attr("data");
        $('#downloadBtn').attr("href","/download/"+fileName);
        $('#downloadBtn')[0].click();
    });

    $('.weekWrap span').on("click",function () {
        if($(this).hasClass("weekWrapActive")){
            return false;
        }
        $('.weekWrap span').removeClass("weekWrapActive");
        $(this).addClass("weekWrapActive");
    });

    $('.preloader').fadeOut(200);

});

