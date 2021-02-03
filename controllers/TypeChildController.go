package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

type TypeChildController struct {
	BaseController
}

func (this *TypeChildController) List() {
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
	if sortNum == "4" {
		sortCol = "updated"
	}
	if sortNum == "5" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")
	tid := this.GetString("tid")
	qMap["tid"] = tid
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey
	obj := new(models.TypeChild)
	//获取总记录数
	records := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *TypeChildController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	name := this.GetString("name")
	description := this.GetString("description")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备分组类目不能为空！", nil)
	}
	var obj models.TypeChild
	obj.Uid = uid
	obj.Tid,_ = this.GetInt("tid")
	obj.Name = name
	obj.Description = description
	obj.Img = img
	obj.DetectionCycle,_ = this.GetInt("detection_cycle")
	err := obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *TypeChildController) Update() {
	id, _ := this.GetInt("id")
	name := this.GetString("name")
	description := this.GetString("description")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备分组类目不能为空！", nil)
	}
	var obj models.TypeChild
	obj.Id = id
	obj.Tid,_ = this.GetInt("tid")
	obj.Name = name
	obj.Description = description
	obj.Img = img
	obj.DetectionCycle,_ = this.GetInt("detection_cycle")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *TypeChildController) Delete() {
	obj := new(models.TypeChild)
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

func(this *TypeChildController) Delete4Batch() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	idArr := this.GetString("idArr")
	if idArr==""{
		this.jsonResult(200,-1,"数据id不能为空！",nil)
	}
	obj := new(models.TypeChild)
	idArr = "("+idArr+")"
	err := obj.DeleteBatch(idArr)
	if err!=nil{
		this.jsonResult(200,-1,"批量删除数据失败,"+err.Error(),err.Error())
	}else{
		this.jsonResult(200,1,"批量删除数据成功！",nil)
	}

}

func (this *TypeChildController) All() {
	obj := new(models.TypeChild)
	this.jsonResult(200, 1, "查询所有分组信息", obj.All())
}

func (this *TypeChildController) QueryByTid() {
	tid := this.GetString("tid")
	obj := new(models.TypeChild)
	this.jsonResult(200, 1, "查询信息", obj.QueryByTid(tid))
}

func (this *TypeChildController) QueryByTidDevice() {
	tid := this.GetString("tid")
	obj := new(models.TypeChild)
	childArr := obj.QueryByTid(tid)
	device := new(models.Device)
	dArr,err := device.All()
	if err!=nil{
		this.jsonResult(200, -1, "查询失败,"+err.Error(), nil)
	}
	var resArr []map[string]interface{}
	for _,item := range childArr{
		bMap := make(map[string]interface{})
		bMap["childType"] = item
		id1 := item["id"].(string)
		var arr []orm.Params
		for _,item1 := range dArr{
			id2 := item1["ttid"].(string)
			if id1==id2{
				arr = append(arr,item1)
			}
		}
		bMap["deviceArr"] = arr
		resArr = append(resArr,bMap)
	}
	this.jsonResult(200, 1, "查询信息",resArr)
}
