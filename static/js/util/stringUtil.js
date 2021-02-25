let stringUtil = {
    maxLength:function (str,maxSize) {
        if(!str){
            return "-";
        }
        let temp = str;
        if(str.length>maxSize){
            temp = str.substring(0,maxSize)+"...";
        }
        return "<span title='"+str+"'>"+temp+"</span>"
    },
    randomString:function(length) {
    let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
    for (let i = length; i > 0; --i)
        result += str[Math.floor(Math.random() * str.length)];
    return result;
    },
    getQueryVariable:function(variable){
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i=0;i<vars.length;i++) {
            let pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
    return "";
    },
    compare:function (prop) {
        return function (obj1, obj2) {
            let val1 = obj1[prop];
            let val2 = obj2[prop];if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
    },
    /**
     * 阿拉伯数字转中文数字,
     * 如果传入数字时则最多处理到21位，超过21位js会自动将数字表示成科学计数法，导致精度丢失和处理出错
     * 传入数字字符串则没有限制
     * @param {number|string} digit
     */
    toZhDigit:function (digit) {
        let chnNumChar = ["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"];
        let chnUnitChar = ["","拾","佰","仟","万","亿","万亿","亿亿"];
        let strIns = '', chnStr = '';
        let unitPos = 0;
        let zero = true;
        while(digit > 0){
            let v = digit % 10;
            if(v === 0){
                if(!zero){
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            }else{
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            digit = Math.floor(digit / 10);
        }
        return chnStr;

    },
}