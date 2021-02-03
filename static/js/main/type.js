let myTable;
let prefix = "/main/type";
let sort;

$(document).ready(function() {

    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

    //tab导航栏切换
    $('.breadcrumb span').on("click",function () {
        if(!$(this).hasClass("active")){
            return false;
        }
        let data = $(this).attr("data");
        if(!data){
            return false;
        }
        $('.breadcrumb span').addClass("active");
        $(this).removeClass("active");
        if(data==="tab1"){
            refresh();
        }
        if(data==="tab3"){
            renderRank();
        }
        $('.tabWrap').fadeOut(300);
        $("#"+data).fadeIn(300);
    });

    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id");
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });

    $('#uploadPic').on('click',function () {
        openWindow("/main/uploadPic?btnId=uploadPic&domId=picName","中科科辅",1200,600);
    });

    $('#edit_uploadPic').on('click',function () {
        openWindow("/main/uploadPic?btnId=edit_uploadPic&domId=edit_picName","中科科辅",1200,600);
    });

    //初始化分组数据
    renderRank();

    //datatable setting
    myTable =$('#myTable').DataTable({
        autoWidth: true,
        "scrollY": 0,
        "scrollCollapse": "true",
        "processing": false,
        fixedHeader: true,
        serverSide: true,
        //bSort:false,//排序
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,2,3,4,7 ] }],//指定哪些列不排序
        "order": [[ 1, "asc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 30,
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
            { data: 'rank'},
            { data: 'name'},
            { data: 'description',"render":function (data) {
                    let temp = data;
                    if(!temp){
                        temp = "-";
                    }
                    if(temp&&temp.length>15){
                        temp = temp.substring(0,15)+"...";
                    }

                    return "<span title='"+data+"'>"+temp+"</span>"
                } },
            { data: 'img',"render":function (data) {
                if(!data){
                    return "-";
                }
                let filePath = "/img/"+data;
                    return "<img width='30' src='"+filePath+"'>";
                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
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
            parent.checkType();
            loadingParent(false,2);
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detail_name').html(rowData.name);
        /*$('#detail_detection_cycle').html(rowData.detection_cycle);*/
        $('#detail_img').html("<a target='_blank' href='/img/"+rowData.img+"'>"+rowData.img+"</a>");
        let description = rowData.description;
        if(!description){
            description = "暂未填写";
        }
        $('#detail_description').html(description);
        let created = rowData.created;
        $('#detail_created').html(dateUtil.GMT2Str(created));

        let updated = rowData.updated;
        $('#detail_updated').html(dateUtil.GMT2Str(updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#id').val(rowData.id);
        if(rowData.img){
            $('#edit_uploadPic').html("替换图片");
        }
        $('#edit_name').val(rowData.name);
        $('#edit_picName').html(rowData.img);
        $('#edit_description').val(rowData.description);
        $('#requestEdit').val(rowData.request);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        console.log(rowData);
        let id = rowData.id;
        window.parent.confirmAlert("确定删除吗？","与当前相关的数据将全部被删除！",del,id);
    });

} );

function renderRank() {
    if(sort){
        sort.destroy();
    }
    $.post(prefix+"/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        $('#foo').html("");
        let tList = res.data;
        if(tList){
            for(let i=0;i<tList.length;i++){
                let item = tList[i];
                $('#foo').append('<li data="'+item.id+'" >'+item.name+'</li>');
            }
            //排序
            sort = Sortable.create(document.getElementById('foo'), {
                group: "words",
                animation: 150,
                store: {
                    get: function (sortable) {
                        let order = localStorage.getItem(sortable.options.group);
                        return order ? order.split('|') : [];
                    },
                    set: function (sortable) {
                        let order = sortable.toArray();
                        localStorage.setItem(sortable.options.group, order.join('|'));
                    }
                },
                /*onAdd: function (evt){ console.log('onAdd.foo:', [evt.item, evt.from]); },
                onUpdate: function (evt){ console.log('onUpdate.foo:', [evt.item, evt.from]); },
                onRemove: function (evt){ console.log('onRemove.foo:', [evt.item, evt.from]); },
                onStart:function(evt){ console.log('onStart.foo:', [evt.item, evt.from]);},
                onSort:function(evt){ console.log('onStart.foo:', [evt.item, evt.from]);},
                onEnd: function(evt){ console.log('onEnd.foo:', [evt.item, evt.from]);}*/
            });
        }

    });
}

function add(){
    let name = $('#name').val().trim();
    let description = $('#description').val().trim();
    let img = $('#picName').html();
    let request = $('#request').val();
    if (!name){
        swalParent("系统提示",'分组名称不能为空!',"warning");
        return;
    }

    if (!img){
        swalParent("系统提示",'未上传图片!',"warning");
        return;
    }
    if (!description){
        swalParent("系统提示",'请填写简述信息!',"warning");
        return;
    }
    if (!request){
        swalParent("系统提示",'请填写实验要求模板!',"warning");
        return;
    }

    $.ajax({
        url : prefix+"/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            name:name,
            img:img,
            description:description,
            request:request
        },
        beforeSend:function(){
            loadingParent(true,2);
        },
        success : function(r) {
            let type = "error";
            if (r.code === 1) {
                type = "success";
                reset4success();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            loadingParent(false,2);
        }
    });
}

function edit(){
    let name = $('#edit_name').val().trim();
    let description = $('#edit_description').val().trim();
    let img = $('#edit_picName').html();
    let request = $('#requestEdit').val();
    if (!name){
        swalParent("系统提示",'分组名称不能为空!',"warning");
        return;
    }
    if (!img){
        swalParent("系统提示",'未上传图片!',"warning");
        return;
    }
    if (!description){
        swalParent("系统提示",'请填写简述信息!',"warning");
        return;
    }
    if (!request){
        swalParent("系统提示",'请填写实验要求模板!',"warning");
        return;
    }
    $.ajax({
        url : prefix+"/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:$('#id').val(),
            name:name,
            img:img,
            description:description,
            request:request
        },
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
        url : prefix+"/delete",
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
            if (r.code === 1) {
                setTimeout(function () {
                    swalParent("系统提示",r.msg, "success");
                    refresh();
                },100);
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            loadingParent(false,2);
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

function rank() {
    let arr = [];
    $('#foo').find("li").each(function (index,item) {
        let id = $(item).attr("data");
        let rank = index+1;
        let obj = {};
        obj.id = id;
        obj.rank = "\""+rank+"\"";
        arr.push(obj);
    });
    loadingParent(true,2);
    $.post(prefix+"/rank",{_xsrf:$("#token", parent.document).val(),data:JSON.stringify(arr)},function (res) {
        loadingParent(false,2);
        if(res.code===1){
            swalParent("系统提示",res.msg,"success");
        }else{
            setTimeout(function () {
                swalParent("系统提示",res.msg,"error");
            },100);
        }
    })
}

function refresh() {
    myTable.ajax.reload( null,false ); // 刷新表格数据，分页信息不会重置
}

function openWindow(url,name,iWidth,iHeight) {
    let iTop = (window.screen.availHeight-30-iHeight)/2;
    let iLeft = (window.screen.availWidth-10-iWidth)/2;
    let openWindow = window.open(url,name,'height='+iHeight+',innerHeight='+iHeight+',width='+iWidth+',innerWidth='+iWidth+',top='+iTop+',left='+iLeft+',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');
}

//富文本输入回调
function openRes(domId,content) {
    //alert(content)
    //console.log(content);
    $('#'+domId).val(content);
}

//接收上传图片回调
function openRes4Pic(isSuccess,btnId,domId,picName) {
    if(isSuccess){
        $('#'+btnId).html("替换图片");
        $('#'+domId).html(picName);
    }else{
        $('#'+btnId).html("上传图片");
    }
}
