let typeId;
let localOutArr;
let url = "http://"+window.location.host;
let signTimerIndex = 0;
let signCode = stringUtil.randomString(6);
let loginFlag = $('#loginFlag').val();
let info = {};
let dataArr = [];
$(function () {
    //判断是否支持localstorage
    if(window.Storage && window.localStorage && window.localStorage instanceof Storage){
        // ....
    }else{
        alert("您的浏览器版本太低，请更换谷歌或火狐!");
        return
    }
    let tArr = window.location.href.split("/type/");
    if(tArr.length===2){
        typeId = tArr[1];
    }
    //熏染设备分类
    $.post("/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.data){
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let tid = item.id;
                $('#typeWrap').append('<a class="myBtn" sketch="'+item.description+'" data-filter="'+tid+'">'+item.name+'</a>');
            }
            $('#typeWrap').find("a").each(function () {
                $(this).on("click",function () {
                    if($(this).hasClass("filterActive")){
                        return
                    }
                    $('#typeWrap').find("a").removeClass("filterActive");
                    $(this).addClass("filterActive");
                    let data = $(this).attr("data-filter");
                    if(data==="0"){
                        //全部设备时自动熏染设备
                        renderDevice();
                        $('#typeChildWrap').html("");
                        $('.col-lg-4').fadeOut(10);
                        $('#deviceWrap').parent().removeClass("col-lg-8");
                        $('#deviceWrap').parent().addClass("col-lg-12");
                    }else{
                        renderChildType();
                        $('.col-lg-4').fadeIn(10);
                        $('#deviceWrap').parent().removeClass("col-lg-12");
                        $('#deviceWrap').parent().addClass("col-lg-8");
                    }
                });
            })
            if(typeId){
                $('.myBtn').each(function () {
                    let data = $(this).attr("data-filter");
                    if(data===typeId){
                        $(this).click();
                    }
                });
            }
        }
    });

    if(!typeId){
        renderDevice();
    }

    //熏染本地存储
    renderModalLib();
    if(loginFlag==="1"){
        renderInfo();
    }

    $('#submitBtn').on("click",function () {
        loginFlag = $('#loginFlag').val();
        if(loginFlag==="0"){
            swal("系统提示","该操作需用户登录，请先登录！","warning");
            return false
        }
        addOrder();

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
        $('.filterWrap').show(200);
        $('#deviceWrap').show(200);
        $('#typeWrap').show();
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

    $('.preloader').fadeOut(300);
})

function renderChildType(){
    typeId = $('#typeWrap').find(".filterActive").attr("data-filter");
    //$('.preloader').show(300);
    $.post("/typeChild/queryByTid",{_xsrf:$("#token", parent.document).val(),tid:typeId},function (res) {
        $('#typeChildWrap').html("");
        if(res.data){
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                if(i===0){
                    $('#typeChildWrap').append('<a class="myBtn filterActive" sketch="'+item.description+'" data-filter="'+item.id+'">'+item.name+'</a>');
                }else{
                    $('#typeChildWrap').append('<a class="myBtn" sketch="'+item.description+'" data-filter="'+item.id+'">'+item.name+'</a>');
                }
            }
            $('#typeChildWrap').find("a").each(function () {
                $(this).on("click",function () {
                    if($(this).hasClass("filterActive")){
                        return
                    }
                    $('#typeChildWrap').find("a").removeClass("filterActive");
                    $(this).addClass("filterActive");
                    renderDevice();
                });
            })
            renderDevice();
        }else{
            $('#deviceWrap').html("<span class='dataTip'>未找到项目!</span>");
        }
        renderSideBar();
        //$('.preloader').hide(300);
    });
}

function renderDevice(){
    renderSideBar();
    let typeId = $('#typeWrap').find(".filterActive").attr("data-filter");
    let ttid = $('#typeChildWrap').find(".filterActive").attr("data-filter");

    $('.preloader').fadeIn(300);
    $.post("/type/device",{_xsrf:$("#token", parent.document).val(),typeId:typeId,ttid:ttid},function (res) {
        if(res.data){
            $('#deviceWrap').html("");
            let arr = res.data;
            dataArr = arr;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let head = item.name;
                head = head.replace(" ","");
                head = head.replace("\n","");
                head = head.replace("\r","");
                head = head.replace("（","(");
                head = head.replace("）",")");
                head = head.replace(" ","");
                if(head.length>7){
                    head = head.substring(0,7)+"...";
                }
                let sketch = item.sketch;
                if(sketch.length>15){
                    sketch = sketch.substring(0,12)+"...";
                }
                let str = "添加实验";
                if(item.is_order!=="1"){
                    str = "立即预约"
                }
                let rid = item.rid;
                let img = item.img;
                $('#deviceWrap').append('' +
                    '<div id="'+item.id+'" class="deviceItem col-sm-3">\n' +
                    '  <a target="_blank" href="/detail/'+rid+'">' +
                    '    <img src="/img/'+img+'" onerror="this.src= \'../../static/img/default1.png\'; this.onerror = null;" alt="">'+
                    '  </a>\n' +
                    '  <div class="title" title="'+item.name+'">'+head+'</div>\n' +
                    '  <div class="sketch" title="'+item.sketch+'">'+sketch+'</div>\n' +
                    '  <a class="addBtn">'+str+'</a>\n' +
                    '</div>')
            }
            renderItemClick();
        }else{
            $('#deviceWrap').html("<span class='dataTip'>未找到项目!</span>");
        }
        if(typeId==="0"){
            $('.deviceItem').removeClass("col-sm-3");
            $('.deviceItem').addClass("col-sm-2");
        }else{
            $('.deviceItem').removeClass("col-sm-2");
            $('.deviceItem').addClass("col-sm-3");
        }
        $('.preloader').fadeOut(300);
    });
}

function renderSideBar() {
    let type1 = $('#typeWrap').find(".filterActive").html();
    let type2 = $('#typeChildWrap').find(".filterActive").html();
    let sketch1 = $('#typeWrap').find(".filterActive").attr("sketch");
    let sketch2 = $('#typeChildWrap').find(".filterActive").attr("sketch");
    $('.sidebar .sketch').html("");
    $('.typeHead').html("");
    $('.typeChildHead').html("");
    $('.typeHead').html(type1);
    $('.typeChildHead').html(type2);
    $('.typeSketch').html(sketch1);
    $('.typeChildSketch').html(sketch2);
    if(!type2){
        $('.typeChildHead').hide();
    }else{
        $('.typeChildHead').show();
    }
}

function renderFilter() {

}

function dataById(id) {
    let res = {};
    for(let i=0;i<dataArr.length;i++){
        let item = dataArr[i];
        let dataId = item.id;
        if(dataId==id){
            res = item;
        }
    }
    return res;
}

function renderItemClick(){
    $('.addBtn').on("click",function () {
        loginFlag = $('#loginFlag').val();
        if(loginFlag==="0"){
            swal("系统提示","该操作需用户登录，请先登录！","warning");
            return false;
        }
        let id = $(this).parent().attr("id");
        let item = dataById(id);
        if(!item){
            swal("系统提示","未找到项目信息！","error");
            return false;
        }
        if($(this).html().indexOf("立即预约")!==-1){
            let rid = item.rid;
            window.open("/detail/"+rid,"_blank");
        }else{
            info = item;
            addOrder();
        }
    })
}