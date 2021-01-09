package sysinit

import (
	"ZkkfProject/utils"
	"github.com/astaxie/beego"
	"runtime"
	"sync"
	"time"
)

type Init struct {}
var (
	IsDev bool
	Host string
	InitTime int64
	IsLinux = false
	SqlFlag = false
	SignMap sync.Map
)

func init()  {

	IsDev,_ = beego.AppConfig.Bool("is_dev")
	Host = beego.AppConfig.String("host")
	SqlFlag,_ = beego.AppConfig.Bool("sql")

	system := runtime.GOOS
	if system!="windows"{
		IsLinux = true
	}

	InitTime = time.Now().Unix()
	//启用Session
	//beego.BConfig.WebConfig.Session.SessionOn = true
	utils.InitSession()
	//初始化日志
	//utils.InitLogs()
	//初始化缓存
	utils.InitCache()
	//初始化数据库
	InitDatabase()
}

