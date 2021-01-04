let myTable;
let prefix = "/main/order";
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
            renderTime("add");
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 7 ] }],//指定哪些列不排序
        "order": [[ 6, "desc" ]],//默认排序
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
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,3);
                }},
            { data: 'company',"render":function (data) {
                    return stringUtil.maxLength(data,6);
                } },
            { data: 'phone',"render":function (data) {
                    return stringUtil.maxLength(data,11);
                } },
            { data: 'status',"render":function (data) {
                    let str;
                    if(data=="0"){
                        str = "<span style='color:orangered'>待确认</span>";
                    }else if(data=="1"){
                        str = "<span style='color:#6195FF'>已确认</span>";
                    }else if(data=="2"){
                        str = "<span style='color:grey'>已取消</span>";
                    }else{
                        str = "<span style='color:green'>已完成</span>";
                    }
                    return str;
                } },
            { data: 'remark',"render":function (data) {
                    return stringUtil.maxLength(data,20);
                } },
            { data: 'updated',"width":"12%","render":function (data,type,row,meta) {
                    if (!data){
                        return "-";
                    }
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: 'created',"width":"12%","render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: null,"width":"15%","render":function () {
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
            $('#myTable_filter').find('input').attr("placeholder","请输入名称、手机号或订单号");
            loading(false);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.rid').html(stringUtil.maxLength(rowData.rid));
        $('#detailModal').find('.name').html(stringUtil.maxLength(rowData.name));
        $('#detailModal').find('.company').html(stringUtil.maxLength(rowData.company));
        $('#detailModal').find('.phone').html(stringUtil.maxLength(rowData.phone));
        let str;
        let status = rowData.status;
        if(status=="0"){
            str = "<span style='color:orangered'>待确认</span>";
        }else if(status=="1"){
            str = "<span style='color:green'>已确认</span>";
        }else if(status=="2"){
            str = "<span style='color:red'>已取消</span>";
        }else{
            str = "<span style='color:green'>已完成</span>";
        }
        $('#detailModal').find('.status').html("<span style='color:green'>"+str+"</span>");
        let created = rowData.created;
        let unixTimestamp = new Date(created);
        let commonTime = unixTimestamp.toLocaleString('chinese',{hour12:false});
        $('#detail_created').html(commonTime);

        let updated = rowData.updated;
        if(updated){
            let unixTimestamp = new Date(updated);
            updated = unixTimestamp.toLocaleString('chinese',{hour12:false});
        }else{
            updated = "暂无更新";
        }
        $('#detail_updated').html(updated);
        let rid = rowData.rid;
        detail(rid);
    });
    $('#myTable').on("click",".btn-info",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#editForm').find("input[name='id']").val(rowData.id);
        $('#editForm').find(".rid").html(rowData.rid);
        let status = rowData.status;
        $('#status').selectpicker('val',rowData.status);
        $("#status").selectpicker('refresh');
        if(status==2||status==3){
            $("#status").parent().find("button").attr("disabled","true");
            $('#editBtn').hide();
        }else{
            $("#status").parent().find("button").removeAttr("disabled");
            $('#editBtn').show();
        }

        $('#editForm').find("textarea[name='remark']").val(rowData.remark);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        let rid = rowData.rid;

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
            del(rid);
        });

    });

} );

function detail(rid) {
    loadingParent(true,2);
    $.post(prefix+"/detail",{rid:rid,_xsrf:$("#token", parent.document).val()},function (res) {
        loadingParent(false,2);
        console.log(res);
        $('#detailModal').modal("show");
    });
}

function add(){
    let deviceId = $('#typeSel1').val();
    let userId = $('#userSel1').val();
    let date = $('#addForm').find("input[name='date']").val().trim();
    let timeId = $('#addForm').find(".timeItemActive").attr("mydata");
    let remark = $('#addForm').find("textarea[name='remark']").val().trim();
    if (!timeId){
        swalParent("系统提示",'未选择任何时间!',"warning");
        return;
    }

    //let formData = formUtil('addForm');
    let formData = {};
    formData["uuid"] = userId;
    formData["deviceId"] = deviceId;
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["remark"] = remark;
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
                renderTime("add","");
                $('#addForm').find("textarea[name='remark']").val("");
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}

function edit(){

    let remark = $('#editForm').find("textarea[name='remark']").val().trim();
    //let formData = formUtil('addForm');
    let formData = {};
    formData["id"] = $('#editForm').find("input[name='id']").val();
    formData["status"] = $('#status').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["remark"] = remark;
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

function del(rid){

    $.ajax({
        url : prefix+"/delete",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            rid:rid
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

function renderTime(type,timeId) {
    let deviceId;
    let date;
    let wrapObj;
    if(type==="add"){
        deviceId = $('#typeSel1').val();
        date = $('#addForm').find(".date").val();
        wrapObj = $('#addForm').find(".timeWrap");
    }else{
        deviceId = $('#typeSel2').val();
        date = $('#editForm').find(".date").val();
        wrapObj = $('#editForm').find(".timeWrap");
    }
    if(!deviceId){
        return false;
    }
    let nowDate = dateUtil.getNow();
    let useFlag = dateUtil.compareDate(date,nowDate);
    //loading(true,2);
    $.post("/reservation/timeQuery",{_xsrf:$("#token", parent.document).val(),deviceId:deviceId,date:date},function (res) {
        if(res.code===1){
            //loading(false,2);
            let tList = res.data;
            if(tList){
                wrapObj.html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let isUse = item.isUse;
                    let id = item.tId;
                    let time = item.time;
                    //判断是否该时段早于当前时间
                    let timeFlag = dateUtil.compareTime(date+" "+time.substring(0,2)+":00:00");
                    //当前预约日期小于当前日期时则禁用选择
                    if(parseInt(timeId)===id){//熏染编辑状态选中
                        wrapObj.append('<span mydata="'+id+'" class="timeItemActive">'+time+'</span>');
                    }else if(!useFlag||!timeFlag||isUse===1){
                        wrapObj.append('<span mydata="'+id+'" class="timeItem-disabled">'+time+'</span>');
                    }else{
                        wrapObj.append('<span mydata="'+id+'" class="timeItem">'+time+'</span>');
                    }
                }
                $('.timeItem').on("click",function () {
                    $('.timeItemActive').addClass("timeItem");
                    $('.timeItemActive').removeClass("timeItemActive");
                    $(this).addClass("timeItemActive");
                });
            }else{
                wrapObj.html('');
                wrapObj.append('<span style="color: red;display: block;margin-top: 6px">暂无可选时间，请先添加!</span>');
            }
        }
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

function loading(flag,type) {
    window.parent.loading(flag,type);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};