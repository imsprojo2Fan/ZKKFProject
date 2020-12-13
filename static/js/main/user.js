let myTable;

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
            return
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
            return
        }else{
            $('#tabHref01').addClass("active");
            $(this).removeClass("active");
            $('#tab1').fadeOut(200);
            $("#tab2").fadeIn(200);
        }
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,3,6 ] }],//指定哪些列不排序
        "order": [[ 5, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 30,
        ajax: {
            url: '/main/user/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'account'},
            { data: 'actived',"render":function (data) {
                    if(data==1){
                        return "<span style='color:green;'>正常</span>";
                    }else{
                        return "<span style='color:red;'>禁用</span>";
                    }
                } },
            { data: 'type',"render":function (data) {
                    let str = "";
                    if(data==0){
                        str = "普通用户";
                    }else if(data==1){
                        str = "管理员";
                    }else if(data==2){
                        str = "高级管理员";
                    }else if(data==3){
                        str = "超级管理员";
                    }else{
                        str = "访客";
                    }
                    return str;
                } },
            { data: 'email',"render":function (data) {
                    if(!data){
                        return "<span>暂未填写</span>";
                    }else{
                        return data;
                    }

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
        $('#detail_account').html(rowData.account);
        if(rowData.actived==1){
            $('#detail_actived').html("<span style='color:green'>正常</span>");
        }else{
            $('#detail_actived').html("<span style='color: red'>禁用</span>");
        }

        let str = "";
        if(rowData.type==0){
            str = "普通用户";
        }else if(rowData.type==1){
            str = "管理员";
        }else if(rowData.type==2){
            str = "高级管理员";
        }else if(rowData.type==3){
            str = "超级管理员";
        }else{
            str = "访客";
        }
        $('#detail_type').html(str);
        let email = rowData.email;
        if(!email){
            email = "暂未填写";
        }
        $('#detail_email').html(email);
        let remark = rowData.remark;
        if(!remark){
            remark = "暂未填写";
        }
        $('#detail_label').html(rowData.label);
        $('#detail_remark').html(remark);
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
        $('#Id').val(rowData.id);
        $('#account_edit').val(rowData.account);
        $('#actived_edit').selectpicker('val',rowData.actived);
        $("#actived_edit").selectpicker('refresh');
        $("#type_edit").selectpicker('val',rowData.type);
        $("#type_edit").selectpicker('refresh');
        $('#password_edit').val(rowData.password);
        $('#email_edit').val(rowData.email);
        $('#label_edit').val(rowData.label);
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

} );

function add(){
    let account = $('#account').val().trim();
    let actived = $('#actived').val();
    let type = $('#type').val();
    let password = $('#password').val().trim();
    let email = $('#email').val().trim();
    let remark = $('#remark').val().trim();
    if (!account){
        swal("系统提示",'账号不能为空!',"warning");
        return;
    }
    if(email){
        if (!checkEmail(email)){
            swal("系统提示",'邮箱格式不正确!',"warning");
        }
    }
    if (!password){
        swal("系统提示",'密码不能为空!',"warning");
        return;
    }
    $.ajax({
        url : "/main/user/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            account:account,
            actived:actived,
            type:type,
            password:password,
            email:email,
            remark:remark
        },
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            let type = "error";
            if (r.code == 1) {
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
    let account = $('#account_edit').val().trim();
    let actived = $('#actived_edit').val();
    let type = $('#type_edit').val();
    let password = $('#password_edit').val().trim();
    let email = $('#email_edit').val().trim();
    let remark = $('#remark_edit').val().trim();
    if (!password){
        swal("系统提示",'密码不能为空!',"warning");
        return;
    }
    if(email){
        if (!checkEmail(email)){
            swal("系统提示",'邮箱格式不正确!',"warning");
        }
    }
    $.ajax({
        url : "/main/user/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:$('#Id').val(),
            //account:account,
            actived:actived,
            type:type,
            password:password,
            email:email,
            remark:remark
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
        url : "/main/user/delete",
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
                swal("系统提示",r.msg, "success");
                refresh();
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
    $('#actived').val(1)
    $('#actived').selectpicker('refresh');
    $("textarea").each(function () {
        $(this).val("");
    });
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
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