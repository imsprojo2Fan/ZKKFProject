let dateUtil = {
    // 获得当前日期,格式:yyyy-MM-dd
    getNow: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        let d = addZero(date.getDate());
        return y + "-" + m + "-" + d;
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
    }
};
function addZero(number) {
    if (number < 10) {
        number = '0' + number;
    }
    return number;
}
//调用方式,如:dateUtil.getNow();