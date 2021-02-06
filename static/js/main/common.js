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