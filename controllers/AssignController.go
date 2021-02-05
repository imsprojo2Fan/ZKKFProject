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
	assign := new(models.Assign)
	if err!=nil{
		res,_ := assign.AssignInfo(rid)
		this.jsonResult(200, 1, "查询信息成功",res)
	}else{
		session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
		if session.Get("id")==nil{
			this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
		}
		uid := session.Get("id").(int)
		if uuid==-1{//-1取消订单 -6完成订单
			assign.Status = -1
			assign.Uuid = uid//最后处理人的id
		}else if uuid==-6{
			assign.Status = 6
			assign.Uuid = uid//最后处理人的id
		}else{
			//查询被指派用户角色
			user := new(models.User)
			resUser := user.SelectById(uuid)
			//通过被指定用户的角色来确定状态
			assign.Status = resUser.Type-2
			assign.Uuid = uuid
		}
		assign.Uid = uid
		assign.Rid = rid
		err = assign.Insert(assign)
		if err!=nil{
			this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		}else{
			this.jsonResult(200, 1, "操作成功", nil)
		}
	}
}

