let myTable;
let prefix = "/main/order";
let userInfo = parent.user();
let uType = parseInt(userInfo.type);
let uRole = parseInt(userInfo.role);
let typeArr = [];
let type;
let request;
let typeChildArr = [];
let detectionCycle;
let allTypeMap = {};
let deviceMap = {};
let allDeviceMap = {};
$(document).ready(function () {
    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

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
            $('input[name=pay]:eq(1)').prop("checked",true);
            $('input[name=test_result]:eq(0)').prop("checked",true);
            $('input[name=detection_report]:eq(0)').prop("checked",true);
            $('input[name=sample_processing]:eq(0)').prop("checked",true);
            $('input[type=text]').val();
            $('textarea').val("");
            $('.editor').html("可插入文字/图片");
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");

        if(data==="tab1"){
            refresh();
        }

        $('.tabWrap').fadeOut(200);
        $("#"+data).fadeIn(200);
    });

    // 中文重写select 查询为空提示信息
    $('.selectpicker').selectpicker({
        noneSelectedText: '下拉选择',
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
        let item = typeArr[clickedIndex];
        if(!item){
            return
        }
        request = typeArr[clickedIndex].request;
        $('#addTable .type').html("-");
        $('#addTable .allDevice').html("-");
        let selected = $(e.currentTarget).val();
        renderChildType(selected);
    });

    //更多操作事件监听
    $(document).on("click",function () {
        $('.myDropdown').find("i").addClass("fa-angle-left");
        $('.myDropdown').find("i").removeClass("fa-angle-down");
        $('.dropdownWrap').hide(200);
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
            "aTargets": [0,6]
        }], //指定哪些列不排序
        "order": [[5, "desc"]], //默认排序
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
                    return stringUtil.maxLength(data, 10);
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
                "width": "10%",
                "render": function (data, type, row) {
                    let status = parseInt(row.status);
                    let msg = row.msg;
                    return renderStatus(status,msg).statusDom;
                }
            },
            {
                data: 'created',
                "width": "15%",
                "render": function (data, type, row, meta) {
                    return dateUtil.GMT2Str(data);
                }
            },
            {
                data: null,
                "render": function () {
                    let html =
                        "<a href='javascript:void(0);'  class='detail btn btn-default btn-xs'>查看</a> "
                    html +=
                        "<a href='javascript:void(0);' class='edit btn btn-primary btn-xs'></i>编辑</a> "
                    html +=
                        "<a href='javascript:void(0);' class='del btn btn-danger btn-xs'>删除</a> "
                    html += "<a class='btn btn-secondary btn-xs myDropdown'>更多操作&nbsp;&nbsp;<i class='fa fa-angle-left' aria-hidden='true'></i></a>"
                    html += "<div class='dropdownWrap'>" +
                                "<button class='dropdownItem protocol btn btn-secondary btn-xs'>实验要求</button>" +
                                "<button class='dropdownItem assign btn btn-secondary btn-xs'>任务管理</button>" +
                                "<button class='dropdownItem report btn btn-secondary btn-xs'>实验报告</button>" +
                                "<button class='dropdownItem evaluate btn btn-secondary btn-xs'>服务评价</button>" +
                            "</div>";
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
            let status = parseInt(data.status);
            let msg = data.msg;
            let statusArr = renderStatus(status,msg).statusArr;
            if(status!==statusArr.length-1){
                $(row).find(".evaluate").remove();
                $(row).find(".report").remove();
            }
            let pageObj = myTable.page.info();
            let num = index + 1;
            num = num + pageObj.page * (pageObj.length);
            if (num < 10) {
                num = "0" + num;
            }
            $('td', row).eq(0).find(".tid").html(num);

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
            //更多操作
            $('.myDropdown').on("click",function (event) {
                if($(this).find("i").hasClass("fa-angle-left")){
                    $('.myDropdown').find("i").addClass("fa-angle-left");
                    $('.myDropdown').find("i").removeClass("fa-angle-down");
                    $('.dropdownWrap').hide(200);
                    //设置显示
                    $(this).find("i").removeClass("fa-angle-left");
                    $(this).find("i").addClass("fa-angle-down");
                    let top = $(this).offset().top+24;
                    let left = $(this).offset().left+1;
                    $(this).parent().find(".dropdownWrap").css({
                        top:top,
                        left:left
                    })
                    $(this).parent().find(".dropdownWrap").show(200);
                }else{
                    $(this).find("i").addClass("fa-angle-left");
                    $(this).find("i").removeClass("fa-angle-down");
                    $(this).parent().find(".dropdownWrap").css({display:"none"})
                }
                event.stopPropagation();    //  阻止事件冒泡
            });
            $('.dataTables_scrollBody').scroll(function () {
                $('.myDropdown').find("i").addClass("fa-angle-left");
                $('.myDropdown').find("i").removeClass("fa-angle-down");
                $('.dropdownWrap').hide();
            });
            parent.checkType();
            loadingParent(false, 2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background", "blue");

    let rowData;
    $('#myTable').on("click", ".detail", function (e) { //查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.rid').html(stringUtil.maxLength(rowData.rid));
        $('#detailModal').find('.name').html(stringUtil.maxLength(rowData.name));
        $('#detailModal').find('.company').html(stringUtil.maxLength(rowData.company));
        $('#detailModal').find('.phone').html(stringUtil.maxLength(rowData.phone));

        let status = rowData.status;
        let msg = rowData.msg;
        $('#detailModal').find('.status').html(renderStatus(status,msg).statusTxt);
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));
        let updated = rowData.updated;
        $('#detail_updated').html(dateUtil.GMT2Str(updated));
        let rid = rowData.rid;
        detail(rid);
    });
    $('#myTable').on("click", ".edit", function (e) { //编辑
        rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        $('#editRid').val(rid);
        editInfo(rid);
    });
    $('#myTable').on("click", ".btn-danger", function (e) { //删除
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        let rid = rowData.rid;
        window.parent.confirmAlert("确定删除吗？","与当前相关的数据将全部被删除！",del,rid);

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
    $('#protocolModal .btn-primary').on("click", function () {
        protocolDetail();
    });
    $('#pdfBtn').on("click", function () {
        //imgUtil.addWatermark("protocolInfo","中科科辅");
        swalParent("系统提示","已开始生成PDF，请稍等...","success");
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

    //任务管理-------------------------------------------------开始
    $('#myTable').on("click", ".assign", function (e) {
        loadingParent(true,2);
        rowData = myTable.row($(this).closest('tr')).data();
        $('#assignModal .rid').html(rowData.rid);
        $('#assignModal .created').html(dateUtil.GMT2Str(rowData.created));
        $('#assignModal .btn').hide();
        $('#assignModal .btn-default').show();
        $('#assignModal .statementsWrap').hide();//对账单
        $('.assignSel').attr("disabled","true");
        $('#assignModal .showWrap i').removeClass("fa-angle-down");
        $('#assignModal .showWrap i').addClass("fa-angle-left");
        $('#assignModal .showWrap i').attr("title","显示更多");

        $.post("/main/assign/list", {
            rid: rowData.rid,
            tid:rowData.tid,
            uid:rowData.uid,
            _xsrf: $("#token", parent.document).val()
        }, function (res) {
            loadingParent(false,2);
            let assignInfo = res.data.aData;
            let status = parseInt(assignInfo.status);
            //显示或隐藏指派下拉
            if(status===0){
                $('.assignSel').parent().parent().show();
            }else{
                $('.assignSel').parent().parent().hide();
            }
            let msg = assignInfo.msg;
            $('#assignModal .msg').val(msg);
            $('#assignModal .status').val(status);
            $('#step').val(assignInfo.step);
            $('#customerId').val(rowData.uid);
            let statusItem = renderStatus(status,msg);

            let curItem = res.data.curItem;
            let lastItem = res.data.lastItem;
            //显示指派任务
            if(status===0){
                $('#assignModal .assignSel').parent().parent().show();
                $('#assignModal .showWrap i').removeClass("fa-angle-left");
                $('#assignModal .showWrap i').addClass("fa-angle-down");
                $('#assignModal .showWrap i').attr("title","隐藏更多");
                $('.assignSel').removeAttr("disabled");
                $('#assignModal .submit').show();
            }
            let statusArr = statusItem.statusArr;
            let sIndex = -1;
            if(statusIndex(statusArr,"结算中")){
                sIndex = statusIndex(statusArr,"结算中");
            }
            if(statusIndex(statusArr,"协商处理中")){
                sIndex = statusIndex(statusArr,"协商处理中");
            }

            //显示取消订单
            if(uRole===3&&status!==statusArr.length-1){
                $('#assignModal .cancel').show();
            }
            //显示发送对账单
            if(sIndex===status&&uRole===3&&curItem.Step!==0){
                $('#assignModal .statement').show();
            }

            //显示确认任务
            if(lastItem&&parseInt(lastItem.Status)===2){//当上一步完成时下一步才可确认,用户未确认时不可结算
                if(curItem&&parseInt(curItem.Status)===0&&uRole>3&&uRole===curItem.Role){
                    $('#assignModal .confirmTask').show();
                }
            }
            //显示完成任务
            if(curItem&&parseInt(curItem.Status)===1&&uRole===curItem.Role&&uRole!==7){
                $('#assignModal .completeTask').show();
            }
            //显示完成订单
            if(status===statusArr.length-2){
                $('#assignModal .complete').show();
            }

            //控制显示对账单
            if(status>=sIndex){
                $('#assignModal .statementsWrap').show();
            }

            $('#curStatus').html(statusItem.allTxt);
            $('#curUser').data("uid", assignInfo.uid);
            $('#curUser').html(assignInfo.name);
            //渲染用户
            $('#uWrap').html("");
            let bArr = res.data.bArr;
            for(let k=0;k<bArr.length;k++){
                let item = bArr[k];
                if(!item){
                    continue
                }
                let uArr = item.uArr;
                let assignUid = item.assignUid;
                if (uArr){
                    $('#userSel'+k).html('');
                    $('#userSel'+k).append('<option value="" selected>下拉选择用户</option>');
                    for (let i = 0; i < uArr.length; i++) {
                        let item = uArr[i];
                        let nameTemp = item.Name;
                        if(!nameTemp){
                            nameTemp = "未填写名字";
                        }
                        $('#userSel'+k).append('<option value="' + item.Id + '">' + nameTemp + '</option>');
                    }
                    if(assignUid){
                        $("#userSel"+k).selectpicker("val",assignUid);
                    }
                    $("#userSel"+k).selectpicker('refresh');
                }
            }
            //渲染对账单
            let cInfo = res.data.cInfo;
            let uInfo = res.data.uInfo;
            let dList = res.data.itemList;
            $('#assignModal .statementsWrap').html("");
            if(cInfo){
                let itemStr = "";
                let allPrice = 0;
                for(let i=0;i<dList.length;i++){
                    let index = i+1;
                    let item = dList[i];
                    let name = stringUtil.maxLength(item.name,15);
                    let price = parseInt(item.price);
                    let version = stringUtil.maxLength(item.version,7);
                    let count = parseInt(item.count);
                    let remark = stringUtil.maxLength(item.remark,8);
                    allPrice = allPrice+(count*price);
                    let all = count*price;
                    itemStr += '<tr class="text-center">\n' +
                        '         <td>'+index+'</td>\n' +
                        '         <td>'+name+'</td>\n' +
                        '         <td>'+version+'</td>\n' +
                        '         <td>'+count+'</td>\n' +
                        '         <td>'+price+'</td>\n' +
                        '         <td>'+all+'</td>\n' +
                        '         <td>'+remark+'</td>\n' +
                        '      </tr>';
                }
                let allPriceTxt = stringUtil.toZhDigit(allPrice);
                $('#assignModal .statementsWrap').html('' +
                    '<table class="infoTable">\n' +
                    '   <tr class="text-center">\n' +
                    '       <td colspan="7"><h3>测试服务明细单</h3></td>\n' +
                    '   </tr>\n' +
                    '   <tr>\n' +
                    '       <td class="text-center" colspan="7">付款通知</td>\n' +
                    '   </tr>\n' +
                    '   <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4" style="text-align: left"><span class="title">订单编号：</span><span class="rid">'+rowData.rid+'</span></td>\n' +
                    '       <td colspan="4" style="text-align: left"><span class="title">创建时间：</span><span>'+dateUtil.GMT2Str(rowData.created)+'</span></td>\n' +
                    '   </tr>\n' +
                    '   <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4"><span class="title">委托方(付款单位)：</span><span>'+uInfo.Company+'</span></td>\n' +
                    '       <td colspan="4"><span class="title">服务方(收款单位)：</span><span>'+cInfo.support+'</span></td>\n' +
                    '   </tr>\n' +
                    '   <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4"><span class="title">地址：</span><span>'+uInfo.Address+'</span></td>\n' +
                    '       <td colspan="4"><span class="title">地址：</span><span>'+cInfo.address+'</span></td>\n' +
                    '    </tr>\n' +
                    '    <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4"><span class="title">纳税人识别号：</span><span>'+uInfo.InvoiceCode+'</span></td>\n' +
                    '       <td colspan="4"><span class="title">开户银行：</span><span>'+cInfo.bank+'</span></td>\n' +
                    '    </tr>\n' +
                    '    <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4"><span class="title">联系人：</span><span>'+uInfo.Name+'</span></td>\n' +
                    '       <td colspan="4"><span class="title">账户：</span><span>'+cInfo.account+'</span></td>\n' +
                    '    </tr>\n' +
                    '    <tr class="text-left">\n' +
                    '       <td class="tdLeft" colspan="4"><span class="title">电话：</span><span>'+uInfo.Phone+'</span></td>\n' +
                    '       <td colspan="4"><span class="title">纳税人识别号：</span><span>'+cInfo.identification+'</span></td>\n' +
                    '     </tr>\n' +
                    '     <tr class="text-left">\n' +
                    '        <td class="tdLeft" colspan="4"><span class="title">电子邮箱：</span><span>'+uInfo.Email+'</span></td>\n' +
                    '        <td colspan="4"><span class="title">联系人：</span><span>'+cInfo.contact+'</span></td>\n' +
                    '     </tr>\n' +
                    '  </table>\n' +
                    '  <table class="itemTable" border="1">\n' +
                    '     <tr class="text-center head">\n' +
                    '         <td>序号</td>\n' +
                    '         <td>实验内容</td>\n' +
                    '         <td>设备型号</td>\n' +
                    '         <td>数量(个)</td>\n' +
                    '         <td>单价(元)</td>\n' +
                    '         <td>总额(元)</td>\n' +
                    '         <td>备注</td>\n' +
                    '     </tr>\n' +itemStr+
                    '      <tr style="font-size: 22px;height: 45px;" class="text-center">\n' +
                    '          <td colspan="7"><span class="title">账单总额:</span>'+allPrice+'元&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="title">中文大写:</span>'+allPriceTxt+'圆整</td>\n' +
                    '      </tr>\n' +
                    '  </table>\n' +
                    '  <div class="foot">\n<span>制表:'+cInfo.step1+'</span>\n<span>复核:'+cInfo.step2+'</span>\n<span>审核:'+cInfo.step3+'</span>\n</div>');
            }
            $('#assignModal').modal("show");
        });
    });

    $('#assignModal .showWrap i').on("click",function () {
        if($(this).hasClass("fa-angle-left")){
            $(this).removeClass("fa-angle-left");
            $(this).addClass("fa-angle-down");
            $(this).attr("title","隐藏更多");
            $('.assignSel').parent().parent().show();
        }else{
            $(this).removeClass("fa-angle-down");
            $(this).addClass("fa-angle-left");
            $(this).attr("title","显示更多");
            $('.assignSel').parent().parent().hide();
        }
    });
    //指派确认
    $('#assignModal .submit').on("click", function () {

        window.parent.confirmAlert("是否确定提交信息？","确认后将更新订单状态！",function () {
            let rid = $('#assignModal .rid').html();
            let s1 = $('#userSel0').val();
            let details = [];
            if(!s1){
                swalParent("系统提示","请选择业务经理！","error");
                return
            }
            let item0 = {};
            item0.uid = s1;
            item0.status = 2;
            item0.role = parseInt($('#userSel0').attr("my-role"));
            details.push(item0);
            let s2 = $('#userSel1').val();
            if(s2){
                let obj = {};
                obj.uid = s2;
                obj.role = parseInt($('#userSel1').attr("my-role"));
                details.push(obj);
            }
            let s3 = $('#userSel2').val();
            if(s3){
                let obj = {};
                obj.uid = s3
                obj.role = parseInt($('#userSel2').attr("my-role"));
                details.push(obj);
            }
            let s4 = $('#userSel3').val();
            if(s4){
                let obj = {};
                obj.uid = s4;
                obj.role = parseInt($('#userSel3').attr("my-role"));
                details.push(obj);
            }
            if(details.length===1){
                swalParent("系统提示","制样/测试/数据分析需至少选一项！","error");
                return
            }
            let s5 = $('#userSel4').val();
            if(!s5){
                swalParent("系统提示","财务管理员为必选！","error");
                return
            }
            //对账单
            let obj0 = {};
            obj0.uid = parseInt($('#userSel0').val());
            obj0.role = parseInt($('#userSel0').attr("my-role"));
            details.push(obj0);
            //客户确认
            let obj = {};
            obj.uid = $('#customerId').val();
            obj.role = 99;
            details.push(obj);
            let obj2 = {};
            obj2.uid = s5;
            obj2.role = parseInt($('#userSel4').attr("my-role"));
            details.push(obj2);
            for(let i=0;i<details.length;i++){
                details[i].step = i;
                details[i].uid = parseInt(details[i].uid);
                details[i].random_id = rid;
            }
            details = JSON.stringify(details);
            console.log(details);
            $.post("/main/assign/assign", {
                rid: rid,
                status:1,
                step:$('#step').val(),
                manager: s1,
                details:details,
                _xsrf: $("#token", parent.document).val()
            }, function (res) {
                if (res.code === 1) {
                    $('#assignModal').modal("hide");
                    refresh();
                    swalParent("系统提示", "操作成功！", "success");
                } else {
                    swalParent("系统提示", "操作失败," + res.data, "error");
                }
            });
        },'');

    });
    //取消订单
    $('#assignModal .cancel').on("click", function () {
        let rid = $('#assignModal .rid').html();
        window.parent.confirmAlert("确定取消吗？","取消将不可恢复！",function () {
            $.post("/main/assign/cancel", {
                rid: rid,
                status:-1,
                _xsrf: $("#token", parent.document).val()
            }, function (res) {
                if (res.code === 1) {
                    $('#assignModal').modal("hide");
                    refresh();
                    swalParent("系统提示", "操作成功！", "success");
                } else {
                    swalParent("系统提示", "操作失败," + res.data, "error");
                }
            });
        },rid);

    });
    //完成订单
    $('#assignModal .complete').on("click", function () {
        let rid = $('#assignModal .rid').html();
        window.parent.confirmAlert("是否确定已完成？","完成将关闭该订单！",function () {
            let status = parseInt($('#assignModal .status').val());
            let msg = $('#assignModal .msg').val();
            let statusArr = renderStatus(status,msg).statusArr;
            let step = parseInt($('#step').val());

            let rid = $('#assignModal .rid').html();
            let formData = new FormData();
            formData.append("rid",rid);
            formData.append("_xsrf",$("#token", parent.document).val());
            formData.append("status",status+"");
            formData.append("step",step+"");
            $.ajax({
                url: "/main/assign/complete",
                type: "POST",
                processData: false,
                contentType: false,
                data: formData,
                beforeSend: function () {
                    loadingParent(true, 2);
                },
                success: function (r) {
                    if (r.code === 1) {
                        $('#assignModal').modal("hide");
                        refresh();
                        swalParent("系统提示", "操作成功！", "success");
                    }else{
                        swalParent("系统提示", "操作失败," + res.data, "error");
                    }
                },
                complete: function () {
                    loadingParent(false, 2);
                }
            });
        },rid);

    });
    //确认任务
    $('#assignModal .confirmTask').on("click", function () {
        let rid = $('#assignModal .rid').html();
        let status = parseInt($("#curStatus span").attr("data"));
        let formData = {};
        formData["rid"] = rid;
        formData["_xsrf"] = $("#token", parent.document).val();
        formData["status"] = status;
        formData["step"] = $('#step').val();

        window.parent.confirmAlert("是否确定任务信息？","确认后将更新订单状态！",function () {
            $.ajax({
                url: "/main/assign/confirm",
                type: "POST",
                dataType: "json",
                cache: false,
                data: formData,
                beforeSend: function () {
                    //loadingParent(true, 2);
                },
                success: function (r) {
                    if (r.code === 1) {
                        $('#assignModal').modal("hide");
                        refresh();
                        swalParent("系统提示", "操作成功！", "success");
                    }else{
                        swalParent("系统提示", "操作失败," + res.data, "error");
                    }
                },
                complete: function () {
                    //loadingParent(false, 2);
                }
            });
        },"");

    });
    //完成任务
    $('#assignModal .completeTask').on("click", function () {

        window.parent.confirmAlert("是否确定已完成任务？","确认后将更新订单状态！",function () {
            //数据分析完成任务需上传实验报告
            let status = parseInt($('#assignModal .status').val());
            let msg = $('#assignModal .msg').val();
            let statusArr = renderStatus(status,msg).statusArr;
            let step = parseInt($('#step').val());

            let rid = $('#assignModal .rid').html();
            let formData = new FormData();
            if(statusArr.length!==0&&statusArr[status+2]==="结算中"){//此过程不需确认
                //下一步是否自动确认
                formData.append("auto","1");
            }
            formData.append("rid",rid);
            formData.append("_xsrf",$("#token", parent.document).val());
            formData.append("status",status+"");
            formData.append("step",step+"");
            /*if(uRole===6){
                let files = $('#assignModal').find("input[name='file']").prop('files');
                if (files.length === 0) {
                    swalParent("系统提示", "请上传实验报告!", "error");
                    return
                }
                let file = files[0];
                let size = file.size;
                if (size > 20971520) {
                    swalParent("系统提示", "文件大小不能超过20MB!", "error");
                    return
                }
                //let formData = new FormData();
                formData.append('table',"order");
                formData.append('file',files[0]);
            }*/
            $.ajax({
                url: "/main/assign/complete",
                type: "POST",
                processData: false,
                contentType: false,
                data: formData,
                beforeSend: function () {
                    loadingParent(true, 2);
                },
                success: function (r) {
                    if (r.code === 1) {
                        $('#assignModal').modal("hide");
                        refresh();
                        swalParent("系统提示", "操作成功！", "success");
                    }else{
                        swalParent("系统提示", "操作失败," + res.data, "error");
                    }
                },
                complete: function () {
                    loadingParent(false, 2);
                }
            });
        },"");

    });

    //发送对账单
    $('#assignModal .statement').on("click",function () {
        $('#assignModal .completeTask').click();
    });
    //任务管理-------------------------------------------------结束

    $('#myTable').on("click", ".report", function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        $('#reportModal .rid').html(rowData.rid);
        let fileName = rowData.file;
        if (fileName) {
            $('#reportModal .btn-primary').html("更新实验报告");
            $('#fileWrap').html("<a style='margin-top: 6px;display: inline-block;' class='download' title='点击下载' href='javascript:void(0);'>" +
                fileName + "</a>");
        } else {
            $('#reportModal .btn-primary').html("上传实验报告");
            $('#fileWrap').html("<p class='red' style='margin-top: 6px;'>暂未上传任何实验报告！</p>");
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
    $('#editTable .editor').on("click",function () {
        let id = $(this).attr("id")+"Content";
        let val = $(this).val();
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });

    //服务评价------------------------------------------------------开始
    $('#myTable').on("click",".evaluate",function(e){//服务评价
        let rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        $('#evaluateModal .rid').val(rid);
        $('#evaluateModal .uid').val(rowData.uid);
        myEva.reload();
        let satisfied = rowData.satisfied;
        if(satisfied&&parseInt(rowData.satisfied)!==-1){
            //熏染数据
            myEva.render(rowData.satisfied,rowData.content);
            //myEva.disabled();
            //myEva.reload();
            //$('#evaluateModal .btn-primary').hide();
        }else{
            //$('#evaluateModal .btn-primary').show();
        }
        $('#evaluateModal').modal("show");
    });
    $('#evaluateModal .btn-primary').on("click",function () {
        loadingParent(true,2);
        let satisfied = parseInt($('.satisfiedActive').attr("data"));
        if(!satisfied){
            satisfied = 0;
        }
        $.post("/main/evaluate/add",{
            rid:$('#evaluateModal .rid').val(),
            uid:$('#evaluateModal .uid').val(),
            satisfied:satisfied,
            content:$('.contentWrap textarea').val().trim(),
            _xsrf:$("#token", parent.document).val()
        },function (r) {
            loadingParent(false,2);
            let type = "error";
            if (r.code === 1) {
                type = "success";
                refresh();
                $('#evaluateModal').modal("hide");
            }
            swalParent("系统提示", r.msg, type);
        });
    });
    //初始化评价插件
    myEva.init();
    //服务评价------------------------------------------------------结束

    //处理项目选择及切换事件------------------------------------------开始
    $('#typeSelect').on('changed.bs.select', function (e,clickedIndex,newValue,oldValue) {
        let val = $(this).val();
        if(val!=="0"&&allTypeMap[val]){
            let item = allTypeMap[val];
            $('.type').html(item.name);
        }else{
            $('.type').html("-");
        }
        renderDevice(val,"deviceSelect","deviceTable");
    });

    $('#typeSelect2').on('changed.bs.select', function (e,clickedIndex,newValue,oldValue) {
        let val = $(this).val();
        if(val!=="0"&&allTypeMap[val]){
            let item = allTypeMap[val];
            $('.type').html(item.name);
        }else{
            $('.type').html("-");
        }
        //renderDevice(val,"deviceSelect2","deviceTable2");
    });

    $('#deviceSelect').on('changed.bs.select', function (e,clickedIndex,newValue,oldValue) {
        let valArr = $(this).val();
        if(valArr.length===1&&valArr[0]==="0"){
            return
        }
        //更新map容器中对应count/remark
        $('#deviceTable .deviceItem').each(function () {
            let id = $(this).find(".id input").val();
            let item = deviceMap[id];
            item.count = $(this).find(".count input").val();
            item.remark = $(this).find(".remark input").val().trim();
            deviceMap[id] = item;
        });
        let dArr = [];
        for(let i=0;i<valArr.length;i++){
            if(!deviceMap[valArr[i]]){
                continue
            }
            dArr.push(deviceMap[valArr[i]]);
        }
        renderTable("deviceTable",dArr);
    });

    $('#deviceSelect2').on('changed.bs.select', function (e,clickedIndex,newValue,oldValue) {
        let valArr = $(this).val();
        if(valArr.length===1&&valArr[0]==="0"){
            return
        }
        //更新map容器中对应count/remark
        $('#deviceTable2 .deviceItem').each(function () {
            let id = $(this).find(".id input").val();
            let item = allDeviceMap[id];
            item.count = $(this).find(".count input").val();
            item.remark = $(this).find(".remark input").val().trim();
            allDeviceMap[id] = item;
        });
        let dArr = [];
        for(let i=0;i<valArr.length;i++){
            if(!allDeviceMap[valArr[i]]){
                continue
            }
            dArr.push(allDeviceMap[valArr[i]]);
        }
        renderTable("deviceTable2",dArr);
    });
    //处理项目选择及切换事件------------------------------------------结束
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
                    allTypeMap[item.id] = item;
                    $('#filterSelect').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSelect').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSelect2').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
                request = typeArr[0].request;
                $('#addParameter').html(request);
                $('#addParameterContent').val(request);
            }
            $('#filterSelect').selectpicker('refresh');
            $('#typeSelect').selectpicker('refresh');
            $('#typeSelect2').selectpicker('refresh');
        }
    });

    //渲染编辑状态为所有设备可选
    $.post("/type/device",{_xsrf:$("#token", parent.document).val(),typeId:0},function (res) {
        allDeviceMap = {};
        $('#deviceTable2').html('<tr>\n<td class="title" style="width: 10%">序号</td>\n<td class="title" style="width: 45%">项目名称</td>\n<td class="title" style="width: 10%">数量</td>\n<td class="title" >备注信息</td>\n</tr>\n<tr><td colspan="4">下拉选择项目</td></tr>');
        if(res.data) {
            let dArr = res.data;
            for(let i=0;i<dArr.length;i++){
                let item = dArr[i];
                allDeviceMap[item.id] = item;
                $('#deviceSelect2').append('<option value="'+item.id+'">'+item.name+'</option>');
            }
        }
        $('#deviceSelect2').selectpicker('refresh');
    });

    //初始化用户信息
    $.post("/main/user/customer",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            //loading(false,2);
            let tList = res.data;
            if(tList){
                $('#userAddSel').html('');
                $('#userEditSel').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let name = item.Name;
                    if(!name){
                        name = "未填写名字";
                    }
                    $('#userAddSel').append('<option value="'+item.Id+'">'+name+'</option>');
                    $('#userEditSel').append('<option value="'+item.Id+'">'+name+'</option>');
                }
            }else{
                $('#userWrap').html('');
                $('#userWrap').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
                $('#userEditWrap').html('');
                $('#userEditWrap').append('<span style="color: red;display: block;margin-top: -24px">暂无用户，请先添加!</span>');
            }
            $('#userAddSel').selectpicker('refresh');
            $('#userEditSel').selectpicker('refresh');
        }
    });
    //初始化被任务管理用户
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
                '<span style="color: red;display: block;">暂无用户，请先添加!</span>');
        }
        if(uType<4){
            $('#userSel').append('<option value="-1">取消订单</option>');
        }
        if(uType===7||uType<2){
            $('#userSel').append('<option value="-6">完成结算</option>');
        }
        $('#userSel').selectpicker('refresh');
    });

}

function renderTable(domId,data) {

    $('#'+domId).html('<tr>\n<td class="title" style="width: 10%">序号</td>\n<td class="title" style="width: 45%">项目名称</td>\n<td class="title" style="width: 10%">数量</td>\n<td class="title" >备注信息</td>\n</tr>');
    let str = "";
    for(let i=0;i<data.length;i++){
        let item = data[i];
        let index = i+1;
        let count = item.count;
        if(!count){
            count = 1;
        }
        let remark = item.remark;
        if(!remark){
            remark = "";
        }
        str += '<tr class="deviceItem">\n' +
            '   <td class="id" style="width: 10%"><input value="'+item.id+'" type="hidden">'+index+'</td>\n' +
            '   <td class="name" style="width: 45%">'+item.name+'</td>\n' +
            '   <td class="count" style="width: 10%;"><input class="count" type="text" oninput="this.value=this.value.replace(/\D/gi,\'\')" value="'+count+'" maxlength="3"></td>\n' +
            '   <td class="remark"><input value="'+remark+'" type="text" maxlength="128"></td>\n' +
            '</tr>';
    }
    if(!str){
        str = "<tr><td colspan='4'>暂无选择项目</td></tr>";
    }
    $('#'+domId).append(str);
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
    let tid = $('#typeSelect').val();
    if(!tid||tid==="0"){
        swalParent("系统提示","请选择分类!","error");
        return;
    }
    let ids = $('#addTable .deviceItem');
    if(ids.length===0){
        swalParent("系统提示","未选择任何实验项目!","error");
        return;
    }
    let item = {};
    let Protocol = {};
    //Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = dateUtil.NowDate();
    Protocol.Pay = $('#addTable').find("input[name='pay']:checked").val();
    Protocol.TestResult = $('#addTable').find("input[name='test_result']:checked").val();
    //Protocol.City = $('.city').html();
    Protocol.SampleName = $('#addTable').find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#addTable').find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#addTable').find("input[name='sample_code']").val().trim();
    Protocol.DetectionCycle = parseInt($('#addTable').find('.detection_cycle').html());
    Protocol.DetectionReport = $('#addTable').find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#addTable').find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#addTable').find("input[name='about']").val().trim();
    Protocol.Parameter = $('#addParameterContent').val();
    Protocol.Other = $("#addAboutContent").val();
    Protocol.Result = $("#addResultContent").val();
    Protocol.Remark1 = $('#addRemark1Content').val();
    Protocol.Remark2 = $('#addRemark2Content').val();
    Protocol.Remark3 = $('#addRemark3Content').val();
    //Protocol.Tid = $('#typeAddSel').val();
    //Protocol.DeviceId = ids;
    Protocol.Uid = parseInt($('#userAddSel').val());
    let dataArr = [];
    item.Protocol = Protocol;
    item.Tid = $('#typeSelect').val();
    let DeviceArr = [];
    $('#addTable .deviceItem').each(function () {
        let item = {};
        item.DeviceId = $(this).find(".id input").val();
        let count = $(this).find(".count input").val();
        if(!count){
            count = 1;
        }
        item.Count = parseInt(count);
        item.Name = $(this).find('.name').html();
        item.Remark = $(this).find(".remark input").val().trim();
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
                $('#deviceSelect').selectpicker('val',['noneSelectedText'])//回到初始状态
                $("#deviceSelect").selectpicker('refresh');
                reset4success();
            }
            swalParent("系统提示", r.msg, type);
        },
        complete: function () {
            loadingParent(false, 2);
        }
    });
}

function editInfo(rid) {
    loadingParent(true,2);
    $.post(prefix+"/info?rid="+rid,{_xsrf: $("#token", parent.document).val()},function (res) {
        if(res.code===1){
            let data = res.data;
            //设置type选中
            $('#typeSelect2').selectpicker('val',data.tid);
            $("#typeSelect2").selectpicker('refresh');
            //设置项目选中
            let deviceSelectArr = res.data.selectDeviceArr;
            let tempArr = [];
            for(let i=0;i<deviceSelectArr.length;i++){
                let item = deviceSelectArr[i];
                tempArr.push(item.id);
                allDeviceMap[item.id] = item;//更新指定项，防止count/remark被覆盖
            }
            $('#deviceSelect2').selectpicker('val',tempArr);
            $("#deviceSelect2").selectpicker('refresh');
            
            //处理协议
            let protocol = data.protocol;
            $('#userEditSel').selectpicker('val',protocol.Uid);
            $("#userEditSel").selectpicker('refresh');
            //清空选中
            $('input:checked').prop('checked', false);
            //console.log("Pay:"+protocol.Pay+" TestResult:"+protocol.TestResult+" DetectionReport:"+protocol.DetectionReport+" SampleProcessing:"+protocol.SampleProcessing);
            $("input[value='"+protocol.TestResult+"']").prop('checked', true);
            $("input[value='"+protocol.Pay+"']").prop('checked', true);
            $("input[value='"+protocol.DetectionReport+"']").prop('checked', true);
            $("input[value='"+protocol.SampleProcessing+"']").prop('checked', true);
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
            loadingParent(false,2);
        }else{
            swalParent("系统提示",res.msg,"error");
        }
    });
}

function update() {

    let ids = $('#editTable .deviceItem');
    if(ids.length===0){
        swalParent("系统提示","未选择任何实验项目!","error");
        return;
    }
    let item = {};
    let Protocol = {};
    //Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = dateUtil.NowDate;
    Protocol.Pay = $('#editTable').find("input[name='pay']:checked").val();
    Protocol.TestResult = $('#editTable').find("input[name='test_result']:checked").val();
    //Protocol.City = $('.city').html();
    Protocol.SampleName = $('#editTable').find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#editTable').find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#editTable').find("input[name='sample_code']").val().trim();
    Protocol.DetectionCycle = parseInt($('#editTable').find('.detection_cycle').html());
    Protocol.DetectionReport = $('#editTable').find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#editTable').find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#editTable').find("input[name='about']").val().trim();
    Protocol.Parameter = $('#editParameterContent').val();
    Protocol.Other = $("#editAboutContent").val();
    Protocol.Result = $("#editResultContent").val();
    Protocol.Remark1 = $("#editRemark1Content").val();
    Protocol.Remark2 = $("#editRemark2Content").val();
    Protocol.Remark3 = $("#editRemark3Content").val();
    //Protocol.Tid = $('#typeAddSel').val();
    //Protocol.DeviceId = ids;
    Protocol.Uid = parseInt($('#userEditSel').val());
    item.Protocol = Protocol;
    item.Tid = $('#typeSelect2').val();
    let DeviceArr = [];
    $('#editTable .deviceItem').each(function () {
        let item = {};
        item.DeviceId = $(this).find(".id input").val();
        let count = $(this).find(".count input").val();
        if(!count){
            count = 1;
        }
        item.Count = parseInt(count);
        item.Name = $(this).find('.name').html();
        item.Remark = $(this).find(".remark input").val().trim();
        DeviceArr.push(item);
    });
    item.Count = DeviceArr.length;
    item.Data = DeviceArr;
    let formData = {};
    formData["data"] = JSON.stringify(item);
    formData["rid"] = $('#editRid').val();
    formData["_xsrf"] = $("#token", parent.document).val();
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
            let type = "error";
            if (r.code == 1) {
                type = "success";
            }
            reset4success();
            $('.list').click();
            swalParent("系统提示",r.msg,type);
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
        url: "/main/protocol/info",
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
            //清空选中
            $('input:checked').prop('checked', false);
            $("input[value='"+protocol.TestResult+"']").prop('checked', true);
            $("input[value='"+protocol.Pay+"']").prop('checked', true);
            $('#tab3 .date').html(protocol.Date);
            $('#tab3 .sign').html("<img src='" + protocol.Sign + "'>");
            $('#tab3 .city').html(r.data.city);
            $('#tab3 .mySign').html(r.data.sign);
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
                let range = item.DetectionCycle;
                devices += "<i class=\"fa fa-files-o\" aria-hidden=\"true\"></i> " + name + "*" +
                    count + "&nbsp;&nbsp;&nbsp;<i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i>&nbsp;服务周期:"+range+"个工作日<br/>";
            }
            $('#tableWrap').html("");
            $('#tableWrap').append('' +
                '<table>\n' +
                '<tr style="height: 35px!important;line-height: 35px;">\n' +
                '   <td class="btbg font-center titfont" colspan="6">\n技术服务要求\n</td>\n' +
                '</tr>' +
                '<tr style="color: #6195ff;font-size: 20px;">\n' +
                '   <td class="tabtxt2" style="width: 9%;">所属分类</td>\n' +
                '   <td colspan="4" class="type">' + r.data.type.Name + '</td>\n' +
                '   <td class="typeMore"></td>\n' +
                '</tr>\n' +
                '<tr >\n' +
                '   <td class="tabtxt2">已选项目</td>\n' +
                '   <td colspan="5" height="75" class="allDevice">' + devices + '</td>\n' +
                '</tr>\n' +
                '<tr>\n' +
                '   <td class="tabtxt2">检测报告</td>\n' +
                '   <td colspan="5">\n' +
                '       <input type="radio" value="无需检测报告（默认）" name="detection_report"/> 无需检测报告（默认）\n                                        ' +
                '       <input type="radio" value="中文检测报告（加收200元）" name="detection_report"/> 中文检测报告（加收200元）\n                                    ' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr>\n' +
                '   <td class="tabtxt2">样品编号</td>\n' +
                '   <td colspan="5">\n' +
                '       <div>' + protocol.SampleCode + '</div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr>\n' +
                '   <td class="tabtxt2">样品名称</td>\n' +
                '   <td colspan="2">\n' +
                '       <div>' + protocol.SampleName + '</div>\n   ' +
                '   </td>\n' +
                '   <td class="tabtxt2" style="text-align: right;padding-right: 15px;">样品数量</td>\n                                    ' +
                '   <td colspan="2">\n' +
                '       <div>' + protocol.SampleCount + '</div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr>\n' +
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
                '   <td height="175" class="tabtxt2">参考结果图片</td>\n' +
                '   <td colspan="5">\n' +
                '       <textarea class="form-control" id="resultContent" name="result" placeholder="可插入文字图片"></textarea>\n' +
                '       <div class="editor result" id="result"></div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr class="trHidden">\n                                    ' +
                '   <td height="175" class="tabtxt2">制样要求</td>\n' +
                '   <td colspan="5">\n' +
                '       <textarea class="form-control" id="remark1Content" name="result" placeholder="可插入文字图片"></textarea>\n' +
                '       <div class="editor result" id="remark1"></div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr class="trHidden">\n                                    ' +
                '   <td height="175" class="tabtxt2">测试要求</td>\n' +
                '   <td colspan="5">\n' +
                '       <textarea class="form-control" id="remark2Content" name="result" placeholder="可插入文字图片"></textarea>\n' +
                '       <div class="editor result" id="remark2"></div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '<tr class="trHidden">\n                                    ' +
                '   <td height="175" class="tabtxt2">分析要求</td>\n' +
                '   <td colspan="5">\n' +
                '       <textarea class="form-control" id="remark3Content" name="result" placeholder="可插入文字图片"></textarea>\n' +
                '       <div class="editor result" id="remark3"></div>\n' +
                '   </td>\n' +
                '</tr>\n' +
                '</table>');
            $("input[value='"+protocol.DetectionReport+"']").prop('checked', true);
            $("input[value='"+protocol.SampleProcessing+"']").prop('checked', true);
            $('#tab3 .parameter').html(protocol.Parameter);
            $('#tab3 .other').html(protocol.Other);
            $('#tab3 .result').html(protocol.Result);
            $('#tab3 .remark1').html(protocol.Remark1);
            $('#tab3 .remark2').html(protocol.Remark2);
            $('#tab3 .remark3').html(protocol.Remark3);
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
                    $('#typeChildAddSel').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
                detectionCycle = tList[0].detection_cycle;
            }else{
                $('#typeChiAddSelWrap').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
            }
            $('#typeChildAddSel').selectpicker('refresh');
            //子类切换监听
            $('#typeChildAddSel').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                let item = typeChildArr[clickedIndex];
                if(!item){
                    return
                }
                detectionCycle = typeChildArr[clickedIndex].detection_cycle;
                $('#addTable .type').html("-");
                $('#addTable .allDevice').html("-");
                renderDevice();
            });
            renderDevice();
        }
    });

}

function renderDevice(typeId,selectId,tableId){
    $.post("/type/device",{_xsrf:$("#token", parent.document).val(),typeId:typeId},function (res) {
        deviceMap = {};
        $('#'+tableId).html('<tr>\n                                                    <td class="title" style="width: 10%">序号</td>\n                                                    <td class="title" style="width: 45%">项目名称</td>\n                                                    <td class="title" style="width: 10%">数量</td>\n                                                    <td class="title" >备注信息</td>\n                                                </tr>\n                                                <tr><td colspan="4">下拉选择项目</td></tr>');
        if(res.data) {
            let dArr = res.data;
            for(let i=0;i<dArr.length;i++){
                let item = dArr[i];
                deviceMap[item.id] = item;
                $('#'+selectId).append('<option value="'+item.id+'">'+item.name+'</option>');
            }
        }
        $('#'+selectId).selectpicker('refresh');
    });
}

function report() {
    let files = $('#reportmodal').find("input[name='file']").prop('files');
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
    formData.append('table', "order");
    formData.append('rid', $('#reportModal .rid').html());
    formData.append('file', files[0]);
    formData.append("_xsrf", $("#token", parent.document).val());
    $.ajax({
        url: "/main/file/report",
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
                reset4success();
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
