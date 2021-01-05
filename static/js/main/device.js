let myTable;
let prefix = "/main/device";
window.onresize = function() {
    let bodyHeight = window.innerHeight;
    console.log("bodyHeight:"+bodyHeight);
    //设置表格高度
    let tHeight = bodyHeight-210;
    console.log("tHeight:"+tHeight);
    $('.dataTables_scrollBody').css("height",tHeight+"px");
};

$(document).ready(function() {

    if(!storageTest(window.localStorage)){
        alert("当前浏览器localStorage不可用，建议使用谷歌浏览器");
    }

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
            $('#tabHref01').addClass("active");
            $(this).removeClass("active");
            $('#tab1').fadeOut(200);
            $("#tab2").fadeIn(200);
        }
    });

    // 中文重写select 查询为空提示信息
    $('.selectpicker').selectpicker({
        noneSelectedText: '下拉选择分组',
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
    //渲染分组下拉框
    /*$('.pSelWrap').find("button").on("change",function () {
        let tid = $(this).parent().find("select").val();
        renderChildType(tid);
    });*/
    $('.pSelWrap').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
        let selected = $(e.currentTarget).val();
        renderChildType(selected);
    });
    //初始化子类分组数据
    $.post("/main/type/all",{_xsrf:$("#token", parent.document).val()},function (res) {
        if(res.code===1){
            loading(false,2);
            let tList = res.data;
            if(tList){
                $('#typeSel1').html('');
                $('#typeSel2').html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#typeSel1').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSel2').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('#selWrap1').html('');
                $('#selWrap2').html('');
                $('#selWrap1').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
                $('#selWrap2').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
            }
            $('#typeSel1').selectpicker('refresh');
            $('#typeSel2').selectpicker('refresh');
            let tid = $('#typeSel1').val();
            renderChildType(tid);
        }
    });


    $('#uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1000,600);
    });

    $('#edit_uploadPic').on('click',function () {
        openWindow("/main/uploadPic","中科科辅",1000,600);
    });

    $('#form1').find('.addItem').on("click",function () {
        let arr = $('#form1').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
        }
        openWindow("/main/uploadPic?domId=addImgWrap","中科科辅",1000,600);
    });

    $('#form2').find('.addItem').on("click",function () {
        let arr = $('#form2').find('.imgItem');
        if(arr.length>4){
            swalParent("系统提示","最多只上传5张图片","warning");
            return
        }
        openWindow("/main/uploadPic?domId=editImgWrap","中科科辅",1000,600);
    });

    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id");
        let val = $(this).val();
        localStorage.setItem(id,val);
        openWindow("/main/editor?domId="+id,"中科科辅",1000,600);
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
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [0,4,10] }],//指定哪些列不排序
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
            { data: 'typeName'},
            { data: 'name',"render":function (data) {
                    return stringUtil.maxLength(data,8);
                } },
            { data: 'disabled',"render":function (data) {
                    if(data==="0"){
                        return "<span style='color:green'>上线</span>";
                    }else{
                        return "<span style='color:red'>下架</span>";
                    }
                }},
            { data: 'sketch',"render":function (data) {
                    return stringUtil.maxLength(data,8);
                } },
            { data: 'view',"render":function (data) {
                    return data;
                } },
            { data: 'order',"render":function (data) {
                    return data;
                } },
            { data: 'reservation',"render":function (data) {
                    return data;
                } },
            { data: 'updated',"render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: 'created',"render":function (data,type,row,meta) {
                    let unixTimestamp = new Date(data);
                    let commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: null,"render":function () {
                    let html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-info btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='preview btn btn-success btn-xs'></i>预览</a>&nbsp;"
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
        "drawCallback": function(settings) {
            let api = this.api();
            // 输出当前页的数据到浏览器控制台
            //console.log( api.rows( {page:'current'} ).data );
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
        $('#detailModal').find('.title').html(rowData.title);
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
        let unixTimestamp = new Date(created);
        let commonTime = unixTimestamp.toLocaleString('chinese',{hour12:false});
        $('#detailModal').find('.created').html(commonTime);

        let updated = rowData.updated;
        if(updated){
            let unixTimestamp = new Date(updated) ;
            updated = unixTimestamp.toLocaleString('chinese',{hour12:false});
        }else{
            updated = "暂无更新";
        }

        $('#detailModal').find('.updated').html(updated);
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-info",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#id').val(rowData.id);
        $('#editModal').find('.name').val(rowData.name);
        $('#editModal').find('.disabled').selectpicker('val',rowData.disabled);
        $('#editModal').find('.disabled').selectpicker('refresh');
        $('#editModal').find('.isOrder').selectpicker('val',rowData.is_order);
        $('#editModal').find('.isOrder').selectpicker('refresh');
        $('#editModal').find('.title').val(rowData.title);
        $('#editModal').find('.source').val(rowData.source);
        $('#editModal').find('.sketch').val(rowData.sketch);
        $('#editModal').find('.parameter').val(rowData.parameter);
        $('#editModal').find('.feature').val(rowData.feature);
        $('#editModal').find('.range').val(rowData.range);
        $('#editModal').find('.achievement').val(rowData.achievement);
        $('#editModal').find('.remark').val(rowData.remark);
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
    $('#myTable').on("click",".preview",function (e) {
        rowData = myTable.row($(this).closest('tr')).data();
        let rid = rowData.rid;
        window.open("/detail/"+rid,"_blank");
    })

} );

function add(){
    let name = $('#form1').find('.name').val().trim();
    if (!name){
        swalParent("系统提示",'设备名称不能为空!',"warning");
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
    let tid = $('#typeSel3').val();
    if(!tid){
        swalParent("系统提示",'未选择子类分组!',"warning");
        return;
    }
    let formData = formUtil('form1');
    formData["isOrder"] = $('#isOrder').val();
    formData["tid"] = tid;
    formData["img"] = imgSrc;
    formData["disabled"] = $('#disabledSel1').val();
    formData["_xsrf"] = $("#token", parent.document).val();
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
            if (r.code === 1) {
                type = "success";
                reset();
            }
            swalParent("系统提示",r.msg,type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
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
    let imgSrc = "";
    $('#editImgWrap').find(".imgItem").each(function () {
        let src = $(this).find("img").attr("src");
        imgSrc = imgSrc+","+src;
    });
    if(imgSrc){
        imgSrc = imgSrc.substring(1,imgSrc.length);
        imgSrc = imgSrc.replaceAll("/img/","");
    }
    let tid = $('#typeSel4').val();
    if(!tid){
        swalParent("系统提示",'未选择子类分组!',"warning");
        return;
    }
    let formData = formUtil('form2');
    formData["isOrder"] = $('#isOrder2').val();
    formData["tid"] = tid;
    formData["img"] = imgSrc;
    formData["disabled"] = $('#disabledSel2').val();
    formData["_xsrf"] = $("#token", parent.document).val();
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
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            if (r.code == 1) {
                setTimeout(function () {
                    swalParent("系统提示",r.msg, "success");
                    refresh();
                },100);
            }else{
                swalParent("系统提示",r.msg, "error");
            }
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    })
}

function preview(oType) {
    let formId = "#form1";
    let imgWrap = "#addImgWrap";
    let typeWrap = "#selWrap1";
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

function reset() {
    $(":input").each(function () {
        $(this).val("");
    });
    $('.addItem').show();
    $('.imgItem').html("");
    $("textarea").each(function () {
        $(this).val("");
    });
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

function loading(flag) {
    window.parent.loading(flag);
}
window.onresize = function() {
    let height = window.innerHeight-200;
    $('.dataTables_scrollBody').css("height",height+"px");
};

function renderChildType(tid) {
    if(!tid){
        return
    }
    //初始化子类分组数据
    $.post("/main/typeChild/queryByTid",{_xsrf:$("#token",parent.document).val(),tid:tid},function (res) {
        if(res.code===1){
            let tList = res.data;
            $('#selWrap3').html('');
            $('#selWrap4').html('');
            if(tList){
                $('#selWrap3').html('<select id="typeSel3" class="selectpicker" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
                $('#selWrap4').html('<select id="typeSel4" class="selectpicker" data-size="10" data-max-options="5" data-live-search="true" data-style="btn-default"></select>');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    $('#typeSel3').append('<option value="'+item.id+'">'+item.name+'</option>');
                    $('#typeSel4').append('<option value="'+item.id+'">'+item.name+'</option>');
                }
            }else{
                $('#selWrap3').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
                $('#selWrap4').append('<span style="color: red;display: block;margin-top: 5px">暂无数据，请先添加!</span>');
            }
            $('#typeSel3').selectpicker('refresh');
            $('#typeSel4').selectpicker('refresh');
        }
    });
}

