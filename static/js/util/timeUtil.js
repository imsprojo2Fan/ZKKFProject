let dateUtil = {
    // 获得当前日期,格式:yyyy-MM-dd
    getNow: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        let d = addZero(date.getDate());
        return y + "-" + m + "-" + d;
    },
    NowDate: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        let d = addZero(date.getDate());
        return y+"年"+m+"月"+d+"日";
    },
    // 获得当前日期前X天的日期,格式:yyyy-MM-dd
    getBeforeDate: function(dayCount) {
        let date = new Date();
        date.setDate(date.getDate() - dayCount); //获取dayCount天前的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1);
        let d = addZero(date.getDate());
        return y + "-" + m + "-" + d;
    },
    // 获得当前日期后X天的日期,格式:yyyy-MM-dd
    getAfterDate: function(dayCount) {
        let date = new Date();
        date.setDate(date.getDate() + dayCount); //获取dayCount天后的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1);
        let d = (date.getDate());
        return y + "-" + m + "-" + d;
    },
    // 获得当前月,格式:yyyy-MM
    getNowMonth: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        return y + "-" + m;
    },
    // 获得当前月前X月的年月,格式:yyyy-MM
    getBeforeMonth: function(monthCount) {
        let date = new Date();
        date.setMonth(date.getMonth() + 1 - monthCount); //获取dayCount天前的月
        let y = date.getFullYear();
        let m = addZero(date.getMonth());
        return y + "-" + m;
    },
    // 获得当前月后X月的年月,格式:yyyy-MM
    getAfterMonth: function(monthCount) {
        let date = new Date();
        date.setMonth(date.getMonth() + 1 - monthCount); //获取dayCount天后的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth());
        return y + "-" + m;
    },
    //比较日期大小
    compareDate:function(date1, date2) {
        let d1 = new Date(date1);
        let d2 = new Date(date2);
        if (d1.getTime() >= d2.getTime()) {
            return true;
        } else {
            return false;
        }
    },
    //与当前比较时间大小
    compareTime:function(time) {
        let curTime = new Date();
        //把字符串格式转化为日期类
        let startTime = new Date(Date.parse(time));
        //进行比较
        if(startTime>=curTime){
            return true;
        }else{
            return false;
        }
    },
    nowTime:function () {
        let dtCur = new Date();
        let yearCur = dtCur.getFullYear();
        let monCur = dtCur.getMonth() + 1;
        let dayCur = dtCur.getDate();
        let hCur = dtCur.getHours();
        let mCur = dtCur.getMinutes();
        let sCur = dtCur.getSeconds();
        let timeCur = yearCur + "-" + (monCur < 10 ? "0" + monCur : monCur) + "-"
            + (dayCur < 10 ? "0" + dayCur : dayCur) + " " + (hCur < 10 ? "0" + hCur : hCur)
            + ":" + (mCur < 10 ? "0" + mCur : mCur) + ":" + (sCur < 10 ? "0" + sCur : sCur);
        //alert(timeCur);// 输出时间
        return timeCur;
    }
};
function addZero(number) {
    if (number < 10) {
        number = '0' + number;
    }
    return number;
}
//调用方式,如:dateUtil.getNow();