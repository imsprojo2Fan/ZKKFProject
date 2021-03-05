package sysinit

import (
	"ZkkfProject/utils"
	"github.com/astaxie/beego"
	"github.com/holdno/snowFlakeByGo"
	"github.com/imsprojo2fan/utillib"
	"runtime"
	"strconv"
	"sync"
	"time"
)

type Init struct {}
var (
	IsDev bool
	Host string //富文本上传图片使用主机地址
	InitTime int64
	IsLinux = false
	SqlFlag = false
	SignMap sync.Map
	LogLevel string
	IdWorker, _ = snowFlakeByGo.NewWorker(0) // 传入当前节点id 此id在机器集群中一定要唯一 且从0开始排最多1024个节点，可以根据节点的不同动态调整该算法每毫秒生成的id上限(如何调整会在后面讲到)

)

func init()  {

	IsDev,_ = beego.AppConfig.Bool("is_dev")
	Host = beego.AppConfig.String("host")
	SqlFlag,_ = beego.AppConfig.Bool("sql")

	if !IsDev{
		Host = utillib.ExternalIP()
	}

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

func IdrRender()string{
	return strconv.FormatInt(IdWorker.GetId(),10)
}

