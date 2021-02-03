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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,2,5 ] }],//指定哪些列不排序
        "order": [[ 4, "desc" ]],//默认排序
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
            { data: 'rid',"render":function (data) {
                    return data;
                }},
            { data: 'typeName',"render":function (data) {
                    return stringUtil.maxLength(data,15);
                }},
            { data: 'status',"render":function (data) {
                    return renderStatus(data).statusTxt;
                } },
            { data: 'created',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='detail btn btn-default btn-xs'>订单详情&nbsp;<i class=\"fa fa-file-text-o\" aria-hidden=\"true\"></i></a>&nbsp;";
                    html += "<a href='javascript:void(0);'  class='result btn btn-primary btn-xs'>实验报告&nbsp;<i class=\"fa fa-cloud-download\" aria-hidden=\"true\"></i></a>";
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
            //let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
            $('.dataTables_scrollBody').css("height",window.innerHeight-270+"px");
            $('#myTable_filter').find('input').attr("placeholder","请输入订单编号");
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".detail",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.rid').html(stringUtil.maxLength(rowData.rid));
        $('#detailModal').find('.status').html(renderStatus(rowData.status).statusTxt);
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));
        let rid = rowData.rid;
        detail(rid);
    });
    $('#myTable').on("click",".result",function(e){//实验报告
        rowData = myTable.row($(this).closest('tr')).data();
        let fileName = rowData.file;
        $('#downloadBtn').attr("href","/file/report/"+fileName);
        $('#downloadBtn')[0].click();
    });

} );

function detail(rid) {
    loadingParent(true,2);
    $.post(prefix+"/detail",{rid:rid,_xsrf:$("#token", parent.document).val()},function (res) {
        loadingParent(false,2);
        console.log(res);
        let localOutArr = res.data;
        $('.libItemWrap').html("");
        for(let i=0;i<localOutArr.length;i++){
            let outItem = localOutArr[i];
            let tid = outItem.tid;
            let typeName = outItem.name;
            let innerArr = outItem.data;
            $('.libItemWrap').append('' +
                '<div class="typeItem">\n' +
                '   <div class="typeName">'+typeName+'</div>\n' +
                '   \n' +
                '<div class="dWrap'+tid+'"></div>'+
                '</div>');
            for(let j=0;j<innerArr.length;j++){
                let dName = innerArr[j].name;
                let title = dName;
                dName = stringUtil.maxLength(dName,20);
                let dId = innerArr[j].id;
                let count = innerArr[j].count;
                $('.dWrap'+tid).append('<div class="dItem">\n<input type="hidden" value="'+dId+'" class="id">\n<i class="fa fa-files-o" aria-hidden="true"></i>\n<span class="dName" title="'+title+'">'+dName+'</span>\n<div class="countWrap" my-data="'+typeName+'" my-id="'+dId+'">&nbsp;&nbsp;<span class="count">x'+count+'</span>&nbsp;&nbsp;</div>\n</div>');
            }
        }


        $('#detailModal').modal("show");
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
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}
function renderStatus(status) {
    let res = {}
    let str;
    let str2;
    status = parseInt(status);
    if(status===-1){
        str2 = "<span class='statusTxt-red'>已取消</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/财务结算/已完成/<span class='statusTxt-red'>已取消</span>";
    }
    if(status===0){
        str2 = "<span class='statusTxt-blue'>待确认</span>";
        str = "<span class='statusTxt-blue'>待确认</span>/已确认/制样中/测试中/数据分析/财务结算/已完成/已取消";
    }
    if(status===1){
        str2 = "<span class='statusTxt-blue'>已确认</span>";
        str = "待确认/<span class='statusTxt-blue'>已确认</span>/制样中/测试中/数据分析/财务结算/已完成/已取消";
    }
    if(status===2){
        str2 = "<span class='statusTxt-blue'>制样中</span>";
        str = "待确认/已确认/<span class='statusTxt-blue'>制样中</span>/测试中/数据分析/财务结算/已完成/已取消";
    }
    if(status===3){
        str2 = "<span class='statusTxt-blue'>测试中</span>";
        str = "待确认/已确认/制样中/<span class='statusTxt-blue'>测试中</span>/数据分析/财务结算/已完成/已取消";
    }
    if(status===4){
        str2 = "<span class='statusTxt-blue'>数据分析</span>";
        str = "待确认/已确认/制样中/测试中/<span class='statusTxt-blue'>数据分析</span>/财务结算/已完成/已取消";
    }
    if(status===5){
        str2 = "<span class='statusTxt-blue'>财务结算</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/<span class='statusTxt-blue'>财务结算</span>/已完成/已取消";
    }
    if(status===6){
        str2 = "<span class='statusTxt-green'>已完成</span>";
        str = "待确认/已确认/制样中/测试中/数据分析/财务结算/<span class='statusTxt-green'>已完成</span>/已取消";
    }
    res.status = str;
    res.statusTxt = str2;
    return res;
}

function loading(flag,type) {
    window.parent.loading(flag,type);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};