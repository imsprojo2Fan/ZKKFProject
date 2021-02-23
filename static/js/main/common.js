$(function () {
    //返回按钮
    $('.backBtn').on("click", function () {
        $('.list').addClass('active');
        $('.list').click();
    });
    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id")+"Content";
        let val = $(this).val();
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });
});

function reset4success() {
    $("input[type=text]").val("");
    $('.addItem').show();
    $('.imgItem').html("");
    $("textarea").val("");
    $("#addTable .editor").html("可插入文字/图片");
    $('#uploadPic').html("上传图片");
    $('#picName').html("");
    $('.selectpicker').selectpicker('val',['noneSelectedText']);
    $('.selectpicker').selectpicker('refresh');
}

function reset() {
    window.parent.confirmAlert("确定重置吗？","重置将清空所有输入信息！",resetVal);
}
function resetVal() {
    $("input").val("");
    $('.addItem').show();
    $('.imgItem').html("");
    $("textarea").val("");
    $("#addTable .editor").html("可插入文字/图片");
    $('#uploadPic').html("上传图片");
    $('#picName').html("");
}

function swalInfo(title,msg,type) {
    setTimeout(function () {
        swal(title,msg,type);
    },300);
}

function loading(flag) {
    window.parent.loading(flag);
}

window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};

function renderStatus(status) {
    let res = {}
    let str;
    let str2;
    status = parseInt(status);
    if(status===-1){
        str2 = "<span class='statusTxt-red'>已取消</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/协商处理中/财务结算/已完成/<span data='"+status+"' class='status statusTxt-red'>已取消</span>";
    }
    if(status===0){
        str2 = "<span class='statusTxt-blue'>待确认</span>";
        str = "<span data='"+status+"' class='status statusTxt-blue'>待确认</span>/已确认/制样中/测试中/数据分析/协商处理中/财务结算/已完成/已取消";
    }
    if(status===1){
        str2 = "<span class='statusTxt-blue'>已确认</span>";
        str = "待确认/<span data='"+status+"' class='status statusTxt-blue'>已确认</span>/制样中/测试中/数据分析/协商处理中/财务结算/已完成/已取消";
    }
    if(status===2){
        str2 = "<span class='statusTxt-blue'>制样中</span>";
        str = "待确认/已确认/<span data='"+status+"' class='status statusTxt-blue'>制样中</span>/测试中/数据分析/协商处理中/财务结算/已完成/已取消";
    }
    if(status===3){
        str2 = "<span class='statusTxt-blue'>测试中</span>";
        str = "待确认/已确认/制样中/<span data='"+status+"' class='status statusTxt-blue'>测试中</span>/数据分析/协商处理中/财务结算/已完成/已取消";
    }
    if(status===4){
        str2 = "<span class='statusTxt-blue'>数据分析</span>";
        str = "待确认/已确认/制样中/测试中/<span data='"+status+"' class='status statusTxt-blue'>数据分析</span>/协商处理中/财务结算/已完成/已取消";
    }
    if(status===-5){
        str2 = "<span class='statusTxt-blue'>财务结算</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/<span data='"+status+"' class='status statusTxt-blue'>协商处理中</span>/财务结算/已完成/已取消";
    }
    if(status===5){
        str2 = "<span class='statusTxt-blue'>财务结算</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/协商处理中/<span data='"+status+"' class='status statusTxt-blue'>财务结算</span>/已完成/已取消";
    }
    if(status===6){
        str2 = "<span class='statusTxt-green'>已完成</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/协商处理中/财务结算/<span data='"+status+"' class='status statusTxt-green'>已完成</span>/已取消";
    }
    res.status = str;
    res.statusTxt = str2;
    return res;
}

function renderStatus2(status,msg) {
    let res = {};
    status = parseInt(status);
    let msgArr = msg.split(",");
    let allStr = "";
    for(let i=0;i<msgArr.length;i++){
        let temp = msgArr[i];
        if(i===status){
            res.txt = msgArr[i];
            temp = "<span data='"+status+"' class='status statusTxt-blue' >"+temp+"</span>";
        }
        allStr += "/"+temp;
    }
    if(status===-1){
        allStr = allStr.replace("已取消","<span class='statusTxt-red'>已取消</span>");
    }
    res.allTxt = allStr.substring(1,allStr.length)
    return res;
}