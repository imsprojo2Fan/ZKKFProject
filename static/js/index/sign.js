let clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
let clientHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
let sign;
$(function () {

    let isPhone = isMobile.any();
    if(!isPhone){
        clientHeight = clientHeight/2-120;
    }else{
        clientHeight = clientHeight+12
    }

    sign = new Draw( {
        // canvas:document.getElementById('canvas'),
        lineWidth: 5, // 线条宽度
        width: clientWidth/2, // canvas 宽
        height: clientHeight, //canvas 高
        strokeStyle: '#333333' // 线条颜色
    } );

    $('.submit').on("click",function () {
        let c = document.createElement('canvas');//创建处理画布对象
        let ctx = c.getContext('2d');
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img,0,0);//绘制
        let imgData = ctx.getImageData(0, 0, c.width, c.height).data;//读取图片数据
        let lOffset = c.width, rOffset = 0,tOffset = c.height, bOffset = 0;
        for (let i = 0; i < c.width; i++) {
            for (let j = 0; j < c.height; j++) {
                let pos = (i + c.width * j) * 4
                if (imgData[pos] == 255 || imgData[pos + 1] == 255 || imgData[pos + 2] == 255 || imgData[pos + 3] == 255) {
                    bOffset = Math.max(j, bOffset); // 找到有色彩的最下端
                    rOffset = Math.max(i, rOffset); // 找到有色彩的最右端
                    tOffset = Math.min(j, tOffset); // 找到有色彩的最上端
                    lOffset = Math.min(i, lOffset); // 找到有色彩的最左端
                }
            }
        }
        lOffset++;
        rOffset++;
        tOffset++;
        bOffset++;
        let x = document.createElement("canvas");//创建处理后画布对象
        let res = x.toDataURL();
    });



})

window.onload = function () {

    // 点击输出图片
    /*document.querySelector( '.ouput' ).onclick = function () {
        /!*let img = new Image();
        img.style.width = clientWidth/4+"";
        img.src = sign.ouput();
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