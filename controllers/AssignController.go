package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"encoding/json"
	"github.com/astaxie/beego/orm"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
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
	//查询订单关联用户信息
	var assign models.Assign
	assign.RandomId = rid
	assignInfo,_ := assign.ListByRandomId(rid)
	//查询可指派用户
	user := new(models.User)
	bMap := make(map[string]interface{})
	var assignDetail models.AssignDetail
	detailArr := assignDetail.AssignList(rid)
	var bArr []map[string]interface{}
	for i:=0;i<=4;i++{
		tMap := make(map[string]interface{})
		role := i+3
		//按角色查询可选用户
		uArr,_ := user.SelectByRole2(role,tid)
		tMap["uArr"] = uArr
		tMap["role"] = role
		//关联该订单已选的角色账号
		for _,detail := range detailArr{
			if role==detail.Role{
				tMap["assignUid"] = detail.Uid
				break
			}
		}
		if i==0{
			tMap["assignUid"] = assignInfo["manager"]
		}
		bArr = append(bArr,tMap)
	}
	//下一步操作
	step,_ := strconv.Atoi(assignInfo["step"].(string))
	next := assignDetail.ListByStep(rid,strconv.Itoa(step+1))

	bMap["bArr"] = bArr
	bMap["aData"] = assignInfo
	bMap["next"] = next
	this.jsonResult(200, 1, "查询信息成功",bMap)
}

func (this *AssignController) Assign(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	var err error
	var assign models.Assign
	o := orm.NewOrm()
	_ = o.Begin()
	rid := this.GetString("rid")

	var assignDetail models.AssignDetail
	var arr []models.AssignDetail
	dArr := this.GetString("details")
	err = json.Unmarshal([]byte(dArr), &arr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(http.StatusOK, -1, "参数解析错误!"+err.Error(), err.Error())
	}
	_,err = assignDetail.MultiInsert(o,rid,arr)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	msg := "待确认,已确认"
	for _,item := range arr{
		if item.Role==4{
			msg += ",制样中,制样完成"
		}
		if item.Role==5{
			msg += ",测试中,测试完成"
		}
		if item.Role==6{
			msg += ",分析中,分析完成"
		}
		if item.Role==7{
			msg += ",结算中,对账单已发送,已开票待收款,已收款"
		}
	}
	msg += ",已完成,已取消"
	assign.Uid = session.Get("id").(int)//当前处理用户id
	assign.Status,_= this.GetInt("status")//当前状态
	assign.Manager,_ = this.GetInt("manager")//业务经理
	assign.RandomId = rid
	assign.Msg = msg
	err = assign.Update4Init(o,assign)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}

	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)

}

func (this *AssignController) Status(){
	var assignInfo models.Assign
	rid := this.GetString("rid")
	assignInfo.Uid,_ = this.GetInt("uid")//当前处理用户id
	assignInfo.Status,_= this.GetInt("status")//当前状态
	assignInfo.RandomId = rid
	var err error

	o := orm.NewOrm()
	_ = o.Begin()
	err = assignInfo.Update4Status(o,assignInfo)

	//更新assign_detail
	var assignDetail models.AssignDetail
	assignDetail.RandomId = rid
	//assignDetail.Step = obj.Step
	err = assignDetail.UpdateByRid(o,assignDetail)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		return
	}

	//处理文件-------------------------------------开始
	var order models.Order
	table := this.GetString("table")
	if table!=""{
		file,information,err := this.GetFile("file")  //返回文件，文件信息头，错误信息
		if err != nil {
			this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
			return
		}
		filePath := "./file/report/"
		if !utils.CheckFileIsExist(filePath){
			_ = os.MkdirAll(filePath, 777)
		}
		defer file.Close()//关闭上传的文件，否则出现临时文件不清除的情况  mmp错了好多次啊
		fileName := "中科科辅实验报告-"+strings.ToLower(utils.RandomString(6))
		fName := information.Filename
		fileName = fileName+fName[strings.LastIndex(fName,"."):]
		err = this.SaveToFile("file", path.Join(filePath,fileName))//保存文件的路径。保存在static/upload中(文件名)
		if err != nil {
			_ = o.Rollback()
			this.jsonResult(http.StatusOK,-1, "读写文件失败!", nil)

		}
		err = order.UpdateReport(o,table,rid,fileName)
		if err!=nil{
			_ = o.Rollback()
			this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		}
	}
	//处理文件-------------------------------------结束

	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)

}

