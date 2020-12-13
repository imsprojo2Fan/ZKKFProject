
let frameHeight = 0;
let bodyHeight = 0;
let clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
let clientHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;

$(function () {

    bodyHeight = window.innerHeight;
    frameHeight = bodyHeight-50;
    $('#J_iframe').css("height",frameHeight+"px");

    //菜单点击
    $(".J_menuItem").on('click',function(){
        let url = $(this).attr('href');
        $("#J_iframe").attr('src',url);
        return false;
    });

    //处理服务器重启未刷新页面
    let oldNum = 0;
    setInterval(function () {
        $.ajax({
            type: 'get',
            url: "/main/alive",
            cache: false,
            dataType: "json",
            processData: false,
            timeout:5000, //超时时间，毫秒
            success: function (res) {
                let newNum = res.data;
                if(oldNum===0){
                    oldNum = newNum;
                }
                //console.log("oldNum:"+oldNum+",newNum:"+newNum);
                if(oldNum!==newNum){
                    //swalInfo("系统提示","登录超时,请刷新页面重新登录!","error");
                    window.location.href = "/login";
                }
            },
            error:function (request, status, error) {
                //swalInfo("系统提示","登录超时,请刷新页面重新登录!","error");
                //window.location.href = "/";
            }
        });

    },5000);

    //console.log(userInfo);
    if(userInfo.Type<3){
        $('#userNav').remove();
        $('#sysSetting').remove();
    }
    //$('#account').html(userInfo.Account);

    let myFrame = document.getElementById('J_iframe');
    myFrame.onload = myFrame.onreadystatechange = function () {
        if (this.readyState && this.readyState != 'complete') {
            //console.log("加载中。。。");
        }
        else {
            //console.log("加载完成。。。");
            $('#loading').fadeOut(100);
        }

    };

});


//动态更改iframe高度
$(window.parent.document).find("#J_iframe").on("load",function () {
    let main = $(window.parent.document).find("#J_iframe");
    let thisHeight = window.innerHeight-50;
    //let width = window.innerWidth;
    frameHeight = thisHeight;
    main.height(thisHeight);

});
window.onresize = function() {
    bodyHeight = window.innerHeight;
    frameHeight = bodyHeight-50;
    //console.log("frameHeight:"+frameHeight);
    //$('#J_iframe').css("height",frameHeight+"px");
    //设置表格高度
    let tHeight = frameHeight-210;
    //console.log("tHeight:"+tHeight);
    //$('#J_iframe').find('.dataTables_scrollBody').css("height",tHeight+"px");
};

function swalInfo(title,msg,type){
    swal(title,msg,type);
}

function loading(flag) {
    if(flag){
        $('#loading').fadeIn(100);
    }else{
        $('#loading').fadeOut(100);
    }
}

function loading2(flag) {
    if(flag){
        $('#loading2').fadeIn(100);
    }else{
        $('#loading2').fadeOut(100);
    }
}

function loading3(flag) {
    if(flag){
        $('#loading3').fadeIn(100);
    }else{
        $('#loading3').fadeOut(100);
    }
}