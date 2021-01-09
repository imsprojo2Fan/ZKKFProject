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
}
}