let isPassKeyLogin = false;
$(function () {

    //console.log(browserInfo.getBrowserInfo());
    //console.log(browserInfo.detectOS());
    //console.log(browserInfo.digits());

    if(top.location!=self.location){
        console.log(("exit"));
        window.parent.location.href = "/login";
    }else{
        console.log(("no exit"));
    }

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
        let email = $('#email').val().trim();
        if(!email){
            setTimeout(function () {
                swal("系统提示","邮箱地址不能为空！","error");
            },200);
            return false;
        }
        if(!checkEmail(email)){
            setTimeout(function () {
                swal("系统提示","邮箱格式不正确！","error");
            },200);
            return false;
        }

        $.post('/forget',{_xsrf:$('#token').val(),tempAccount:email},function (r) {
            if(r.code===1){
                setTimeout(function () {
                    swal({
                        title: "<h3>请输入验证码和密码</h3>",
                        text: "<input style='text-align: center' id='code' placeholder='验证码' type='text' maxlength='6'>"+"<input placeholder='密码长度不能小于8个字符' style='text-align: center' type='password' id='ePassword' maxlength='40'>"+"",
                        html:true,
                        showCancelButton: true,
                        closeOnConfirm: true,
                        confirmButtonColor: "#6397ff",
                        confirmButtonText: "提交",
                        cancelButtonText: "取消",
                        animation: "slide-from-top",
                        type: "prompt",
                        inputPlaceholder:"邮箱验证码"
                    }, function(){
                        let password = $('#ePassword').val().trim();
                        let code = $('#code').val().trim();
                        if(!password){
                            setTimeout(function () {
                                swal("系统提示","您未填写密码!","error");
                            },200);
                            return
                        }
                        if(password.length<8){
                            setTimeout(function () {
                                swal("系统提示","密码不能少于8个字符!","error");
                            },200);
                            return
                        }
                        if(!code){
                            setTimeout(function () {
                                swal("系统提示","验证码不能为空!","error");
                            },200);
                            return
                        }
                        $.post("/reset",{_xsrf:$('#token').val(),tempAccount:email,password:password,code:code},function (r) {
                            if(r.code===1){
                                setTimeout(function () {
                                    swal("系统提示","密码重置成功","success");
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