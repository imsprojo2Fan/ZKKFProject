let myTable;
let prefix = "/main/file";
window.onresize = function() {
    let bodyHeight = window.innerHeight;
    console.log("bodyHeight:"+bodyHeight);
    //设置表格高度
    let tHeight = bodyHeight-210;
    console.log("tHeight:"+tHeight);
    $('.dataTables_scrollBody').css("height",tHeight+"px");
};

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
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");
        let data = $(this).attr("data");
        if(!data){
            return false;
        }
        $('.tabWrap').fadeOut(300);
        if(data==="tab1"){
            refresh();
        }
        $("#"+data).fadeIn(300);
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,6] }],//指定哪些列不排序
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
            { data: 'type',"render":function (data) {
                    let str;
                    if(data==="0"){
                        str = "项目文件";
                    }else if(data==="1"){
                        str = "内部文件";
                    }else if(data==="2"){
                        str = "共享文件";
                    }else{
                        str = "其他文件";
                    }
                    return str;
                } },
            { data: 'ori_name',"render":function (data) {
                    return stringUtil.maxLength(data,15);
                } },
            { data: 'remark',"render":function (data) {
                    return stringUtil.maxLength(data,25);
                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    //let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    let html = "<a href='javascript:void(0);' class='btn btn-primary btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='btn btn-danger btn-xs'>删除</a>&nbsp;";
                    html += "<a href='javascript:void(0);' class='download btn btn-success btn-xs'>下载</a>"
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
            $('#myTable_filter').find('input').attr("placeholder","请输入原文件名/备注");
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
        $('#editForm').find(".type").selectpicker('val',rowData.type);
        $('#editForm').find(".type").selectpicker('refresh');
        $('#editModal').find('input[name="fileName"]').val(rowData.file_name);
        $('#editModal').find('input[name="oriName"]').val(rowData.ori_name);
        $('#editModal').find('textarea').val(rowData.remark);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        let id = rowData.id;
        let fileName = rowData.file_name;
        swal({
            title: "确定删除吗?",
            text: '删除将无法恢复该信息!',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff1200',
            cancelButtonColor: '#474747',
            confirmButtonText: '确定',
            cancelButtonText:'取消'
        },function(){
            del(id,fileName);
        });

    });
    $('#myTable').on("click",".download",function(e){//下载文件
        rowData = myTable.row($(this).closest('tr')).data();
        let fileName = rowData.file_name;
        $('#downloadBtn').attr("href","/file/upload/"+fileName);
        $('#downloadBtn')[0].click();
    });

} );

function add(){
    let remark = $('#addForm').find('textarea').val().trim();
    let files = $('#addForm').find("input[name='file']").prop('files');
    if(files.length===0){
        swal("系统提示","请选择上传文件!","error");
        return
    }
    let file = files[0];
    let size = file.size;
    if(size>20971520){
        swal("系统提示","文件大小不能超过20MB!","error");
        return
    }
    let formData = new FormData();
    formData.append('type', $('#addForm').find(".type").val());
    formData.append('file', files[0]);
    formData.append("_xsrf",$("#token", parent.document).val());
    formData.append("remark",remark);
    $.ajax({
        url : prefix+"/add",
        type : "POST",
        cache: false,
        processData: false,
        contentType: false,
        data : formData,
        beforeSend:function(){
            loadingParent(true,2)
        },
        success : function(r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                reset();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2)
        }
    });
}

function edit(){
    //let remark = $('#editForm').find('textarea').val().trim();
    let formData = formUtil('editForm');
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
            if (r.code === 1) {
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

function del(id,fileName){

    $.ajax({
        url : prefix+"/delete",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id,
            fileName:fileName
        },
        beforeSend:function(){
            loadingParent(true,2)
        },
        success : function(r) {
            if (r.code === 1) {
                setTimeout(function () {
                    swalParent("系统提示",r.msg, "success");
                    refresh();
                },100);
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            loadingParent(false,2)
        }
    })
}

function batchDel() {
    let checkboxes = $('td input[type="checkbox"]');
    // 获取选中的checkbox
    let allChecked = checkboxes.filter(':checked');
    if(allChecked.length===0){
        swalParent("系统提示","未选中任何删除项!","warning");
        return;
    }
    let idArr="";
    for(let i=0;i<allChecked.length;i++){
        let id = $(allChecked[i]).val();
        idArr = idArr+","+id;
    }
    idArr = idArr.substring(1,idArr.length);
    swal({
        title: "确定删除这些数据吗?",
        text: '删除将无法恢复该信息！',
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#ff1200',
        cancelButtonColor: '#474747',
        confirmButtonText: '确定',
        cancelButtonText:'取消'
    },function(){
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
    });
}

function reset() {
    $(":input").val("");
    $('.addItem').show();
    $('.imgItem').html("");
    $("textarea").val("")
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function loading(flag) {
    window.parent.loading(flag);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};

