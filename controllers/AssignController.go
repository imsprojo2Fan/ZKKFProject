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

func (this *AssignController)List(){
	rid := this.GetString("rid")
	tid := this.GetString("tid")
	assign := new(models.Assign)
	//查询任务状态
	res,_ := assign.AssignInfo(rid)
	//查询可指派用户
	user := new(models.User)
	bMap := make(map[string]interface{})
	bMap["res"] = res
	var assignDetail models.AssignDetail
	aData,_ := assignDetail.ListByRid(rid)
	var bArr []map[string]interface{}
	for i:=1;i<=4;i++{
		tMap := make(map[string]interface{})
		role := i+3
		//按角色查询可选用户
		uArr,_ := user.SelectByRole2(role,tid)
		tMap["uArr"] = uArr
		step := i+1
		if aData!=nil{
			//关联该订单已选的角色账号
			for _,assign := range aData{
				if step==assign.Step{
					tMap["assignUid"] = assign.Uid
					break
				}
			}
		}
		bArr = append(bArr,tMap)
	}
	bMap["bArr"] = bArr
	this.jsonResult(200, 1, "查询信息成功",bMap)
}

func (this *AssignController) Assign(){
	rid := this.GetString("rid")
	uuid,err := this.GetInt("uid")
	assign := new(models.Assign)
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

