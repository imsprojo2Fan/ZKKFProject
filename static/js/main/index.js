
let frameHeight = 0;
let bodyHeight = 0;
let clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
let clientHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;

$(function () {
    let account = userInfo.account;
    if(account.length>6){
        account = account.substring(0,3)+"...";
    }
    $('#account').parent().attr("title","Hi,"+userInfo.account);
    $('#account').html(account);
    bodyHeight = window.innerHeight;
    frameHeight = bodyHeight-50;
    $('#J_iframe').css("height",frameHeight+"px");

    $('.nav-header').on("click",function () {
        window.open("/","_blank");
    })

    //swalInfo("测试","ces","success");

    //菜单点击
    $(".J_menuItem").on('click',function(){
        $('.J_menuItem').each(function () {
            $(this).css("border-left","5px solid #2b333e");
            $(this).css("background","#2b333e");
            $(this).css("color","#869fb1");
        });
        $(this).css("border-left","5px solid #6195FF");
        $(this).css("background-color","#131e26");
        $(this).css("color","#fff");
        let url = $(this).attr('href');
        $("#J_iframe").attr('src',url);
        return false;
    });
    $('#home').click();

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
    if(userInfo.type<1){
        $('.fa-gg-circle').parent().parent().remove();
        $('.fa-cubes').parent().parent().remove();
        $('.fa-money').parent().parent().remove();
        $('.fa-newspaper-o').parent().parent().remove();
    }
    if(userInfo.type<2){
        $('.fa-user-plus').parent().parent().remove();
    }
    if(userInfo.type<3){
        $('.fa-cogs').parent().parent().remove();
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
    loading("loading",false);

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
    setTimeout(function () {
        swal(title,msg,type);
    },200)
}

function loading(flag,type) {
    if(!type){
        type = "1";
    }
    if(flag){
        $('#loading'+type).fadeIn(300);
    }else{
        $('#loading'+type).fadeOut(300);
    }
}