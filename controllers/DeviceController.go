package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

type DeviceController struct {
	BaseController
}

func (this *DeviceController) List() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := session.Get("type").(int)
	GlobalDraw++
	qMap := make(map[string]interface{})
	backMap := make(map[string]interface{})

	pageNow, err2 := this.GetInt64("start")
	pageSize, err := this.GetInt64("length")

	if err != nil || err2 != nil {
		pageNow = 1
		pageSize = 20
		//this.jsonResult(http.StatusOK,-1, "rows or page should be number", nil)
	}
	sortType := this.GetString("order[0][dir]")
	var sortCol string
	sortNum := this.GetString("order[0][column]")
	if sortNum == "1" {
		sortCol = "tid"
	}
	if sortNum == "2" {
		sortCol = "name"
	}
	if sortNum == "3" {
		sortCol = "disabled"
	}
	if sortNum == "5" {
		sortCol = "view"
	}
	if sortNum == "6" {
		sortCol = "order"
	}
	if sortNum == "7" {
		sortCol = "reservation"
	}
	if sortNum == "8" {
		sortCol = "updated"
	}
	if sortNum == "9" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey
	if uType < 1 { //账号类型小于3的用户可查看所有信息
		this.jsonResult(200, -1, "查询成功！", "无权限")
	}

	obj := new(models.Device)
	//获取总记录数
	var records int
	var dataList []orm.Params
	records, err = obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList, err = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *DeviceController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	name := this.GetString("name")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备名称不能为空！", nil)
	}
	var obj models.Device
	obj.Rid = utils.RandomString(16)
	obj.Uid = uid
	obj.Tid, _ = this.GetInt("tid")
	obj.Name = name
	obj.IsOrder,_ = this.GetInt("isOrder")
	obj.Title = this.GetString("title")
	obj.Source = this.GetString("source")
	obj.Img = img
	obj.Sketch = this.GetString("sketch")
	obj.Parameter = this.GetString("parameter")
	obj.Feature = this.GetString("feature")
	obj.Range = this.GetString("range")
	obj.Achievement = this.GetString("achievement")
	obj.Disabled, _ = this.GetInt("disabled")
	obj.Remark = this.GetString("remark")
	err := obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *DeviceController) Update() {
	name := this.GetString("name")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备名称不能为空！", nil)
	}
	var obj models.Device
	obj.Id, _ = this.GetInt("id")
	obj.Tid, _ = this.GetInt("tid")
	obj.Name = name
	obj.IsOrder,_ = this.GetInt("isOrder")
	obj.Title = this.GetString("title")
	obj.Source = this.GetString("source")
	obj.Img = img
	obj.Sketch = this.GetString("sketch")
	obj.Parameter = this.GetString("parameter")
	obj.Feature = this.GetString("feature")
	obj.Range = this.GetString("range")
	obj.Achievement = this.GetString("achievement")
	obj.Disabled, _ = this.GetInt("disabled")
	obj.Remark = this.GetString("remark")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *DeviceController) Delete() {
	obj := new(models.Device)
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

func (this *DeviceController) All() {
	obj := new(models.Device)
	res, _ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}

func (this *DeviceController)Detail() {
	rid := this.Ctx.Input.Param(":rid")
	if rid==""{
		this.TplName = "tip/404.html"
		return
	}
	obj := new(models.Device)
	res, err := obj.DetailByRid(rid)
	if err!=nil{
		this.Data["err"] = err.Error()
	}
	if len(res)==0{
		this.TplName = "tip/404.html"
		return
	}
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	id := session.Get("id")
	//首页判断是否已登录过
	if id==nil{
		this.Data["login"] = 0
	}else{
		this.Data["login"] = 1
		uid := session.Get("id").(int)
		user := userObj.SelectById(uid)
		//user := session.Get("user").(*models.User)
		user.Remark = ""
		user.Type = -1
		this.Data["user"] = user
	}
	if err==nil{
		obj.UpdateNum("view",rid)
	}
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["info"] = res[0]
	this.TplName = "detail.html"

}

func (this *DeviceController) ListByType() {
	typeId := this.GetString("typeId")
	obj := new(models.Device)
	res, _ := obj.ListByType(typeId)
	this.jsonResult(200, 1, "查询信息成功", res)
}
