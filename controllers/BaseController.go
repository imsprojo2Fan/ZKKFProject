package controllers

import (
	"ZkkfProject/enums"
	"ZkkfProject/models/other"
	"ZkkfProject/utils"
	"github.com/astaxie/beego"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date:
 * @Modified By:
 */
var GlobalDraw int
type BaseController struct {
	beego.Controller
}

func (c *BaseController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{Status: status, Code: code, Msg: msg, Obj: data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}

func(this *BaseController) CheckAuth(userType int)bool{
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := session.Get("type").(int)
	flag := false
	if uType>userType{
		flag = true
	}
	return flag
}

func(this *BaseController) EmptyData()  {
	backMap := make(map[string]interface{})
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = 0
	backMap["recordsFiltered"] = 0
	backMap["data"] = make([]int, 0)
	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
}