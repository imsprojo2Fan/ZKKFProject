package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"strings"
	"time"
)

type EvaluateController struct {
	BaseController
}

func (this *EvaluateController) List() {
	if this.CheckAuth(7){
		this.EmptyData()
		return
	}
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []orm.Params
	backMap := make(map[string]interface{})

	pageNow, err2 := this.GetInt64("start")
	pageSize, err := this.GetInt64("length")

	if err != nil || err2 != nil {
		pageNow = 1
		pageSize = 20
		//this.jsonResult(http.StatusOK,-1, "rows or page should be number", nil)
	}
	sorType := this.GetString("order[0][dir]")
	var sortCol string
	sortNum := this.GetString("order[0][column]")
	if sortNum == "1" {
		sortCol = "title"
	}
	if sortNum == "3" {
		sortCol = "view"
	}
	if sortNum == "4" {
		sortCol = "updated"
	}
	if sortNum == "5" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey

	obj := new(models.Evaluate)
	//获取总记录数
	records,_ := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList,_ = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *EvaluateController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	satisfied,_ := this.GetInt("satisfied")
	content := this.GetString("content")
	var obj models.Evaluate
	obj.Uid = uid
	obj.RandomId = this.GetString("rid")
	//查询order_device获取该订单包含几项项目
	orderDevice := new(models.OrderDevice)
	dArr,_ := orderDevice.ListByRid2(obj.RandomId)
	var dStr string
	for _,item := range dArr{
		dStr += ","+item.Rid
	}
	if dStr!=""{
		dStr = dStr[1:]
	}
	obj.DeviceRid = dStr
	obj.Satisfied = satisfied
	obj.Content = content
	err := obj.Insert(&obj)
	if err!=nil&&strings.Contains(err.Error(),"idx1"){
		err = obj.UpdateByRid(&obj)
	}
	if err != nil {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *EvaluateController) Update() {
	id, _ := this.GetInt("id")
	satisfied,_ := this.GetInt("satisfied")
	content := this.GetString("content")
	var obj models.Evaluate
	obj.Id = id
	obj.Disabled,_ = this.GetInt("disabled")
	obj.Satisfied = satisfied
	obj.Content = content
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *EvaluateController) Delete() {
	obj := new(models.Evaluate)
	obj.Id, _ = this.GetInt("id")
	if obj.Id == 0 {
		this.jsonResult(200, -1, "id不能为空！", nil)
	}
	err := obj.Delete(obj)
	if err == nil {
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func(this *EvaluateController) Delete4Batch() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	idArr := this.GetString("idArr")
	if idArr==""{
		this.jsonResult(200,-1,"数据id不能为空！",nil)
	}
	obj := new(models.Evaluate)
	idArr = "("+idArr+")"
	err := obj.DeleteBatch(idArr)
	if err!=nil{
		this.jsonResult(200,-1,"批量删除数据失败,"+err.Error(),err.Error())
	}else{
		this.jsonResult(200,1,"批量删除数据成功！",nil)
	}

}

func (this *EvaluateController) All() {
	obj := new(models.Evaluate)
	res,_ := obj.All()
	this.jsonResult(200, 1, "查询所有信息", res)
}

func (this *EvaluateController) ListByDeviceRid() {
	rid := this.GetString("rid")
	if rid==""{
		this.jsonResult(200, -1, "参数错误!", nil)
	}
	obj := new(models.Evaluate)
	res,_ := obj.ListByRid(rid)
	this.jsonResult(200, 1, "查询信息成功!", res)
}

func (this *EvaluateController) ListByRandomId() {
	rid := this.GetString("rid")
	if rid==""{
		this.jsonResult(200, -1, "参数错误!", nil)
	}
	obj := new(models.Evaluate)
	res,_ := obj.ListByRandomId(rid)
	this.jsonResult(200, 1, "查询信息成功!",res)
}

