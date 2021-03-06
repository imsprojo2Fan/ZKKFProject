package main

import (
	"ZkkfProject/models"
	_ "ZkkfProject/routers"
	"ZkkfProject/sysinit"
	_ "ZkkfProject/sysinit"
	"ZkkfProject/timer"
	"ZkkfProject/utils"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context"
	"github.com/astaxie/beego/orm"
	"net/http"
	_ "net/http/pprof"
	"strings"
)

func init() {
	//打印sql
	orm.Debug = sysinit.SqlFlag
	//是否开启 XSRF，默认为 false，不开启  防跨站
	beego.BConfig.WebConfig.EnableXSRF = true
	beego.BConfig.WebConfig.XSRFExpire = 0 //过期时间，默认1小时
	beego.BConfig.WebConfig.XSRFKey = "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o"
	//是否开启热升级，默认是 false，关闭热升级。
	//beego.BConfig.Listen.Graceful=true
	beego.BConfig.EnableGzip = true
	//beego.BConfig.WebConfig.Session.SessionGCMaxLifetime=36000000000

	beego.SetStaticPath("/file", "./file")
	beego.SetStaticPath("/img", "./file/img")
	beego.SetStaticPath("/download", "./file/upload")
	beego.SetStaticPath("/report", "./file/report")

	//透明static
	beego.InsertFilter("/static", beego.BeforeRouter, TransparentStatic)

	//判断用户是否登录/登录超时
	var FilterUser = func(ctx *context.Context) {
		session, _ := utils.GlobalSessions.SessionStart(ctx.ResponseWriter, ctx.Request)
		id := session.Get("id")
		//fmt.Println("SessionId:",id)
		if id == nil {
			ctx.Redirect(302, "/timeout")
		}
		url := ctx.Input.URL()
		if !strings.Contains(url, "alive") {
			var operate models.Operate
			operate.Ip = session.Get("ip").(string)
			operate.Client = session.Get("browserInfo").(string)
			operate.Uid = session.Get("id").(int)
			operate.Url = url
			operate.Insert(&operate)
		}

	}
	beego.InsertFilter("/main/*", beego.BeforeRouter, FilterUser, false)
}

func TransparentStatic(ctx *context.Context) {
	if strings.Index(ctx.Request.URL.Path, "v1/") >= 0 {
		return
	}
	http.ServeFile(ctx.ResponseWriter, ctx.Request, "static/"+ctx.Request.URL.Path)
}

func main() {

	//开启性能调试
	// web:
	// 1、http://localhost:8081/ui
	// 2、http://localhost:6060/debug/charts
	// 3、http://localhost:6060/debug/pprof //协程调试
	// 4、http://localhost:6060/debug/pprof/heap?debug=1
	// 5、go tool pprof -http=:1234 http://localhost:6060/debug/pprof/profile?seconds=30 cpu调试
	// 6、go tool pprof -http=:8081 http://localhost:6060/debug/pprof/heap 内存调试
	go func() {
		fmt.Println("pprof port:9998")
		fmt.Println(http.ListenAndServe(":9998", nil))
	}()

	//开启web服务
	go func() {
		beego.Run()
	}()

	//启动定时器
	go timer.Timer()

	select {}

}
