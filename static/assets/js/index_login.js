$(function () {
    let k = !0;
    $("#loginBtn").click(function () {
        $(".loginmask").fadeIn(300);
        $("#loginalert").fadeIn(300);
    });
    $(".loginmask,.closealert").click(function () {
        $(".loginmask").fadeOut(300);
        $("#loginalert").fadeOut(500);
    });

    $('#frTip').on("click",function () {
        let txt = $(this).html();
        if(txt.indexOf("注册")>0){
            $('#f1Title').html("注册账号");
            $('#frTip').html('已有账号?<a href="javascript:void(0)">马上登录</a>');
            $('#form1').hide(200);
            $('#form2').show(200);
        }else{
            $('#f1Title').html("账号登录");
            $('#frTip').html('还没账号?<a href="javascript:void(0)">立即注册</a>');
            $('#form2').hide(200);
            $('#form3').hide(200);
            $('#form1').show(200);
        }
    });
    $('#forget').on('click',function () {
        $('#f1Title').html("忘记密码");
        $('#frTip').html('<a href="javascript:void(0)">返回登录</a>');
        $('#form1').hide(200);
        $('#form3').show(200);
    });

});