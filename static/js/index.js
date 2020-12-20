let t =0;
$(function () {

    //获取本地存储信息
    let account = getCookieValue("account");
    let password = getCookieValue("password");
    if(account&&password){
        $('#account').val(account);
        $('#password').val(password);
        $('#checkbox').attr("checked","checked");
    }

    $('#loginBtn').on("click",function () {
        let account,password;
        account = $('#account').val().trim();
        password = $('#password').val().trim();
        if(!account){
            sweetAlert(
                '系统提示',
                '账号不能为空！',
                'warning'
            )
            return
        }
        if(!password){
            sweetAlert(
                '系统提示',
                '请填写密码！',
                'warning'
            )
            return
        }

        let objChk = document.getElementById("checkbox");
        if(objChk.checked){
            //添加cookie
            addCookie("account",account,7,"/");
            addCookie("password",password,7,"/");
            addCookie("check",1,7,"/");
            //swal("记住了你的密码登录。",' ',"success");
        }else{
            deleteCookie("account",'/');
            deleteCookie("password",'/');
            deleteCookie("check",'/');
            //swal("不记密码登录。",' ',"error");
        }
        $.ajax({
            url : "/validate",
            type : "POST",
            data : {
                type:"login",
                account:account,
                password:password,
                browserInfo:browserInfo.getBrowserInfo()+"/"+browserInfo.detectOS()+"/"+browserInfo.digits(),
                _xsrf:$('#token').val()
            },
            dataType : "json",
            cache : false,
            beforeSend:function(){
                $('.preloader').fadeIn(100);
            },
            success : function(r,status) {
                if (r.code == 1) {
                    window.open("/main","_blank");
                    $('#loginShowBtn').html("前往个人中心");
                    $(".loginmask,.closealert").click();
                    //swal("登录成功!",' ',"success");
                } else {
                    sweetAlert("系统提示",r.msg,"error");
                    $(".swal2-confirm").trigger("blur");
                }
            },
            error:function(){
                swal("会话已失效!",'请刷新页面重试',"error");
            },
            complete:function () {
                $('.preloader').fadeOut(100);
            }
        });

    })

    $('#signCodeBtn').on("click",function () {
        if($(this).html().length>5){
            return false;
        }
        let tempAccount = $('#signInput').val().trim();
        if(!tempAccount){
            $('#alertTip').html("邮箱或手机号不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(tempAccount.length<6){
            $('#alertTip').html("邮箱或手机号格式不正确!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        timer("signCodeBtn");
        $.post('/signCode',{_xsrf:$('#token').val(),tempAccount:tempAccount},function (r) {
            if(r.code===1){
                $('#alertTip').css("color","green");
                $('#alertTip').html("验证码已发送!");
                setTimeout(function () {
                    $('#alertTip').css("color","red");
                    $('#alertTip').html("");
                },3000);
            }else{
                $('#alertTip').html(r.msg);
                setTimeout(function () {
                    $('#alertTip').html("");
                },3000);
            }
        })
    });

    $('#signBtn').on("click",function () {
        let tempAccount = $('#signInput').val().trim();
        let password = $('#signPassword').val().trim();
        let code = $('#signCode').val().trim();
        if(!tempAccount){
            $('#alertTip').html("邮箱或手机号不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(tempAccount.length<6){
            $('#alertTip').html("邮箱或手机号格式不正确!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(!password){
            $('#alertTip').html("密码不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(password.length<8){
            $('#alertTip').html("密码长度不得小于8个字符!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(!code){
            $('#alertTip').html("验证码不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(code.length!=6){
            $('#alertTip').html("验证码错误!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        $.post('/sign',{_xsrf:$('#token').val(),tempAccount:tempAccount,password:password,code:code},function (r) {
            if(r.code===1){
                $('#alertTip').css("color","green");
                $('#alertTip').html("账号注册成功!");
                setTimeout(function () {
                    $('#alertTip').css("color","red");
                    $('#alertTip').html("");
                },3000);
                $('#signInput').val("");
                $('#signPassword').val("");
                $('#signCode').val("");
                $('#frTip').click();
            }else{
                $('#alertTip').html(r.msg);
                setTimeout(function () {
                    $('#alertTip').html("");
                },3000);
            }
        })

    });

    $("#loginShowBtn").click(function () {
        let txt = $(this).html();
        if(txt==="前往个人中心"){
            window.open("/main","_blank");
        }else{
            $(".loginmask").fadeIn(300);
            $("#loginalert").fadeIn(300);
        }
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
        $('#form3').find(".resignWrap").hide();
        $('#frTip').html('<a href="javascript:void(0)">返回登录</a>');
        $('#form1').hide(200);
        $('#form3').show(200);
    });
    $('#forgetCodeBtn').on("click",function () {
        if($(this).html().length>5){
            return false;
        }
        let tempAccount = $('#form3').find(".account").val().trim();
        if(!tempAccount){
            $('#alertTip').html("邮箱或手机号不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        timer("forgetCodeBtn");
        $.post('/forget',{_xsrf:$('#token').val(),tempAccount:tempAccount},function (r) {
            if(r.code===1){
                $('#form3').find(".password").show();
                $('#form3').find(".resignWrap").show();
            }else{
                $('#alertTip').html(r.msg);
                setTimeout(function () {
                    $('#alertTip').html("");
                },3000);
            }
        })
    });
    $('#forgetBtn').on("click",function () {
        let tempAccount = $('#form3').find(".account").val().trim();
        if(!tempAccount){
            $('#alertTip').html("邮箱或手机号不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        let code = $('#form3').find(".code").val().trim();
        if(!code){
            $('#alertTip').html("验证码不能为空!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        let password = $('#form3').find(".password").val().trim();
        if(!password){
            $('#alertTip').html("您未填写密码!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }
        if(password.length<8){
            $('#alertTip').html("密码长度不能小于8个字符!");
            setTimeout(function () {
                $('#alertTip').html("");
            },3000);
            return false;
        }

        $.post("/reset",{_xsrf:$('#token').val(),tempAccount:tempAccount,password:password,code:code},function (r) {
            if(r.code===1){
                $('#alertTip').css("color","green");
                $('#alertTip').html("密码重置成功!");
                $('#form3').find(".account").val("");
                $('#forgetCode').val("");
                $('#form3').find(".password").val("");
                $('#form3').find(".password").hide();
                setTimeout(function () {
                    $('#alertTip').css("color","red");
                    $('#alertTip').html("");
                },3000);
                $('#frTip').click();
            }else{
                $('#alertTip').html("密码重置失败，请稍后再试!");
                setTimeout(function () {
                    $('#alertTip').html("");
                },3000);
            }
        });
    });


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

function timer(domId){
    let i = 60;
    $('#' + domId).css("cursor","not-allowed");
    let tNum = setInterval(function () {
        --i;
        if(i===0) {
            $('#'+domId).html("获取验证码");
            $('#' + domId).css("cursor","pointer");
            window.clearInterval(tNum);
            return
        }
        if(i<10){
            $('#'+domId).html("获取验证码(0"+i+")");
        }else{
            $('#'+domId).html("获取验证码("+i+")");
        }

    },800);
}
