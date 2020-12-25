$(function () {

    //熏染设备分类
    $.post("/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.data){
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                $('#typeWrap').append('<a data-filter="'+item.id+'">'+item.name+'</a>');
            }
            $('#typeWrap').find("a").each(function () {
                $(this).on("click",function () {
                    if($(this).hasClass("filterActive")){
                        return
                    }
                    $('#typeWrap').find("a").removeClass("filterActive");
                    $(this).addClass("filterActive");
                    renderDevice();
                });
            })
        }
    })

    renderDevice();

    $('.preloader').fadeOut(200);
})

function renderDevice(){
    let typeId = $('#typeWrap').find(".filterActive").attr("data-filter");
    $('.preloader').show("slow");
    $.post("/type/device",{_xsrf:$("#token", parent.document).val(),typeId:typeId},function (res) {
        if(res.data){
            $('#deviceWrap').html("");
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let head = item.name;
                if(head.length>25){
                    head = head.substring(0,22)+"...";
                }
                let sketch = item.sketch;
                if(sketch.length>45){
                    sketch = sketch.substring(0,42)+"...";
                }
                let rid = item.rid;
                let img = item.img;
                $('#deviceWrap').append('' +
                    '<div class="col-md-4">\n' +
                    '   <div class="blog-one__single">\n' +
                    '       <div class="blog-one__image">\n' +
                    '           <a target="_blank" href="/detail/'+rid+'">\n' +
                    '               <img src="/img/'+img+'" onerror="this.src= \'../../static/img/default2.png\'; this.onerror = null;this.style.marginTop=\'18px\';this.style.marginLeft=\'45px\'" alt="">\n' +
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
            $('#deviceWrap').html("<span class='dataTip'>无匹配设备!</span>");
        }
        $('.preloader').hide("slow");
    });
}