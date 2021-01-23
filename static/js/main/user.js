let myTable;
let prefix = "/main/user";
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
            return false
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
            return false
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,3,4,5,6,10] }],//指定哪些列不排序
        "order": [[ 9, "desc" ]],//默认排序
        "lengthMenu": [ [50, 100, 200,500], [30, 50, 100, 200,500] ],
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
                    return "<div style='text-align: left'><input type='checkbox' name='check' value='"+row.id+"'><span style='margin-left: 3px;' class='tid'>"+row.id+"</span></div>";
                }},
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,3);
                }},
            { data: 'company',"render":function (data) {
                    return stringUtil.maxLength(data,7);
                }},
            { data: 'phone',"render":function (data) {
                    return stringUtil.maxLength(data,11);
                } },
            { data: 'email',"render":function (data) {
                    return stringUtil.maxLength(data,11);
                } },
            { data: 'address',"render":function (data) {
                    return stringUtil.maxLength(data,7);
                }},
            { data: 'teacher',"render":function (data) {
                    return stringUtil.maxLength(data,5);
                } },
            { data: 'type',"render":function (data) {
                    let str = "";
                    if(data==99){
                        str = "普通用户";
                    }else if(data==2){
                        str = "管理员";
                    }else if(data==1){
                        str = "高级管理员";
                    }else{
                        str = "访客";
                    }
                    return str;
                } },
            { data: 'disabled',"render":function (data) {
                    if(data==0){
                        return "<span style='color:green;'>正常</span>";
                    }else{
                        return "<span style='color:red;'>禁用</span>";
                    }
                } },
            { data: 'created',"width":"12%","render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"width":"15%","render":function () {
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
        "drawCallback": function( settings ) {

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
            $('#myTable_filter').find('input').attr("placeholder","请输入姓名/手机/邮箱");
            parent.checkType();
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.account').html(rowData.account);
        if(rowData.active==1){
            $('#detailModal').find('.active').html("<span style='color:green'>已激活</span>");
        }else{
            $('#detailModal').find('.active').html("<span style='color: red'>未激活</span>");
        }
        if(rowData.disabled==0){
            $('#detailModal').find('.disabled').html("<span style='color:green'>可用</span>");
        }else{
            $('#detailModal').find('.disabled').html("<span style='color: red'>禁用</span>");
        }
        $('#detailModal').find('.gender').html(rowData.gender);
        $('#detailModal').find('.name').html(stringUtil.maxLength(rowData.name));

        let str;
        if(rowData.type==99){
            str = "普通用户";
        }else if(rowData.type==2){
            str = "管理员";
        }else if(rowData.type==1){
            str = "高级管理员";
        }
        $('#detailModal').find('.type').html(str);
        $('#detailModal').find('.phone').html(stringUtil.maxLength(rowData.phone));
        $('#detailModal').find('.company').html(stringUtil.maxLength(rowData.company,10));
        $('#detailModal').find('.address').html(stringUtil.maxLength(rowData.address,15));
        $('#detailModal').find('.email').html(stringUtil.maxLength(rowData.email,11));
        $('#detailModal').find('.teacher').html(stringUtil.maxLength(rowData.teacher,3));
        $('#detailModal').find('.teacher_phone').html(stringUtil.maxLength(rowData.teacher_phone,11));
        $('#detailModal').find('.teacher_mail').html(stringUtil.maxLength(rowData.teacher_mail,20));
        $('#detailModal').find('.invoice').html(stringUtil.maxLength(rowData.invoice,20));
        $('#detailModal').find('.invoice_code').html(stringUtil.maxLength(rowData.invoice_code,20));
        $('#detailModal').find('.remark').html(stringUtil.maxLength(rowData.remark,15));
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));

        let updated = rowData.updated;
        $('#detail_updated').html(dateUtil.GMT2Str(updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#editForm').find("input[name='id']").val(rowData.id);
        $('#editForm').find("input[name='account']").val(rowData.account);
        $('#editActive').selectpicker('val',rowData.active);
        $("#editActive").selectpicker('refresh');
        $('#editDisabled').selectpicker('val',rowData.disabled);
        $("#editDisabled").selectpicker('refresh');
        $('#editGender').selectpicker('val',rowData.gender);
        $("#editGender").selectpicker('refresh');
        $("#editType").selectpicker('val',rowData.type);
        $("#editType").selectpicker('refresh');
        $('#editForm').find("input[name='name']").val(rowData.name);
        $('#editForm').find("input[name='password']").val(rowData.password);
        $('#editForm').find("input[name='phone']").val(rowData.phone);
        $('#editForm').find("input[name='email']").val(rowData.email);
        $('#editForm').find("input[name='company']").val(rowData.company);
        $('#editForm').find("input[name='address']").val(rowData.address);
        $('#editForm').find("input[name='teacher']").val(rowData.teacher);
        $('#editForm').find("input[name='teacher_phone']").val(rowData.teacher_phone);
        $('#editForm').find("input[name='teacher_mail']").val(rowData.teacher_mail);
        $('#editForm').find("input[name='invoice']").val(rowData.invoice);
        $('#editForm').find("input[name='invoice_code']").val(rowData.invoice_code);
        $('#editForm').find("textarea[name='remark']").val(rowData.remark);
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
    let account = $('#addForm').find("input[name='account']").val().trim();
    let password = $('#addForm').find("input[name='password']").val().trim();
    let phone = $('#addForm').find("input[name='phone']").val().trim();
    let email = $('#addForm').find("input[name='email']").val().trim();
    if (!account){
        swalParent("系统提示",'账号不能为空!',"warning");
        return;
    }
    if(!isNaN(account)){
        swalParent("账号不可为纯数字!");
        return
    }
    if (account.length<5){
        swalParent("系统提示",'账号不能少于5个字符!',"warning");
        return;
    }
    if (!password){
        swalParent("系统提示",'密码不能为空!',"warning");
        return;
    }
    if(password.length<8){
        swalParent("系统提示",'密码不能少于8个字符!',"warning");
        return;
    }
    if(phone&&!(/^1[3456789]\d{9}$/.test(phone))){
        swalParent("系统提示",'手机号格式错误!',"warning");
        return;
    }
    let reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
    if(email&&!reg.test(email)){
        swalParent("系统提示",'邮箱地址格式错误!',"warning");
        return;
    }

    let formData = formUtil('addForm');
    formData["type"] = $('#type').val();
    formData["gender"] = $('#gender').val();
    formData["disabled"] = $('#disabled').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["active"] = 1;
    formData["sign"] = 1;
    $.ajax({
        url : prefix+"/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            let type = "error";
            if (r.code == 1) {
                type = "success";
                reset();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}

function edit(){
    let account = $('#editForm').find('input[name="account"]').val().trim();
    let password = $('#editForm').find('input[name="password"]').val().trim();
    let phone = $('#editForm').find("input[name='phone']").val().trim();
    let email = $('#editForm').find("input[name='email']").val().trim();
    if (!account){
        swalParent("系统提示",'账号不能为空!',"warning");
        return;
    }

    if (!password){
        swalParent("系统提示",'密码不能为空!',"warning");
        return;
    }
    if(password.length<8){
        swalParent("系统提示",'密码不能少于8个字符!',"warning");
        return;
    }
    if(phone&&!(/^1[3456789]\d{9}$/.test(phone))){
        swalParent("系统提示",'手机号格式错误!',"warning");
        return;
    }
    let reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
    if(email&&!reg.test(email)){
        swalParent("系统提示",'邮箱地址格式错误!',"warning");
        return;
    }
    let formData = formUtil('editForm');
    formData["type"] = $('#editType').val();
    formData["disabled"] = $('#editDisabled').val();
    formData["active"] = $('#editActive').val();
    formData["gender"] = $('#editGender').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    $.ajax({
        url : prefix+"/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
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
            swalParent("系统提示",r.msg,type);
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
                swalParent("系统提示",r.msg, "success");
                refresh();
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            $('#loading').fadeOut(200);
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

function loading(flag) {
    window.parent.loading(flag);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};