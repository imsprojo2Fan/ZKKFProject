let parentWin = window.parent;
let userInfo;
$(function () {
    renderForm();
    $('#update').on("click",function () {
        let account = $('#account').val().trim();
        let password1 = $('#password').val().trim();
        let password2 = $('#password2').val().trim();
        let email = $('#email').val().trim();
        let phone = $('#phone').val().trim();
        if(!account){
            tipTip("请填写账号!");
            return
        }
        if(!password1){
            tipTip("密码不能为空!");
            return
        }
        if(!password2){
            tipTip("请确认密码!");
            return
        }
        if(password1.length<8||password2.length<8){
            tipTip("密码不能少于8个字符!");
            return
        }
        if(password1!==password2){
            tipTip("请确认两次密码一致!");
            return
        }

        if(phone&&!(/^1[3456789]\d{9}$/.test(phone))){
            swal("系统提示",'手机号格式错误!',"warning");
            return;
        }
        if(!email&&!checkEmail(email)){
            tipTip("邮箱地址格式不正确!");
            return
        }

        $.ajax({
            url:"/main/user/updateProfile",
            type:"POST",
            data:{
                id:userInfo.Id,
                account:account,
                password:password1,
                name:$('#name').val().trim(),
                phone:phone,
                email:email,
                _xsrf:$('#token').val()
            },
            beforeSend:function () {
                $('#loading').fadeIn(200);
            },
            success:function (r) {
                if(r.code===1){
                    renderForm();
                    swal("系统提示",r.msg,"success");
                }else{
                    swal("系统提示",r.msg,"error");
                }
            },
            complete:function () {
                $('#loading').fadeOut(200);
            }
        });

    });
    $('#operate4mail').on("click",function () {
        let txt = $(this).html();
        if(txt==="验证邮箱"){
            $.post("/main/user/validate4mail",{_xsrf:$('#token').val(),email:$('#email').val().trim()},function (r) {
                if(r.code==1){
                    swal({
                        title: "<h3>请输入邮箱验证码</h3>",
                        text: "<input style='text-align: center' maxlength='6' placeholder='6位验证码' type='text' id='code'>",
                        html:true,
                        showCancelButton: true,
                        closeOnConfirm: true,
                        confirmButtonColor: "#6397ff",
                        confirmButtonText: "提交",
                        cancelButtonText: "取消",
                        animation: "slide-from-top",
                        type: "prompt",
                        inputPlaceholder:"6位验证码"
                    }, function(){
                        let code_ = $('#code').val().trim();
                        if(!code_){
                            parentWin.swalInfo("系统提示","验证码不能为空!","error");
                        }
                        $.post("/main/user/mail4confirm",{_xsrf:$('#token').val(),code:code_},function (r) {
                            if(r.code==1){
                                parentWin.swalInfo("系统提示",r.msg,"success");
                                renderForm();
                            }else{
                                parentWin.swalInfo("系统提示",r.msg,"error");
                            }
                        });
                    });
                }else{
                    parentWin.swalInfo("系统提示",r.msg,"error");
                }
            });

        }else{
            $('#emailModal').modal("show");
        }
    });
    $('#editCodeBtn').on('click',function () {
        let email = $('#editEmail').val().trim();
        if(!email){
            $('#modalTip').html('<p class="text-danger">您未填写邮箱地址!</p>');
            return
        }
        $('#editCodeBtn').prop("disabled","disabled");
        let num = 60;
        let str;
        let timer = setInterval(function () {
            if(num===1){
                window.clearInterval(timer);
                $('#editCodeBtn').prop("disabled",false);
                $('#editCodeBtn').html("获取验证码");
                return
            }
            num--;
            str = num;
            if(num<10){
                str = "0"+num;
            }
            $('#editCodeBtn').html("剩余: "+str+" s");
        },800);
        $.post("/main/user/validate4mail",{_xsrf:$('#token').val(),email:email},function (r) {
            if(r.code===1){
                $('#modalTip').html('<p class="text-success">'+r.msg+'</p>');
            }else{
                window.clearInterval(timer);
                $('#editCodeBtn').prop("disabled",false);
                $('#editCodeBtn').html("获取验证码");
                $('#modalTip').html('<p class="text-danger">'+r.msg+'</p>');
            }
        });
    });
    $('#editSubmit').on('click',function () {
        $.post("/main/user/mail4confirm",{_xsrf:$('#token').val(),code:$('#editCode').val().trim(),changeMail:$('#editEmail').val().trim(),type:"edit"},function (r) {
            if(r.code==1){
                $('#editEmail').val("");
                $('#editCode').val("");
                $('#emailModal').modal("hide");
                parentWin.swalInfo("系统提示",r.msg,"success");
                renderForm();
            }else{
                parentWin.swalInfo("系统提示",r.msg,"error");
            }
        });
    });
});
function renderForm() {
    $.post("/main/user/listOne",{_xsrf:$('#token').val()},function (r) {
        userInfo = r.data;
        $('#id').val(userInfo.Id);
        let account = userInfo.Account;
        if(account){
            $('#account').val(account);
            $('#account').attr("disabled","disabled");
        }
        let password = userInfo.Password;
        if(password){
            $('#password').val(password);
            $('#password2').val(password);
        }
        $('#name').val(userInfo.Name);
        let gender = userInfo.Gender;
        if(gender==="男"){
            $('#radio1').prop("checked",true);
            $('#radio2').prop("checked",false);
        }else{
            $('#radio2').prop("checked",true);
            $('#radio1').prop("checked",false);
        }
        $('#birthday').val(userInfo.Birthday);
        $('#phone').val(userInfo.Phone);
        let active = userInfo.Active;
        $('#email').val(userInfo.Email);
        /*if(actived===0&&userInfo.Email){
            let dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址未验证,该地址将用于找回密码");
            $(dom).addClass("text-danger");
        }else if(actived===1&&userInfo.Email){
            let dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址将用于找回密码");
            $('#email').attr("disabled","disabled");
            let dom2 = $('#email').parent().find("button");
            $(dom2).html("更换邮箱");
        }else{
            let dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址将用于找回密码");
            let dom2 = $('#email').parent().find("button");
            $(dom2).remove();
        }*/
    });
}

function tipTip(str) {
    swal("系统提示",str,"error");
}