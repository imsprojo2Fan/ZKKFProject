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

function renderStatus(status,msg) {
    let res = {};
    let allStr = "";
    let statusDom = "";
    let statusTxt = "";
    status = parseInt(status);
    if(!msg){
        if(status===-1){
            statusDom = "<span class='statusTxt-red'>已取消</span>";
            statusTxt = "已取消";
            allStr = "<span class='statusTxt-red'>已取消</span>";
        }else if(status===0){
            statusDom = "<span class='statusTxt-blue'>待确认</span>";
            statusTxt = "待确认";
            allStr = "<span class='statusTxt-blue'>待确认</span>";
        }
        res.statusDom = statusDom;
        res.statusTxt = statusTxt;
        res.allTxt = allStr;
        res.statusArr = [];
        res.statusIndex = 0;
        return res;
    }

    let msgArr = msg.split(",");
    res.statusArr = msgArr;
    for(let i=0;i<msgArr.length;i++){
        let temp = msgArr[i];
        if(i===status){
            res.statusDom = "<span class='statusTxt-blue'>"+msgArr[i]+"</span>";
            res.statusTxt = msgArr[i];
            temp = "<span data='"+status+"' class='status statusTxt-blue' >"+temp+"</span>";
            res.statusIndex = 0;
        }
        allStr += "/"+temp;
    }
    allStr = allStr.substring(1,allStr.length);
    res.allTxt = allStr;
    if(!res.allTxt){
        res.allTxt = "-";
    }
    return res;
}

function statusIndex(arr,txt) {
    let index = 0;
    for(let i=0;i<arr.length;i++){
        let txt0 = arr[i];
        if(txt===txt0){
            index = i;
            break
        }
    }
    return index;
}