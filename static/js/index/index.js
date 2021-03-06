$(window).on('load', function () {

    //熏染导航
    $('body').scrollspy({
        target: '#nav',
        offset: $(window).height() / 2
    });

    $('.moreDevice').on("click",function () {
        window.open("/type","_blank");
    });

    ///////////////////////////
    // Smooth scroll
    $(".main-nav__navigation-box a[href^='#']").on('click', function(e) {
        let href = $(this).attr("href");
        $('.main-nav-one a').removeClass("a_active");
        $('.main-nav-one a').each(function () {
            if($(this).attr("href")===href){
                $(this).addClass("a_active");
            }
        })
        e.preventDefault();
        let offTop = $(this.hash).offset().top-75;
        $('html, body').animate({
            scrollTop: offTop
        }, 600);
    });

    //熏染数据
    renderType();
    renderNews();
    initOwl();
    $('.preloader').fadeOut(200);
});

function renderType(){
    $.post("/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.data){
            $('#deviceWrap').html("");
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let head = item.name;
                head = head.replace("（","(");
                head = head.replace("）",")");
                head = head.replace(" ","");
                if(head.length>10){
                    head = head.substring(0,8)+"...";
                }
                let sketch = item.description;
                sketch = sketch.replace("（","(");
                sketch = sketch.replace("）",")");
                sketch = sketch.replace(" ","");
                if(sketch.length>30){
                    sketch = sketch.substring(0,27)+"...";
                }
                let id = item.id;
                let img = "/img/"+item.img;
                $('#deviceWrap').append('' +
                    '<div class="col-sm-3 deviceItem">\n' +
                    '   <a target="_blank" href="/type/'+id+'">\n' +
                        '   <img class="devImg lazy" data-original="'+img+'" src="'+img+'" alt="图片加载失败" onerror="this.src= \'../../static/img/default1.png\'; this.onerror = null;" alt="">\n' +
                        '   </a><div class="sketch">'+sketch+'</div>\n' +
                        '   <div class="title">'+head+'</div>\n' +
                    '   ' +
                    '</div>');
                $("img.lazy").lazyload({
                    effect : "fadeIn",
                    placeholder : "../../img/loading.gif",
                    threshold : 200
                });
            }
        }else{
            $('#deviceWrap').html("<span class='dataTip'>无任何分组!</span>");
        }
    });
}

function renderDevice(){
    $.post("/type/device",{_xsrf:$("#token", parent.document).val()},function (res) {
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
                    '<div class="item">' +
                    '   <a target="_blank" href="/detail/'+rid+'">\n' +
                    '   <div class="collection-two__single">\n' +
                    '       <div class="collection-two__image">\n' +
                    '           <img class="devImg" src="/img/'+img+'" onerror="this.src= \'../../static/img/default2.png\'; this.onerror = null;this.style.marginTop=\'0px\';this.style.marginLeft=\'45px\'" alt="">\n' +
                    '       </div>\n' +
                    '       <div class="collection-two__content">\n' +
                    '           <h3><a target="_blank" href="/detail/'+rid+'">'+head+'</a></h3>\n' +
                    '           <p>'+sketch+'</p>\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '   </a>' +
                    '</div>');
            }
            initOwl();
        }else{
            $('#deviceWrap').html("<span class='dataTip'>无匹配设备!</span>");
        }
    });
}

function renderNews(){
    $.post("/news/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.data){
            $('#newWrap').html("");
            let arr = res.data;
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let head = item.title;
                if(head.length>25){
                    head = head.substring(0,22)+"...";
                }
                let content = item.content;
                if(content.length>15){
                    content = content.substring(0,12)+"...";
                }
                let rid = item.rid;
                let img = "/img/"+item.img;
                let date = item.created;
                date = date.replace("T"," ");
                date = date.replace("+08:00","");
                $('#newWrap').append(''+
                    '<div class="col-lg-4">\n'+
                    '   <a target="_blank" href="/news/'+rid+'"><div class="blog-one__single">\n'+
                    '       <div class="blog-one__image">\n'+
                    '           <img class="lazy" data-original="'+img+'" src="'+img+'" alt="图片加载失败" onerror="this.src= \'../../static/img/default2.png\'; this.onerror = null;this.style.marginTop=\'18px\';this.style.marginLeft=\'45px\'" alt=""/>\n' +
                    '           <div class="blog-one__date">\n'+
                    '               <i class="far fa-calendar-alt"></i>'+date+'\n' +
                    '           </div>\n' +
                    '       </div>\n' +
                    '       <div class="blog-one__content">\n' +
                    '            <h3 title="'+item.title+'"><a href="/news/'+rid+'">'+head+'</a></h3>\n' +
                    '            <p>'+content+'</p>\n' +
                    '            <a target="_blank" href="/news/'+rid+'" class="blog-one__link">查看详情</a>\n' +
                    '       </div>\n' +
                    '   </div></a>\n' +
                    '</div>');
            }
            $("img.lazy").lazyload({
                effect : "fadeIn",
                placeholder : "../../img/loading.gif"
            });
            initOwl();
        }else{
            $('#newWrap').html("<span class='dataTip'>无新闻动态!</span>");
        }
    });
}

function initOwl() {
    if ($('.thm__owl-carousel').length) {
        $('.thm__owl-carousel').each(function () {

            let Self = $(this);
            let carouselOptions = Self.data('options');
            let carouselPrevSelector = Self.data('carousel-prev-btn');
            let carouselNextSelector = Self.data('carousel-next-btn');
            let thmCarousel = Self.owlCarousel(carouselOptions);
            if (carouselPrevSelector !== undefined) {
                $(carouselPrevSelector).on('click', function () {
                    thmCarousel.trigger('prev.owl.carousel', [1000]);
                    return false;
                });
            }
            if (carouselNextSelector !== undefined) {
                $(carouselNextSelector).on('click', function () {
                    thmCarousel.trigger('next.owl.carousel', [1000]);
                    return false;
                });
            }
        });
    }
    // owl dots margin increment
    if ($('.thm__owl-dot-1').length) {
        let count = 10;
        $('.thm__owl-dot-1').find('.owl-dot span').each(function () {
            count += 10;
            $(this).css('left', '+=' + count + 'px');
        });
    }
    if ($('.thm__owl-dot-rtl-1').length) {
        let count = 10;
        $('.thm__owl-dot-rtl-1').find('.owl-dot span').each(function () {
            count += 10;
            $(this).css('right', '+=' + count + 'px');
        });
    }
    if ($('.thm__owl-dot-2').length) {
        let count = 10;
        $('.thm__owl-dot-2').find('.owl-dot span').each(function () {
            count += 10;
            $(this).css('top', '+=' + count + 'px');
        });
    }
}