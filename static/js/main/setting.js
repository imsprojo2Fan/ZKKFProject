let myTable;
let prefix = "/main/setting";
$(function () {
    loadingParent(false,2);
    $('#email').val(localStorage.getItem("test-email"));
    $('#d-token').val(localStorage.getItem("test-token"));
    $('#secret').val(localStorage.getItem("test-secret"));
    $('#content').val(localStorage.getItem("test-content"));
    $('#mailTest').on("click",function () {
        let email = $('#email').val().trim();
        if(!email){
            swal("系统提示","邮箱地址不能为空!","error");
            return false;
        }
        localStorage.setItem("test-email",email);
        $.get("/mailTest?email="+email,function (res) {
            if(res.code===1){
                swal("系统提示",res.msg,"success");
            }else{
                swal("系统提示",res.msg,"error");
            }
        });
    });

    $('#dingTest').on("click",function () {
        let token = $('#d-token').val().trim();
        let secret = $('#secret').val().trim();
        let content = $('#content').val();
        if(!token){
            swal("系统提示","token不能为空!","error");
            return false;
        }
        if(!secret){
            swal("系统提示","secret不能为空!","error");
            return false;
        }
        if(!content){
            swal("系统提示","发送内容不能为空!","error");
            return false;
        }
        localStorage.setItem("test-token",token);
        localStorage.setItem("test-secret",secret);
        localStorage.setItem("test-content",content);
        $.get("/dingTest",{token:token,secret:secret,content:content},function (res) {
            if(res.code===1){
                swal("系统提示",res.msg,"success");
            }else{
                swal("系统提示",res.msg,"error");
            }
        });
    });

    //tab导航栏切换
    $('.breadcrumb li').each(function () {
        $(this).on("click",function () {
            let dataId = $(this).attr("data-id");
            //console.log(dataId);
            let isActive = $(this).find("span").attr("class");
            if(!isActive){
                return false
            }else{
                $('.breadcrumb span').each(function () {
                    $(this).addClass("active");
                });
                $(this).find("span").removeClass("active");
                $('.tabWrap').each(function () {
                    $(this).fadeOut(100);
                });
                $("#"+dataId).fadeIn(100);
                if(dataId==="tab1"){
                    refresh();
                }
            }
        })
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,3,4,7 ] }],//指定哪些列不排序
        "order": [[ 6, "desc" ]],//默认排序
        "lengthMenu": [ [50, 100, 200,500], [50, 100, 200,500] ],
        "pageLength": 50,
        ajax: {
            url: prefix+'/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            {"data": "id","width":"5%","render": function (data, type, row) {
                    return "<div style='text-align: center'><span class='tid'>"+row.id+"</span></div>";
                }},
            { data: 'grouping',"render":function (data) {
                    if(!data){
                        return "-";
                    }
                    return data;
                } },
            { data: 'key',"width":"10%","render":function (data) {
                    return data;
                } },
            { data: 'value',"width":"10%","render":function (data) {
                    let temp = data;
                    if(data.length>15){
                        data = data.substring(0,15)+"...";
                    }
                    return "<span title='"+temp+"'>"+data+"</span>";
                } },
            { data: 'remark',"width":"15%","render":function (data) {
                    if(!data){
                        return "<span>-</span>";
                    }
                    let temp = data;
                    if(data.length>15){
                        data = data.substring(0,15)+"...";
                    }
                    return "<span title='"+temp+"'>"+data+"</span>";

                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-primary btn-xs'></i>编辑</a>&nbsp;"
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
            let pageObj = myTable.page.info();
            let num = index+1;
            num = num+ pageObj.page*(pageObj.length);
            if(num<10){
                num = "0"+num;
            }
            $('td', row).eq(0).find(".tid").html(num);
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
        $('#detail_grouping').html(rowData.grouping);
        $('#detail_key').html(rowData.key);
        $('#detail_value').html(rowData.value);
        let remark = rowData.remark;
        if(!remark){
            remark = "暂未填写";
        }
        $('#detail_label').html(rowData.label);
        $('#detail_remark').html(remark);
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));

        let updated = rowData.updated;
        $('#detail_updated').html(dateUtil.GMT2Str(updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#Id').val(rowData.id);
        $('#grouping_edit').val(rowData.grouping);
        $('#key_edit').val(rowData.key);
        $('#value_edit').val(rowData.value);
        $('#remark_edit').val(rowData.remark);
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

});


function add(){
    let grouping = $('#grouping').val().trim();
    let key = $('#key').val();
    let value = $('#value').val();
    let remark = $('#remark').val().trim();
    if (!grouping){
        swalInfo("系统提示",'分组类型不能为空!',"warning");
        return;
    }
    if (!key||!value){
        swalInfo("系统提示",'关键字或值不能为空!',"warning");
        return;
    }
    $.ajax({
        url : prefix+"/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            group:grouping,
            key:key,
            value:value,
            remark:remark
        },
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
    let grouping = $('#grouping_edit').val().trim();
    let key = $('#key_edit').val();
    let value = $('#value_edit').val();
    let remark = $('#remark_edit').val().trim();
    if (!grouping){
        swalParent("系统提示",'分组类型不能为空!',"warning");
        return;
    }
    if (!key||!value){
        swalParent("系统提示",'关键字或值不能为空!',"warning");
        return;
    }
    $.ajax({
        url : prefix+"/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:$('#Id').val(),
            group:grouping,
            key:key,
            value:value,
            remark:remark
        },
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
            if (r.code === 1) {
                swalParent("系统提示",r.msg, "success");
                refresh();
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            loadingParent(false,2);
        }
    })
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

