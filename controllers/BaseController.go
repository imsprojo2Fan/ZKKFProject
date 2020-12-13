package controllers

import (
	"ZkkfProject/enums"
	"ZkkfProject/models/other"
	"github.com/astaxie/beego"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date:
 * @Modified By:
 */

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