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
/**
	查询订单信息
 */
func (this *AssignController)List(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	curUuid := session.Get("id").(int)
	rid := this.GetString("rid")
	tid := this.GetString("tid")
	uid ,_ := this.GetInt("uid")
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
	var curItem models.AssignDetail
	var lastItem models.AssignDetail
	var nextItem models.AssignDetail
	for i,item := range detailArr{
		if i==0{
			continue
		}
		lastItem = detailArr[i-1]
		if item.Uid==curUuid{
			curItem = item
			break
		}
	}
	//判断是否渲染对账单信息------------------------------------开始
	flag := false
	msg := assignInfo["msg"].(string)
	if msg!=""{
		status,_ := strconv.Atoi(assignInfo["status"].(string))
		arr := strings.Split(msg,",")
		var sIndex int
		for index,item := range arr{
			if "结算中"==item||"协商处理中"==item{
				sIndex = index
				break
			}
		}
		if status>=sIndex{
			flag = true
		}
	}
	if flag{
		tMap,_ := StatementInfo(rid,uid)
		bMap["cInfo"] = tMap["cInfo"]
		bMap["uInfo"] = tMap["uInfo"]
		bMap["itemList"] = tMap["itemList"]
	}
	//判断是否渲染对账单信息------------------------------------结束

	bMap["bArr"] = bArr
	bMap["aData"] = assignInfo
	bMap["lastItem"] = lastItem
	bMap["curItem"] = curItem
	bMap["nextItem"] = nextItem
	this.jsonResult(200, 1, "查询信息成功",bMap)
}
/**
	任务指派
 */
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
	for i,item := range arr{
		if i==0{
			continue
		}
		if item.Role==4{
			msg += ",制样中,制样完成"
		}
		if item.Role==5{
			msg += ",测试中,测试完成"
		}
		if item.Role==6{
			msg += ",分析中,分析完成"
		}
		if item.Role==3{
			msg += ",结算中,对账单已发送"
		}
		if item.Role==99{
			msg += ",账单确认完毕"
		}
		if item.Role==7{
			msg += ",已开票待收款"
		}
	}
	msg += ",订单已完成"
	assign.Uid = session.Get("id").(int)//当前处理用户id
	assign.Status = 1 //状态重新开始
	assign.Step = 0
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
/**
	确认任务
 */
func (this *AssignController)Confirm(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	rid := this.GetString("rid")
	uid := session.Get("id").(int)//当前处理用户id
	var err error
	var assign models.Assign
	assign.Uid = uid
	assign.Status,_= this.GetInt("status")//当前状态
	assign.Status = assign.Status+1
	assign.RandomId = rid
	Step,_ := this.GetInt("step")
	assign.Step = Step+1

	o := orm.NewOrm()
	_ = o.Begin()
	err = assign.Update4Status(o,assign)

	//更新assign_detail
	var assignDetail models.AssignDetail
	assignDetail.RandomId = rid
	assignDetail.Uid = uid
	assignDetail.Status = 1
	err = assignDetail.UpdateByRid(o,assignDetail)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		return
	}
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}
/*
	完成任务/订单
 */
func (this *AssignController)Complete(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	var assignInfo models.Assign
	var assignDetail models.AssignDetail
	rid := this.GetString("rid")
	uid := session.Get("id").(int)
	status,_ := this.GetInt("status")//当前状态
	step,_ := this.GetInt("step")
	auto := this.GetString("auto")//下一步骤是否自动确认
	if auto!=""{
		status = status+2
		step = step+1
		r := assignDetail.ListByStep(rid,step)
		assignInfo.Uid = r.Uid
	}else{
		status = status+1
		assignInfo.Uid = uid//当前处理用户id
	}

	assignInfo.Status = status
	assignInfo.RandomId = rid
	assignInfo.Step = step
	var err error

	o := orm.NewOrm()
	_ = o.Begin()
	err = assignInfo.Update4Status(o,assignInfo)

	//更新assign_detail
	//var assignDetail models.AssignDetail
	assignDetail.Uid = uid
	assignDetail.RandomId = rid
	assignDetail.Status = 2
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
/*
	取消订单
 */
func (this *AssignController) Cancel(){
	var assignInfo models.Assign
	rid := this.GetString("rid")
	assignInfo.Uid,_ = this.GetInt("uid")//当前处理用户id
	assignInfo.Status,_= this.GetInt("status")//当前状态
	assignInfo.RandomId = rid
	var err error

	o := orm.NewOrm()
	_ = o.Begin()
	err = assignInfo.Update4Status(o,assignInfo)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, 1, "操作失败,"+err.Error(), err.Error())
	}
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)

}
/**
	对账单信息
 */
func(this *AssignController) Statement()  {
	uid,_ := this.GetInt("uid")
	rid := this.GetString("rid")
	bMap,err := StatementInfo(rid,uid)
	if err!=nil{
		this.jsonResult(200,-1,"查询失败,"+err.Error(),err.Error())
	}
	this.jsonResult(200,1,"查询成功",bMap)

}

func StatementInfo(rid string,uid int)(map[string]interface{},error)  {
	//查询订单所有设备信息
	var oDevice models.OrderDevice
	itemList,err := oDevice.ListByRid3(rid)
	if err!=nil{
		return nil, err
	}
	//查询当前所处step
	var assign models.Assign
	var assignData orm.Params
	assignData,err = assign.ListByRandomId(rid)
	if err!=nil{
		return nil, err
	}
	//获取公司信息
	sArr := settingObj.SelectByGroup("StatementInfo")
	cInfo := make(map[string]interface{})
	cInfo["support"] = models.RangeValue(sArr,"support")
	cInfo["address"] = models.RangeValue(sArr,"address")
	cInfo["bank"] = models.RangeValue(sArr,"bank")
	cInfo["account"] = models.RangeValue(sArr,"account")
	cInfo["identification"] = models.RangeValue(sArr,"identification")
	cInfo["contact"] = models.RangeValue(sArr,"contact")
	cInfo["step1"] = models.RangeValue(sArr,"step1")
	cInfo["step2"] = models.RangeValue(sArr,"step2")
	cInfo["step3"] = models.RangeValue(sArr,"step3")
	//查询个人用户信息
	user := userObj.SelectById(uid)
	bMap := make(map[string]interface{})
	bMap["step"] = assignData["step"]
	bMap["status"] = assignData["status"]
	bMap["itemList"] = itemList
	bMap["cInfo"] = cInfo
	bMap["uInfo"] = user
	return bMap,nil
}
/*
	对账单/实验数据有误
 */
func(this *AssignController)Wrong(){
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	rid := this.GetString("rid")
	uid := session.Get("id").(int)
	status,_ :=this.GetInt("status")
	msg := this.GetString("msg")
	msg = strings.Replace(msg,"结算中","协商处理中",-1)
	var aDetail models.AssignDetail
	aInfo := aDetail.List4Wrong(rid)
	//后退两步转至业务经理处理
	status = status-1
	step := aInfo.Step

	var assignInfo models.Assign
	assignInfo.Status = status
	assignInfo.RandomId = rid
	assignInfo.Step = step
	assignInfo.Uid = aInfo.Uid
	assignInfo.Msg = msg
	var err error

	o := orm.NewOrm()
	_ = o.Begin()
	err = assignInfo.Update4Status(o,assignInfo)

	//更新assign_detail1
	//更新业务经理状态
	aDetail.Uid = aInfo.Uid
	aDetail.RandomId = rid
	aDetail.Status = 0
	err = aDetail.UpdateByRid(o,aDetail)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		return
	}
	//更新用户状态
	aDetail.Uid = uid
	aDetail.RandomId = rid
	aDetail.Status = 0
	err = aDetail.UpdateByRid(o,aDetail)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
		return
	}
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功!",nil)

}

