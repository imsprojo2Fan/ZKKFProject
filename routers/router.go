package routers

import (
	"ZkkfProject/controllers"
	"github.com/astaxie/beego"
)

func init() {
	//网站首页相关
	beego.Router("/?:url", &controllers.IndexController{}, "*:Index")
	beego.Router("/template/?:url", &controllers.IndexController{}, "*:Template")
	beego.Router("/detail/?:rid", &controllers.DeviceController{}, "*:Detail")
	beego.Router("/type/all", &controllers.TypeController{}, "*:All")
	beego.Router("/type/?:id", &controllers.TypeController{}, "*:Redirect")
	beego.Router("/news/all", &controllers.NewsController{}, "*:All")
	beego.Router("/news/?:rid", &controllers.NewsController{}, "*:Detail")
	beego.Router("/type/device", &controllers.DeviceController{}, "*:ListByType")
	beego.Router("/typeChild/queryByTid", &controllers.TypeChildController{}, "POST:QueryByTid")
	beego.Router("/order/add", &controllers.OrderController{}, "*:IndexAdd")
	beego.Router("/other/?:url", &controllers.IndexController{}, "*:Other")
	beego.Router("/index/mail4index", &controllers.IndexController{}, "*:Mail4Index")
	//签名数据
	beego.Router("/signData", &controllers.IndexController{}, "POST:SignData")

	//登录相关
	beego.Router("/login", &controllers.LoginController{}, "*:LoginIndex")
	beego.Router("/validate", &controllers.LoginController{}, "*:Validate")
	beego.Router("/timeout", &controllers.LoginController{}, "*:Timeout")
	beego.Router("/signCode", &controllers.LoginController{}, "POST:SignCode")
	beego.Router("/sign", &controllers.LoginController{}, "POST:Sign")
	beego.Router("/forget", &controllers.LoginController{}, "POST:Forget")
	beego.Router("/reset", &controllers.LoginController{}, "POST:Reset")
	//后台管理相关
	beego.Router("/main", &controllers.MainController{}, "*:Index")
	beego.Router("/main/?:redirect", &controllers.MainController{}, "*:Redirect")
	beego.Router("/main/alive", &controllers.MainController{}, "*:Alive")

	//新闻管理
	beego.Router("/main/news/add", &controllers.NewsController{}, "POST:Add")
	beego.Router("/main/news/update", &controllers.NewsController{}, "POST:Update")
	beego.Router("/main/news/delete", &controllers.NewsController{}, "POST:Delete")
	beego.Router("/main/news/del4batch", &controllers.NewsController{}, "POST:Delete4Batch")
	beego.Router("/main/news/list", &controllers.NewsController{}, "POST:List")
	beego.Router("/index/news/all", &controllers.NewsController{}, "POST:All")
	//用户信息管理
	beego.Router("/main/user/list", &controllers.UserController{}, "POST:List")
	beego.Router("/main/user/add", &controllers.UserController{}, "POST:Add")
	beego.Router("/main/user/update", &controllers.UserController{}, "POST:Update")
	beego.Router("/main/user/updateProfile", &controllers.UserController{}, "POST:UpdateProfile")
	beego.Router("/main/user/updateInfo", &controllers.UserController{}, "POST:UpdateInfo")
	beego.Router("/main/user/delete", &controllers.UserController{}, "POST:Delete")
	beego.Router("/main/user/del4batch", &controllers.UserController{}, "POST:Delete4Batch")
	beego.Router("/main/user/all", &controllers.UserController{}, "POST:All")
	beego.Router("/main/user/customer", &controllers.UserController{}, "POST:AllCustomer")
	beego.Router("/main/user/listOne", &controllers.UserController{}, "POST:ListOne")
	beego.Router("/main/user/validate4mail", &controllers.UserController{}, "POST:Validate4mail")
	beego.Router("/main/user/mail4confirm", &controllers.UserController{}, "POST:Mail4confirm")
	beego.Router("/main/user/assign", &controllers.UserController{}, "POST:Assign")

	//设备分组管理
	beego.Router("/main/type/list", &controllers.TypeController{}, "POST:List")
	beego.Router("/main/type/add", &controllers.TypeController{}, "POST:Add")
	beego.Router("/main/type/update", &controllers.TypeController{}, "POST:Update")
	beego.Router("/main/type/delete", &controllers.TypeController{}, "POST:Delete")
	beego.Router("/main/type/del4batch", &controllers.TypeController{}, "POST:Delete4Batch")
	beego.Router("/main/type/all", &controllers.TypeController{}, "POST:All")
	beego.Router("/main/type/rank", &controllers.TypeController{}, "POST:Rank")
	//设备分组管理2
	beego.Router("/main/typeChild/list", &controllers.TypeChildController{}, "POST:List")
	beego.Router("/main/typeChild/add", &controllers.TypeChildController{}, "POST:Add")
	beego.Router("/main/typeChild/update", &controllers.TypeChildController{}, "POST:Update")
	beego.Router("/main/typeChild/delete", &controllers.TypeChildController{}, "POST:Delete")
	beego.Router("/main/typeChild/del4batch", &controllers.TypeChildController{}, "POST:Delete4Batch")
	beego.Router("/main/typeChild/all", &controllers.TypeChildController{}, "POST:All")
	beego.Router("/main/typeChild/queryByTid", &controllers.TypeChildController{}, "POST:QueryByTid")
	//设备管理
	beego.Router("/main/device/list", &controllers.DeviceController{}, "POST:List")
	beego.Router("/main/device/add", &controllers.DeviceController{}, "POST:Add")
	beego.Router("/main/device/update", &controllers.DeviceController{}, "POST:Update")
	beego.Router("/main/device/delete", &controllers.DeviceController{}, "POST:Delete")
	beego.Router("/main/device/del4batch", &controllers.DeviceController{}, "POST:Delete4Batch")
	beego.Router("/main/device/all", &controllers.DeviceController{}, "POST:All")
	beego.Router("/main/device/reservation", &controllers.DeviceController{}, "POST:Reservation")
	//预约管理
	beego.Router("/main/reservation/list", &controllers.ReservationController{}, "POST:List")
	beego.Router("/main/reservation/list4person", &controllers.ReservationController{}, "POST:ListForPerson")
	beego.Router("/main/reservation/add", &controllers.ReservationController{}, "POST:Add")
	beego.Router("/main/reservation/update", &controllers.ReservationController{}, "POST:Update")
	beego.Router("/main/reservation/delete", &controllers.ReservationController{}, "POST:Delete")
	beego.Router("/main/reservation/delete4soft", &controllers.ReservationController{}, "POST:SoftDelete")
	beego.Router("/main/reservation/all", &controllers.ReservationController{}, "POST:All")
	beego.Router("/reservation/timeQuery", &controllers.ReservationController{}, "POST:TimeQuery")
	beego.Router("/reservation/add", &controllers.ReservationController{}, "*:IndexAdd")
	beego.Router("/main/reservation/info", &controllers.ReservationController{}, "POST:Info")
	//订单管理
	beego.Router("/main/order/list", &controllers.OrderController{}, "POST:List")
	beego.Router("/main/order/list4person", &controllers.OrderController{}, "POST:ListForPerson")
	beego.Router("/main/order/add", &controllers.OrderController{}, "POST:Add")
	beego.Router("/main/order/update", &controllers.OrderController{}, "POST:Update")
	beego.Router("/main/order/delete", &controllers.OrderController{}, "POST:Delete")
	beego.Router("/main/order/delete4soft", &controllers.OrderController{}, "POST:SoftDelete")
	beego.Router("/main/order/all", &controllers.OrderController{}, "POST:All")
	beego.Router("/main/order/detail", &controllers.OrderController{}, "POST:Detail")
	beego.Router("/main/order/info", &controllers.OrderController{}, "POST:Info")
	//系统设置相关
	beego.Router("/main/setting/list", &controllers.SettingController{}, "POST:List")
	beego.Router("/main/setting/add", &controllers.SettingController{}, "POST:Add")
	beego.Router("/main/setting/update", &controllers.SettingController{}, "POST:Update")
	beego.Router("/main/setting/delete", &controllers.SettingController{}, "POST:Delete")
	//文件管理
	beego.Router("/main/file/add", &controllers.FileController{}, "POST:Add")
	beego.Router("/main/file/update", &controllers.FileController{}, "POST:Update")
	beego.Router("/main/file/delete", &controllers.FileController{}, "POST:Delete")
	beego.Router("/main/file/del4batch", &controllers.FileController{}, "POST:Delete4Batch")
	beego.Router("/main/file/list", &controllers.FileController{}, "POST:List")
	beego.Router("/main/file/all", &controllers.FileController{}, "POST:All")
	beego.Router("/main/file/list4type", &controllers.FileController{}, "POST:List4Type")
	beego.Router("/main/file/report", &controllers.FileController{}, "POST:Report")
	//富文本文件管理
	beego.Router("/main/upload", &controllers.FileController{}, "POST:Upload")
	//图片上传
	beego.Router("/main/upload4pic", &controllers.FileController{}, "POST:Upload4Pic")
	beego.Router("/main/file/upload4file", &controllers.FileController{}, "POST:Upload4File")
	//协议管理
	beego.Router("/main/protocol/info", &controllers.ProtocolController{}, "POST:Info")
	//指派任务管理
	beego.Router("/main/assign/assign", &controllers.AssignController{}, "POST:Assign")
	//消息管理
	beego.Router("/main/message/listAll", &controllers.MessageController{}, "POST:ListAll")
	//定制错误页
	beego.ErrorController(&controllers.ErrorController{})

}
