let myTable;
let prefix = "/main/reservation";
let deviceList = [];
let selectDeviceIndex = 0;
let gDeviceId;
let gDate;
let gTimeId;
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
        let data = $(this).attr("data");
        if (!data) {
            return false;
        }
        if(data==="tab4"){
            return false;
        }
        $('input').removeAttr("disabled");
        if(data==="tab2"){
            $('input[name=pay]:eq(1)').attr("checked",true);
            $('input[name=test_result]:eq(0)').attr("checked",true);
            $('input[name=detection_report]:eq(0)').attr("checked",true);
            $('input[name=sample_processing]:eq(0)').attr("checked",true);
            renderTime();
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");

        if(data==="tab1"){
            refresh();
        }
        $('.tabWrap').fadeOut(200);
        $("#"+data).fadeIn(200);
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,4,7 ] }],//指定哪些列不排序
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
            {"data": "id","width":"5%","render": function (data, type, row) {
                    return "<span class='tid'>"+row.id+"</span>";
                }},
            { data: 'name',"render":function (data,type,row) {
                    let str = row.name+"/"+row.phone+"/"+row.company;
                    return "<span title='"+str+"'>"+stringUtil.maxLength(str,20)+"</span>";
                }},
            { data: 'deviceName',"render":function (data) {
                    return stringUtil.maxLength(data,12);
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
                    data = parseInt(data);
                    if(data===0){
                        str = "<span style='color:orangered'>待确认</span>";
                    }else if(data===1){
                        str = "<span style='color:#6195FF'>已确认</span>";
                    }else if(data===2){
                        str = "<span style='color:grey'>已取消</span>";
                    }else{
                        str = "<span style='color:green'>已完成</span>";
                    }
                    return str;
                } },
            { data: 'created',"width":"12%","render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-primary btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a>&nbsp;";
                    html +=
                        "<a href='javascript:void(0);'  class='protocol btn btn-secondary btn-xs'>实验要求</a> "
                    html +=
                        "<a href='javascript:void(0);'  class='assign btn btn-secondary btn-xs'>指派订单</a> "
                    html +=
                        "<a href='javascript:void(0);'  class='report btn btn-secondary btn-xs'>实验报告</a> "
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
        let rid = rowData.rid;
        $('#editDeviceId').val(rowData.device_id);
        $('#editRid').val(rid);
        editInfo(rid);
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
    $('#myTable').on("click", ".protocol", function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        /*$('#protocolModal .rid').html(rowData.rid);
        $('#protocolModal').modal("show");*/
        $('.wat').remove();
        $('.protocolTable').hide(200);
        $("#more").attr("src", "../../static/img/square_left.png");
        $("#more").attr("title", "显示协议");
        protocolDetail(rowData.rid);
    });
    $('#pdfBtn').on("click", function () {
        //imgUtil.addWatermark("protocolInfo","中科科辅");
        if($('.protocolTable').is(":hidden")){
            $('#more').click();
        }
        setTimeout(function () {
            imgUtil.domShot("protocolInfo", imgUtil.pagePdf, "中科科辅服务协议/" + dateUtil.nowTime());
        },500)

    });
    $('#more').on("click", function () {
        if ($(this).attr("title") === "隐藏协议") {
            $(this).attr("title", "显示协议");
            $(this).attr("src", "../../static/img/square_left.png");
        } else {
            $(this).attr("src", "../../static/img/square_down.png");
            $(this).attr("title", "隐藏协议");
        }
        $('.wat').remove();
        $('.protocolTable').toggle(200);
        setTimeout(function () {
            imgUtil.addWatermark("protocolInfo", "中科科辅");
        }, 500);

    });
    $('.backBtn').on("click", function () {
        $('.list').addClass('active');
        $('.list').click();
    });
    $('#myTable').on("click", ".assign", function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        $('#assignModal .rid').html(rowData.rid);
        $.post(prefix + "/assign", {
            rid: rowData.rid,
            _xsrf: $("#token", parent.document).val()
        }, function (res) {
            if (res.data) {
                let data = res.data[0];
                $('#curUser').data("uid", data.uuid);
                $('#curUser').html(data.name);
            } else {
                $('#curUser').data("uid", 0);
                $('#curUser').html("<span style='color: red;'>暂未指派用户！</span>");
            }

        });
        $('#assignModal').modal("show");
    });
    $('#assignModal .btn-primary').on("click", function () {
        let rid = $('#assignModal .rid').html();
        let oldUid = $('#curUser').data("uid");
        let newUid = $('#userSel').val();
        if (oldUid == newUid) {
            swalParent("系统提示", "该用户已在处理！", "error");
            return false;
        }
        $.post(prefix + "/assign", {
            rid: rid,
            uid: newUid,
            _xsrf: $("#token", parent.document).val()
        }, function (res) {
            if (res.code === 1) {
                $('#assignModal').modal("hide");
                refresh();
                swalParent("系统提示", "订单已指派！", "success");
            } else {
                swalParent("系统提示", "订单指派失败," + res.data, "error");
            }
        });
    });
    $('#myTable').on("click", ".report", function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        $('#reportModal .rid').html(rowData.rid);
        let fileName = rowData.file;
        if (fileName) {
            $('#reportModal .btn-primary').html("更新实验报告");
            $('#fileWrap').html("<a class='download' title='点击下载' href='javascript:void(0);'>" +
                fileName + "</a>");
        } else {
            $('#reportModal .btn-primary').html("上传实验报告");
            $('#fileWrap').html("<p class='red'>暂未上传实验报告！</p>");
        }
        $('#reportModal .download').on("click", function () {
            let fileName = $('#reportModal .download').html();
            $('#downloadBtn').attr("href", "/file/report/" + fileName);
            $('#downloadBtn')[0].click();
        });
        $('#reportModal').modal("show");
    });
    $('#reportModal .btn-primary').on("click", function () {
        report();
    });
    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id")+"Content";
        let val = $(this).val();
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });
    initData();
});

function initData() {
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
                $('#userSel2').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let name = item.Name;
                    if(!name){
                        name = "未填写名字";
                    }
                    $('#userSel1').append('<option value="'+item.Id+'">'+name+'</option>');
                    $('#userSel2').append('<option value="'+item.Id+'">'+name+'</option>');
                }

            }else{
                $('#userWrap1').html('');
                $('#userWrap1').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
                $('#userWrap2').html('');
                $('#userWrap2').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
            }
            $('#userSel1').selectpicker('refresh');
            $('#userSel2').selectpicker('refresh');
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
                deviceList = tList;
                $('#typeSel1').html('');
                $('#typeSel2').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#typeSel1').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSel2').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('#selWrap1').html('');
                $('#selWrap1').append('<span style="color: red;display: block;margin-top: -24px">暂无设备，请先添加!</span>');
                $('#selWrap2').html('');
                $('#selWrap2').append('<span style="color: red;display: block;margin-top: -24px">暂无设备，请先添加!</span>');
            }
            $('#typeSel1').selectpicker('refresh');
            $('#typeSel2').selectpicker('refresh');
            if(tList.length>0){
                //设置实验要求
                $('#addParameterContent').val(tList[0].request);
                $('#addParameter').html(tList[0].request);
                renderTime();
            }
        }
    });
    $('#typeSel1').on('change', function(e){
        /*console.log(this.value,
            this.options[this.selectedIndex].value,
            $(this).find("option:selected").val(),);*/
        let clickIndex = this.selectedIndex;
        selectDeviceIndex = clickIndex;
        let item = deviceList[clickIndex];
        //设置实验要求
        $('#addParameterContent').val(item.request);
        $('#addParameter').html(item.request);
        renderTime();
    });
}

function add(){
    let date = $('#tab2 .clickActive').attr("date");
    let timeId = $('#tab2 .clickActive').attr("timeId");
    if(!timeId){
        swalParent("系统提示","未选择任何预约时间!","error");
        return false;
    }
    gDate = date;
    gTimeId = timeId;
    let deviceItem = deviceList[selectDeviceIndex];
    let Protocol = {};
    //Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = dateUtil.NowDate();
    Protocol.Pay = $("input[name='pay']:checked").val();
    Protocol.TestResult = $("input[name='test_result']:checked").val();
    //Protocol.City = $('.city').html();
    Protocol.DeviceId = deviceItem.id;
    Protocol.Tid = deviceItem.tid;
    Protocol.SampleName = $('#addTable').find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#addTable').find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#addTable').find("input[name='sample_code']").val().trim();
    Protocol.DetectionReport = $('#addTable').find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#addTable').find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#addTable').find("input[name='about']").val().trim();
    Protocol.Parameter = $("#addParameterContent").val();
    Protocol.Other = $("#addAboutContent").val();
    Protocol.Result = $("#addResultContent").val();
    Protocol.Remark1 = $('#addRemark1Content').val();
    Protocol.Remark2 = $('#addRemark2Content').val();
    Protocol.Remark3 = $('#addRemark3Content').val();

    let formData = {};
    formData["tid"] = deviceItem.tid;
    formData["deviceId"] = deviceItem.id;
    gDeviceId = deviceItem.id;
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["protocol"] = JSON.stringify(Protocol);
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
            if (r.code===1) {
                type = "success";
                renderTime();
                reset();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2);
        }
    });
}

function editInfo(rid) {
    loadingParent(true,2);
    $.post(prefix+"/info?rid="+rid,{_xsrf: $("#token", parent.document).val()},function (res) {
        loadingParent(false,2);
        if(res.code===1){
            let data = res.data;
            let reservation = data.reservation;
            //设置type选中
            $('#typeSel2').selectpicker('val',reservation.device_id);
            $("#typeSel2").selectpicker('refresh');
            $('.hasSelect').html(reservation.date+" "+reservation.timeVal);
            //熏染时间选择
            renderTime(reservation.device_id);
            setTimeout(function () {
                //熏染选中
                renderDateSelect(reservation.device_id,reservation.date,reservation.time_id);
            },300);

            //处理协议
            let protocol = data.protocol;
            //清空选中
            $("input[type=radio]").attr("checked",false);
            $('#editTable').find("input[value='"+protocol.TestResult+"']").attr('checked',true);
            $('#editTable').find("input[value='"+protocol.Pay+"']").attr('checked',true);
            $('#editTable').find("input[value='"+protocol.DetectionReport+"']").attr('checked',true);
            $('#editTable').find("input[value='"+protocol.SampleProcessing+"']").attr('checked',true);
            $('#editTable').find('input[name="sample_code"]').val(protocol.SampleCode);
            $('#tab4').find('input[name="sample_name"]').val(protocol.SampleName);
            $('#tab4').find('input[name="sample_count"]').val(protocol.SampleCount);
            $('#tab4').find('input[name="about"]').val(protocol.About);
            $('#editParameterContent').val(protocol.Parameter);
            $('#editParameter').html(protocol.Parameter);
            $('#editAboutContent').val(protocol.Other);
            $('#editAbout').html(protocol.Other);
            $('#editResultContent').val(protocol.Result);
            $('#editResult').html(protocol.Result);
            $('#editRemark1Content').val(protocol.Remark1);
            $('#editRemark1').html(protocol.Remark1);
            $('#editRemark2Content').val(protocol.Remark2);
            $('#editRemark2').html(protocol.Remark2);
            $('#editRemark3Content').val(protocol.Remark3);
            $('#editRemark3').html(protocol.Remark3);
            $('.tabWrap').hide();
            $('.list').addClass("active");
            $('.edit').removeClass("active");
            $('#tab4').fadeIn(200);
        }else{
            swalParent("系统提示",res.msg,"error");
        }
    });
}

function edit(){
    let date = $('#tab4 .clickActive').attr("date");
    let timeId = $('#tab4 .clickActive').attr("timeId");
    let Protocol = {};
    //Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = dateUtil.NowDate();
    Protocol.Pay = $("input[name='pay']:checked").val();
    Protocol.TestResult = $("input[name='test_result']:checked").val();
    //Protocol.City = $('.city').html();
    Protocol.DeviceId = $('#editDeviceId').val();
    //Protocol.Tid = deviceItem.tid;
    Protocol.SampleName = $('#editTable').find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#editTable').find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#editTable').find("input[name='sample_code']").val().trim();
    Protocol.DetectionReport = $('#editTable').find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#editTable').find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#editTable').find("input[name='about']").val().trim();
    Protocol.Parameter = $("#editParameterContent").val();
    Protocol.Other = $("#editAboutContent").val();
    Protocol.Result = $("#editResultContent").val();
    Protocol.Remark1 = $('#editRemark1Content').val();
    Protocol.Remark2 = $('#editRemark2Content').val();
    Protocol.Remark3 = $('#editRemark3Content').val();
    let formData = {};
    //formData["deviceId"] = deviceItem.id;
    formData["rid"] = $('#editRid').val();
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["protocol"] = JSON.stringify(Protocol);
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
            let type = "error";
            if (r.code===1) {
                type = "success";
                $('.backBtn').click();
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

function renderTime(deviceId){
    if(!deviceId){
        if(!$('#tab2').is(":hidden")){
            deviceId = $('#typeSel1').val();
        }else{
            deviceId = $('#typeSel2').val();
        }
    }
    let wrapObj;
    let week = $('.weekWrapActive').attr("data");
    wrapObj = $('.dateTable');
    //loadingParent(true,2);
    $.post("/reservation/timeQuery",{_xsrf:$("#token", parent.document).val(),deviceId:deviceId,week:week},function (res) {
        if(res.code===1){
            //loadingParent(false,2);
            let tList = res.data;
            if(tList){
                let nowYear = new Date().getFullYear();
                wrapObj.html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let dataList = item.data;
                    dataList.sort(stringUtil.compare("tStamp"));
                    if(i===0){
                        wrapObj.append('<tr class="tr'+i+'"></tr>');
                        for(let j=0;j<dataList.length;j++){
                            let item2 = dataList[j];
                            let date = item2.date;
                            $('.tr'+i).append('<th>'+date+'</th>');
                        }
                    }else{
                        wrapObj.append('<tr class="tr'+i+'"></tr>');
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
                                    $('.tr'+i).append('<td deviceId="'+deviceId+'" date="'+date+'" timeId="'+timeId+'">-</td>');
                                }else{
                                    $('.tr'+i).append('<td deviceId="'+deviceId+'" date="'+date+'" timeId="'+timeId+'" class="click '+date+'">可预约</td>');
                                }
                            }else{
                                $('.tr'+i).append('<td >'+time+'</td>');
                            }
                        }
                    }
                }
                $('.click').on("click",function () {
                    if($(this).hasClass("clickActive")){
                        //swal("已从本地预约列表移除","需提交预约方作系统确认！","info");
                        $(this).removeClass("clickActive");
                    }else{
                        $('.clickActive').removeClass("clickActive");
                        //swal("已加入本地预约列表","需提交预约方作系统确认！","info");
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

function renderDateSelect(deviceId,date,timeId) {
    $('td').each(function () {
        let deviceId1 = $(this).attr("deviceId");
        let date1 = $(this).attr("date");
        let time1 = $(this).attr("timeid");
        if(deviceId==deviceId1&&date==date1&&timeId==time1){
            $(this).html("<span style='color:green'>✔</span>")
        }
    });
}

function reset() {
    $("#addTable input").val("");
    $("#addTable textarea").val("");
    $("#addTable .editor").html("可插入文字/图片");
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
function openRes(domId,content) {
    $('#'+domId).val(content);
    domId = domId.replace("Content","");
    $('#'+domId).html(content);
}

function openWindow(url,name,iWidth,iHeight) {
    let iTop = (window.screen.availHeight-30-iHeight)/2;
    let iLeft = (window.screen.availWidth-10-iWidth)/2;
    window.open(url,name,'height='+iHeight+',innerHeight='+iHeight+',width='+iWidth+',innerWidth='+iWidth+',top='+iTop+',left='+iLeft+',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');
}