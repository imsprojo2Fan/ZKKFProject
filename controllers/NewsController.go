package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

type NewsController struct {
	BaseController
}

func (this *NewsController) List() {
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
	if sortNum == "0" {
		sortCol = "title"
	}
	if sortNum == "2" {
		sortCol = "view"
	}
	if sortNum == "3" {
		sortCol = "updated"
	}
	if sortNum == "4" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey
	if uType > 1 { //账号类型小于2的用户可查看所有信息
		this.jsonResult(200, -1, "查询成功！", "无权限")
	}

	obj := new(models.News)
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

func (this *NewsController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	title := this.GetString("title")
	source := this.GetString("source")
	content := this.GetString("content")
	img := this.GetString("img")
	if title == "" {
		this.jsonResult(200, -1, "新闻标题不能为空！", nil)
	}
	var obj models.News
	obj.Uid = uid
	obj.Title = title
	obj.Source = source
	obj.Content = content
	obj.Img = img
	obj.Rid = utils.RandomString(8)
	err := obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *NewsController) Update() {
	id, _ := this.GetInt("id")
	title := this.GetString("title")
	content := this.GetString("content")
	img := this.GetString("img")
	if title == "" {
		this.jsonResult(200, -1, "新闻标题不能为空！", nil)
	}
	var obj models.News
	obj.Id = id
	obj.Title = title
	obj.Source = this.GetString("source")
	obj.Content = content
	obj.Img = img
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *NewsController) Delete() {
	obj := new(models.News)
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

func (this *NewsController) All() {
	obj := new(models.News)
	res,_ := obj.All()
	this.jsonResult(200, 1, "查询所有信息", res)
}

func (this *NewsController) Detail() {
	rid := this.Ctx.Input.Param(":rid")
	if rid==""{
		this.TplName = "tip/404.html"
		return
	}
	obj := new(models.News)
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
	}
	if err==nil{
		obj.UpdateNum("view",rid)
	}
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["info"] = res[0]
	this.TplName = "news.html"

}

func (this *NewsController) Template()  {
	this.TplName = "news.html"
}
