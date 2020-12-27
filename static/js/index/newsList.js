$(function () {

    renderNews();

    $('.preloader').fadeOut(200);
})

function renderNews(){
    $.post("/news/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.data){
            $('#newsWrap').html("");
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let head = item.title;
                if(head.length>25){
                    head = head.substring(0,22)+"...";
                }
                let content = item.content;
                if(content.length>45){
                    content = content.substring(0,42)+"...";
                }
                let rid = item.rid;
                let img = item.img;
                $('#newsWrap').append('' +
                    '<div class="col-md-4">\n' +
                    '   <div class="blog-one__single">\n' +
                    '       <div class="blog-one__image">\n' +
                    '           <a target="_blank" href="/detail/'+rid+'">\n' +
                    '               <img src="/img/'+img+'" onerror="this.src= \'../../static/img/default2.png\'; this.onerror = null;this.style.marginTop=\'18px\';this.style.marginLeft=\'45px\'" alt="">\n' +
                    '           </a>\n' +
                    '       </div>\n' +
                    '       <div class="blog-one__content">\n' +
                    '       <div class="itemHead" title="'+item.name+'">'+head+'</div>\n' +
                    '           <p class="sketch" title="'+item.sketch+'">'+content+'</p>\n ' +
                    '           <a href="/detail/'+rid+'" target="_blank" class="blog-one__link">查看详情</a>\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '</div>');
            }
        }else{
            $('#newsWrap').html("<span class='dataTip'>无新闻动态!</span>");
        }
    });
}