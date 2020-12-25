package routers

import (
	"ZkkfProject/controllers"
	"github.com/astaxie/beego"
)

func init() {
	//网站首页相关
	beego.Router("/?:url", &controllers.IndexController{}, "*:Index")
	beego.Router("/detail/?:rid", &controllers.DeviceController{}, "*:Detail")
	beego.Router("/type/all", &controllers.TypeController{}, "*:All")
	beego.Router("/type/device", &controllers.DeviceController{}, "*:ListByType")
	beego.Router("/reservation/add", &controllers.ReservationController{}, "*:IndexAdd")
	beego.Router("/other/?:url", &controllers.IndexController{}, "*:Other")
	beego.Router("/index/mail4index", &controllers.IndexController{}, "*:Mail4Index")

	//登录相关
	beego.Router("/login", &controllers.LoginController{}, "*:LoginIndex")
	beego.Router("/validate", &controllers.LoginController{}, "*:Validate")
	beego.Router("/timeout", &controllers.LoginController{}, "*:Timeout")
	beego.Router("/signCode", &controllers.LoginController{}, "POST:SignCode")
	beego.Router("/sign", &controllers.LoginController{}, "POST:Sign")
	beego.Router("/forget", &controllers.LoginController{}, "POST:Forget")
	beego.Router("/reset", &controllers.LoginController{}, "POST:Reset")
	beego.Router("/main/upload", &controllers.FileController{}, "POST:Upload")
	//图片上传
	beego.Router("/main/upload4pic", &controllers.FileController{}, "POST:Upload4Pic")
	//后台管理相关
	beego.Router("/main", &controllers.MainController{}, "*:Index")
	beego.Router("/main/?:redirect", &controllers.MainController{}, "*:Redirect")
	beego.Router("/main/alive", &controllers.MainController{}, "*:Alive")

	//模板信息管理
	beego.Router("/main/resume/insert", &controllers.ResumeController{}, "POST:Insert")
	beego.Router("/main/resume/edit", &controllers.ResumeController{}, "POST:Update")
	beego.Router("/main/resume/delete", &controllers.ResumeController{}, "POST:Delete")
	beego.Router("/main/resume/list", &controllers.ResumeController{}, "POST:ListByPage")
	beego.Router("/index/resume/list", &controllers.ResumeController{}, "POST:ListByPage4Index")
	//用户信息管理
	beego.Router("/main/user/list", &controllers.UserController{}, "POST:List")
	beego.Router("/main/user/add", &controllers.UserController{}, "POST:Add")
	beego.Router("/main/user/update", &controllers.UserController{}, "POST:Update")
	beego.Router("/main/user/updateProfile", &controllers.UserController{}, "POST:UpdateProfile")
	beego.Router("/main/user/delete", &controllers.UserController{}, "POST:Delete")
	beego.Router("/main/user/all", &controllers.UserController{}, "POST:All")
	beego.Router("/main/user/customer", &controllers.UserController{}, "POST:AllCustomer")
	beego.Router("/main/user/listOne", &controllers.UserController{}, "POST:ListOne")
	beego.Router("/main/user/validate4mail", &controllers.UserController{}, "POST:Validate4mail")
	beego.Router("/main/user/mail4confirm", &controllers.UserController{}, "POST:Mail4confirm")

	//设备分组管理
	beego.Router("/main/type/list", &controllers.TypeController{}, "POST:List")
	beego.Router("/main/type/add", &controllers.TypeController{}, "POST:Add")
	beego.Router("/main/type/update", &controllers.TypeController{}, "POST:Update")
	beego.Router("/main/type/delete", &controllers.TypeController{}, "POST:Delete")
	beego.Router("/main/type/all", &controllers.TypeController{}, "POST:All")

	//设备管理
	beego.Router("/main/device/list", &controllers.DeviceController{}, "POST:List")
	beego.Router("/main/device/add", &controllers.DeviceController{}, "POST:Add")
	beego.Router("/main/device/update", &controllers.DeviceController{}, "POST:Update")
	beego.Router("/main/device/delete", &controllers.DeviceController{}, "POST:Delete")
	beego.Router("/main/device/all", &controllers.DeviceController{}, "POST:All")

	//预约管理
	beego.Router("/main/reservation/list", &controllers.ReservationController{}, "POST:List")
	beego.Router("/main/reservation/add", &controllers.ReservationController{}, "POST:Add")
	beego.Router("/main/reservation/update", &controllers.ReservationController{}, "POST:Update")
	beego.Router("/main/reservation/delete", &controllers.ReservationController{}, "POST:Delete")
	beego.Router("/main/reservation/all", &controllers.ReservationController{}, "POST:All")
	beego.Router("/reservation/timeQuery", &controllers.ReservationController{}, "POST:TimeQuery")

	//系统设置相关
	beego.Router("/main/setting/list", &controllers.SettingController{}, "POST:List")
	beego.Router("/main/setting/add", &controllers.SettingController{}, "POST:Add")
	beego.Router("/main/setting/update", &controllers.SettingController{}, "POST:Update")
	beego.Router("/main/setting/delete", &controllers.SettingController{}, "POST:Delete")

	//消息管理
	beego.Router("/main/message/listAll", &controllers.MessageController{}, "POST:ListAll")
	//定制错误页
	beego.ErrorController(&controllers.ErrorController{})

}
