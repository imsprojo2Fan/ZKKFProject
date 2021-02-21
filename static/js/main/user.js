let myTable;
let prefix = "/main/user";
let userInfo = parent.user();
let uType = userInfo.type;

$(document).ready(function() {

    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

    //tab导航栏切换
    $('.breadcrumb span').on("click", function () {
        if (!$(this).hasClass("active")) {
            return false;
        }
        let data = $(this).attr("data");
        if (!data) {
            return false;
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");
        if(data==="tab1"){
            refresh();
        }
        $('.tabWrap').fadeOut(200);
        $("#"+data).fadeIn(200);
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
            {"data": "id","width":"8%","render": function (data, type, row) {
                    return "<div style='text-align: left'><input type='checkbox' name='check' value='"+row.id+"'><span style='margin-left: 3px;' class='tid'>"+row.id+"</span></div>";
                }},
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,6);
                }},
            { data: 'company',"render":function (data) {
                    return stringUtil.maxLength(data,5);
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
                    data = parseInt(data);
                    if(data===99){
                        str = "普通用户";
                    }else if(data===6){
                        str = "数据分析师";
                    }else if(data===5){
                        str = "测试工程师";
                    }else if(data===4){
                        str = "制样工程师";
                    }else if(data===3){
                        str = "业务经理";
                    }else if(data===7){
                        str = "财务管理员";
                    }else if(data===2){
                        str = "普通管理员";
                    }else if(data===1){
                        str = "高级管理员";
                    }
                    return str;
                } },
            { data: 'disabled',"render":function (data) {
                    if(parseInt(data)===0){
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
            if(uType>2){
                $('.btn-primary').remove();
            }
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
        let data = parseInt(rowData.type);
        if(data===99){
            str = "普通用户";
        }else if(data===7){
            str = "数据分析师";
        }else if(data===6){
            str = "测试工程师";
        }else if(data===5){
            str = "制样工程师";
        }else if(data===4){
            str = "业务经理";
        }else if(data===3){
            str = "财务管理员";
        }else if(data===2){
            str = "普通管理员";
        }else if(data===1){
            str = "高级管理员";
        }
        $('#detailModal').find('.type').html(str);
        $('#detailModal').find('.phone').html(stringUtil.maxLength(rowData.phone));
        $('#detailModal').find('.company').html(stringUtil.maxLength(rowData.company,30));
        $('#detailModal').find('.address').html(stringUtil.maxLength(rowData.address,35));
        $('#detailModal').find('.email').html(stringUtil.maxLength(rowData.email,30));
        $('#detailModal').find('.teacher').html(stringUtil.maxLength(rowData.teacher,6));
        $('#detailModal').find('.teacher_phone').html(stringUtil.maxLength(rowData.teacher_phone,11));
        $('#detailModal').find('.teacher_mail').html(stringUtil.maxLength(rowData.teacher_mail,30));
        $('#detailModal').find('.invoice').html(stringUtil.maxLength(rowData.invoice,30));
        $('#detailModal').find('.invoice_code').html(stringUtil.maxLength(rowData.invoice_code,30));
        $('#detailModal').find('.remark').html(stringUtil.maxLength(rowData.remark,45));
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
        let role = rowData.role;
        let tempArr = [];
        if(role){
            let arr = role.split(",");

            for(let i=0;i<arr.length;i++){
                let id = arr[i];
                if(!id){
                    continue
                }
                tempArr.push(id);
            }
        }
        $('#roleEdit').selectpicker('val',tempArr);
        $("#roleEdit").selectpicker('refresh');
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
        if(parseInt(rowData.type)===99){
            $('#roleEdit').parent().parent().parent().hide();
            $('#editTypeSel').parent().parent().parent().hide();
        }else{
            $('#roleEdit').parent().parent().parent().show();
            $('#editTypeSel').parent().parent().parent().show();
        }
        let type_job = rowData.type_job;
        if(type_job){
            let arr = type_job.split(",");
            let tempArr = [];
            for(let i=0;i<arr.length;i++){
                let id = arr[i];
                if(!id){
                    continue
                }
                tempArr.push(id);
            }
            $('#editTypeSel').selectpicker('val',tempArr);
            $("#editTypeSel").selectpicker('refresh');
        }
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        console.log(rowData);
        let id = rowData.id;
        window.parent.confirmAlert("确定删除吗？","与当前相关的数据将全部被删除！",del,id);

    });
    initData();
});

function initData() {
    //初始化父类分组过滤数据
    $.post("/main/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            let tList = res.data;
            typeArr = tList;
            //$('#addTypeSel').append('<option value="0">暂不选择</option>');
            //$('#editTypeSel').append('<option value="0">暂不选择</option>');
            if(tList){
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#addTypeSel').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#editTypeSel').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }
            $('#addTypeSel').selectpicker('refresh');
            $('#editTypeSel').selectpicker('refresh');
        }
    });
    if(uType>1){
        $('#type').html("");
        $('#type').append('<option value="99">普通用户</option>');
        $('#type').selectpicker('refresh');
    }
    // 中文重写select 查询为空提示信息
    $('.selectpicker').selectpicker({
        noneSelectedText: '下拉选择指定项',
        noneResultsText: '无匹配选项',
        maxOptionsText: function (numAll, numGroup) {
            let arr = [];
            arr[0] = (numAll == 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
            arr[1] = (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
            return arr;
        },
        //liveSearch: true,
        //size:10   //设置select高度，同时显示5个值
    });
    $(".selectpicker").selectpicker('refresh');
}

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
    let roleVal = $('#role').val();
    let roleArr = "";
    $.each(roleVal,function (i,item) {
        roleArr += ","+item;
    });
    roleArr = roleArr.substring(1,roleArr.length);
    formData["role"] = roleArr;
    formData["gender"] = $('#gender').val();
    formData["disabled"] = $('#disabled').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["active"] = 1;
    formData["sign"] = 1;
    let addTypeSel = $('#addTypeSel').val();
    let typeArr = "";
    $.each(addTypeSel,function (i,item) {
        typeArr += ","+item;
    });
    typeArr = typeArr.substring(1,typeArr.length);
    formData["typeJob"] = typeArr;
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
            if (r.code===1) {
                type = "success";
                reset4success();
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
    let roleVal = $('#roleEdit').val();
    let roleArr = "";
    $.each(roleVal,function (i,item) {
        roleArr += ","+item;
    });
    roleArr = roleArr.substring(1,roleArr.length);
    formData["role"] = roleArr;
    formData["disabled"] = $('#editDisabled').val();
    formData["active"] = $('#editActive').val();
    formData["gender"] = $('#editGender').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    let editTypeSel = $('#editTypeSel').val();
    let typeArr = "";
    $.each(editTypeSel,function (i,item) {
        typeArr += ","+item;
    });
    typeArr = typeArr.substring(1,typeArr.length);
    formData["typeJob"] = typeArr;
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
            if (r.code===1) {
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

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function hideTypeSel(obj,domId,domId2){
    let val = $(obj).val();
    if(parseInt(val)===99){
        $('#'+domId).parent().hide();
        $('#'+domId2).parent().parent().parent().hide();
    }else{
        $('#'+domId).parent().show();
        $('#'+domId2).parent().parent().parent().show();
    }
}
