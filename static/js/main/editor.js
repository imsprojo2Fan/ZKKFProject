let editor;
let domId;
let receive;
$(document).ready(function() {
    domId = $('#domId').val();
    //receive = $('#'+domId,window.opener).val();
    receive = window.opener.document.getElementById(domId).value;
    //初始化富文本编辑器
    let E = window.wangEditor;
    editor = new E('#editor');
    // 或者 var editor = new E( document.getElementById('editor') )
    // 配置服务器端地址
    editor.customConfig.uploadImgServer = '/main/easy-upload';
    editor.customConfig.uploadImgParams = {
        _xsrf:$("#token").val()
    };
    editor.customConfig.uploadFileName = 'file';
    // 将图片大小限制为 3M
    editor.customConfig.uploadImgMaxSize = 3 * 1024 * 1024;
    editor.customConfig.customAlert = function (info) {
        // info 是需要提示的内容
        swal("系统提示",info,"info");
    };
    editor.customConfig.uploadImgHooks = {
        before: function (xhr, editor, files) {
            // 图片上传之前触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，files 是选择的图片文件

            // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
            // return {
            //     prevent: true,
            //     msg: '放弃上传'
            // }
        },
        success: function (xhr, editor, result) {
            // 图片上传并返回结果，图片插入成功之后触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果


            /*new $.flavr({ content : '请输入图片外链', dialog : 'prompt',

                prompt : { placeholder: '链接以http://开头' },
                onConfirm : function( $container, $prompt){
                    let val = $prompt.val().trim();
                    let picLink = result.data[0];
                    editor.cmd.do('insertHTML', '<a href="'+val+'" target="_blank"><img src="' + picLink + '" style="max-width:100%;"/></a>');
                },
                onCancel : function(){
                    //alert('Canceled');
                }
            });*/

            let picLink = result.data[0];
            editor.cmd.do('insertHTML', '<img src="' + picLink + '" style="max-width:100%;"/>');

        },
        fail: function (xhr, editor, result) {
            // 图片上传并返回结果，但图片插入错误时触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        },
        error: function (xhr, editor) {
            // 图片上传出错时触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        },
        timeout: function (xhr, editor) {
            // 图片上传超时时触发
            // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        },

        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
        customInsert: function (insertImg, result, editor) {
            // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
            // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

            // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
            let url = result.url;
            insertImg(url)

            // result 必须是一个 JSON 格式字符串！！！否则报错
        }
    };

    editor.customConfig.uploadImgMaxLength = 1;
    editor.customConfig.debug = true;
    editor.create();
    //初始化内容
    //editor.txt.html("receive");
    editor.txt.html(receive);
    $('#confirm').on("click",function () {
        //获取编辑器区域完整html代码
        let html = editor.txt.html();
        // 获取编辑器纯文本内容
        let text = editor.txt.text();
        //let domId = $('#domId').val();
        window.opener.openRes(domId,html);
        window.close();
    })

});
