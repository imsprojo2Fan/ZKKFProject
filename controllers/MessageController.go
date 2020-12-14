package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
)

type MessageController struct {
	BaseController
}

func(this *MessageController) ListAll()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id")
	var dataList []models.Message
	message := new(models.Message)
	message.ListAll(uid,&dataList)
	this.jsonResult(200,1,"查询消息列表",dataList)
}
