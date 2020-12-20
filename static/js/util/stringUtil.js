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
    }
}