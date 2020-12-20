
let browserInfo = {
    getBrowserInfo:function(){
        let agent = navigator.userAgent.toLowerCase() ;
        let sUserAgent = navigator.userAgent;
        let regStr_ie = /msie [\d.]+;/gi ;
        let regStr_ff = /firefox\/[\d.]+/gi
        let regStr_chrome = /chrome\/[\d.]+/gi ;
        let regStr_saf = /safari\/[\d.]+/gi ;
        //IE
        if(agent.indexOf("msie") > 0)
        {
            return agent.match(regStr_ie);
        }
        //firefox
        if(agent.indexOf("firefox") > 0)
        {
            return agent.match(regStr_ff) ;
        }
        //Chrome
        if(agent.indexOf("chrome") > 0)
        {
            return agent.match(regStr_chrome);
        }
        //Safari
        if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
        {
            return agent.match(regStr_saf) ;
        }
    },
    detectOS:function(){
        let sUserAgent = navigator.userAgent;
        let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
        let isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
        if (isMac) return "Mac";
        let isUnix = (navigator.platform == "X11") && !isWin && !isMac;
        if (isUnix) return "Unix";
        let isLinux = (String(navigator.platform).indexOf("Linux") > -1);
        if (isLinux) return "Linux";
        if (isWin) {
            let isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
            if (isWin2K) return "Win2000";
            let isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
            if (isWinXP) return "WinXP";
            let isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
            if (isWin2003) return "Win2003";
            let isWinVista= sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
            if (isWinVista) return "WinVista";
            let isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
            if (isWin7) return "Win7";
            let isWin8 = sUserAgent.indexOf("windows NT 6.2") > -1 || sUserAgent.indexOf("Windows 8") > -1;
            if (isWin8) return "Win8";
            let isWin10 = sUserAgent.indexOf("Windows NT 10") > -1 || sUserAgent.indexOf("Windows 10") > -1;
            if (isWin10) return "Win10";

        }
        return "other";
    },
    digits: function(){
        let agent = navigator.userAgent.toLowerCase() ;
        let sUserAgent = navigator.userAgent;
        let is64 = sUserAgent.indexOf("WOW64") > -1;
        if (is64) {
            return "64位";
        }else{
            return "32位";
        }
    },
    ip:function () {
        
    }
}
