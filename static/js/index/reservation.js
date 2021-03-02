
function addReservation(){

    let date = $('.clickActive').attr("date");
    let timeId = $('.clickActive').attr("timeId");
    //let message = $('#message').val().trim();
    let tid = info.tid;
    let Protocol = {};
    Protocol.Sign = $('.sign img').attr("src");
    Protocol.Date = $('.date').html();
    Protocol.Pay = $("input[name='pay']:checked").val();
    Protocol.TestResult = $("input[name='test_result']:checked").val();
    Protocol.City = $('.city').html();
    Protocol.DeviceId = info.id;
    Protocol.Tid = info.tid;
    Protocol.SampleName = $('#'+tid).find("input[name='sample_name']").val().trim();
    Protocol.SampleCount = $('#'+tid).find("input[name='sample_count']").val();
    Protocol.SampleCode = $('#'+tid).find("input[name='sample_code']").val().trim();
    Protocol.DetectionCycle = $('#'+tid).find('.detection_cycle').html();
    Protocol.DetectionReport = $('#'+tid).find("input[name='detection_report']:checked").val();
    Protocol.SampleProcessing = $('#'+tid).find("input[name='sample_processing']:checked").val();
    Protocol.About = $('#'+tid).find("input[name='about']").val().trim();
    Protocol.Parameter = $('#parameter'+tid+"Content").val();
    Protocol.Other = $('#about'+tid+"Content").val();
    Protocol.Result = $('#result'+tid+"Content").val();

    //let formData = formUtil('addForm');
    let formData = {};
    formData["tid"] = info.tid;
    formData["deviceId"] = $('#deviceId').val();
    formData["date"] = date;
    formData["_xsrf"] = $("#token", parent.document).val();
    formData["timeId"] = timeId;
    formData["barcode"] = "B"+lInfo.rid;
    formData["protocol"] = JSON.stringify(Protocol);
    $.ajax({
        url : "/reservation/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : formData,
        beforeSend:function(){
            $('.preloader').fadeIn(100);
        },
        success : function(r) {
            if (r.code === 1) {
                imgUtil.addWatermark("protocolInfo","中科科辅");
                imgUtil.domShot("protocolInfo",imgUtil.pagePdf,"中科科辅服务协议/"+dateUtil.nowTime());
                renderTime();
                $('#message').val("");
                $('#lib').click();
                let selectDate = $('#deviceId').val()+","+date+","+timeId;
                localStorage.setItem("selectDate",selectDate);
                mySwal("系统提示",r.msg+"，客服将尽快确认！","success");
            }else{
                mySwal("系统提示",r.msg,"error");
            }
        },
        complete:function () {
            $('.preloader').fadeOut(100);
        }
    });
}

function renderTime(){
    let deviceId;
    let wrapObj;
    deviceId = $('#deviceId').val();
    let week = $('.weekWrapActive').attr("data");
    wrapObj = $('#dateTable');
    $('.preloader').fadeIn(200);
    $.post("/reservation/timeQuery",{_xsrf:$("#token", parent.document).val(),deviceId:deviceId,week:week},function (res) {
        if(res.code===1){
            $('.preloader').fadeOut(200);
            let tList = res.data.resArr;
            let now = res.data.now;
            if(tList){
                let nowYear = new Date().getFullYear();
                wrapObj.html('');
                for(let i=0;i<tList.length;i++){
                    let item = tList[i];
                    let dataList = item.data;
                    dataList.sort(stringUtil.compare("tStamp"));
                    if(i===0){
                        wrapObj.append('<tr id="tr'+i+'"></tr>');
                        for(let j=0;j<dataList.length;j++){
                            let item2 = dataList[j];
                            let date = item2.date;
                            $('#tr'+i).append('<th>'+date+'</th>');
                        }
                    }else{
                        wrapObj.append('<tr id="tr'+i+'"></tr>');
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
                                let t = date+" "+ time.substring(0,5)+":00";
                                let timeFlag = dateUtil.compareTime(t,now);
                                if(!timeFlag||isUse==1){
                                    $('#tr'+i).append('<td deviceId="'+deviceId+'" date="'+date+'" timeId="'+timeId+'">-</td>');
                                }else{
                                    //console.log(t);
                                    $('#tr'+i).append('<td date="'+date+'" timeId="'+timeId+'" time="'+item2.time+'" class="click '+date+'">可预约</td>');
                                }
                            }else{
                                $('#tr'+i).append('<td >'+time+'</td>');
                            }
                        }
                    }
                }
                $('.click').on("click",function () {
                    loginFlag = $('#loginFlag').val();
                    if(loginFlag==="0"){
                        mySwal("系统提示","该操作需用户登录，请先登录！","warning");
                        return false;
                    }
                    if($(this).hasClass("clickActive")){
                        mySwal("已从本地预约列表移除","务必填写协议及实验要求！","info");
                        $(this).removeClass("clickActive");
                    }else{
                        $('.clickActive').removeClass("clickActive");
                        mySwal("已加入本地预约列表","务必填写协议及实验要求！","info");
                        $(this).addClass("clickActive");
                    }
                });
                renderDateSelect();
            }else{
                wrapObj.html('');
                wrapObj.append('<span style="color: red;display: block;margin-top: 6px">暂无可选时间，请先添加!</span>');
            }
        }
    });

}

function showProtocolForReservation() {
    loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        mySwal("系统提示","该操作需用户登录，请先登录！","warning");
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
    $('.submitBtn').html("提交预约");
    $('.submitBtn').show(200);
    $('#signCode').show(200);
    renderProtocolForReservation();
    $('#libModal').modal("hide");
    $('#lib img').attr("src","../static/img/back.png");
    $('#lib').show();
    $('#lib span').hide();
    $('#lib').attr("title","返回项目信息");
}

function renderProtocolForReservation() {
    loginFlag = $('#loginFlag').val();
    if(loginFlag==="0"){
        return false;
    }

    $('#tableWrap').html("");
    let tid = info.tid;
    let name = info.name;
    let range = info.detectionCycle;
    let deviceDom = "<i class=\"fa fa-files-o\" aria-hidden=\"true\"></i>&nbsp;"+name+"&nbsp;&nbsp;&nbsp;<i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i>&nbsp;服务周期:"+range+"个工作日<br/>";
    let dateTime = $('.clickActive').attr("date")+" "+$('.clickActive').attr("time");
    $('#tableWrap').append('' +
        '<table id="'+tid+'">\n' +
        '<tr style="color: #6195ff;font-size: 20px;">\n' +
        '   <td class="tabtxt2" style="width: 7%;">所属分类</td>\n' +
        '   <td colspan="4" class="type">'+info.typeName+'</td>\n' +
        '   <td class="typeMore"><i title="隐藏更多" class="fa fa-angle-down" aria-hidden="true"></i></td>\n' +
        '</tr>\n' +
        '<tr >\n' +
        '   <td class="tabtxt2">已选项目</td>\n' +
        '  <td colspan="5" height="75" class="allDevice">'+deviceDom+'</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '   <td class="tabtxt2">预约时间</td>\n' +
        '   <td colspan="5" class="detection_cycle">'+dateTime+'</td>\n                                ' +
        '</tr>\n' +
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
        '   </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '   <td class="tabtxt2">样品处理</td>\n' +
        '   <td colspan="5">\n' +
        '       <input type="radio" value="一般样品回收（50元）" checked="true" name="sample_processing"/>&nbsp;一般样品回收（50元）\n                                        ' +
        '       <input type="radio" value="样品不回收" name="sample_processing"/>&nbsp;样品不回收\n                                    ' +
        '   </td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '   <td class="tabtxt2">关于样品</td>\n' +
        '   <td colspan="5">\n' +
        '       <input type="text" class="form-control" name="about" placeholder="样品信息">\n                                    ' +
        '   </td>\n' +
        '</tr>\n                                ' +
        '<tr>\n                                    ' +
        '   <td height="175" class="tabtxt2">实验参数要求</td>\n                                    ' +
        '   <td colspan="5">\n                                        ' +
        '       <textarea class="form-control" id="parameter'+tid+'Content" name="parameter" ></textarea>\n                                        ' +
        '       <div class="editor" id="parameter'+tid+'">'+info.request+'</div>\n                                    ' +
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
    $('#parameter'+tid+"Content").val(info.request);
    renderClick();
}

function renderDateSelect() {
    let selectDate = localStorage.getItem("selectDate");
    if(!selectDate){
        return
    }
    let arr = selectDate.split(",")
    let deviceId = arr[0];
    let date = arr[1];
    let timeId = arr[2];
    $('td').each(function () {
        let deviceId1 = $(this).attr("deviceId");
        let date1 = $(this).attr("date");
        let time1 = $(this).attr("timeid");
        if(deviceId===deviceId1&&date===date1&&timeId===time1){
            $(this).html("<span style='color:green'>✔</span>")
        }
    });
}