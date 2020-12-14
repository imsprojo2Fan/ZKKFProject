let myTable;
let prefix = "/main/device";
window.onresize = function() {
    let bodyHeight = window.innerHeight;
    console.log("bodyHeight:"+bodyHeight);
    //设置表格高度
    let tHeight = bodyHeight-210;
    console.log("tHeight:"+tHeight);
    $('.dataTables_scrollBody').css("height",tHeight+"px");
};

$(document).ready(function() {

    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

    //tab导航栏切换
    $('#tabHref01').on("click",function () {
        let isActive = $(this).attr("class");
        if(!isActive){
            return false;
        }else{
            $('#tabHref02').addClass("active");
            $(this).removeClass("active");
            $('#tab2').fadeOut(200);
            $("#tab1").fadeIn(200);
            refresh();
        }
    });

    $('#tabHref02').on("click",function () {
        let isActive = $(this).attr("class");
        if(!isActive){
            return false;
        }else{
            $('#tabHref01').addClass("active");
            $(this).removeClass("active");
            $('#tab1').fadeOut(200);
            $("#tab2").fadeIn(200);
        }
    });

    $('#uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1000,600);
    });

    $('#edit_uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1000,600);
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,2,7 ] }],//指定哪些列不排序
        "order": [[ 6, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 30,
        ajax: {
            url: prefix+'/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'name'},
            { data: 'disabled',"render":function (data) {
                    if(data==="1"){
                        return "<span style='color:green'>上线</span>";
                    }else{
                        return "<span style='color:red'>下架</span>";
                    }
                }},
            { data: 'sketch',"render":function (data) {
                    let temp = data;
                    if(temp.length>15){
                        temp = temp.substring(0,15)+"...";
                    }

                    return "<span title='"+data+"'>"+temp+"</span>"
                } },
            { data: 'view',"render":function (data) {
                    return data;
                } },
            { data: 'reservation',"render":function (data) {
                    return data;
                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-info btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a>"
                    return html;
                } }
        ],
        language: {
            url: '../../static/plugins/datatables/zh_CN.json'
        },
        "fnInitComplete": function(oSettings, json) {
            if(!json){
                swal("系统提示","登录超时！请刷新页面","error");
                return false;
            }
        },
        "createdRow": function ( row, data, index ) {//回调函数用于格式化返回数据
            /*if(!data.name){
                $('td', row).eq(2).html("暂未填写");
            }*/
        },
        "fnPreDrawCallback": function (oSettings) {
            loading(true);
        },
        "drawCallback": function( settings ) {
            let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
            $('.dataTables_scrollBody').css("height",window.innerHeight-270+"px");
            loading(false);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.name').html(rowData.name);
        $('#detailModal').find('.title').html(rowData.title);
        let disabled = rowData.disabled;
        if(disabled==="1"){
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
        let unixTimestamp = new Date(created) ;
        let commonTime = unixTimestamp.toLocaleString('chinese',{hour12:false});
        $('#detail_created').html(commonTime);

        let updated = rowData.updated;
        if(updated){
            let unixTimestamp = new Date(updated) ;
            updated = unixTimestamp.toLocaleString('chinese',{hour12:false});
        }else{
            updated = "暂无更新";
        }

        $('#detail_updated').html(updated);
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-info",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#id').val(rowData.id);
        $('#editModal').find('.name').val(rowData.name);
        $('#editModal').find('.disabled').selectpicker('val',rowData.disabled);
        $('#editModal').find('.disabled').selectpicker('refresh');
        $('#editModal').find('.title').val(rowData.title);
        $('#editModal').find('.source').val(rowData.source);
        $('#editModal').find('.sketch').val(rowData.sketch);
        $('#editModal').find('.parameter').val(rowData.parameter);
        $('#editModal').find('.feature').val(rowData.feature);
        $('#editModal').find('.range').val(rowData.range);
        $('#editModal').find('.achievement').val(rowData.achievement);
        $('#editModal').find('.remark').val(rowData.remark);
        //$('#edit_picVal').val(rowData.img);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        console.log(rowData);
        let id = rowData.id;

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
            del(id);
        });

    });

} );

function add(){
    let name = $('.form1').find('.name').val().trim();
    let disabled = $('.form1').find('.disabled').val().trim();
    let title = $('.form1').find('.title').val().trim();
    let source = $('.form1').find('.source').val().trim();
    let sketch = $('.form1').find('.sketch').val().trim();
    let parameter = $('.form1').find('.parameter').val().trim();
    let feature = $('.form1').find('.feature').val().trim();
    let range = $('.form1').find('.range').val().trim();
    let achievement = $('.form1').find('.achievement').val().trim();
    let remark = $('.form1').find('.remark').val().trim();
    let img = $('#picVal').val();
    if (!name){
        swal("系统提示",'设备名称不能为空!',"warning");
        return;
    }
    /*if (!img){
        swal("系统提示",'请上传图片!',"warning");
        return;
    }*/
    let obj = {};
    let formArray = $("#form1").serializeArray();
    $.each(formArray, function () {
        if (obj[this.name] !== undefined) {
            if (!obj[this.name].push) {
                obj[this.name] = [obj[this.name]];
            }
            obj[this.name].push(this.value || '');
        } else {
            obj[this.name] = this.value || '';
        }
    });
    obj["_xsrf"] = $("#token", parent.document).val();
    console.info(obj);
    $.ajax({
        url : prefix+"/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : obj,
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                reset();
            }
            swal("系统提示",r.msg,type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}

function edit(){
    let name = $('#edit_name').val().trim();
    let description = $('#edit_description').val().trim();
    let img = $('#edit_picVal').val();
    if (!name){
        swal("系统提示",'分组名称不能为空!',"warning");
        return;
    }
    $.ajax({
        url : prefix+"/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:$('#id').val(),
            name:name,
            img:img,
            description:description
        },
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            $('#editModal').modal("hide");
            let type = "error";
            if (r.code == 1) {
                type = "success";
                refresh();
            }
            swal("系统提示",r.msg,type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
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
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            if (r.code == 1) {
                setTimeout(function () {
                    swal("系统提示",r.msg, "success");
                    refresh();
                },100);
            }else{
                swal("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    })
}

function reset() {
    $(":input").each(function () {
        $(this).val("");
    });
    $('#picName').html("");
    $("textarea").each(function () {
        $(this).val("");
    });
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function openWindow(url,name,iWidth,iHeight) {
    let iTop = (window.screen.availHeight-30-iHeight)/2;
    let iLeft = (window.screen.availWidth-10-iWidth)/2;
    let openWindow = window.open(url,name,'height='+iHeight+',innerHeight='+iHeight+',width='+iWidth+',innerWidth='+iWidth+',top='+iTop+',left='+iLeft+',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');

}

function swalParent(title,msg,type) {
    window.parent.swalInfo(title,msg,type);
}

function loading(flag) {
    window.parent.loading(flag);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};