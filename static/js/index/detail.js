
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
            $('#submitBtn').html("实验要求&nbsp;<i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i>");
            $('#messageWrap').show();
            $('#dateWrap').show();
            $('#lib').hide();
            //熏染可预约时间
            renderTime();
        }else{
            //熏染本地存储
            renderModalLib();
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

        if(loginFlag==="1"){
            renderInfo();
        }
        //熏染关联项目
        renderRelate();
    }

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
        if($(this).html().indexOf("添加实验")!==-1){
            addOrder();
        }else{
            let timeId = $('.clickActive').attr("timeId");
            if (!timeId){
                swal("系统提示",'您未选择任何预约时间！',"warning");
                return;
            }
            showProtocolForReservation();
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
        if($(this).find("img").attr("src").indexOf("back")!==-1){
            $(this).find("img").attr("src","../static/img/lib.png");
            if(info.is_order=="0"){
                $(this).hide();
            }
        }else{
            $('#libModal').modal("show");
        }
    });

    makeCode("signCode",url+"/sign?code="+signCode,108,108);

    $('#orderBtn').on("click",function () {
        showProtocolForOrder();
    });

    $('.sign').on("click",function () {
        openWindow("/sign?code="+signCode,"签字板",1200,600);
    })

    $('.submitBtn').on("click",function () {
        let signImg = $('.sign img').attr("src");
        if(!signImg){
            swal("系统提示","请在甲方代表签字处签字","error");
            return false;
        }
        let typeBtn = $(this).html();
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
            if(typeBtn==="提交实验"){
                submitOrder();
            }else{
                addReservation();
            }

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
        renderTime();
    });

    renderEvaluate();

    renderBarcode();

    $('.preloader').fadeOut(200);

});

function renderRelate() {
    let ids = info.relate;
    $('.sidebar__post').html("无关联项目!");
    $.post("/detail/relate",{_xsrf:$('#token').val(),ids:ids},function (res) {
        if(res.code===1){
            let data = res.data;
            if(data){
                $('.sidebar__post').html("");
            }
            for(let i=0;i<data.length;i++){
                let item = data[i];
                let rid = item.Rid;
                let name = item.Name;
                name = stringUtil.maxLength(name,10);
                let sketch = item.Sketch;
                sketch = stringUtil.maxLength(sketch,25);
                let imgSrc = info.Img;
                if(imgSrc){
                    imgSrc = imgSrc.split(",")[0];
                }
                $('.sidebar__post').append('' +
                    '<div class="sidebar__post-single">\n' +
                    '   <div class="sidebar__post-image">\n' +
                    '       <img src="/img/'+imgSrc+'" onerror="this.src= \'../../static/img/default1.png\'; this.onerror = null;this.style.marginTop=\'0px\';this.style.marginLeft=\'0px\'">\n' +
                    '   </div>\n' +
                    '   <div class="sidebar__post-content">\n'+
                    '       <p>'+sketch+'</p>' +
                    '       <h3><a target="_blank" href="/detail/'+rid+'">'+name+'</a></h3>\n' +
                    '   </div>\n' +
                    '</div>');
            }
        }
    });
}

function renderEvaluate(){
    if(!eArr){
        $('.commentWrap').html("<p>暂无服务评价</p>");
        return
    }
    $('.commentWrap').html("");
    for(let i=0;i<eArr.length;i++){
        let item = eArr[i];
        let satisfied = item.satisfied;
        let satisfiedTxt = '非常满意';
        let cStatus;
        if(satisfied==1){
            satisfiedTxt = "满意";
        }else if(satisfied==2){
            cStatus = "cStatus-gray";
            satisfiedTxt = "一般";
        }else if(satisfied==3){
            cStatus = "cStatus-red";
            satisfiedTxt = "不满意";
        }
        let created = item.created;
        created = created.replace("T"," ");
        created = created.replace("+08:00","");
        $('.commentWrap').append('' +
            '<div class="cItem">\n' +
            '   <div class="cHead">\n' +
            '       <div class="avatar"><i class="fa fa-user-circle" aria-hidden="true"></i></div>\n' +
            '       <div class="cName">'+item.name+'&nbsp;&nbsp;&nbsp;['+item.company+']</div>\n' +
            '       <div class="satisfied '+cStatus+'">'+satisfiedTxt+'</div>\n' +
            '       <div class="cTime"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;'+created+'</div>\n' +
            '   </div>\n' +
            '   <div class="cContent">\n' +
            '       <span class="cContentTxt">'+item.content+'</span>\n' +
            '   </div>\n' +
            '</div>');
    }
}

function renderBarcode() {
    if(!lInfo){
        return
    }
    let barcode = "B"+lInfo.rid;
    $('.barcodeWrap').data("data",barcode);
    JsBarcode("#barcode",barcode,{
        displayValue: true,
        height:40,
        width:1.5
    });
}
function myPrint(){
    let dom = document.getElementById('barcode');
    let win = window.open('/');
    win.document.write(dom.outerHTML);
    win.print();
    win.close();
}

