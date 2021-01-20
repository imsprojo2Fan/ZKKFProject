let typeId;

$(function () {
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
            $('#deviceWrap').html("<span class='dataTip'>无匹配项目!</span>");
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
                    '<div class="deviceItem col-sm-3">\n' +
                    '  <a target="_blank" href="/detail/'+rid+'">' +
                    '    <img src="/img/'+img+'" onerror="this.src= \'../../static/img/default1.png\'; this.onerror = null;" alt="">'+
                    '  </a>\n' +
                    '  <div class="title" title="'+item.name+'">'+head+'</div>\n' +
                    '  <div class="sketch" title="'+item.sketch+'">'+sketch+'</div>\n' +
                    '  <a class="addBtn">'+str+'</a>\n' +
                    '</div>')
            }
        }else{
            $('#deviceWrap').html("<span class='dataTip'>无匹配项目!</span>");
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