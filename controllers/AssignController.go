package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 11:09 2021/1/30
 * @Modified By:
 */

type AssignController struct {
	BaseController
}

func (this *AssignController) Assign(){
	rid := this.GetString("rid")
	uuid,err := this.GetInt("uid")
	assign := new(models.AssignHistory)
	if err!=nil{
		res,_ := assign.LimitOne(rid)
		this.jsonResult(200, 1, "查询信息成功", res)
	}else{
		session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
		if session.Get("id")==nil{
			this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
		}
		uid := session.Get("id").(int)
		assign.Uid = uid
		assign.Uuid = uuid
		assign.Rid = rid
		err := assign.Insert(assign)
		if err!=nil{
			this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		}else{
			this.jsonResult(200, 1, "操作成功", nil)
		}
	}
}

