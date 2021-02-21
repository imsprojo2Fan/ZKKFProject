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
	//查询可指派用户
	user := new(models.User)
	bMap := make(map[string]interface{})
	var assignInfo models.AssignInfo
	aData,_ := assignInfo.ListByRandomId(rid)
	var bArr []map[string]interface{}
	for i:=0;i<=4;i++{
		tMap := make(map[string]interface{})
		role := i+3
		//按角色查询可选用户
		uArr,_ := user.SelectByRole2(role,tid)
		tMap["uArr"] = uArr
		step := i+1
		if aData!=nil{
			//关联该订单已选的角色账号
			if step==1{
				tMap["assignUid"] = aData["s1"]
			}
			if step==2{
				tMap["assignUid"] = aData["s2"]
			}
			if step==3{
				tMap["assignUid"] = aData["s3"]
			}
			if step==4{
				tMap["assignUid"] = aData["s4"]
			}
			if step==5{
				tMap["assignUid"] = aData["s5"]
			}
		}
		bArr = append(bArr,tMap)
	}
	bMap["bArr"] = bArr
	bMap["aData"] = aData
	this.jsonResult(200, 1, "查询信息成功",bMap)
}

func (this *AssignController) Assign(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	var err error
	var assignInfo models.AssignInfo
	rid := this.GetString("rid")
	oType,_ := this.GetInt("oType")
	assignInfo.Uid,_ = this.GetInt("uid")//当前处理用户id
	assignInfo.Status,_= this.GetInt("status")//当前状态

	assignInfo.RandomId = rid
	//业务经理指派任务
	if oType==1{
		assignInfo.S1,_ = this.GetInt("s1")
		assignInfo.S2,_ = this.GetInt("s2")
		assignInfo.S3,_ = this.GetInt("s3")
		assignInfo.S4,_ = this.GetInt("s4")
		assignInfo.S5,_ = this.GetInt("s5")
		err = assignInfo.Update4Init(assignInfo)
	}

	if err!=nil{
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}else{
		this.jsonResult(200, 1, "操作成功", nil)
	}

}

