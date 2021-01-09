let clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
let clientHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
let sign;
$(function () {
    let isPhone = isMobile.any();
    if(!isPhone){
        clientHeight = clientHeight/2-120;
        clientWidth = clientWidth/2;
    }else{
        //clientHeight = clientHeight;
    }

    sign = new Draw( {
        // canvas:document.getElementById('canvas'),
        lineWidth: 5, // 线条宽度
        width: clientWidth, // canvas 宽
        height: clientHeight, //canvas 高
        strokeStyle: '#333333' // 线条颜色
    } );

    $('.submit').on("click",function () {
        let canvas = document.getElementById('myCanvas');
        if(isCanvasBlank(canvas)){
            swal("无任何签字！","","error");
            return false;
        }
        let res1 = cropSignatureCanvas(canvas);
        $('.imgWrap').attr("src",res1);
        if(isPhone){
            rotation(270);
        }
        setTimeout(function () {
            let res2 = $('.imgWrap').attr("src");
            let signCode = stringUtil.getQueryVariable("code");
            $.post("/signData",{data:res2,_xsrf:$("#token").val(),code:signCode},function (res) {
                if(res.code===1){
                    if(!isPhone){
                        swal("签字已发送！","","success");
                        setTimeout(function () {
                            window.close();
                        },1000);
                    }else{
                        $('.tip').html("签字已发送!");
                        $('.tip').show();
                        setTimeout(function () {
                            $('.tip').hide();
                        },2000);

                    }
                }else{
                    swal(res.msg,"","error");
                }
            });
        },500)

    });



})

window.onload = function () {

    // 点击输出图片
    /*document.querySelector( '.ouput' ).onclick = function () {
        /!*let img = new Image();
        img.style.width = clientWidth/4+"";
        img.src = sign.output();
        img.onload = function () {
            $('.imgWrap').html("");
            $('.imgWrap').append(img);
            //document.body.appendChild( img );
        }*!/
        //document.querySelector( 'img' ) && document.querySelector( 'img' ).remove();
    }*/
    // 点击清除
    document.querySelector( '.clear' ).onclick = function () {
        sign.clear();
    }
    // 点击撤销
    document.querySelector( '.undo' ).onclick = function () {
        sign.undo();
    }
}

function cropSignatureCanvas(canvas) {

    // 复制画布 避免影响之前的画布
    let croppedCanvas = document.createElement('canvas'),
        croppedCtx    = croppedCanvas.getContext('2d');
    croppedCanvas.width  = canvas.width;
    croppedCanvas.height = canvas.height;
    croppedCanvas.id = "tempC";
    document.body.appendChild(croppedCanvas);
    croppedCtx.drawImage(canvas, 0, 0);
    // 处理画布空白
    let w         = croppedCanvas.width,
        h         = croppedCanvas.height,
        pix       = {x:[], y:[]},
        imageData = croppedCtx.getImageData(0,0,croppedCanvas.width,croppedCanvas.height), // 获取canvas像素数据
        x, y, index;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4 + 3;  //根据行、列读取某像素点的R/G/B/A值的公式：
            if (imageData.data[index] > 0) {
                pix.x.push(x);
                pix.y.push(y);
            }
        }
    }

    pix.x.sort(function(a,b){return a-b});
    pix.y.sort(function(a,b){return a-b});
    let n = pix.x.length-1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    let cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);

    croppedCanvas.width = w;
    croppedCanvas.height = h;
    croppedCtx.putImageData(cut, 0, 0);
    return croppedCanvas.toDataURL("image/png");
}

function isCanvasBlank(canvas) {
    let blank = document.createElement('canvas');//系统获取一个空canvas对象
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() == blank.toDataURL();//比较值相等则为空
}

async function rotation(degree) {
    debugger
    //let degree = 0;
    const sourceImg = document.getElementById('imgWrap');
    const targetImg = document.getElementById('imgWrap');
    const rotationCanvas = document.getElementById('tempC');
    //degree += 90;
    let d = (degree * Math.PI) / 180;
    let image = sourceImg;
    let size = await getSize(sourceImg.src);
    const canvasWidth = size.width;
    const canvasHeight = size.height;
    rotationCanvas.width = canvasHeight;
    rotationCanvas.height = canvasWidth;

    let surfaceContext = rotationCanvas.getContext('2d');
    surfaceContext.clearRect(0, 0, rotationCanvas.width, rotationCanvas.height);
    surfaceContext.save();
    // Translate to the center point of our image
    surfaceContext.translate(canvasHeight * 0.5, canvasWidth * 0.5);
    // Perform the rotation
    surfaceContext.rotate(d);
    // Translate back to the top left of our image
    // surfaceContext.translate(-image.width * 0.5, -image.height * 0.5);
    // Finally we draw the image
    // surfaceContext.drawImage(image, -image.width * 0.5, -image.height * 0.5);
    surfaceContext.drawImage(image, -canvasWidth / 2, -canvasHeight / 2);
    // surfaceContext.drawImage(image, canvasWidth/2, canvasHeight/2);
    // rotationCanvas.style.width = canvasHeight + 'px'
    // rotationCanvas.style.height = canvasWidth + 'px'
    surfaceContext.restore();
    // surfaceContext.scale(.5, .5)
    targetImg.src = rotationCanvas.toDataURL();
    return rotationCanvas.toDataURL();
}

function getSize(url) {
    return new Promise((resolve) => {
        let img = document.createElement('img');
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.src = url;
    });
}