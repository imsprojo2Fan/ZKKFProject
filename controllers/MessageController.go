package controllers

import (
	"ZkkfProject/enums"
	"ZkkfProject/models"
	"ZkkfProject/models/other"
	"ZkkfProject/utils"
	"github.com/astaxie/beego"
)

type MessageController struct {
	beego.Controller
}

func(this *MessageController) ListAll()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id")
	var dataList []models.Message
	message := new(models.Message)
	message.ListAll(uid,&dataList)
	this.jsonResult(200,1,"查询消息列表",dataList)
}

func (this *MessageController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	this.Data["json"] = r
	this.ServeJSON()
	this.StopRun()
	return
}