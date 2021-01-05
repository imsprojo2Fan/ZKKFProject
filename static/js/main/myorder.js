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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,4 ] }],//指定哪些列不排序
        "order": [[ 3, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 50,
        ajax: {
            url: prefix+'/list4person',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            {"data": "id","width":"5%","render": function (data, type, row) {
                    return "<span class='tid'>"+row.id+"</span>";
                }},
            { data: 'rid',"render":function (data) {
                    return data;
                }},
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
            { data: 'created',"width":"12%","render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: null,"width":"15%","render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看详情</a>&nbsp;"
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
            $('#myTable_filter').find('input').attr("placeholder","请输入订单编号");
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.rid').html(stringUtil.maxLength(rowData.rid));
        let str;
        let status = rowData.status;
        if(status==="0"){
            str = "<span style='color:orangered'>待确认</span>";
        }else if(status==="1"){
            str = "<span style='color:green'>已确认</span>";
        }else if(status==="2"){
            str = "<span style='color:red'>已取消</span>";
        }else{
            str = "<span style='color:green'>已完成</span>";
        }
        $('#detailModal').find('.status').html("<span style='color:green'>"+str+"</span>");
        let created = rowData.created;
        let unixTimestamp = new Date(created);
        let commonTime = unixTimestamp.toLocaleString('chinese',{hour12:false});
        $('#detail_created').html(commonTime);
        let rid = rowData.rid;
        detail(rid);
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
                '   <hr>\n' +
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
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function loading(flag,type) {
    window.parent.loading(flag,type);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};