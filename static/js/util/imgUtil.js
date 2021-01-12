let imgUtil = {
    //截图
    domShot:function(domId,func,fileName){
        window.pageYOffset = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        //0.5.0-beta4方法
        html2canvas(document.querySelector("#" + domId),{
            allowTaint:true,
            height: $("#"+domId).outerHeight() + 20
        }).then(function(canvas) {
            //添加水印
            //canvas = imgUtil.addWatermark(canvas,"中科科辅");
            func(canvas,fileName);
        });
    },
    //生成pdf
    doPDF:function(sourceId,fileName) {
        fileName = new Date();
        let pdf = new jsPDF('p', 'pt', 'letter')
            , source = $('#'+sourceId)[0]
            , specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypassme': function(element, renderer){
                // true = "handled elsewhere, bypass text extraction"
                return true
            }
        }

        margins = {
            top: 80,
            bottom: 60,
            left: 40,
            width: 522
        };
        pdf.fromHTML(
            source // HTML string or DOM elem ref.
            , margins.left // x coord
            , margins.top // y coord
            , {
                'width': margins.width // max width of content on PDF
                , 'elementHandlers': specialElementHandlers
            },
            function (dispose) {
                pdf.save(fileName+'.pdf');
            },
            margins
        )
    },
    //分页pdf
    pagePdf:function (canvas,fileName) {
        let contentWidth = canvas.width;
        let contentHeight = canvas.height;
        //一页pdf显示html页面生成的canvas高度;
        let pageHeight = contentWidth / 592.28 * 841.89;
        //未生成pdf的html页面高度
        let leftHeight = contentHeight;
        //页面偏移
        let position = 0;
        //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        let imgWidth = 595.28;
        let imgHeight = 592.28/contentWidth * contentHeight;

        let pageData = canvas.toDataURL('image/jpeg', 1.0);

        let pdf = new jsPDF('', 'pt', 'a4');

        //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        //当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
            pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {    // 分页
            while(leftHeight > 0) {
                pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                leftHeight -= pageHeight;
                position -= 841.89;
                //避免添加空白页
                if(leftHeight > 0) {
                    pdf.addPage();
                }
            }
        }
        pdf.save(fileName+'.pdf');
    },
    //canvas转图片
    convertCanvasToImage:function (canvas) {
        //新Image对象，可以理解为DOM
        let image = new Image();
        // canvas.toDataURL 返回的是一串Base64编码的URL，当然,浏览器自己肯定支持
        // 指定格式 PNG
        image.src = canvas.toDataURL("image/png");
        return image;
    },
    //添加水印
    addWatermark:function (domId,text) {
        let div1 = document.createElement("div");
        //创建一个能够覆盖页面宽度且有一定高度的容器承载水印
        div1.className="wat";//为容器元素添加类名，用来调试设计相应的样式
        let wrapHeight = $('#'+domId).outerHeight(true);
        div1.style.height=$('#'+domId).outerHeight(true);//先设置个高度再说
        let num = Math.floor(wrapHeight/150);
        for (let i = 0;i<num*5+5;i++) {//循环添加页面的水印
            //这里写死，需要根据body测量结果并动态添加循环次数的孩子不要着急
            let div2 = document.createElement("div");//创建一个调试水印文字样式的子容器
            let eHeight = $(div2).outerHeight(true);
            div2.className="watword";//添加样式类
            let textNode = document.createTextNode(text);//通过js方法给子容器写一句要水印的文字
            div2.appendChild(textNode);
            //文字节点添加进容器
            div1.appendChild(div2);
            //子容器添加到父类容器中
        }
        document.getElementById(domId).appendChild(div1);
        //父容器再添加到body中
    },
    addWatermark2:function () {
        watermark.init({ watermark_txt: "中科科辅" , watermark_width: 200});
    }
}