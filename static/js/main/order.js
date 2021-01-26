let myTable;
let prefix = "/main/order";
let userInfo = parent.user();
let uType = userInfo.type;
let typeArr = [];
let type;
let request;
let typeChildArr = [];
let detectionCycle;
let deviceArr = [];
window.onresize = function () {
    let bodyHeight = window.innerHeight;
    console.log("bodyHeight:" + bodyHeight);
    //设置表格高度
    let tHeight = bodyHeight - 210;
    console.log("tHeight:" + tHeight);
    $('.dataTables_scrollBody').css("height", tHeight + "px");
};

$(document).ready(function () {
    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

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
    $('.selectpicker').selectpicker({
        noneSelectedText: '下拉选择指定项',
        noneResultsText: '无匹配选项',
        maxOptionsText: function (numAll, numGroup) {
            let arr = [];
            arr[0] = (numAll === 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
            arr[1] = (numGroup === 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
            return arr;
        },
        //liveSearch: true,
        //size:10   //设置select高度，同时显示5个值
    });
    $(".selectpicker").selectpicker('refresh');
    //父类切换监听
    $('#typeAddSel').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
        request = typeArr[clickedIndex].request;
        $('#addTable .type').html("-");
        $('#addTable .allDevice').html("-");
        let selected = $(e.currentTarget).val();
        renderChildType(selected);
    });

    //datatable setting
    myTable = $('#myTable').DataTable({
        autoWidth: true,
        "scrollY": 0,
        "scrollCollapse": "true",
        "processing": false,
        fixedHeader: true,
        serverSide: true,
        //bSort:false,//排序
        "aoColumnDefs": [{
            "bSortable": false,
            "aTargets": [0, 5, 7]
        }], //指定哪些列不排序
        "order": [[6, "desc"]], //默认排序
        "lengthMenu": [[30, 50, 100, 200, 500], [30, 50, 100, 200, 500]],
        "pageLength": 50,
        ajax: {
            url: prefix + '/list',
            type: 'POST',
            data: {
                _xsrf: $("#token", parent.document).val(),
                tid:$('#filterSelect').val()
            }
        },
        columns: [
            {
                "data": "id",
                "width": "5%",
                "render": function (data, type, row) {
                    return "<span class='tid'>" + row.id + "</span>";
                }
            },
            {
                data: 'name',
                "width": "8%",
                "render": function (data) {
                    return stringUtil.maxLength(data, 5);
                }
            },
            {
                data: 'company',
                "render": function (data) {
                    return stringUtil.maxLength(data, 6);
                }
            },
            {
                data: 'phone',
                "width": "10%",
                "render": function (data) {
                    return stringUtil.maxLength(data, 11);
                }
            },
            {
                data: 'status',
                "width": "6%",
                "render": function (data) {
                    let str;
                    if (data == "0") {
                        str = "<span style='color:orangered'>待确认</span>";
                    } else if (data == "1") {
                        str = "<span style='color:#6195FF'>已确认</span>";
                    } else if (data == "2") {
                        str = "<span style='color:grey'>已取消</span>";
                    } else {
                        str = "<span style='color:green'>已完成</span>";
                    }
                    return str;
                }
            },
            {
                data: 'remark',
                "width": "15%",
                "render": function (data) {
                    return stringUtil.maxLength(data, 20);
                }
            },
            /*{ data: 'updated',"width":"12%","render":function (data,type,row,meta) {
                    if (!data){
                        return "-";
                    }
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},*/
            {
                data: 'created',
                "width": "12%",
                "render": function (data, type, row, meta) {
                    return dateUtil.GMT2Str(data);
                }
            },
            {
                data: null,
                "render": function () {
                    let html =
                        "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a> "
                    html +=
                        "<a href='javascript:void(0);' class='up btn btn-primary btn-xs'></i>编辑</a> "
                    html +=
                        "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a> "
                    html +=
                        "<a href='javascript:void(0);'  class='protocol btn btn-success btn-xs'>协议下载</a> "
                    html +=
                        "<a href='javascript:void(0);'  class='assign btn btn-secondary btn-xs'>指派订单</a> "
                    html +=
                        "<a href='javascript:void(0);'  class='report btn btn-secondary btn-xs'>实验报告</a> "
                    return html;
                }
            }
        ],
        language: {
            url: '../../static/plugins/datatables/zh_CN.json'
        },
        "fnInitComplete": function (oSettings, json) {
            if (!json) {
                swal("系统提示", "登录超时！请刷新页面", "error");
                return false;
            }
        },
        "createdRow": function (row, data, index) { //回调函数用于格式化返回数据
            /*if(!data.name){
                $('td', row).eq(2).html("暂未填写");
            }*/
            let pageObj = myTable.page.info();
            let num = index + 1;
            num = num + pageObj.page * (pageObj.length);
            if (num < 10) {
                num = "0" + num;
            }
            $('td', row).eq(0).find(".tid").html(num);

            if (uType > 1) {
                $(row).find(".btn-danger").remove();
                $(row).find(".assign").remove();
            }

        },
        "fnPreDrawCallback": function (oSettings) {
            loadingParent(true, 2);
        },
        "drawCallback": function (settings) {
            let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
            $('.dataTables_scrollBody').css("height", window.innerHeight - 270 + "px");
            $('#myTable_filter').find('input').attr("placeholder", "请输入名称、手机号或订单号");
            parent.checkType();
            loadingParent(false, 2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background", "blue");

    let rowData;
    $('#myTable').on("click", ".btn-default", function (e) { //查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.rid').html(stringUtil.maxLength(rowData.rid));
        $('#detailModal').find('.name').html(stringUtil.maxLength(rowData.name));
        $('#detailModal').find('.company').html(stringUtil.maxLength(rowData.company));
        $('#detailModal').find('.phone').html(stringUtil.maxLength(rowData.phone));
        let str;
        let status = rowData.status;
        if (status == "0") {
            str = "<span style='color:orangered'>待确认</span>";
        } else if (status == "1") {
            str = "<span style='color:#6195FF'>已确认</span>";
        } else if (status == "2") {
            str = "<span style='color:red'>已取消</span>";
        } else {
            str = "<span style='color:var(--thm-green)'>已完成</span>";
        }
        $('#detailModal').find('.status').html(str);
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));
        let updated = rowData.updated;
        $('#detail_updated').html(dateUtil.GMT2Str(updated));
        let rid = rowData.rid;
        detail(rid);
    });
    $('#myTable').on("click", ".btn-primary", function (e) { //编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#editForm').find("input[name='id']").val(rowData.id);
        $('#editForm').find(".rid").html(rowData.rid);
        let status = rowData.status;
        $('#status').selectpicker('val', rowData.status);
        $("#status").selectpicker('refresh');
        if (status == 2 || status == 3) {
            $("#status").parent().find("button").attr("disabled", "true");
            $('#editBtn').hide();
        } else {
            $("#status").parent().find("button").removeAttr("disabled");
            $('#editBtn').show();
        }

        $('#editForm').find("textarea[name='remark']").val(rowData.remark);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click", ".btn-danger", function (e) { //删除
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
            cancelButtonText: '取消'
        }, function () {
            del(rid);
        });

    });
    $('#myTable').on("click", ".protocol", function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        /*$('#protocolModal .rid').html(rowData.rid);
        $('#protocolModal').modal("show");*/
        $('.wat').remove();
        $('.protocolTable').show(200);
        $("#more").attr("src", "../../static/img/square_down.png");
        $("#more").attr("title", "隐藏协议");
        protocolDetail(rowData.rid);
    });
    $('#protocolModal .btn-primary').on("click", function () {
        protocolDetail();
    });
    $('#pdfBtn').on("click", function () {
        //imgUtil.addWatermark("protocolInfo","中科科辅");
        imgUtil.domShot("protocolInfo", imgUtil.pagePdf, "中科科辅服务协议/" + dateUtil.nowTime());
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
        }, 500)

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
    $('#addTable .editor').on("click",function () {
        let id = $(this).attr("id")+"Content";
        let val = $(this).val();
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });

    setTimeout(function () {
        initData();
    },100);


});

function initData() {
    //初始化父类分组过滤数据
    $.post("/main/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            let tList = res.data;
            typeArr = tList;
            if(tList){
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#filterSelect').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeAddSel').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
                request = typeArr[0].request;
                $('#addParameter').html(request);
                $('#addParameterContent').val(request);
            }
            $('#filterSelect').selectpicker('refresh');
            $('#typeAddSel').selectpicker('refresh');
            let tid = $('#typeAddSel').val();
            renderChildType(tid);
        }
    });
    //初始化用户信息
    $.post("/main/user/customer",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            //loading(false,2);
            let tList = res.data;
            if(tList){
                $('#userAddSel').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let name = item.Name;
                    if(!name){
                        name = "未填写名字";
                    }
                    $('#userAddSel').append('<option value="'+item.Id+'">'+name+'</option>');
                }
            }else{
                $('#userWrap').html('');
                $('#userWrap').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
            }
            $('#userAddSel').selectpicker('refresh');
        }
    });
    //初始化被指派任务用户
    $.post("/main/user/assign", {_xsrf: $("#token", parent.document).val()}, function (res) {
        let tList = res.data;
        if (tList) {
            $('#userSel').html('');
            for (let i = 0; i < tList.length; i++) {
                let item = tList[i];
                let nameTemp = item.Name;
                if(!nameTemp){
                    nameTemp = "未填写名字";
                }
                $('#userSel').append('<option value="' + item.Id + '">' + nameTemp + '</option>');
            }
        } else {
            $('#userSelWrap').html('');
            $('#userSelWrap').append(
                '<span style="color: red;display: block;margin-top: 5px">暂无用户，请先添加!</span>');
        }
        $('#userSel').selectpicker('refresh');
    })
}

function detail(rid) {
    loadingParent(true, 2);
    $.post(prefix + "/detail", {
        rid: rid,
        _xsrf: $("#token", parent.document).val()
    }, function (res) {
        loadingParent(false, 2);
        let localOutArr = res.data;
        if(!localOutArr){
            swalParent("系统提示","当前订单包含项目已被删除！","error");
            return false;
        }
        $('.libItemWrap').html("");
        for (let i = 0; i < localOutArr.length; i++) {
            let outItem = localOutArr[i];
            let tid = outItem.tid;
            let typeName = outItem.name;
            if(!typeName){
                $('.libItemWrap').append('<p class="red">当前订单包含分组已被删除！</p>')
                continue;
            }
            let innerArr = outItem.data;
            $('.libItemWrap').append('' +
                '<div class="typeItem">\n' +
                '   <div class="typeName">' + typeName + '</div>\n' +
                '   \n' +
                '<div class="dWrap' + tid + '"></div>' +
                '</div>');
            if(!innerArr){
                $('.dWrap' + tid).append('<p class="red">当前订单包含项目已被删除！</p>');
                continue;
            }
            for (let j = 0; j < innerArr.length; j++) {
                let dName = innerArr[j].name;
                let title = dName;
                dName = stringUtil.maxLength(dName, 20);
                let dId = innerArr[j].id;
                let count = innerArr[j].count;
                $('.dWrap' + tid).append('<div class="dItem">\n<input type="hidden" value="' + dId +
                    '" class="id">\n<i class="fa fa-files-o" aria-hidden="true"></i>\n<span class="dName" title="' +
                    title + '">' + dName + '</span>\n<div class="countWrap" my-data="' + typeName +
                    '" my-id="' + dId + '">  <span class="count">x' + count +
                    '</span>  </div>\n</div>');
            }
        }

        $('#detailModal').modal("show");
    });
}

function add() {
    let ids = $('#addTable .allDevice').attr("deviceIds");
    if(!ids){
        swalParent("系统提示","未选择任何实验项目!","error");
        return;
    }
    let item = {};
    let Protocol = {};
    //Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = dateUtil.NowDate;
    //Protocol.Pay = $("input[name='pay']:checked").val();
    //Protocol.TestResult = $("input[name='test_result']:checked").val();
    //Protocol.City = $('.city').html();
    Protocol.SampleName = $('#addTable').find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#addTable').find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#addTable').find("input[name='sample_code']").val().trim();
    Protocol.DetectionCycle = $('#addTable').find('.detection_cycle').html();
    Protocol.DetectionReport = $('#addTable').find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#addTable').find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#addTable').find("input[name='about']").val().trim();
    Protocol.Parameter = $('#addParameterContent').val();
    Protocol.Other = $("#addAboutContent").val();
    Protocol.Result = $("#addResultContent").val();
    //Protocol.Tid = $('#typeAddSel').val();
    //Protocol.DeviceId = ids;
    Protocol.Uid = parseInt($('#userAddSel').val());
    let dataArr = [];
    item.Protocol = Protocol;
    item.Tid = $('#typeAddSel').val();
    item.Count = 4;
    let DeviceArr = [];
    $('#addTable .device').each(function () {
        let item = {};
        item.DeviceId = $(this).attr("data-id");
        item.Count = 1;
        item.Name = $(this).html();
        DeviceArr.push(item);
    });
    item.Count = DeviceArr.length;
    item.Data = DeviceArr;
    dataArr.push(item);
    //let formData = formUtil('addForm');
    let formData = {};
    formData["data"] = JSON.stringify(dataArr);
    formData["_xsrf"] = $("#token", parent.document).val();
    $.ajax({
        url: prefix + "/add",
        type: "POST",
        dataType: "json",
        cache: false,
        data: formData,
        beforeSend: function () {
            loadingParent(true, 2);
        },
        success: function (r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                $('#deviceAddSel').selectpicker('val',['noneSelectedText'])//回到初始状态
                $("#deviceAddSel").selectpicker('refresh');
                reset();
            }
            swalParent("系统提示", r.msg, type);
        },
        complete: function () {
            loadingParent(false, 2);
        }
    });
}

function edit() {

    let remark = $('#editForm').find("textarea[name='remark']").val().trim();
    //let formData = formUtil('addForm');
    let formData = {};
    formData["id"] = $('#editForm').find("input[name='id']").val();
    formData["status"] = $('#status').val();
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["remark"] = remark;
    $.ajax({
        url: prefix + "/update",
        type: "POST",
        dataType: "json",
        cache: false,
        data: formData,
        beforeSend: function () {
            loadingParent(true, 2);
        },
        success: function (r) {
            $('#editModal').modal("hide");
            let type = "error";
            if (r.code == 1) {
                type = "success";
                refresh();
            }
            swalParent("系统提示", r.msg, type);
        },
        complete: function () {
            loadingParent(false, 2);
        }
    });
}

function del(rid) {
    $.ajax({
        url: prefix + "/delete4soft",
        type: "POST",
        dataType: "json",
        cache: false,
        data: {
            _xsrf: $("#token", parent.document).val(),
            rid: rid
        },
        beforeSend: function () {
            loadingParent(true, 2);
        },
        success: function (r) {
            if (r.code == 1) {
                swalParent("系统提示", r.msg, "success");
                refresh();
            } else {
                swalParent("系统提示", r.msg, "error");
            }
        },
        complete: function () {
            loadingParent(false, 2);
        }
    })
}

function protocolDetail(rid) {
    $.ajax({
        url: prefix + "/protocol",
        type: "POST",
        dataType: "json",
        cache: false,
        data: {
            _xsrf: $("#token", parent.document).val(),
            rid: rid
        },
        beforeSend: function () {
            loadingParent(true, 2);
        },
        success: function (r) {
            let user = r.data.user;
            let protocol = r.data.protocol;
            $('#tab3 .company').html(user.Company);
            $('#tab3 .invoice').html(user.Invoice);
            $('#tab3 .invoice_code').html(user.InvoiceCode);
            $('#tab3 .name').html(user.Name);
            $('#tab3 .phone').html(user.Phone);
            $('#tab3 .email').html(user.Email);
            $('#tab3 .address').html(user.Address);
            $('#tab3 .teacher').html(user.Teacher);
            $('#tab3 .teacher_phone').html(user.TeacherPhone);
            $('#tab3 .teacher_mail').html(user.TeacherMail);
            $('#tab3 .myCompany').html(r.data.company);
            $('#tab3 .myCompanyPhone').html(r.data.phone);
            $('#tab3 .home').html(r.data.home);
            $('#tab3 .myEmail').html(r.data.email);
            $('#tab3 .myWechat').html(r.data.wechat);
            $('#tab3 .myAddress').html(r.data.address);
            $('#tab3 .myEmail').html(r.data.email);
            $("input[value='" + protocol.Pay + "']").attr('checked', true);
            $("input[value='" + protocol.TestResult + "']").attr('checked', true);
            $('#tab3 .date').html(protocol.Date);
            $('#tab3 .sign').html("<img src='" + protocol.Sign + "'>");
            $('#tab3 .city').html(r.data.city);
            $('#tab3 .mySign').html(r.data.sign);
            $('#tableWrap').html("");
            let devices = "";
            let innerArr = r.data.deviceArr;
            if(!r.data.type.Name){
                if(!innerArr){
                    swalParent("系统提示","当前订单包含分组已被删除！","error");
                    return false;
                }
            }
            if(!innerArr){
                swalParent("系统提示","当前订单包含项目已被删除！","error");
                return false;
            }
            for (let j = 0; j < innerArr.length; j++) {
                let item = innerArr[j];
                let count = item.Count;
                let name = item.Name;
                devices += "<i class=\"fa fa-files-o\" aria-hidden=\"true\"></i> " + name + "*" +
                    count + "<br/>";
            }

            $('#tableWrap').append('' +
                '<table>\n' +
                '<tr style="height: 35px!important;line-height: 35px;">\n' +
                '   <td class="btbg font-center titfont" colspan="6">\n技术服务要求\n</td>\n' +
                '</tr>' +
                '<tr style="color: #6195ff;font-size: 20px;">\n' +
                '   <td class="tabtxt2" style="width: 7%;">所属分类</td>\n' +
                '   <td colspan="4" class="type">' + r.data.type.Name + '</td>\n' +
                '   <td class="typeMore"></td>\n' +
                '</tr>\n' +
                '<tr >\n' +
                '   <td class="tabtxt2">已选项目</td>\n' +
                '  <td colspan="5" height="75" class="allDevice">' + devices + '</td>\n' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">检测周期</td>\n                                    ' +
                '   <td colspan="5" class="detection_cycle">' + protocol.DetectionCycle +
                '</td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">检测报告</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <input type="radio" value="无需检测报告（默认）" name="detection_report"/> 无需检测报告（默认）\n                                        ' +
                '       <input type="radio" value="中文检测报告（加收200元）" name="detection_report"/> 中文检测报告（加收200元）\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">样品编号</td>\n                                    ' +
                '   <div colspan="5">\n                                        ' +
                '       <div>' + protocol.SampleCode + '"</div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">样品名称</td>\n                                    ' +
                '   <td colspan="2">\n                                        ' +
                '       <div>' + protocol.SampleName + '</div>\n   ' +
                '   </td>\n                                    ' +
                '   <td class="tabtxt2" style="text-align: right;padding-right: 15px;">样品数量</td>\n                                    ' +
                '   <td colspan="2">\n                                        ' +
                '       <div>' + protocol.SampleCount + '</div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">样品处理</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <input type="radio" value="一般样品回收（50元）" name="sample_processing"/> 一般样品回收（50元）\n                                        ' +
                '       <input type="radio" value="样品不回收" name="sample_processing"/> 样品不回收\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td class="tabtxt2">关于样品</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <div>' + protocol.About + '</div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td height="175" class="tabtxt2">实验参数要求</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <textarea class="form-control" id="parameterContent" name="parameter" ></textarea>\n                                        ' +
                '       <div class="editor parameter" id="parameter"></div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td height="175" class="tabtxt2">其他特殊要求</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <textarea class="form-control" id="aboutContent" name="about" placeholder="可插入文字图片"></textarea>\n                                        ' +
                '       <div class="editor other" id="other"></div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                                ' +
                '<tr>\n                                    ' +
                '   <td height="175" class="tabtxt2">参考结果图片</td>\n                                    ' +
                '   <td colspan="5">\n                                        ' +
                '       <textarea class="form-control" id="resultContent" name="result" placeholder="可插入文字图片"></textarea>\n                                        ' +
                '       <div class="editor result" id="result"></div>\n                                    ' +
                '   </td>\n                                ' +
                '</tr>\n                            ' +
                '</table>');
            $("input[value='" + protocol.DetectionReport + "']").attr('checked', true);
            $("input[value='" + protocol.SampleProcessing + "']").attr('checked', true);
            $('#tab3 .parameter').html(protocol.Parameter);
            $('#tab3 .other').html(protocol.Other);
            $('#tab3 .result').html(protocol.Result);
            $('input').attr("disabled", "true");
            setTimeout(function () {
                imgUtil.addWatermark("protocolInfo", "中科科辅");
            }, 500)
            $('#tab1').hide();
            $('#tab3').show();
            $('#tabHref01').addClass("active");
        },
        complete: function () {
            loadingParent(false, 2);
        }
    })
}

function renderChildType(tid) {
    if(!tid){
        return
    }
    //初始化子类分组数据
    $.post("/main/typeChild/queryByTid",{_xsrf:$("#token",parent.document).val(),tid:tid},function (res) {
        if(res.code===1){
            let tList = res.data;
            $('#typeChiAddSelWrap').html('');
            if(tList){
                typeChildArr = tList;
                $('#typeChiAddSelWrap').html('<select id="typeChiAddSel" class="selectpicker" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#typeChiAddSel').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
                detectionCycle = tList[0].detection_cycle;
            }else{
                $('#typeChiAddSelWrap').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
            }
            $('#typeChiAddSel').selectpicker('refresh');
            //子类切换监听
            $('#typeChiAddSel').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                detectionCycle = typeChildArr[clickedIndex].detection_cycle;
                $('#addTable .type').html("-");
                $('#addTable .allDevice').html("-");
                renderDevice();
            });
            renderDevice();
        }
    });

}

function renderDevice(){
    let typeId = $('#typeAddSel').val();
    let ttid = $('#typeChiAddSel').val();

    $.post("/type/device",{_xsrf:$("#token", parent.document).val(),typeId:typeId,ttid:ttid},function (res) {
        if(res.data){
            $('#deviceAddSelWrap').html("");
            $('#addTable .type').html('-');
            $('#addTable .allDevice').html('-');
            let arr = res.data;
            deviceArr = arr;
            $('#deviceAddSelWrap').html('<select multiple id="deviceAddSel" class="selectpicker" data-size="10" data-max-options="50" data-live-search="true" data-style="btn-default"></select>');
            for(let i=0;i<arr.length;i++){
                let item = arr[i];
                let name = item.name;
                $('#deviceAddSel').append('<option deviceName="'+name+'" value="'+item.id+'">'+name+'</option>');
            }
            $('.selectpicker').selectpicker({
                noneSelectedText: '下拉多选项目',
                noneResultsText: '无匹配选项',
                maxOptionsText: function (numAll, numGroup) {
                    let arr = [];
                    arr[0] = (numAll === 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
                    arr[1] = (numGroup === 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
                    return arr;
                },
                //liveSearch: true,
                //size:10   //设置select高度，同时显示5个值
            });
            $('#deviceAddSel').selectpicker('refresh');
            //设备切换监听
            $('#deviceAddSel').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                $('#addTable .allDevice').html("");
                $('#addTable .type').html($('#typeAddSel').find("option:selected").text()/*+'&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;服务周期:7个工作日'*/);
                let options = $("#deviceAddSel option:selected");
                for(let i=0;i<options.length;i++){
                    let item = options[i];
                    $('#addTable .allDevice').append('<i class="fa fa-files-o" aria-hidden="true"></i>&nbsp;<span class="device" data-id="'+$(item).val()+'">'+item.innerHTML+'</span><br>');
                }
                let val1 = $('#deviceAddSel').val();
                let tArr = "";
                $.each(val1,function (i,item) {
                    tArr = tArr+","+item;
                });
                tArr = tArr.substring(1,tArr.length);
                $('#addTable .allDevice').attr("deviceIds",tArr);
                if(!tArr){
                    $('#addTable .allDevice').html("-");
                }
            });
        }else{
            $('#deviceAddSelWrap').html("<span style=\"color: red;display: block;margin-top: 5px\">暂无数据，请先添加!</span>");
        }
    });

}

function report() {
    let files = $('#reportModal').find("input[name='file']").prop('files');
    if (files.length === 0) {
        swal("系统提示", "请选择上传文件!", "error");
        return
    }
    let file = files[0];
    let size = file.size;
    if (size > 20971520) {
        swal("系统提示", "文件大小不能超过20MB!", "error");
        return
    }
    let formData = new FormData();
    formData.append('rid', $('#reportModal .rid').html());
    formData.append('file', files[0]);
    formData.append("_xsrf", $("#token", parent.document).val());
    $.ajax({
        url: prefix + "/report",
        type: "POST",
        cache: false,
        processData: false,
        contentType: false,
        data: formData,
        beforeSend: function () {
            loadingParent(true, 2)
        },
        success: function (r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                reset();
            }
            refresh();
            $('#reportModal').modal("hide");
            swalParent("系统提示", r.msg, type);
        },
        complete: function () {
            loadingParent(false, 2)
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
    let tid = $('#filterSelect').val();
    if(!tid){
        tid = 0;
    }
    let param = {
        "_xsrf":$("#token", parent.document).val(),
        "tid": tid
    };
    myTable.settings()[0].ajax.data = param;
    myTable.ajax.reload(null, false); // 刷新表格数据，分页信息不会重置
}

function loading(flag, type) {
    window.parent.loading(flag, type);
}
window.onresize = function () {
    let height = window.innerHeight - 200;
    $('.dataTables_scrollBody').css("height", height + "px");
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