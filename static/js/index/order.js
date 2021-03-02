
function addOrder() {
    let num = $('#lib').find("span").html();
    $('#lib').find("span").html(parseInt(num)+1);
    $('#lib').show();
    //获取本地存储
    let localLibTemp = localStorage.getItem("lib");
    let localOutArr = [];
    let localInnerArr = [];
    let outItem = {};
    if(localLibTemp){
        localOutArr = JSON.parse(localLibTemp);
        outItem = findByType(info.typeName,localOutArr);
        localInnerArr = outItem.Data;
    }
    if(!localOutArr){
        localOutArr = [];
    }
    if(!outItem){
        outItem = {};
    }
    if(!localInnerArr){
        localInnerArr = [];
    }
    let id = info.id;
    let innerItem = findById(id,localInnerArr);
    if(!innerItem){
        innerItem = {};
        innerItem.Name = info.name;
        innerItem.DeviceId = info.id;
        innerItem.Ttid = info.ttid;
        innerItem.Type = info.typeName;
        innerItem.Count = 1;
        innerItem.DetectionCycle = info.detectionCycle;
        localInnerArr.push(innerItem);
    }else{
        innerItem.Count = innerItem.Count+1;
        //localInnerArr.splice(1,1,innerItem);
        localInnerArr = replaceItemById(innerItem,localInnerArr);
    }

    if(outItem.Type){
        outItem.Count = outItem.Count+1;
        outItem.Data = localInnerArr;
        //localOutArr.splice(1,1,outItem);
        localOutArr = replaceItemByType(outItem,localOutArr);
    }else{
        outItem.Tid = info.tid;
        outItem.Type = info.typeName;
        outItem.Request = info.request;
        outItem.Count = 1;
        outItem.Data = localInnerArr;
        localOutArr.push(outItem);
    }

    localStorage.setItem("lib",JSON.stringify(localOutArr));
    mySwal("已成功加入本地实验列表","提示：需提交实验方可作系统确认","success");
    renderModalLib();
}

function showProtocolForOrder() {
    loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        mySwal("系统提示","该操作需用户登录，请先登录！","warning");
        return false;
    }
    let localLibTemp = localStorage.getItem("lib");
    if(!localLibTemp){
        showTip("当前未选中任何项目！")
        return false;
    }
    localOutArr = JSON.parse(localLibTemp);
    if(localOutArr.length===0){
        showTip("当前未选中任何项目！")
        return false;
    }
    window.clearInterval(signTimerIndex);
    signTimer();
    $('#deviceInfo').hide(200);
    $('#deviceWrap').hide(200);
    $('.filterWrap').hide(200);
    $('#typeWrap').hide();
    $('#searchWrap').hide(200);
    $('#protocolInfoTip').show(200);
    //$('#pdfBtn').show(200);
    $('#protocolInfo').show(200);
    $('.submitBtn').show(200);
    $('#signCode').show(200);
    renderProtocol();
    $('#libModal').modal("hide");
    $('#lib img').attr("src","../static/img/back.png");
    $('#lib img').attr("title","返回项目信息");
}

function renderModalLib() {
    let localLibTemp = localStorage.getItem("lib");
    if(localLibTemp){
        localOutArr = JSON.parse(localLibTemp);
        let count = 0;
        let errData = false;
        for(let i=0;i<localOutArr.length;i++){
            let outItem = localOutArr[i];
            let innerArr = outItem.Data;
            let continueFlag = false;
            //防止项目数据为空
            for(let j=0;j<innerArr.length;j++){
                if(!innerArr[j].Name){
                    localOutArr.pop(outItem);
                    continueFlag = true;
                    errData = true;
                    break
                }
            }
        }
        if(errData){
            localStorage.setItem("lib",JSON.stringify(localOutArr));
        }
        if(localOutArr&&localOutArr.length===0){
            return false;
        }
        let cNum = cacAllNum(localOutArr);
        $('#lib').find("span").html(cNum);
        $('#lib').show();
        //熏染modal
        $('.libItemWrap').html("");
        for(let i=0;i<localOutArr.length;i++){
            let outItem = localOutArr[i];
            let tid = outItem.Tid;
            let typeName = outItem.Type;
            let innerArr = outItem.Data;
            $('.libItemWrap').append('' +
                '<div class="typeItem">\n' +
                '   <div class="typeName">'+typeName+'</div>\n' +
                '   <hr style="border-top:1px dashed rgba(0,0,0,0.1)">\n' +
                '<div class="dWrap'+tid+'"></div>'+
                '</div>');
            for(let j=0;j<innerArr.length;j++){
                let dName = innerArr[j].Name;
                let title = dName;
                dName = stringUtil.maxLength(dName,40);
                let dId = innerArr[j].DeviceId;
                let count = innerArr[j].Count;
                if(count<10){
                    count = "0"+count;
                }
                $('.dWrap'+tid).append('<div class="dItem">\n<input type="hidden" value="'+dId+'" class="id">\n<i class="fa fa-files-o" aria-hidden="true"></i>\n<span class="dName" title="'+title+'">'+dName+'</span>\n<div class="countWrap" my-data="'+typeName+'" my-id="'+dId+'">\n<span class="cac cac1">-</span>&nbsp;&nbsp;<span class="count">'+count+'</span>&nbsp;&nbsp;<span class="cac cac2">+</span>\n</div>\n</div>');
            }
        }
    }
    $('.cac').on("click",function () {
        let count = $(this).parent().find(".count").html();
        count = parseInt(count);
        if($(this).hasClass("cac1")){
            if(count===0){
                return
            }
            count = count-1;
        }else{
            count = count+1;
        }
        let countTxt = count;
        if(count<10){
            countTxt = "0"+count;
        }
        let type = $(this).parent().attr("my-data");
        let id = $(this).parent().attr("my-id");
        let outItem = findByType(type,localOutArr);
        let innerItem = findById(id,outItem.Data);
        innerItem.Count = count;
        let innerArr = replaceItemById(innerItem,outItem.Data);
        outItem.Data = innerArr;
        let cNum = cacAllNum(localOutArr);
        outItem.Count = cNum;
        let outArr = replaceItemByType(outItem,localOutArr);
        localStorage.setItem("lib",JSON.stringify(outArr));
        $(this).parent().find(".count").html(countTxt);
        $('#lib').find("span").html(cNum);
    });
}

function renderProtocol() {
    loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        return false;
    }
    let localLibTemp = localStorage.getItem("lib");
    if(localLibTemp){
        localOutArr = JSON.parse(localLibTemp);
    }
    let errData = false;
    for(let i=0;i<localOutArr.length;i++){
        let outItem = localOutArr[i];
        let innerArr = outItem.Data;
        let continueFlag = false;
        //防止项目数据为空
        for(let j=0;j<innerArr.length;j++){
            if(!innerArr[j].Name){
                localOutArr.pop(outItem);
                continueFlag = true;
                errData = true;
                break
            }
        }
    }
    if(localOutArr&&localOutArr.length===0){
        return false;
    }
    $('#tableWrap').html("");
    for(let i=0;i<localOutArr.length;i++){
        let outItem = localOutArr[i];
        let tid = outItem.Tid;
        let typeName = outItem.Type;
        let detectionCycle = outItem.DetectionCycle;
        let request = outItem.Request;
        let innerArr = outItem.Data;
        let devices = "";
        for(let j=0;j<innerArr.length;j++){
            let item = innerArr[j];
            let count = item.Count;
            let name = item.Name;
            let range = item.DetectionCycle;
            devices += "<i class=\"fa fa-files-o\" aria-hidden=\"true\"></i>&nbsp;"+name+"*"+count+"&nbsp;&nbsp;&nbsp;<i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i>&nbsp;服务周期:"+range+"个工作日<br/>";
        }

        $('#tableWrap').append('' +
            '<table id="'+tid+'">\n' +
            '<tr style="color: #6195ff;font-size: 20px;">\n' +
            '   <td class="tabtxt2" style="width: 7%;">所属分类</td>\n' +
            '   <td colspan="4" class="type">'+typeName+'</td>\n' +
            '   <td class="typeMore"><i title="隐藏更多" class="fa fa-angle-down" aria-hidden="true"></i></td>\n' +
            '</tr>\n' +
            '<tr >\n' +
            '   <td class="tabtxt2">已选项目</td>\n' +
            '  <td colspan="5" height="75" class="allDevice">'+devices+'</td>\n' +
            '</tr>\n                                ' +
            /*'<tr>\n' +
            '   <td class="tabtxt2">检测周期</td>\n' +
            '   <td colspan="5" class="detection_cycle">'+detectionCycle+'个工作日</td>\n                                ' +
            '</tr>\n' +*/
            '<tr>\n                                    ' +
            '   <td class="tabtxt2">检测报告</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <input type="radio" checked value="无需检测报告（默认）" name="detection_report"/>&nbsp;无需检测报告（默认）\n                                        ' +
            '       <input type="radio" value="中文检测报告（加收200元）" name="detection_report"/>&nbsp;中文检测报告（加收200元）\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td class="tabtxt2">样品编号</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <input type="text" class="form-control"  maxlength="255" name="sample_code" placeholder="请输入样品编号">\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td class="tabtxt2">样品名称</td>\n                                    ' +
            '   <td colspan="2">\n                                        ' +
            '       <input type="text" class="form-control"  maxlength="255" name="sample_name" placeholder="请输入样品名称">\n   ' +
            '   </td>\n                                    ' +
            '   <td class="tabtxt2" style="text-align: right;padding-right: 15px;">样品数量</td>\n                                    ' +
            '   <td colspan="2">\n                                        ' +
            '       <input type="text" class="form-control" oninput=\'this.value=this.value.replace(/\\D/gi,"")\' maxlength="2" name="sample_count" placeholder="请输入样品数量">\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td class="tabtxt2">样品处理</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <input type="radio" value="一般样品回收（50元）" checked="true" name="sample_processing"/>&nbsp;一般样品回收（50元）\n                                        ' +
            '       <input type="radio" value="样品不回收" name="sample_processing"/>&nbsp;样品不回收\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td class="tabtxt2">关于样品</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <input type="text" class="form-control" name="about" placeholder="样品信息">\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td height="175" class="tabtxt2">实验参数要求</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <textarea class="form-control" id="parameter'+tid+'Content" name="parameter" ></textarea>\n                                        ' +
            '       <div class="editor" id="parameter'+tid+'">'+request+'</div>\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td height="175" class="tabtxt2">其他特殊要求</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <textarea class="form-control" id="about'+tid+'Content" name="about" placeholder="可插入文字图片"></textarea>\n                                        ' +
            '       <div class="editor" id="about'+tid+'">可插入文字图片</div>\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                                ' +
            '<tr>\n                                    ' +
            '   <td height="175" class="tabtxt2">参考结果图片</td>\n                                    ' +
            '   <td colspan="5">\n                                        ' +
            '       <textarea class="form-control" id="result'+tid+'Content" name="result" placeholder="可插入文字图片"></textarea>\n                                        ' +
            '       <div class="editor" id="result'+tid+'">可插入文字图片</div>\n                                    ' +
            '   </td>\n                                ' +
            '</tr>\n                            ' +
            '</table>');
        $('#parameter'+tid+"Content").val(request);
    }
    renderClick();
}

function findByType(type,localArr) {
    if(!localArr||localArr.length===0){
        return false
    }
    let backItem = "";
    for(let i=0;i<localArr.length;i++){
        let item = localArr[i];
        let localType = item.Type;
        if(type===localType){
            backItem = item;
            break
        }
    }
    return backItem;
}

function findById(id,localArr) {
    if(!localArr||localArr.length===0){
        return false
    }
    let backItem = "";
    for(let i=0;i<localArr.length;i++){
        let item = localArr[i];
        let localId = item.DeviceId;
        if(id===localId){
            backItem = item;
            break
        }
    }
    return backItem;
}

function replaceItemById(item,arr) {
    for(let i=0;i<arr.length;i++){
        if(item.Id==arr[i].DeviceId){
            arr[i] = item;
            break
        }
    }
    return arr;
}

function replaceItemByType(item,arr) {
    for(let i=0;i<arr.length;i++){
        if(item.Type==arr[i].Type){
            arr[i] = item;
            break
        }
    }
    return arr;
}

function cacAllNum(arr) {
    let count = 0;
    for(let i=0;i<arr.length;i++){
        let innerArr = arr[i].Data;
        for(let j=0;j<innerArr.length;j++){
            count += innerArr[j].Count;
        }
    }
    return count;
}

function showTip(txt) {
    $('#modalTip').html(txt);
    setTimeout(function () {
        $('#modalTip').html("");
    },5000);
}

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

function signTimer() {
    signTimerIndex = setInterval(function () {
        if($('#loginFlag').val()==="0"){
            return false;
        }
        $.ajax({
            url : "/signData",
            type : "POST",
            dataType : "json",
            cache : false,
            data : {
                _xsrf:$('#token').val(),code:signCode
            },
            beforeSend:function(){
                //$('#loading').fadeIn(200);
            },
            success : function(res,status,xhr) {
                //console.log(xhr.status+" "+dateUtil.nowTime());
                if(xhr.status=="403"){
                    window.clearInterval(signTimerIndex);
                }
                let imgSrc = res.data;
                if(!imgSrc){
                    return false;
                }
                let localSrc = $('.sign img').attr("src");
                if(localSrc===imgSrc){
                    return  false;
                }
                $('.sign').html("<img src='"+imgSrc+"'>");
            },
            err:function(){
                window.clearInterval(signTimerIndex);
            },
            complete:function () {
                //$('#loading').fadeOut(200);
            }
        });

        /*$.post("/signData",{_xsrf:$('#token').val(),code:signCode},function (res) {
            let imgSrc = res.data;
            if(!imgSrc){
                return false;
            }
            let localSrc = $('.sign img').attr("src");
            if(localSrc===imgSrc){
                return  false;
            }
            $('.sign').html("<img src='"+imgSrc+"'>");
        })*/
    },3000);
}

function renderInfo() {
    $('.company').html(user.Company);
    $('.invoice').html(user.Company);
    $('.invoice_code').html(user.InvoiceCode);
    $('.name').html(user.Name);
    $('.phone').html(user.Phone);
    $('.email').html(user.Email);
    $('.address').html(user.Address);
    $('.teacher').html(user.Teacher);
    $('.teacher_phone').html(user.TeacherPhone);
    $('.teacher_mail').html(user.TeacherMail);
    $('.myCompany').html(lInfo.company);
    $('.myCompanyPhone').html(lInfo.phone);
    $('.home').html(lInfo.home);
    $('.myEmail').html(lInfo.email);
    $('.myWechat').html(lInfo.wechat);
    $('.myAddress').html(lInfo.address);
    $('.city').html(lInfo.city);
    $('.mySign').html(lInfo.sign);
    $('.date').html(dateUtil.NowDate())
}

function renderClick() {
    //富文本监听事件
    $('.editor').on("click",function () {
        let id = $(this).attr("id")+"Content";
        let val = $(this).val();
        openWindow("/main/editor?domId="+id,"中科科辅",1200,600);
    });

    //协议隐藏显示
    $('.typeMore i').on("click",function () {
        if($(this).hasClass("fa-angle-down")){
            $(this).removeClass("fa-angle-down");
            $(this).addClass("fa-angle-left");
            $(this).attr("title","显示更多");
            $(this).parent().parent().siblings().hide(200);
        }else{
            $(this).addClass("fa-angle-down");
            $(this).removeClass("fa-angle-left");
            $(this).attr("title","隐藏更多");
            $(this).parent().parent().siblings().show(200);
        }
    });
}

function submitOrder() {
    let localLibTemp = localStorage.getItem("lib");
    if(!localLibTemp){
        showTip("当前未选中任何项目！")
        return false;
    }
    let localOutArr = JSON.parse(localLibTemp);
    let dataArr = [];
    for(let i=0;i<localOutArr.length;i++){
        let item = localOutArr[i];
        let tid = item.Tid;
        let Protocol = {};
        Protocol.Sign = $('.sign img').attr("src");
        Protocol.Date = $('.date').html();
        Protocol.Pay = $("input[name='pay']:checked").val();
        Protocol.TestResult = $("input[name='test_result']:checked").val();
        Protocol.City = $('.city').html();
        Protocol.SampleName = $('#'+tid).find("input[name='sample_name']").val().trim();
        Protocol.SampleCount = $('#'+tid).find("input[name='sample_count']").val();
        Protocol.SampleCode = $('#'+tid).find("input[name='sample_code']").val().trim();
        Protocol.DetectionCycle = parseInt($('#'+tid).find('.detection_cycle').html());
        Protocol.DetectionReport = $('#'+tid).find("input[name='detection_report']:checked").val();
        Protocol.SampleProcessing = $('#'+tid).find("input[name='sample_processing']:checked").val();
        Protocol.About = $('#'+tid).find("input[name='about']").val().trim();
        Protocol.Parameter = $('#parameter'+tid+"Content").val();
        Protocol.Other = $('#about'+tid+"Content").val();
        Protocol.Result = $('#result'+tid+"Content").val();
        item.Protocol = Protocol;
        dataArr.push(item);
    }
    let formData = {};
    formData["barcode"] = "B"+lInfo.rid;
    formData["data"] = JSON.stringify(dataArr);
    formData["_xsrf"] = $("#token", parent.document).val();
    $.ajax({
        url : "/order/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            $('.preloader').fadeIn(200);
        },
        success : function(r) {
            if (r.code === 1) {
                imgUtil.addWatermark("protocolInfo","中科科辅");
                imgUtil.domShot("protocolInfo",imgUtil.pagePdf,"中科科辅服务协议/"+dateUtil.nowTime());
                localStorage.setItem("lib","");
                $('#libModal').modal('hide');
                $('#lib').find("span").html(0);
                $('#lib').hide();
                $('.back').click();
                $('.sign').html("扫码或点击此处完成签字");
                $('#tableWrap').html("");
                $('#protocolInfoTip').hide();
                //$('#pdfBtn').hide(200);
                $('#protocolInfo').hide();
                $('#signCode').hide();
                $('.wat').remove();
                window.clearInterval(signTimerIndex);
                $('.submitBtn').hide(200);
                $('#deviceInfo').show();
                $('#deviceWrap').show();
                $(this).find("img").attr("src","../static/img/lib.png");
                $('#typeWrap').show();
                $('.filterWrap').show(200);
                $('#searchWrap').show();
                mySwal("系统提示",r.msg+",客服将尽快确认！","success");
            }else{
                mySwal("系统提示",r.msg,"error");
            }

        },
        complete:function () {
            $('.preloader').fadeOut(200);
        }
    });
}

function mySwal(title,msg,type) {
    setTimeout(function () {
        swal(title,msg,type);
    },100)
}