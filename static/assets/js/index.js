let t =0;
$(function () {
    let flag = isMobile.any();
    if(flag){
        $('#qrCode').on("click",function () {
            let isHiden = $('#wechat-alert').is(":hidden");
            if(isHiden){
                $('#wechat-alert').fadeIn(300);
            }else{
                $('#wechat-alert').fadeOut(300);
            }
        });
    }else{
        let t = 0;
        $("#qrCode").hover(
            function(){
                var $div = $(this);
                t = setInterval(function(){
                    $('#wechat-alert').fadeIn(300);
                },100);
            },function(){
                clearInterval(t);
                $('#wechat-alert').fadeOut(300);
            })
    }
});

//Detect Mobile
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};