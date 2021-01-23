let myTable;
let prefix = "/main/reservation";
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
    $('.breadcrumb span').on("click", function () {
        if (!$(this).hasClass("active")) {
            return false;
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");
        let data = $(this).attr("data");
        if (!data) {
            return false;
        }
        if(data==="tab1"){
            refresh();
        }
        $('.tabWrap').fadeOut(200);
        $("#"+data).fadeIn(200);
    });

    // 中文重写select 查询为空提示信息
    $('#userSel1').selectpicker({
        noneSelectedText: '下拉选择用户',
        noneResultsText: '无匹配选项',
        maxOptionsText: function (numAll, numGroup) {
            let arr = [];
            arr[0] = (numAll == 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
            arr[1] = (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
            return arr;
        },
        liveSearch: true,
        size:10   //设置select高度，同时显示5个值
    });
    $("#userSel1").selectpicker('refresh');
    //初始化用户信息
    $.post("/main/user/customer",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            //loading(false,2);
            let tList = res.data;
            if(tList){
                $('#userSel1').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let name = item.Name;
                    if(!name){
                        name = "未填写名字";
                    }
                    $('#userSel1').append('<option value="'+item.Id+'">'+name+'</option>');
                }
            }else{
                $('#userWrap1').html('');
                $('#userWrap1').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
            }
            $('#userSel1').selectpicker('refresh');
        }
    });

    // 中文重写select 查询为空提示信息
    $('#typeSel1').selectpicker({
        noneSelectedText: '下拉选择设备',
        noneResultsText: '无匹配选项',
        maxOptionsText: function (numAll, numGroup) {
            let arr = [];
            arr[0] = (numAll == 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
            arr[1] = (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
            return arr;
        },
        liveSearch: true,
        size:10   //设置select高度，同时显示5个值
    });
    $("#typeSel1").selectpicker('refresh');
    //初始化设备数据
    $.post("/main/device/reservation",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            let tList = res.data;
            if(tList){
                $('#typeSel1').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#typeSel1').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('#selWrap1').html('');
                $('#selWrap1').append('<span style="color: red;display: block;margin-top: -24px">暂无设备，请先添加!</span>');
            }
            $('#typeSel1').selectpicker('refresh');
            if(tList.length>0){
                renderTime();
            }
        }
    });
    $('#typeSel1').on('change', function(e){
        /*console.log(this.value,
            this.options[this.selectedIndex].value,
            $(this).find("option:selected").val(),);*/
        renderTime();
    });

    $('.weekWrap span').on("click",function () {
        if($(this).hasClass("weekWrapActive")){
            return false;
        }
        $('.weekWrap span').removeClass("weekWrapActive");
        $(this).addClass("weekWrapActive");
        renderTime();
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,3,4,6,10 ] }],//指定哪些列不排序
        "order": [[ 9, "desc" ]],//默认排序
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
            {"data": "id","width":"5%","render": function (data, type, row) {
                    return "<span class='tid'>"+row.id+"</span>";
                }},
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,3);
                }},
            { data: 'company',"render":function (data) {
                    return stringUtil.maxLength(data,6);
                } },
            { data: 'phone',"render":function (data) {
                    return stringUtil.maxLength(data,11);
                } },
            { data: 'deviceName',"render":function (data) {
                    return stringUtil.maxLength(data,15);
                } },
            { data: 'date',"render":function (data) {
                    if(!data){
                        return "<span>-</span>";
                    }else{
                        return data.replace("T00:00:00+08:00","");
                    }
                } },
            { data: 'time',"render":function (data) {
                    return stringUtil.maxLength(data);
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
            { data: 'updated',"width":"12%","render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
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
            loadingParent(true,2);
        },
        "drawCallback": function( settings ) {
            let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
            $('.dataTables_scrollBody').css("height",window.innerHeight-270+"px");
            $('#myTable_filter').find('input').attr("placeholder","请输入用户名称或手机号");
            parent.checkType();
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
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
        $('#detailModal').find('.deviceName').html(rowData.deviceName);
        let date = rowData.date;
        date = date.replace("T00:00:00+08:00","");
        $('#detailModal').find('.date').html(date);
        $('#detailModal').find('.time').html(rowData.time);

        let remark = rowData.remark;
        if(!remark){
            remark = "暂未填写";
        }
        $('#detailModal').find('.remark').html(remark);
        $('#detail_created').html(dateUtil.GMT2Str(rowData.created));
        $('#detail_updated').html(dateUtil.GMT2Str(rowData.updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#editForm').find("input[name='id']").val(rowData.id);
        $('#editForm').find("input[name='account']").val(rowData.account);
        $('#editDevice').html(rowData.deviceName);
        let date = rowData.date;
        date = date.replace("T00:00:00+08:00","");
        $('#editDate').html(date);
        $('#editTime').html(rowData.time);
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
    let date = $('.clickActive').attr("date");
    let timeId = $('.clickActive').attr("timeId");
    let message = $('#addForm').find("textarea[name='remark']").val().trim();
    //let formData = formUtil('addForm');
    let formData = {};
    formData["deviceId"] = $('#typeSel1').val();
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["uuid"] = $('#userSel1').val();
    formData["message"] = message;
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
            if (r.code == 1) {
                type = "success";
                renderTime();
                $('#addForm').find("textarea[name='remark']").val("");
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2);
        }
    });
}

function edit(){
    let deviceId = $('#typeSel1').val();
    //let date = $('#editForm').find("input[name='date']").val().trim();
    //let timeId = $('#editForm').find(".timeItemActive").attr("mydata");
    let remark = $('#editForm').find("textarea[name='remark']").val().trim();
    /*if (!timeId){
        swalParent("系统提示",'未选择任何时间!',"warning");
        return;
    }*/

    //let formData = formUtil('addForm');
    let formData = {};
    formData["id"] = $('#editForm').find("input[name='id']").val();
    //formData["deviceId"] = deviceId;
    //formData["date"] = date;
    formData["status"] = $('#status').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    //formData["timeId"] = timeId;
    formData["remark"] = remark;
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
        url : prefix+"/delete4soft",
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

function renderTime(){
    let wrapObj;
    let deviceId = $('#typeSel1').val();
    let week = $('.weekWrapActive').attr("data");
    wrapObj = $('#dateTable');
    loadingParent(true,2);
    $.post("/reservation/timeQuery",{_xsrf:$("#token", parent.document).val(),deviceId:deviceId,week:week},function (res) {
        if(res.code===1){
            loadingParent(false,2);
            let tList = res.data;
            if(tList){
                let nowYear = new Date().getFullYear();
                wrapObj.html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let dataList = item.data;
                    dataList.sort(stringUtil.compare("tStamp"));
                    if(i===0){
                        wrapObj.append('<tr id="tr'+i+'"></tr>');
                        for(let j=0;j<dataList.length;j++){
                            let item2 = dataList[j];
                            let date = item2.date;
                            $('#tr'+i).append('<th>'+date+'</th>');
                        }
                    }else{
                        wrapObj.append('<tr id="tr'+i+'"></tr>');
                        for(let j=0;j<dataList.length;j++){
                            let item2 = dataList[j];
                            let timeId = item2.timeId;
                            let date = item2.date;
                            let time = item2.time;
                            let isUse = item2.isUse;
                            if(date){
                                //判断是否该时段早于当前时间
                                //比较时间
                                date = date.substring(3,date.length);
                                date = nowYear+"-"+date;
                                let timeFlag = dateUtil.compareTime(date+" "+time.substring(0,5)+":00");
                                if(!timeFlag||isUse==1){
                                    $('#tr'+i).append('<td>-</td>');
                                }else{
                                    $('#tr'+i).append('<td date="'+date+'" timeId="'+timeId+'" class="click '+date+'">可预约</td>');
                                }
                            }else{
                                $('#tr'+i).append('<td >'+time+'</td>');
                            }
                        }
                    }
                }
                $('.click').on("click",function () {
                    if($(this).hasClass("clickActive")){
                        swal("已从本地预约列表移除","需提交预约方作系统确认！","info");
                        $(this).removeClass("clickActive");
                    }else{
                        $('.clickActive').removeClass("clickActive");
                        swal("已加入本地预约列表","需提交预约方作系统确认！","info");
                        $(this).addClass("clickActive");
                    }
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