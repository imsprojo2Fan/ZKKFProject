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
	if this.CheckAuth(7){
		this.EmptyData()
		return
	}
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
	if sortNum == "4" {
		sortCol = "view"
	}
	if sortNum == "5" {
		sortCol = "order"
	}
	if sortNum == "6" {
		sortCol = "reservation"
	}
	if sortNum == "7" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")
	tid := this.GetString("tid")
	qMap["tid"] = tid
	ttid := this.GetString("ttid")
	qMap["ttid"] = ttid
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey

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
	obj.Ttid, _ = this.GetInt("ttid")
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
	obj.Standard = this.GetString("standard")
	obj.Drawing = this.GetString("drawing")
	obj.Remark = this.GetString("remark")
	obj.Relate = this.GetString("relate")
	obj.Price,_ = this.GetInt("price")
	obj.Version = this.GetString("version")
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
	obj.Ttid, _ = this.GetInt("ttid")
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
	obj.Standard = this.GetString("standard")
	obj.Drawing = this.GetString("drawing")
	obj.Remark = this.GetString("remark")
	obj.Relate = this.GetString("relate")
	obj.Price,_ = this.GetInt("price")
	obj.Version = this.GetString("version")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *DeviceController) Delete() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
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

func(this *DeviceController) Delete4Batch() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	idArr := this.GetString("idArr")
	if idArr==""{
		this.jsonResult(200,-1,"数据id不能为空！",nil)
	}
	obj := new(models.Device)
	idArr = "("+idArr+")"
	err := obj.DeleteBatch(idArr)
	if err!=nil{
		this.jsonResult(200,-1,"批量删除数据失败,"+err.Error(),err.Error())
	}else{
		this.jsonResult(200,1,"批量删除数据成功！",nil)
	}

}

func (this *DeviceController) All() {
	obj := new(models.Device)
	res, _ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}

func(this *DeviceController) Reservation()  {
	obj := new(models.Device)
	res, _ := obj.ReservationData()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}

var obj models.Device
var settingObj models.Setting
var fileObj models.File
var bMap = make(map[string]interface{})
func (this *DeviceController)Detail() {
	rid := this.Ctx.Input.Param(":rid")
	if rid==""{
		this.TplName = "tip/404.html"
		return
	}
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
	deviceInfo := res[0]
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
		this.Data["lInfo"] = bMap
	}
	if err==nil{
		obj.UpdateNum("view",rid)
	}
	//查询关联文件
	standardIds := deviceInfo["standard"].(string)
	if standardIds!=""{
		deviceInfo["standard"],_ = fileObj.ListByIds(standardIds)
	}
	drawingIds := deviceInfo["drawing"].(string)
	if drawingIds!=""{
		deviceInfo["drawing"],_ = fileObj.ListByIds(drawingIds)
	}
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["info"] = deviceInfo
	//查询评价
	eva := new(models.Evaluate)
	eArr,_ := eva.ListByRid(rid)
	var eArr2 []orm.Params
	for _,item := range eArr{
		name := item["name"].(string)
		company := item["company"].(string)
		name = utils.SubString(name,1)+"**"
		company = utils.SubString(company,5)+"***"
		item["name"] = name
		item["company"] = company
		eArr2 = append(eArr2,item)
	}
	this.Data["eArr"] = eArr2
	this.TplName = "detail.html"

}

func (this *DeviceController) ListByType() {
	typeId := this.GetString("typeId")
	ttid := this.GetString("ttid")
	obj := new(models.Device)
	res, _ := obj.ListByType(typeId,ttid)
	this.jsonResult(200, 1, "查询信息成功", res)
}

func (this *DeviceController) Relate() {
	ids := this.GetString("ids")
	if ids==""{
		this.jsonResult(200, -1, "参数错误", nil)
	}
	obj := new(models.Device)
	res, err := obj.ListByIds(ids)
	if err!=nil{
		this.jsonResult(200, -1, "查询失败,"+err.Error(), nil)
	}
	this.jsonResult(200, 1, "查询信息成功", res)
}