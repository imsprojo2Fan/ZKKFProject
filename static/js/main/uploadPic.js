let maxSize = 1048576;
if($('#maxSize').val()){
    maxSize = $('#maxSize').val();
}
$(function(){
    // 初始化插件
    $("#zyupload").zyUpload({
        width            :   "650px",                 // 宽度
        height           :   "400px",                 // 宽度
        itemWidth        :   "140px",                 // 文件项的宽度
        itemHeight       :   "115px",                 // 文件项的高度
        url              :   "/main/upload4pic/",  // 上传文件的路径
        fileType         :   ["jpg","jpeg","png","gif"],// 上传文件的类型
        fileSize         :   maxSize,                // 上传文件的大小
        multiple         :   false,                    // 是否可以多个文件上传
        dragDrop         :   true,                    // 是否可以拖动上传文件
        tailor           :   true,                    // 是否可以裁剪图片
        del              :   true,                    // 是否可以删除文件
        finishDel        :   false,  				  // 是否在上传文件完成后删除预览
        /* 外部获得的回调接口 */
        onSelect: function(selectFiles, allFiles){    // 选择文件的回调方法  selectFile:当前选中的文件  allFiles:还没上传的全部文件
            console.info("当前选择了以下文件：");
            console.info(selectFiles);
            if(selectFiles.length==0){//选中文件不符合上传标准时
                return
            }
            //处理预览图只显示单张有效图片
            allFiles.pop();
            allFiles[0] = selectFiles[0];
            let arr = $('.upload_append_list');
            if(arr.length>0){
                for(let i=0;i<arr.length;i++){
                    $(arr[i]).remove();
                }
            }
        },
        onDelete: function(file, files){              // 删除一个文件的回调方法 file:当前删除的文件  files:删除之后的文件
            console.info("当前删除了此文件：");
            console.info(file.name);
        },
        onSuccess: function(file, response){          // 文件上传成功的回调方法
            console.info(file.name);
            let r = JSON.parse(response);
            //window.opener.document.getElementById($('#btnId').val()).innerText = "替换图片";
            //window.opener.document.getElementById($('#domId').val()).innerText = r.data;
            /*window.opener.document.getElementById("uploadPic").innerText = "替换图片";
            window.opener.document.getElementById("picName").innerText = r.data;
            window.opener.document.getElementById("picVal").value = r.data;
            window.opener.document.getElementById("edit_picName").innerText = r.data;
            window.opener.document.getElementById("edit_picVal").value = r.data;*/
            $("#uploadInf").html("<p>上传成功，文件名是：" + r.data+ "</p>");

            window.opener.openRes4Pic(true,$('#btnId').val(),$('#domId').val(),r.data);
            setTimeout(function () {
                window.close();
            },200);
        },
        onFailure: function(file, response){          // 文件上传失败的回调方法
            console.info("此文件上传失败：");
            console.info(file.name);
            let r = JSON.parse(response);
            window.opener.document.getElementById($('#btnId').val()).innerText = "上传图片";
            window.opener.document.getElementById($('#domId').val()).innerText = "";
            window.opener.openRes4Pic(false,$('#btnId').val(),$('#domId').val(),"");
            $("#uploadInf").html("<p>此文件上传失败：" + r.msg + "</p>");
        },
        onComplete: function(response){           	  // 上传完成的回调方法
            console.info("文件上传完成");
            console.info(response);
        }
    });

});