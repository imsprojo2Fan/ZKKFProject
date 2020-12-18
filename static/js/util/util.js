
var isShowQRCode = false;//是否显示二维码

document.onreadystatechange = function () {
    if(document.readyState === "complete"){ //当页面加载状态为完全结束时进入
        $('#pageLoading').hide(200);
    }
}

$(function () {
    //Scroll Top
    jQuery('#scroll-top').scrollToTop();//绑定返回顶部事件

    if(window.location.href.indexOf("share")>0){
        isShowQRCode = true;
    }

    var flag = isMobile.any();
    if(flag){
        $('#wechat').on("click",function () {
            var isHiden = $('#wechat-alert').is(":hidden");
            if(isHiden){
                $('#wechat-alert').fadeIn(500);
            }else{
                $('#wechat-alert').fadeOut(500);
            }
        });
    }else{
        var t = 0;
        $("#wechat").hover(
            function(){
                var $div = $(this);
                t = setInterval(function(){
                    $('#wechat-alert').fadeIn(500);
                },100);
            },function(){
                clearInterval(t);
                $('#wechat-alert').fadeOut(500);
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

//Scroll Top
$.fn.scrollToTop = function() {
    jQuery(this).hide().removeAttr('href');
    if (jQuery(window).scrollTop() != '0') {
        jQuery(this).fadeIn(200);
        $('#wechat').fadeIn(200);
        $('#design').fadeIn(200);
    }
    var scrollDiv = jQuery(this);
    jQuery(window).scroll(function() {
        if (jQuery(window).scrollTop() == '0') {
            jQuery(scrollDiv).fadeOut(200);
            $('#wechat').fadeOut(200);
            $('#wechat-alert').fadeOut(200);
            $('#design').fadeOut(200);
            $('#qrcodeBtn').fadeOut(200);
        } else {
            jQuery(scrollDiv).fadeIn(200);
            $('#wechat').fadeIn(200);
            $('#design').fadeIn(200);
            if(isShowQRCode){
                $('#qrcodeBtn').fadeIn(200);
            }
        }
    });
    jQuery(this).on('click', function() {
        jQuery('html, body').animate({
            scrollTop: 0
        }, 800)
    })
};

function redirect(str) {//锚点跳转
    //$('#close-button').click();
    var target = document.getElementById(str);
    if (!target) {
        $('html,body').animate({
                scrollTop: 0
            },
            800);
        return;
    }
    var targetOffset = $(target).offset().top - 100;
    $('html,body').animate({
            scrollTop: targetOffset
        },
        800);
}

/*
    <!--微信联系-->
    <a href="javascript:void(0)" class="wechat" id="wechat"><i class="fa fa-weixin" aria-hidden="true"></i></a>

    <div class="wechat-alert" id="wechat-alert">
    <img src="../static/img/weImg_.jpg" width="108" height="108">
    </div>

    <!--返回顶部-->
    <a href="javascript:void(0)" class="scroll-top" id="scroll-top"><i class="fa fa-angle-up" aria-hidden="true"></i></a>

*/

    /*<!--jquery cdn-->
    <script src="https://cdn.bootcss.com/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js"></script>*/

    /*<!--bootstrap cdn-->
    <script src="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <link href="https://cdn.bootcss.com/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">*/

    /*<!--font-awesome cdn-->
    <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.min.css">*/

function GetQueryString(name) {//获取url参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
    var context = "";

    if (r != null)
        context = r[2];
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "" : context;
}

function addCookie(name,value,days,path){/**添加设置cookie**/
var name = escape(name);
    var value = escape(value);
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 3600000 * 24);
    //path=/，表示cookie能在整个网站下使用，path=/temp，表示cookie只能在temp目录下使用
    path = path == "" ? "" : ";path=" + path;
    //GMT(Greenwich Mean Time)是格林尼治平时，现在的标准时间，协调世界时是UTC
    //参数days只能是数字型
    var _expires = (typeof days) == "string" ? "" : ";expires=" + expires.toUTCString();
    document.cookie = name + "=" + value + _expires + path;
}
function getCookieValue(name){  /**获取cookie的值，根据cookie的键获取值**/
    //用处理字符串的方式查找到key对应value
var name = escape(name);
    //读cookie属性，这将返回文档的所有cookie
    var allcookies = document.cookie;
    //查找名为name的cookie的开始位置
    name += "=";
    var pos = allcookies.indexOf(name);
    //如果找到了具有该名字的cookie，那么提取并使用它的值
    if (pos != -1){                                      //如果pos值为-1则说明搜索"version="失败
        var start = pos + name.length;                  //cookie值开始的位置
        var end = allcookies.indexOf(";",start);        //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
        if (end == -1) end = allcookies.length;        //如果end值为-1说明cookie列表里只有一个cookie
        var value = allcookies.substring(start,end); //提取cookie的值
        return (value);                           //对它解码
    }else{  //搜索失败，返回空字符串
        return "";
    }
}
function deleteCookie(name,path){   /**根据cookie的键，删除cookie，其实就是设置其失效**/
var name = escape(name);
    var expires = new Date(0);
    path = path == "" ? "" : ";path=" + path;
    document.cookie = name + "="+ ";expires=" + expires.toUTCString() + path;
}

function isPhone() {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        //alert('手机端');
        return true;
    }else{
        //alert('PC端');
        return false;
    }
}

function toggleBody(isPin){

    if(isPin){
        document.body.style.height = '100vh'
        document.body.style['overflow-y'] = 'hidden'
    }

    else{
        document.body.style.height = 'unset'
        document.body.style['overflow-y'] = 'auto'
    }
}

function makeCode() {
    var url = window.location.href;
    var qrcode = new QRCode("qrcode", {
        text: url,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

function share() {
    //debugger
    var url = window.location.href;
    var dom = $('#qrcode').clone();
    $(dom).css("display","block");
    $(dom).css("margin","0 auto");
    console.log($(dom).prop("outerHTML"));
    swal({
        title: "<h4>长按二维码 扫码/保存</h4>",
        text:$(dom).prop("outerHTML")+'<br><p>分享链接:<br>'+url+'</p>',
        html: true
    });
}

function checkPhone(phone){
    if(!(/^1[34578]\d{9}$/.test(phone))){
        return false;
    }else{
        return true
    }
}

function checkEmail(email) {
    var filter = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if (filter.test(email)) {
        return true;
    } else {
        return false;
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function formUtil(formId) {
    let obj = {};
    let formArray = $("#"+formId).serializeArray();
    $.each(formArray, function () {
        if (obj[this.name] !== undefined) {
            if (!obj[this.name].push) {
                obj[this.name] = [obj[this.name]];
            }
            obj[this.name].push(this.value || '');
        } else {
            obj[this.name] = this.value || '';
        }
    });
    return obj
}

function storageTest(storage){
    if(!!storage){
        try {
            storage.setItem("key", "value");
            storage.removeItem("key");
            return true;
        } catch(e){
            return false;
        }
    }else{
        return false;
    }
}
