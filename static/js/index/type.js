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
                $('#typeWrap').append('<a class="myBtn" data-filter="'+tid+'">'+item.name+'</a>');
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
                        $('#typeChildWrap').html("");
                        renderDevice();
                    }else{
                        renderChildType();
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
    $('.preloader').fadeOut(200);
})

function renderChildType(){
    typeId = $('#typeWrap').find(".filterActive").attr("data-filter");
    $('.preloader').show(200);
    $.post("/typeChild/queryByTid",{_xsrf:$("#token", parent.document).val(),tid:typeId},function (res) {
        $('#typeChildWrap').html("");
        if(res.data){
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                if(i===0){
                    $('#typeChildWrap').append('<a class="myBtn filterActive" data-filter="'+item.id+'">'+item.name+'</a>');
                }else{
                    $('#typeChildWrap').append('<a class="myBtn" data-filter="'+item.id+'">'+item.name+'</a>');
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
            $('#deviceWrap').html("<span class='dataTip'>无匹配项!</span>");
        }
        $('.preloader').hide(200);
    });
}

function renderDevice(){
    let typeId = $('#typeWrap').find(".filterActive").attr("data-filter");
    let ttid = $('#typeChildWrap').find(".filterActive").attr("data-filter");

    $('.preloader').show(200);
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
                if(head.length>15){
                    head = head.substring(0,12)+"...";
                }
                let sketch = item.sketch;
                if(sketch.length>35){
                    sketch = sketch.substring(0,32)+"...";
                }
                let rid = item.rid;
                let img = item.img;
                $('#deviceWrap').append('' +
                    '<div class="col-md-4">\n' +
                    '   <div class="blog-one__single">\n' +
                    '       <div class="blog-one__image">\n' +
                    '           <a target="_blank" href="/detail/'+rid+'">\n' +
                    '               <img src="/img/'+img+'" onerror="this.src= \'../../static/img/default2.png\'; this.onerror = null;this.style.marginTop=\'0px\';this.style.marginLeft=\'0px\'" alt="">\n' +
                    '           </a>\n' +
                    '       </div>\n' +
                    '       <div class="blog-one__content">\n' +
                    '       <div class="itemHead" title="'+item.name+'">'+head+'</div>\n' +
                    '           <p class="sketch" title="'+item.sketch+'">'+sketch+'</p>\n ' +
                    '           <a href="/detail/'+rid+'" target="_blank" class="blog-one__link">查看详情</a>\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '</div>');
            }
        }else{
            $('#deviceWrap').html("<span class='dataTip'>无匹配项!</span>");
        }
        $('.preloader').hide(200);
    });
}