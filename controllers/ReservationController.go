package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"time"
)

type ReservationController struct {
	BaseController
}

func (this *ReservationController) List() {
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
	if sortNum == "3" {
		sortCol = "date"
	}
	if sortNum == "5" {
		sortCol = "status"
	}
	if sortNum == "6" {
		sortCol = "updated"
	}
	if sortNum == "7" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey
	if uType < 2 { //账号类型小于3的用户不可查看所有信息
		this.jsonResult(200, -1, "查询成功！", "无权限")
	}

	obj := new(models.Reservation)
	//获取总记录数
	var records int
	var dataList []orm.Params
	records,err = obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList,err = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *ReservationController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	uuid,err := this.GetInt("uuid")
	if err!=nil{
		uuid = 0
	}
	deviceId,_ := this.GetInt("deviceId")
	timeId,_ := this.GetInt("timeId")
	date := this.GetString("date");
	remark := this.GetString("remark")
	var obj models.Reservation
	obj.Rid = utils.RandomString(16)
	obj.Uid = uid
	obj.Uuid = uuid
	obj.Date = utils.StrToDate(date)
	obj.TimeId = timeId
	obj.DeviceId = deviceId
	obj.Status = 0
	obj.Remark = remark
	err = obj.Insert(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败", err.Error())
	}
}

func (this *ReservationController) Update() {
	var obj models.Reservation
	obj.Id,_ = this.GetInt("id")
	obj.DeviceId,_ = this.GetInt("deviceId")
	obj.TimeId,_ = this.GetInt("timeId")
	obj.Status,_ = this.GetInt("status")
	obj.Remark = this.GetString("remark")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败", err.Error())
	}
}

func (this *ReservationController) Delete() {
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

func (this *ReservationController) All() {
	obj := new(models.Reservation)
	res,_ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功",res)
}
func (this *ReservationController) TimeQuery() {
	deviceId := this.GetString("deviceId")
	date := this.GetString("date")
	var setting models.Setting
	allTimeArr := setting.SelectByGroup("ReservationTime")
	obj := new(models.Reservation)
	selectArr,_ := obj.TimeQuery(deviceId,date)
	var resArr []map[string]interface{}
	for _,item1 := range allTimeArr{
		tMap := make(map[string]interface{})
		id1 := item1.Id
		isUse := 0
		for _,item2 := range selectArr{
			id2 := item2.TimeId
			if id1==id2{
				isUse = 1
				break
			}
		}
		tMap["isUse"] = isUse
		tMap["time"] = item1.Value
		tMap["tId"] = item1.Id
		resArr = append(resArr,tMap)
	}
	this.jsonResult(200, 1, "查询信息成功",resArr)
}
