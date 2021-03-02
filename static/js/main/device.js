let myTable;
let prefix = "/main/device";
let typeDataArr = [];
let gTid;
let gTtid;
$(document).ready(function() {

    if(!storageTest(window.localStorage)){
        alert("当前浏览器localStorage不可用，建议使用谷歌浏览器");
    }

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
        $('.tabWrap').fadeOut(300);
        $("#"+data).fadeIn(300);
    });

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

    $('#uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1200,600);
    });

    $('#edit_uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1200,600);
    });

    $('#form1').find('.addItem').on("click",function () {
        let arr = $('#form1').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
        }
        openWindow("/main/uploadPic?domId=addImgWrap","中科科辅",1200,600);
    });

    $('#form2').find('.addItem').on("click",function () {
        let arr = $('#form2').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
            return
        }
        openWindow("/main/uploadPic?domId=editImgWrap","中科科辅",1200,600);
    });

    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id");
        let val = $(this).val();
        localStorage.setItem(id,val);
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [0,8] }],//指定哪些列不排序
        "order": [[ 7, "desc" ]],//默认排序
        "lengthMenu": [ [30, 50, 100, 200,500], [30, 50, 100, 200,500] ],
        "pageLength": 50,
        ajax: {
            url: prefix+'/list',
            type: 'POST',
            data:{
                tid:$('#filterSelect').val(),
                ttid:$('#filterSelect2').val(),
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            {"data": "id","width":"8%","render": function (data, type, row) {
                    return "<div style='text-align: left'><input type='checkbox' name='check' value='"+row.id+"'><span style='margin-left: 3px;' class='tid'>"+row.id+"</span></div>";
                }},
            { data: 'typeName',"width":"8%",},
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,15);
                } },
            { data: 'disabled',"width":"6%","render":function (data) {
                    if(data==="0"){
                        return "<span style='color:green'>上线</span>";
                    }else{
                        return "<span style='color:red'>下架</span>";
                    }
                }},
            { data: 'view',"width":"6%","render":function (data) {
                    return data;
                } },
            { data: 'order',"width":"6%","render":function (data) {
                    return data;
                } },
            { data: 'reservation',"width":"6%","render":function (data) {
                    return data;
                } },
            { data: 'created',"width":"10%","render":function (data,type,row,meta) {
                    return dateUtil.GMT2Str(data);
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-primary btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a>&nbsp;";
                    html += "<a href='javascript:void(0);' class='preview btn btn-success btn-xs'></i>预览</a>"
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
        "drawCallback": function(settings) {

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
            parent.checkType();
            $('.dataTables_scrollBody').css("height",window.innerHeight-270+"px");
            $('#myTable_filter').find('input').attr("placeholder","请输入设备名称");
            loadingParent(false,2);
        }
    });
    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");
    let rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detailModal').find('.type').html(rowData.typeName);
        $('#detailModal').find('.name').html(rowData.name);
        $('#detailModal').find('.price').html(rowData.price);
        $('#detailModal').find('.version').html(rowData.version);
        let disabled = rowData.disabled;
        if(disabled==="0"){
            $('#detailModal').find('.disabled').html("<span style='color: green'>上线</span>");
        }else{
            $('#detailModal').find('.disabled').html("<span style='color: red'>下架</span>");
        }
        $('#detailModal').find('.source').html(rowData.source);
        let temp = rowData.sketch;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.sketch').html("<span title='"+rowData.sketch+"'>"+temp+"</span>");
        temp = rowData.parameter;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.parameter').html("<span title='"+rowData.parameter+"'>"+temp+"</span>");
        temp = rowData.feature;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.feature').html("<span title='"+rowData.feature+"'>"+temp+"</span>");
        temp = rowData.range;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.range').html("<span title='"+rowData.range+"'>"+temp+"</span>");
        temp = rowData.achievement;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.achievement').html("<span title='"+rowData.achievement+"'>"+temp+"</span>");
        temp = rowData.remark;
        if(temp.length>15){
            temp = temp.substring(0,15)+"...";
        }
        $('#detailModal').find('.remark').html("<span title='"+rowData.remark+"'>"+temp+"</span>");

        let created = rowData.created;
        $('#detailModal').find('.created').html(dateUtil.GMT2Str(created));

        let updated = rowData.updated;
        $('#detailModal').find('.updated').html(dateUtil.GMT2Str(updated));
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-primary",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#id').val(rowData.id);
        $('#editModal').find('.name').val(rowData.name);
        $('#typeSelEdit').selectpicker('val',rowData.tid);
        $('#typeSelEdit').selectpicker('refresh');
        let typeChildArr = findByTid(rowData.tid);
        renderChildType(typeChildArr,"Edit");
        $('#typeChildSelEdit').selectpicker('val',rowData.ttid);
        $('#typeChildSelEdit').selectpicker('refresh');
        let deviceArr = findByTtid(rowData.ttid,typeChildArr);
        renderDevice4relate(deviceArr,"Edit");
        let relate = rowData.relate;
        if(relate){
            let arr = relate.split(",");
            let tempArr = [];
            for(let i=0;i<arr.length;i++){
                let id = arr[i];
                if(!id){
                    continue
                }
                tempArr.push(id);
            }
            $('#relateEdit').selectpicker('val',tempArr);
            $("#relateEdit").selectpicker('refresh');
        }

        $('#editModal').find('.disabled').selectpicker('val',rowData.disabled);
        $('#editModal').find('.disabled').selectpicker('refresh');
        $('#editModal').find('.isOrder').selectpicker('val',rowData.is_order);
        $('#editModal').find('.isOrder').selectpicker('refresh');
        $('#editModal').find('.price').val(rowData.price);
        $('#editModal').find('.version').val(rowData.version);
        $('#editModal').find('.sketch').val(rowData.sketch);
        $('#editModal').find('.parameter').val(rowData.parameter);
        $('#editModal').find('.feature').val(rowData.feature);
        $('#editModal').find('.range').val(rowData.range);
        $('#editModal').find('.achievement').val(rowData.achievement);
        $('#editModal').find('.remark').val(rowData.remark);
        let standardStr = rowData.standard;
        if(document.getElementById("standardSelEdit")){
            $('#standardSelEdit').selectpicker('val',['noneSelectedText'])
            //document.getElementById("standardSelEdit").options.selectedIndex = 0; //回到初始状态
        }
        $("#standardSelEdit").selectpicker('refresh');//对searchPayState这个下拉框进行重置刷新
        if(standardStr){
            let arr = standardStr.split(",");
            let tempArr = [];
            for(let i=0;i<arr.length;i++){
                let id = arr[i];
                if(!id){
                    continue
                }
                tempArr.push(id);
            }
            $('#standardSelEdit').selectpicker('val',tempArr);
            $("#standardSelEdit").selectpicker('refresh');
        }
        let drawingStr = rowData.drawing;
        if(document.getElementById("drawingSelEdit")){
            $('#drawingSelEdit').selectpicker('val',['noneSelectedText'])
            //document.getElementById("drawingSelEdit").options.selectedIndex = 0; //回到初始状态
        }
        
        $("#drawingSelEdit").selectpicker('refresh');//对searchPayState这个下拉框进行重置刷新
        if(drawingStr){
            let arr = drawingStr.split(",");
            let tempArr = [];
            for(let i=0;i<arr.length;i++){
                let id = arr[i];
                if(!id){
                    continue
                }
                tempArr.push(id);
            }
            $('#drawingSelEdit').selectpicker('val',tempArr);
            $("#drawingSelEdit").selectpicker('refresh');
        }
        $('#editImgWrap').find(".imgItem").remove();
        if(rowData.img){
            let imgArr = rowData.img.split(",");
            $('#editImgWrap').find(".addItem").hide();
            for(let i=0;i<imgArr.length;i++){
                $('#editImgWrap').append('' +
                    '<div class="imgItem">\n ' +
                    '<i title="点击删除" class="fa fa-window-close" aria-hidden="true"></i>\n' +
                    '<img src="/img/'+imgArr[i]+'">\n' +
                    '</div>');
            }
            //图片删除按钮点击事件
            $('.fa-window-close').on('click',function () {
                $(this).parent().remove();
                $('#editImgWrap').find(".addItem").show();
            })
        }
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        //console.log(rowData);
        let id = rowData.id;
        window.parent.confirmAlert("确定删除吗？","与当前相关的数据将全部被删除！",del,id);

    });
    $('#myTable').on("click",".preview",function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        window.open("/detail/"+rid,"_blank");
    })
    initData();
});

function initData() {
    //初始化父类分组过滤数据
    $.post("/main/type/all4device",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            loading(false,2);
            let tList = res.data;
            if(tList){
                for(let i=0;i<tList.length;i++){
                    let item = tList[i].typeItem;
                    $('#filterSelect').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('#filterSelect').append('<span style="color: red;display: block;margin-top: 6px">暂无数据，请先添加!</span>');
            }
            $('#filterSelect').selectpicker('refresh');
        }
    });
    //初始化文件选择
    $.post("/main/file/list4type",{_xsrf:$("#token", parent.document).val(),type:0},function (res) {
        if(res.code===1){
            let tList = res.data;
            if(tList){
                $('#standardSelAdd').html('');
                $('#drawingSelAdd').html('');
                $('#standardSelEdit').html('');
                $('#drawingSelEdit').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#standardSelAdd').append('<option value="'+item.id+'">'+item.ori_name+'</option>');
                    $('#drawingSelAdd').append('<option value="'+item.id+'">'+item.ori_name+'</option>');
                    $('#standardSelEdit').append('<option value="'+item.id+'">'+item.ori_name+'</option>');
                    $('#drawingSelEdit').append('<option value="'+item.id+'">'+item.ori_name+'</option>');
                }
            }else{
                $('#form1 .standardWrap').html('');
                $('#form1 .drawingWrap').html('');
                $('#form1 .standardWrap').append('<span style="display: block;margin-top: 6px">暂无文件，请先添加!</span>');
                $('#form1 .drawingWrap').append('<span style="display: block;margin-top: 6px">暂无文件，请先添加!</span>');
                $('#form2 .standardWrap').html('');
                $('#form2 .drawingWrap').html('');
                $('#form2 .standardWrap').append('<span style="display: block;margin-top: 6px">暂无文件，请先添加!</span>');
                $('#form2 .drawingWrap').append('<span style="display: block;margin-top: 6px">暂无文件，请先添加!</span>');
            }
            $('#standardSelAdd').selectpicker('refresh');
            $('#drawingSelAdd').selectpicker('refresh');
            $('#standardSelEdit').selectpicker('refresh');
            $('#drawingSelEdit').selectpicker('refresh');

        }
    });
    init4select();
}

function init4select(){
    //初始化父类分组过滤数据
    $.post("/main/type/all4device",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            let tList = res.data;
            if(tList){
                typeDataArr = tList;
                $('.typeSelWrapAdd').html('<select class="selectpicker" id="typeChildSelAdd" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
                $('.typeSelWrapEdit').html('<select class="selectpicker" id="typeChildSelEdit" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i].typeItem;
                    $('#typeSelAdd').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSelEdit').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('.typeSelWrapAdd').html('<span style="color: red;display: block;margin-top: 6px">暂无数据，请先添加!</span>');
                $('.typeSelWrapEdit').html('<span style="color: red;display: block;margin-top: 6px">暂无数据，请先添加!</span>');
            }
            $('#typeSelAdd').selectpicker('refresh');
            $('#typeSelEdit').selectpicker('refresh');
            //回到初始状态
            $('#typeSelAdd').selectpicker('val',['noneSelectedText'])
            $("#typeSelAdd").selectpicker('refresh');
            //渲染分组下拉框
            $('#typeSelAdd').on('changed.bs.select', function (e,clickedIndex,newValue,oldValue) {
                if(clickedIndex===undefined){
                    return
                }
                let typeChildArr;
                let item = typeDataArr[clickedIndex];
                gTid = item.typeItem.id;
                typeChildArr = item.typeChildArr;
                $('#relateWrapAdd').html("<span style=\"color: red;display: block;margin-top: 6px\">暂无数据，请先添加!</span>");
                renderChildType(typeChildArr,'Add');
            });
            $('#typeSelEdit').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
                if(clickedIndex===undefined){
                    return
                }
                let typeChildArr;
                let item = typeDataArr[clickedIndex];
                gTid = item.typeItem.id;
                typeChildArr = item.typeChildArr;
                $('#relateWrapEdit').html("<span style=\"color: red;display: block;margin-top: 6px\">暂无数据，请先添加!</span>");
                renderChildType(typeChildArr,'Edit');
            });
        }
    });
}

function add(){
    let name = $('#form1').find('.name').val().trim();
    if (!name){
        swalParent("系统提示",'设备名称不能为空!',"warning");
        return;
    }
    let price = $('#form1').find('.price').val().trim();
    if (!price){
        swalParent("系统提示",'参考费用不能为空!',"warning");
        return;
    }
    let imgSrc = "";
    $('#addImgWrap').find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let tid = $('#typeSelAdd').val();
    if(!tid){
        swalParent("系统提示",'未选择父类分组!',"warning");
        return;
    }
    let ttid = $('#typeChildSelAdd').val();
    if(!ttid){
        swalParent("系统提示",'未选择子类分组!',"warning");
        return;
    }
    let val1 = $('#standardSelAdd').val();
    let tArr = "";
    if(val1&&val1.length!==0){
        $.each(val1,function (i,item) {
            tArr = tArr+","+item;
        });
        tArr = tArr.substring(1,tArr.length);
    }
    let val2 = $('#drawingSelEdit').val();
    let tArr2 = "";
    if(val2&&val2.length!==0){
        $.each(val2,function (i,item) {
            tArr2 = tArr2+","+item;
        });
        tArr2 = tArr2.substring(1,tArr2.length);
    }
    let relateVal = $('#relateAdd').val();
    let relateArr = "";
    if(relateVal&&relateVal.length!==0){
        $.each(relateVal,function (i,item) {
            relateArr += ","+item;
        });
        relateArr = relateArr.substring(1,relateArr.length);
    }
    let formData = formUtil('form1');
    formData["isOrder"] = $('#isOrder').val();
    formData["tid"] = tid;
    formData["ttid"] = ttid;
    formData["img"] = imgSrc;
    formData["standard"] = tArr;
    formData["drawing"] = tArr2;
    formData["relate"] = relateArr;
    formData["disabled"] = $('#disabledSel1').val();
    formData["_xsrf"] = $("#token", parent.document).val();
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
            if (r.code === 1) {
                type = "success";
                init4select();
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
    let name = $('#form2').find('.name').val().trim();
    //let img = $('#edit_picVal').val();
    if (!name){
        swalParent("系统提示",'分组名称不能为空!',"warning");
        return;
    }
    let price = $('#form2').find('.price').val().trim();
    if (!price){
        swalParent("系统提示",'参考费用不能为空!',"warning");
        return;
    }
    let imgSrc = "";
    $('#editImgWrap').find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let tid = $('#typeSelEdit').val();
    if(!tid){
        swalParent("系统提示",'未选择父类分组!',"warning");
        return;
    }
    let ttid = $('#typeChildSelEdit').val();
    if(!ttid){
        swalParent("系统提示",'未选择子类分组!',"warning");
        return;
    }
    let val1 = $('#standardSelEdit').val();
    let tArr = "";
    if(val1&&val1.length!==0){
        $.each(val1,function (i,item) {
            tArr = tArr+","+item;
        });
        tArr = tArr.substring(1,tArr.length);
    }
    let val2 = $('#drawingSelEdit').val();
    let tArr2 = "";
    if(val2&&val2.length!==0){
        $.each(val2,function (i,item) {
            tArr2 = tArr2+","+item;
        });
        tArr2 = tArr2.substring(1,tArr2.length);
    }
    let relateVal = $('#relateEdit').val();
    let relateArr = "";
    if(relateVal&&relateVal.length!==0){
        $.each(relateVal,function (i,item) {
            relateArr += ","+item;
        });
        relateArr = relateArr.substring(1,relateArr.length);
    }
    let formData = formUtil('form2');
    formData["isOrder"] = $('#isOrder2').val();
    formData["tid"] = tid;
    formData["ttid"] = ttid;
    formData["img"] = imgSrc;
    formData["standard"] = tArr;
    formData["drawing"] = tArr2;
    formData["disabled"] = $('#disabledSel2').val();
    formData["relate"] = relateArr;
    formData["_xsrf"] = $("#token", parent.document).val();
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
            if (r.code === 1) {
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
            if (r.code == 1) {
                setTimeout(function () {
                    swalParent("系统提示",r.msg, "success");
                    init4select();
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
            init4select();
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

function preview(oType) {
    let formId = "#form1";
    let imgWrap = "#addImgWrap";
    let typeWrap = "#addTypeSelWrap";
    if(oType==="edit"){
        formId = "#form2";
        imgWrap = "#editImgWrap";
    }
    let name = $(formId).find('.name').val().trim();
    if (!name){
        swalParent("系统提示",'设备名称不能为空!',"warning");
        return false;
    }
    let imgSrc = "";
    $(imgWrap).find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let type = $(typeWrap).find("button").attr("title");
    localStorage.setItem("t-type",type);
    localStorage.setItem("t-name",name);
    localStorage.setItem("t-imgSrc",imgSrc);
    localStorage.setItem("t-sketch",$(formId).find('.sketch').val().trim());
    localStorage.setItem("t-parameter",$(formId).find('.parameter').val().trim());
    localStorage.setItem("t-feature",$(formId).find('.feature').val().trim());
    localStorage.setItem("t-range",$(formId).find('.range').val().trim());
    localStorage.setItem("t-achievement",$(formId).find('.achievement').val().trim());
    window.open("/template/detail","_blank");
}

function refresh() {
    let tid = $('#filterSelect').val();
    if(!tid){
        tid = 0;
    }
    let ttid = $('#filterSelect2').val();
    if(!tid){
        ttid = 0;
    }
    let param = {
        "_xsrf":$("#token", parent.document).val(),
        "tid": tid,
        "ttid": ttid,
    };
    myTable.settings()[0].ajax.data = param;
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
        $('#'+domId).find(".addItem").hide();
        $('#'+domId).append('' +
            '<div class="imgItem">\n ' +
                '<i title="点击删除" class="fa fa-window-close" aria-hidden="true"></i>\n' +
                '<img src="/img/'+picName+'">\n' +
            '</div>');
        //图片删除按钮点击事件
        $('.fa-window-close').on('click',function () {
            $(this).parent().remove();
            $('#'+domId).find(".addItem").show();
        })
    }
}

function renderChildType(typeChildArr,append) {
    //初始化子类分组数据
    if(typeChildArr){
        let tList = typeChildArr;
        $('#typeChildSelWrap'+append).html('');
        if(tList){
            $('#typeChildSelWrap'+append).html('<select class="selectpicker" id="typeChildSel'+append+'" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
            for(let i=0;i<tList.length;i++){
                let item = tList[i].typeChildItem;
                $('#typeChildSel'+append).append('<option value="'+item.id+'">'+item.name+'</option>');
            }
        }else{
            $('#typeChildSelWrap'+append).append('<span style="color: red;display: block;margin-top: 6px">暂无数据，请先添加!</span>');
        }
        $('#typeChildSel'+append).selectpicker({
            noneSelectedText: '下拉选择项目',
            noneResultsText: '无匹配选项',
            maxOptionsText: function (numAll, numGroup) {
                let arr = [];
                arr[0] = (numAll === 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
                arr[1] = (numGroup === 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
                return arr;
            },
        });
        //回到初始状态
        $('#typeChildSel'+append).selectpicker('val',['noneSelectedText'])
        $('#typeChildSel'+append).selectpicker('refresh');
        $('#typeChildSel'+append).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(clickedIndex===undefined){
                return
            }
            let data = tList[clickedIndex].deviceArr;
            renderDevice4relate(data,append);
        });
    }else{
        $('#typeChildSelWrap'+append).html('<span style="color: red;display: block;margin-top: 6px">暂无数据，请先添加!</span>');
    }
}

function renderDevice4relate(data,append){
    $('#relateWrap'+append).html("");
    if(data){
        let arr = data;
        $('#relateWrap'+append).html('<select multiple class="selectpicker" id="relate'+append+'" data-size="10" data-max-options="50" data-live-search="true" data-style="btn-default"></select>');
        for(let i=0;i<arr.length;i++){
            let item = arr[i];
            let name = item.name;
            $('#relate'+append).append('<option deviceName="'+name+'" value="'+item.id+'">'+name+'</option>');
        }
        $('#relate'+append).selectpicker({
            noneSelectedText: '下拉多选关联项目',
            noneResultsText: '无匹配选项',
            maxOptionsText: function (numAll, numGroup) {
                let arr = [];
                arr[0] = (numAll === 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
                arr[1] = (numGroup === 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
                return arr;
            },
        });
        $('#relate'+append).selectpicker('refresh');
    }else{
        $('#relateWrap'+append).html("<span style=\"color:red;display:block;margin-top: 6px\">暂无数据，请先添加!</span>");
    }

}

function renderChildType2() {
    let tid = $('#filterSelect').val();
    //初始化子类分组数据
    $.post("/main/typeChild/queryByTid",{_xsrf:$("#token",parent.document).val(),tid:tid},function (res) {
        if(res.code===1){
            let tList = res.data;
            $('#filterSelect2').html('');
            $('#filterSelect2').append('<option value="0">全部设备</option>');
            if(tList&&tid!=0){
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#filterSelect2').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }
            $('#filterSelect2').selectpicker('refresh');
        }
        refresh();
    });
}

function findByTid(tid) {
    let resArr = [];
    for(let i=0;i<typeDataArr.length;i++){
        let typeId = typeDataArr[i].typeItem.id;
        let typeChildArr = typeDataArr[i].typeChildArr;
        if(typeId===tid){
            resArr = typeChildArr;
        }
    }
    return resArr;
}
function findByTtid(ttid,dataArr) {
    let resArr = [];
    for(let i=0;i<dataArr.length;i++){
        let typeChildId = dataArr[i].typeChildItem.id;
        let typeChildArr = dataArr[i].deviceArr;
        if(typeChildId===ttid){
            resArr = typeChildArr;
        }
    }
    return resArr;
}


