package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"encoding/json"
	"github.com/astaxie/beego/orm"
	"net/http"
	"time"
)

type TypeController struct {
	BaseController
}

func (this *TypeController) List() {
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
		sortCol = "rank"
	}
	if sortNum == "5" {
		sortCol = "updated"
	}
	if sortNum == "6" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey

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
	request := this.GetString("request")
	if request == "" {
		this.jsonResult(200, -1, "实验要求不能为空！", nil)
	}
	var obj models.Type
	obj.Uid = uid
	obj.Name = name
	obj.Request = request
	obj.Description = description
	obj.Img = img
	obj.DetectionCycle,_ = this.GetInt("detection_cycle")
	obj.Rank = obj.LastRank()+1
	err := obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
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
	request := this.GetString("request")
	if request == "" {
		this.jsonResult(200, -1, "实验要求不能为空！", nil)
	}
	var obj models.Type
	obj.Id = id
	obj.Name = name
	obj.Request = request
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
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func(this *TypeController) Delete4Batch() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	idArr := this.GetString("idArr")
	if idArr==""{
		this.jsonResult(200,-1,"数据id不能为空！",nil)
	}
	obj := new(models.Type)
	idArr = "("+idArr+")"
	err := obj.DeleteBatch(idArr)
	if err!=nil{
		this.jsonResult(200,-1,"批量删除数据失败,"+err.Error(),err.Error())
	}else{
		this.jsonResult(200,1,"批量删除数据成功！",nil)
	}

}

func (this *TypeController) All() {
	obj := new(models.Type)
	this.jsonResult(200, 1, "查询所有分组信息", obj.All())
}

func (this *TypeController) All4Device() {
	var resArr []map[string]interface{}
	obj := new(models.Type)
	typeArr := obj.All()
	child := new(models.TypeChild)
	childArr := child.All()
	device := new(models.Device)
	dArr,_ := device.All()
	for _,item := range childArr{
		bMap := make(map[string]interface{})
		bMap["typeChildItem"] = item
		bMap["tid"] = item["tid"]
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
	var backArr []map[string]interface{}
	for _,item := range typeArr{
		id1 := item["id"].(string)
		tMap := make(map[string]interface{})
		tMap["typeItem"] = item
		var arr []map[string]interface{}
		for _,item1 := range resArr{
			id2 := item1["tid"].(string)
			if id1==id2{
				arr = append(arr,item1)
			}
		}
		tMap["typeChildArr"] = arr
		backArr = append(backArr,tMap)
	}
	this.jsonResult(200, 1, "查询所有分组信息", backArr)
}

func (this *TypeController) Rank() {
	obj := new(models.Type)
	var dataArr []map[string]string
	dataStr := this.GetString("data")
	err := json.Unmarshal([]byte(dataStr), &dataArr)
	if err != nil {
		this.jsonResult(http.StatusOK, -1, "参数解析错误!", err.Error())
	}
	err = obj.UpdateRank(dataArr)
	if err!=nil{
		this.jsonResult(200, -1, "更新失败,"+err.Error(),err.Error())
	}else{
		this.jsonResult(200, 1, "更新成功",nil)
	}

}

func (this *TypeController) Redirect() {
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	id := session.Get("id")
	//首页判断是否已登录过
	if id==nil{
		this.Data["login"] = 0
	}else{
		this.Data["login"] = 1
		uid := session.Get("id").(int)
		//查询用户信息
		user := userObj.SelectById(uid)
		user.Remark = ""
		user.Type = -1
		this.Data["user"] = user
		//查询公司信息
		res := settingObj.SelectByGroup("LocalInfo")
		bMap["company"] = models.RangeValue(res,"company")
		bMap["phone"] = models.RangeValue(res,"phone")
		bMap["home"] = models.RangeValue(res,"home")
		bMap["email"] = models.RangeValue(res,"email")
		bMap["wechat"] = models.RangeValue(res,"wechat")
		bMap["address"] = models.RangeValue(res,"address")
		bMap["city"] = models.RangeValue(res,"city")
		bMap["sign"] = models.RangeValue(res,"sign")
		bMap["rid"] = sysinit.IdrRender()
		this.Data["lInfo"] = bMap
	}
	this.TplName = "type.html"
}
