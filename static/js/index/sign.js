let clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
let clientHeight = window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
let sign;
$(function () {

    let isPhone = isMobile.any();
    if(!isPhone){
        clientHeight = 300;
    }else{
        clientHeight = clientHeight+12
    }

    sign = new Draw( {
        // canvas:document.getElementById('canvas'),
        lineWidth: 5, // 线条宽度
        width: 400, // canvas 宽
        height: clientHeight, //canvas 高
        strokeStyle: '#333333' // 线条颜色
    } );



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