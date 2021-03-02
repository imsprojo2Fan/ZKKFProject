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

//初始化子类分组数据
$.post("/main/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
    if(res.code===1){
        let tList = res.data;
        if(tList){
            for(let i=0;i<tList.length;i++){
                let item = tList[i];
                $('#filterSelect').append('<option value="'+item.id+'">'+item.name+'</option>');
            }
        }
        $('#filterSelect').selectpicker('refresh');
    }
});

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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,3,6 ] }],//指定哪些列不排序
        "order": [[ 5, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 50,
        ajax: {
            url: prefix+'/list4person',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val(),
                tid:$('#filterSelect').val()
            }
        },
        columns: [
            {"data": "id","width":"5%","render": function (data, type, row) {
                    return "<span class='tid'>"+row.id+"</span>";
                }},
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
            { data: 'status',"render":function (data, type, row) {
                    let status = parseInt(row.status);
                    let msg = row.msg;
                    return renderStatus(status,msg).statusDom;
                } },
            { data: 'created',"width":"12%","render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='detail btn btn-primary btn-xs'>预约详情&nbsp;<i class=\"fa fa-file-text-o\" aria-hidden=\"true\"></i></a>&nbsp;";
                    html += "<a href='javascript:void(0);'  class='statement btn btn-primary btn-xs'>对账单&nbsp;<i class=\"fa fa-file-text\" aria-hidden=\"true\"></i></a>&nbsp;";
                    html += "<a href='javascript:void(0);'  class='result btn btn-primary btn-xs'>实验报告&nbsp;<i class=\"fa fa-cloud-download\" aria-hidden=\"true\"></i></a>&nbsp;";
                    html += "<a href='javascript:void(0);'  class='evaluate btn btn-primary btn-xs'>服务评价&nbsp;<i class=\"fa fa-commenting-o\" aria-hidden=\"true\"></i></a>&nbsp;";
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
            if(!data.file){
                $(row).find(".result").remove();
            }
            let status = parseInt(data.status);
            let msg = data.msg;
            let statusItem = renderStatus(status,msg);
            let statusArr = statusItem.statusArr;
            let sIndex = statusIndex(statusArr,"对账单已发送");
            if(status===0||status<sIndex){
                $(row).find(".statement").remove();
            }
            if(status!==statusArr.length-1){
                $(row).find(".evaluate").remove();
            }
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
            $('#myTable_filter').find('input').attr("placeholder","请输入项目名称或预约编号");
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".detail",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.status').html(renderStatus(rowData.status,rowData.msg).statusDom);
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
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".result",function(e){//实验报告
        rowData = myTable.row($(this).closest('tr')).data();
        let fileName = rowData.file;
        $('#downloadBtn').attr("href","/file/report/"+fileName);
        $('#downloadBtn')[0].click();
    });

    //任务管理-------------------------------------------------开始
    $('#myTable').on("click", ".statement", function (e) {
        loadingParent(true,2);
        rowData = myTable.row($(this).closest('tr')).data();
        $('#assignModal .rid').html(rowData.rid);
        $('#assignModal .created').html(dateUtil.GMT2Str(rowData.created));
        let status = parseInt(rowData.status);
        let msg = rowData.msg;
        $('#assignModal .rid').val(rowData.rid);
        $('#assignModal .msg').val(rowData.msg);
        let statusArr = renderStatus(status,msg).statusArr;
        let statusTxt = statusArr[status];
        if(statusTxt==="对账单已发送"){
            $('#assignModal .cancel').show();
            $('#assignModal .confirm').show();
        }else{
            $('#assignModal .cancel').hide();
            $('#assignModal .confirm').hide();
        }
        $.post("/main/assign/statement", {
            rid: rowData.rid,
            uid:rowData.uid,
            _xsrf: $("#token", parent.document).val()
        }, function (res) {
            loadingParent(false,2);
            let data = res.data;
            $('#assignModal .step').val(data.step);
            $('#assignModal .status').val(data.status);
            let cInfo = data.cInfo;
            let uInfo = data.uInfo;
            let dList = data.itemList;
            let itemStr = "";
            let allPrice = 0;
            $('#assignModal .statementsWrap').html("");
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
            $('#assignModal').modal("show");
        });

    });
    //账单有误
    $('#assignModal .cancel').on("click", function () {
        window.parent.confirmAlert("确定账单有误吗？","客服将尽快与您确认！",function () {
            $.post("/main/assign/wrong", {
                rid: $('#assignModal .rid').val(),
                status:$('#assignModal .status').val(),
                msg:$('#assignModal .msg').val(),
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
        },"");

    });
    //确认账单
    $('#assignModal .confirm').on("click", function () {
        window.parent.confirmAlert("是否确定账单无误？","确定完将更新订单状态！",function () {
            $.post("/main/assign/complete", {
                rid: $('#assignModal .rid').val(),
                status:$('#assignModal .status').val(),
                step:parseInt($('#assignModal .step').val())+1,
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

    //任务管理-------------------------------------------------结束

    //服务评价------------------------------------------------------开始
    $('#myTable').on("click",".evaluate",function(e){//服务评价
        let rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        myEva.reload();
        $('#evaluateModal .rid').val(rid);
        $('#evaluateModal .rid').val(rowData.uid);
        let satisfied = rowData.satisfied;
        if(satisfied&&parseInt(rowData.satisfied)!==-1){
            //熏染数据
            myEva.render(rowData.satisfied,rowData.content);
            myEva.disabled();
            //myEva.reload();
            $('#evaluateModal .btn-primary').hide();
        }else{
            $('#evaluateModal .btn-primary').show();
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

} );

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
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function loading(flag,type) {
    window.parent.loading(flag,type);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};
