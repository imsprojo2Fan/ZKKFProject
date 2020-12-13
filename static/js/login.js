var isPassKeyLogin = false;
$(function () {

    if(top.location!=self.location){
        console.log(("exit"));
        window.parent.location.href = "/login";
    }else{
        console.log(("no exit"));
    }


    $('#switch').bootstrapSwitch({
        onText:"普通登录",
        offText:"密钥登录",
        onColor:"primary",
        offColor:"danger",
        size:"normal",
        onSwitchChange:function(event,state){
            $('#switch').trigger("blur");
            if(state==true){
                isPassKeyLogin = false;
                $('.fancy-checkbox').show();
                $('#normalLogin').show();
                $('#passLogin').hide();
                console.info('已打开');
            }else{
                isPassKeyLogin = true;
                $('.fancy-checkbox').hide();
                $('#normalLogin').hide();
                $('#passLogin').show();
                console.info('已关闭');
            }
        }
    });


    //获取本地存储信息
    var account = getCookieValue("account");
    var password = getCookieValue("password");
    if(account&&password){
        $('#account').val(account);
        $('#password').val(password);
        $('#checkbox').attr("checked","checked");
    }

    $('#loginBtn').on("click",function () {
        var passKey,account,password;
        if(isPassKeyLogin){
            passKey = $('#passKey').val().trim();
            if(!passKey){
                sweetAlert(
                    '系统提示',
                    '登录密钥不能为空！',
                    'warning'
                )
                $(".swal2-confirm").trigger("blur");
                return
            }
        }else{
            account = $('#account').val().trim();
            password = $('#password').val().trim();
            if(!account){
                sweetAlert(
                    '系统提示',
                    '账号不能为空！',
                    'warning'
                )
                $(".swal2-confirm").trigger("blur");
                return
            }
            if(!password){
                sweetAlert(
                    '系统提示',
                    '请填写密码！',
                    'warning'
                )
                $(".swal2-confirm").trigger("blur");
                return
            }

            var objChk = document.getElementById("checkbox");
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
        }

        $.ajax({
            url : "/validate",
            type : "POST",
            data : {
                type:"login",
                account:account,
                password:password,
                passKey:passKey,
                _xsrf:$('#token').val()
            },
            dataType : "json",
            cache : false,
            beforeSend:function(){
                $('#loading').fadeIn(100);
            },
            success : function(r,status) {
                if (r.code == 1) {
                    window.location.href = "/main";
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
                $('#loading').fadeOut(100);
            }
        });

    })
});
function forget() {
    swal({
        title: "<h3>请输入预留邮箱地址</h3>",
        text: "<input  type='text' id='email'>",
        html:true,
        showCancelButton: true,
        closeOnConfirm: true,
        confirmButtonColor: "#6397ff",
        confirmButtonText: "提交",
        cancelButtonText: "取消",
        animation: "slide-from-top",
        type: "prompt",
        inputPlaceholder:"邮箱地址"
    }, function(){
        var email = $('#email').val().trim();
        if(!email){
            setTimeout(function () {
                swal("系统提示","您似乎什么都没填","error");
            },200);
            return
        }
        if(!checkEmail(email)){
            setTimeout(function () {
                swal("系统提示","邮箱格式好像不正确","error");
            },200);
            return
        }

        $.post('/forget',{_xsrf:$('#token').val(),email:email},function (r) {
            if(r.code===1){
                setTimeout(function () {
                    swal({
                        title: "<h3>请输入验证码和密码</h3>",
                        text: "<input style='text-align: center' id='code' placeholder='验证码' type='text' maxlength='6'>"+"<input placeholder='至少6个字符密码' style='text-align: center' type='password' id='ePassword' maxlength='40'>"+"",
                        html:true,
                        showCancelButton: true,
                        closeOnConfirm: true,
                        confirmButtonColor: "#6397ff",
                        confirmButtonText: "提交",
                        cancelButtonText: "取消",
                        animation: "slide-from-top",
                        type: "prompt",
                        inputPlaceholder:"6位数验证码"
                    }, function(){
                        var password = $('#ePassword').val().trim();
                        var code = $('#code').val().trim();
                        if(!password){
                            setTimeout(function () {
                                swal("系统提示","您未填写密码!","error");
                            },200);
                            return
                        }
                        if(password.length<6){
                            setTimeout(function () {
                                swal("系统提示","密码过简单了!","error");
                            },200);
                            return
                        }
                        if(!code){
                            setTimeout(function () {
                                swal("系统提示","验证码不能为空!","error");
                            },200);
                            return
                        }
                        $.post("/reset",{_xsrf:$('#token').val(),email:email,password:password,code:code},function (r) {
                            if(r.code===1){
                                setTimeout(function () {
                                    swal("系统提示",r.msg,"success");
                                },200);
                            }else{
                                setTimeout(function () {
                                    swal("系统提示",r.msg,"error");
                                },200);
                            }
                        })
                    });
                },200);

            }else{
                setTimeout(function () {
                    swal("系统提示",r.msg,"error");
                },200);
            }
        })
    });
}