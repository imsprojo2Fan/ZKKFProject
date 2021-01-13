
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

    if(userInfo.account){
        $('#infoForm').find("input[name='account']").val(userInfo.account);
        $('#infoForm').find("input[name='account']").attr("readonly","true");
    }
    $('#infoForm').find("input[name='id']").val(userInfo.id);
    $('#infoForm').find("input[name='name']").val(userInfo.name);
    $('#infoForm').find("input[name='company']").val(userInfo.company);
    $('#infoForm').find("input[name='address']").val(userInfo.address);
    $('#infoForm').find("input[name='phone']").val(userInfo.phone);
    $('#infoForm').find("input[name='email']").val(userInfo.email);
    $('#infoForm').find("input[name='address']").val(userInfo.address);
    $('#infoForm').find("input[name='invoice']").val(userInfo.invoice);
    $('#infoForm').find("input[name='invoice_code']").val(userInfo.invoice_code);
    $('#infoBtn').on("click",function () {
        let account = $('#infoForm').find("input[name='account']").val().trim();
        let name = $('#infoForm').find("input[name='name']").val().trim();
        let company = $('#infoForm').find("input[name='company']").val().trim();
        let address = $('#infoForm').find("input[name='address']").val().trim();
        let phone = $('#infoForm').find("input[name='phone']").val().trim();
        let email = $('#infoForm').find("input[name='email']").val().trim();
        let invoice = $('#infoForm').find("input[name='invoice']").val().trim();
        let invoiceCode = $('#infoForm').find("input[name='invoice_code']").val().trim();
        if(!account){
            showTip("请填写账号!");
            return
        }
        if(!isNaN(account)){
            showTip("账号需包含数字和字母!");
            return false;
        }
        if(account.length<5){
            showTip("账号长度不可少于5个字符!");
            return false;
        }
        if(!name){
            showTip("modalTip","姓名不能为空!");
            return false;
        }
        if(!company){
            showTip("modalTip","单位不能为空!");
            return false;
        }
        if(!address){
            showTip("modalTip","邮寄地址不能为空!");
            return false;
        }
        if(!phone){
            showTip("modalTip","手机号不能为空!");
            return false;
        }
        if(!(/^1[3456789]\d{9}$/.test(phone))){
            showTip("modalTip","手机号格式错误!");
            return false;
        }
        if(!email){
            showTip("modalTip","邮箱不能为空!");
            return false;
        }
        if(email&&!checkEmail(email)){
            showTip("邮箱地址格式不正确!");
            return false;
        }
        if(!invoice){
            showTip("modalTip","发票抬头不能为空!");
            return false;
        }
        if(!invoiceCode){
            showTip("modalTip","纳税人识别号不能为空!");
            return false;
        }

        let formData = formUtil('infoForm');
        userInfo = formData;
        formData["_xsrf"] = $("#token").val();
        $.ajax({
            url:"/main/user/updateInfo",
            type:"POST",
            data:formData,
            beforeSend:function () {
                loading(true,2);
            },
            success:function (r) {
                if(r.code===1){
                    $('#infoModal').modal("hide");
                    swalParent("系统提示",r.msg,"success");
                }else{
                    swalParent("系统提示",r.msg,"error");
                }
            },
            complete:function () {
                loading(false,2);
            }
        });

    });
    $('#outBtn').on("click",function () {
        window.location.href = "/timeout"
    });


    bodyHeight = window.innerHeight;
    frameHeight = bodyHeight-50;
    $('#J_iframe').css("height",frameHeight+"px");

    $('.nav-header').on("click",function () {
        window.open("/","_blank");
    })

    //swalInfo("测试","ces","success");

    //菜单点击
    $(".J_menuItem").on('click',function(){
        loading(true,2);
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
    if(userInfo.type>1){
        $('.fa-gg-circle').parent().parent().remove();
        $('.fa-tags').parent().parent().remove();
        $('.fa-cubes').parent().parent().remove();
        $('.fa-money').parent().parent().remove();
        $('.fa-tasks').parent().parent().remove();
        $('.fa-newspaper-o').parent().parent().remove();
    }

    if(userInfo.type>2){
        $('.fa-user-plus').parent().parent().remove();
    }
    if(userInfo.type>3){
        $('.fa-cogs').parent().parent().remove();
    }
    if(userInfo.type>2){
        if(!userInfo.account||!userInfo.name||!userInfo.phone||!userInfo.email||!userInfo.address||!userInfo.company||!userInfo.invoice||!userInfo.invoice_code){
            $('#infoModal').modal("show");
        }
    }

    //$('#account').html(userInfo.Account);

    let myFrame = document.getElementById('J_iframe');
    myFrame.onload = myFrame.onreadystatechange = function () {
        if (this.readyState && this.readyState != 'complete') {
            //console.log("加载中。。。");
        }
        else {
            //console.log("加载完成。。。");
            //$('#loading').fadeOut(100);
        }
    };
    //loading(false,2);

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

function user() {
    return userInfo;
}

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