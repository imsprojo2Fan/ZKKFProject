package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

type TypeController struct {
	BaseController
}

func (this *TypeController) List() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := session.Get("type").(int)
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

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey
	if uType < 1 { //账号类型小于3的用户可查看所有信息
		this.jsonResult(200, -1, "查询成功！", "无权限")
	}

	obj := new(models.Type)
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

func (this *TypeController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	name := this.GetString("name")
	description := this.GetString("description")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备分组类目不能为空！", nil)
	}
	var obj models.Type
	obj.Uid = uid
	obj.Name = name
	obj.Description = description
	obj.Img = img
	obj.DetectionCycle,_ = this.GetInt("detection_cycle")
	err := obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败", err.Error())
	}
}

func (this *TypeController) Update() {
	id, _ := this.GetInt("id")
	name := this.GetString("name")
	description := this.GetString("description")
	img := this.GetString("img")
	if name == "" {
		this.jsonResult(200, -1, "设备分组类目不能为空！", nil)
	}
	var obj models.Type
	obj.Id = id
	obj.Name = name
	obj.Description = description
	obj.Img = img
	obj.DetectionCycle,_ = this.GetInt("detection_cycle")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败", err.Error())
	}
}

func (this *TypeController) Delete() {
	obj := new(models.Type)
	obj.Id, _ = this.GetInt("id")
	if obj.Id == 0 {
		this.jsonResult(200, -1, "id不能为空！", nil)
	}
	err := obj.Delete(obj)
	if err == nil {
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,请稍后再试！", err.Error())
	}
}

func (this *TypeController) All() {
	obj := new(models.Type)
	this.jsonResult(200, 1, "查询所有分组信息", obj.All())
}

func (c *TypeController) Redirect() {
	//设置token
	c.Data["_xsrf"] = c.XSRFToken()
	c.TplName = "type.html"

}
