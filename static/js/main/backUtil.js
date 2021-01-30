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