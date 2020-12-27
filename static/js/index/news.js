$(function () {
    if(!info){
        //熏染信息
        let imgSrc = localStorage.getItem("news-imgSrc");
        if(imgSrc){
            imgSrc = imgSrc.split(",")[0];
            $('.blog-details__image').find("img").attr("src","/img/"+imgSrc);
        }
        $('.name').html(localStorage.getItem("news-title"));
        $('.parameter').html(localStorage.getItem("news-content"));
    }else{
        //熏染信息
        $('.parameter').html(info.content);
        let imgSrc = info.img;
        if(imgSrc){
            imgSrc = imgSrc.split(",")[0];
            $('.blog-details__image').find("img").attr("src","/img/"+imgSrc);
        }
        let time = info.created.substring(0,19);
        time = time.replace("T"," ");
        $('#created').html(time);
        $('#view').html(info.view);
    }

    $('.preloader').fadeOut(200);

});
