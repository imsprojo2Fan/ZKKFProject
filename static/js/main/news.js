let myTable;
let prefix = "/main/news";

$(document).ready(function() {

    if(!storageTest(window.localStorage)){
        alert("当前浏览器localStorage不可用，建议使用谷歌浏览器");
    }

    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

    //tab导航栏切换
    $('.breadcrumb span').on("click",function () {
        if(!$(this).hasClass("active")){
            return false;
        }
        let data = $(this).attr("data");
        if(!data){
            return false;
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");
        if(data==="tab1"){
            refresh();
        }
        $('.tabWrap').fadeOut(300);
        $("#"+data).fadeIn(300);
    });

    $('#uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1200,600);
    });

    $('#edit_uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1200,600);
    });

    $('#form1').find('.addItem').on("click",function () {
        let arr = $('#form1').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
        }
        openWindow("/main/uploadPic?domId=addImgWrap","中科科辅",1200,600);
    });

    $('#form2').find('.addItem').on("click",function () {
        let arr = $('#form2').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
            return
        }
        openWindow("/main/uploadPic?domId=editImgWrap","中科科辅",1000,600);
    });

    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id");
        openWindow("/main/editor?domId="+id,"中科科辅",1000,600);
    });

    //datatable setting
    myTable =$('#myTable').DataTable({
        autoWidth: true,
        "scrollY": 0,
        "scrollCollapse": "true",
        "processing": false,
        fixedHeader: true,
        serverSide: true,
        //bSort:false,//排序
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,2,6] }],//指定哪些列不排序
        "order": [[ 5, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 50,
        ajax: {
            url: prefix+'/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            {"data": "id","render": function (data, type, row) {
                    return "<div style='text-align: left'><input type='checkbox' name='check' value='"+row.id+"'><span style='margin-left: 3px;' class='tid'>"+row.id+"</span></div>";
                }},
            { data: 'title',"render":function (data) {
                    return stringUtil.maxLength(data,15);
                } },
            { data: 'img',"render":function (data) {
                    if(data){
                        return "<img width='30' src=/img/"+data+"/>";
                    }else{
                        return "-";
                    }
                }},
            { data: 'view',"render":function (data) {
                    return data;
                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    //let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    let html = "<a href='javascript:void(0);' class='up btn btn-primary btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='preview btn btn-success btn-xs'></i>预览</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a>"
                    return html;
                } }
        ],
        language: {
            url: '../../static/plugins/datatables/zh_CN.json'
        },
        "fnInitComplete": function(oSettings, json) {
            if(!json){
                swalParent("系统提示","登录超时！请刷新页面","error");
                return false;
            }
        },
        "createdRow": function ( row, data, index ) {//回调函数用于格式化返回数据
            let pageObj = myTable.page.info();
            let num = index+1;
            num = num+ pageObj.page*(pageObj.length);
            if(num<10){
                num = "0"+num;
            }
            $('td', row).eq(0).find(".tid").html(num);
        },
        "fnPreDrawCallback": function (oSettings) {
            loadingParent(true,2);
        },
        "drawCallback": function(settings) {

            $('input[name=check]').iCheck({
                checkboxClass: 'icheckbox_flat-blue', // 指定的皮肤样式
                radioClass: 'iradio_minimal',
                increaseArea: '20%' // optional
            });
            //复选框选择
            let $checkboxContainer = $('th input[type=checkbox]');
            $checkboxContainer.on('ifChecked ifUnchecked', function(event){
                if (event.type === 'ifChecked') {//全选
                    $('td input[type="checkbox"]').each(function () {
                        $(this).iCheck('check');
                    });
                } else {//全不选
                    $('td input[type="checkbox"]').each(function () {
                        $(this).iCheck('uncheck');
                    });
                }
            });
            $('td input[type="checkbox"]').on('ifUnchecked',function () {
                //$checkboxContainer.icheck('uncheck');
            });
            $('td input[type="checkbox"]').on('ifChecked',function () {
                let bg = $(this).parent().parent().parent().parent().css("background-color");
                if(bg==="rgba(92, 184, 92, 0.35)"){

                }
            });

            //let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
            $('.dataTables_scrollBody').css("height",window.innerHeight-270+"px");
            $('#myTable_filter').find('input').attr("placeholder","请输入标题");
            parent.checkType();
            loadingParent(false,2);
        }
    });
    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");
    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.type').html(rowData.typeName);
        $('#detailModal').find('.name').html(rowData.name);
        $('#detailModal').find('.title').html(rowData.title);
        let disabled = rowData.disabled;
        if(disabled==="0"){
            $('#detailModal').find('.disabled').html("<span style='color: green'>上线</span>");
        }else{
            $('#detailModal').find('.disabled').html("<span style='color: red'>下架</span>");
        }
        $('#detailModal').find('.source').html(rowData.source);
        let temp = rowData.sketch;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.sketch').html("<span title='"+rowData.sketch+"'>"+temp+"</span>");
        temp = rowData.parameter;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.parameter').html("<span title='"+rowData.parameter+"'>"+temp+"</span>");
        temp = rowData.feature;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.feature').html("<span title='"+rowData.feature+"'>"+temp+"</span>");
        temp = rowData.range;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.range').html("<span title='"+rowData.range+"'>"+temp+"</span>");
        temp = rowData.achievement;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.achievement').html("<span title='"+rowData.achievement+"'>"+temp+"</span>");
        temp = rowData.remark;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.remark').html("<span title='"+rowData.remark+"'>"+temp+"</span>");

        let created = rowData.created;
        $('#detailModal').find('.created').html(dateUtil.GMT2Str(created));

        let updated = rowData.updated;
        $('#detailModal').find('.updated').html(dateUtil.GMT2Str(updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#id').val(rowData.id);
        $('#editModal').find('input[name="title"]').val(rowData.title);
        $('#editModal').find('input[name="source"]').val(rowData.source);
        $('#editModal').find('textarea[name="content"]').val(rowData.content);
        $('#editImgWrap').find(".imgItem").remove();
        if(rowData.img){
            let imgArr = rowData.img.split(",");
            $('#editImgWrap').find(".addItem").hide();
            for(let i=0;i<imgArr.length;i++){
                $('#editImgWrap').append('' +
                    '<div class="imgItem">\n ' +
                    '<i title="点击删除" class="fa fa-window-close" aria-hidden="true"></i>\n' +
                    '<img src="/img/'+imgArr[i]+'">\n' +
                    '</div>');
            }
            //图片删除按钮点击事件
            $('.fa-window-close').on('click',function () {
                $(this).parent().remove();
                $('#editImgWrap').find(".addItem").show();
            })
        }
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        let id = rowData.id;
        window.parent.confirmAlert("确定删除吗？","与当前相关的数据将全部被删除！",del,id);

    });
    $('#myTable').on("click",".preview",function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        window.open("/news/"+rid,"_blank");
    })

} );

function add(){
    let title = $('#form1').find('input[name="title"]').val().trim();
    if (!title){
        swalParent("系统提示",'新闻标题不能为空!',"warning");
        return;
    }
    let imgSrc = "";
    $('#addImgWrap').find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let formData = formUtil('form1');
    formData["img"] = imgSrc;
    formData["_xsrf"] = $("#token", parent.document).val();
    $.ajax({
        url : prefix+"/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            loadingParent(true,2);
        },
        success : function(r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                reset4success();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2);
        }
    });
}

function edit(){
    let title = $('#form2').find('input[name="title"]').val().trim();
    //let img = $('#edit_picVal').val();
    if (!title){
        swalParent("系统提示",'新闻标题不能为空!',"warning");
        return;
    }
    let imgSrc = "";
    $('#editImgWrap').find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let formData = formUtil('form2');
    formData["img"] = imgSrc;
    formData["_xsrf"] = $("#token", parent.document).val();
    $.ajax({
        url : prefix+"/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            loadingParent(true,2);
        },
        success : function(r) {
            $('#editModal').modal("hide");
            let type = "error";
            if (r.code == 1) {
                type = "success";
                refresh();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2);
        }
    });
}

function del(id){

    $.ajax({
        url : prefix+"/delete",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id
        },
        beforeSend:function(){
            loadingParent(true,2);
        },
        success : function(r) {
            if (r.code == 1) {
                setTimeout(function () {
                    swalParent("系统提示",r.msg, "success");
                    refresh();
                },100);
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            loadingParent(false,2);
        }
    })
}

function batchDel(){
    let checkboxes = $('td input[type="checkbox"]');
    // 获取选中的checkbox
    let allChecked = checkboxes.filter(':checked');
    if(allChecked.length===0){
        swalParent("系统提示","未选中任何删除项!","warning");
        return;
    }
    window.parent.confirmAlert("确定删除这些数据吗？","删除将无法恢复该信息！",batchDelOperate);
}

function batchDelOperate(){
    let idArr="";
    let checkboxes = $('td input[type="checkbox"]');
    let allChecked = checkboxes.filter(':checked');
    for(let i=0;i<allChecked.length;i++){
        let id = $(allChecked[i]).val();
        idArr = idArr+","+id;
    }
    idArr = idArr.substring(1,idArr.length);
    loading(true);
    $.post(prefix+"/del4batch",{_xsrf:$("#token", parent.document).val(),idArr:idArr},function (res) {
        loading(false);
        if(res.code===1){
            $("#hCheck").iCheck('uncheck');
            refresh();
            swalParent("系统提示",res.msg,"success");
        }else{
            let msg = res.msg;
            if(!msg){
                msg = "当前用户无权限此操作!"
            }
            setTimeout(function () {
                swalParent("系统提示",msg,"error");
            },100);
        }
    });
}

function preview(oType) {
    let formId = "#form1";
    let imgWrap = "#addImgWrap";
    let typeWrap = "#selWrap1";
    if(oType==="edit"){
        formId = "#form2";
        imgWrap = "#editImgWrap";
    }
    let title = $(formId).find('input[name="title"]').val().trim();
    if (!title){
        swalParent("系统提示",'新闻标题不能为空!',"warning");
        return false;
    }
    let imgSrc = "";
    $(imgWrap).find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    localStorage.setItem("news-title",title);
    localStorage.setItem("news-imgSrc",imgSrc);
    localStorage.setItem("news-content",$(formId).find('input[name="content"]').val().trim());
    window.open("/template/news","_blank");
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function openWindow(url,name,iWidth,iHeight) {
    let iTop = (window.screen.availHeight-30-iHeight)/2;
    let iLeft = (window.screen.availWidth-10-iWidth)/2;
    let openWindow = window.open(url,name,'height='+iHeight+',innerHeight='+iHeight+',width='+iWidth+',innerWidth='+iWidth+',top='+iTop+',left='+iLeft+',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');
}
//富文本输入回调
function openRes(domId,content) {
    //alert(content)
    //console.log(content);
    $('#'+domId).val(content);
}
//接收上传图片回调
function openRes4Pic(isSuccess,btnId,domId,picName) {
    if(isSuccess){
        $('#'+domId).find(".addItem").hide();
        $('#'+domId).append('' +
            '<div class="imgItem">\n ' +
                '<i title="点击删除" class="fa fa-window-close" aria-hidden="true"></i>\n' +
                '<img src="/img/'+picName+'">\n' +
            '</div>');
        //图片删除按钮点击事件
        $('.fa-window-close').on('click',function () {
            $(this).parent().remove();
            $('#'+domId).find(".addItem").show();
        })
    }
}


