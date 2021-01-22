package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"github.com/astaxie/beego/orm"
	"strconv"
	"strings"
	"sync"
	"time"
)

type ReservationController struct {
	BaseController
}

func (this *ReservationController) List() {
	if this.CheckAuth(3){
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
	if sortNum == "5" {
		sortCol = "date"
	}
	if sortNum == "7" {
		sortCol = "status"
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

	obj := new(models.Reservation)
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

func (this *ReservationController) ListForPerson() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	//uType := session.Get("type").(int)
	uid := session.Get("id").(int)
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
	if sortNum == "4" {
		sortCol = "status"
	}
	if sortNum == "5" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["uid"] = uid
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey

	obj := new(models.Reservation)
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

func (this *ReservationController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	uuid, err := this.GetInt("uuid")
	if err != nil {
		uuid = 0
	}
	deviceId, _ := this.GetInt("deviceId")
	timeId, _ := this.GetInt("timeId")
	date := this.GetString("date")
	message := this.GetString("message")
	var obj models.Reservation
	//查询当前用户当天是否已预约过该设备
	/*var res []models.Reservation
	res,err = obj.ListByUidAndDate(strconv.Itoa(uid))
	if len(res)>0{
		this.jsonResult(200, -1, "当前日期您已预约过,如需更换时间可联系管理员!", nil)
	}*/
	obj.Rid = utils.RandomString(16)
	obj.Uid = uid
	obj.Uuid = uuid
	obj.Date = date
	obj.TimeId = timeId
	obj.DeviceId = deviceId
	obj.Status = 0
	obj.Remark = message
	err = obj.Insert(&obj)
	if err == nil {
		//更新预约数
		var device models.Device
		device.UpdateNum("reservation", strconv.Itoa(deviceId))
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *ReservationController) Update() {
	var obj models.Reservation
	obj.Id, _ = this.GetInt("id")
	obj.DeviceId, _ = this.GetInt("deviceId")
	obj.Date = this.GetString("date")
	obj.TimeId, _ = this.GetInt("timeId")
	obj.Status, _ = this.GetInt("status")
	obj.Remark = this.GetString("remark")
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *ReservationController) Delete() {
	obj := new(models.Reservation)
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

func (this *ReservationController) SoftDelete() {
	obj := new(models.Reservation)
	obj.Id, _ = this.GetInt("id")
	if obj.Id == 0 {
		this.jsonResult(200, -1, "id不能为空！", nil)
	}
	err := obj.SoftDelete(strconv.Itoa(obj.Id))
	if err == nil {
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func (this *ReservationController) All() {
	obj := new(models.Reservation)
	res, _ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}
var weekArr = []string{"周一","周二","周三","周四","周五","周六","周日"}
func (this *ReservationController) TimeQuery() {
	deviceId := this.GetString("deviceId")
	week,err := this.GetInt("week")
	if err!=nil{
		this.jsonResult(200, -1, "参数错误", nil)
	}
	startDate := utils.WeekByDate((week-1)*7)
	endDate := utils.WeekByDate(week*7)

	var setting models.Setting
	//获取已添加工作时间
	useTimeArr := setting.SelectByGroup("ReservationTime")
	//获取指定不可预约的日期
	disabledDateArr := setting.SelectByGroup("ReservationDate")
	//获取一周中不可预约的日期
	disabledWeekArr := setting.SelectByGroup("ReservationWeek")
	obj := new(models.Reservation)
	selectArr, _ := obj.TimeQuery(deviceId,startDate,endDate)
	var resArr []map[string]interface{}
	//添加表头
	var weekMap sync.Map
	var thArr []map[string]interface{}
	tMap := make(map[string]interface{})
	tMap["date"] = "时间段"
	tMap["tStamp"] = 0
	thArr = append(thArr,tMap)
	for i:=(week-1)*7;i<week*7;i++{//0\7\14
		tMap := make(map[string]interface{})
		dateStr := utils.WeekByDate(i)
		tMap["date"] = weekArr[i-(week-1)*7]+"/"+dateStr[5:]
		thArr = append(thArr,tMap)
		tMap["tStamp"] = utils.DateStrToUnix(dateStr)
		weekMap.Store(i,tMap)
	}
	bMap["data"] = thArr
	resArr = append(resArr,bMap)

	//组装可选时间数据
	var timeMap sync.Map
	for _,item := range useTimeArr{
		timeMap.Store(item.Id,item)
	}
	//组装已被预约数据
	var selMap sync.Map
	for _,item := range selectArr{
		selMap.Store(item.Date+"-"+strconv.Itoa(item.TimeId),item)
	}
	nowYear := time.Now().Year()
	for _,timeSetting := range useTimeArr{
		outMap := make(map[string]interface{})
		timeId := timeSetting.Id
		//获取当前时间段所有被预约的日期
		var localSelMap sync.Map
		selMap.Range(func(key, value interface{}) bool {
			localKey := key.(string)
			if strings.HasSuffix(localKey,strconv.Itoa(timeId)){
				k := localKey[0:10]
				localSelMap.Store(k,timeId)
			}
			return true
		})
		//按日期装填数据
		var innerArr []map[string]interface{}
		innerMap := make(map[string]interface{})
		innerMap["time"] = timeSetting.Value
		innerMap["isUse"] = 0
		innerMap["date"] = nil
		innerMap["tStamp"] = 0
		innerArr = append(innerArr,innerMap)
		weekMap.Range(func(key, value interface{}) bool {
			innerMap := make(map[string]interface{})
			tMap := value.(map[string]interface{})
			date := tMap["date"].(string)
			date2 := strconv.Itoa(nowYear)+"-"+strings.Split(date,"/")[1]
			temp,_ := localSelMap.Load(date2)
			innerMap["timeId"] = timeId
			flag := false
			for _,item := range disabledDateArr{
				if strings.Contains(date,item.Value){
					flag = true
					break
				}
			}
			for _,item := range disabledWeekArr{
				if strings.Contains(date,item.Value){
					flag = true
					break
				}
			}
			if temp==nil&&!flag{
				innerMap["isUse"] = 0
			}else{
				innerMap["isUse"] = 1
			}
			innerMap["date"] = date
			innerMap["time"] = timeSetting.Value
			innerMap["tStamp"] = tMap["tStamp"]
			innerArr = append(innerArr,innerMap)
			return true
		})
		outMap["data"] = innerArr
		resArr = append(resArr,outMap)
	}

	this.jsonResult(200, 1, "查询信息成功", resArr)
}

func (this *ReservationController) IndexAdd() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	uid := session.Get("id").(int)
	deviceId, _ := this.GetInt("deviceId")
	timeId, _ := this.GetInt("timeId")
	date := this.GetString("date")
	message := this.GetString("message")
	var obj models.Reservation
	//查询当前用户当天是否已预约过该设备
	res,err := obj.ListByUidAndDate(strconv.Itoa(uid))
	if err!=nil{
		this.jsonResult(200, -1, "查询错误,"+err.Error(), err.Error())
	}
	if len(res)>0{
		this.jsonResult(200, -1, "今日您已预约过，如需更换时间或其它需求请联系客服！", nil)
	}
	obj.Rid = utils.RandomString(16)
	obj.Uid = uid
	obj.Uuid = uid
	obj.Date = date
	obj.TimeId = timeId
	obj.DeviceId = deviceId
	obj.Status = 0
	obj.Message = message
	err = obj.Insert(&obj)
	if err == nil {
		//更新预约数
		var device models.Device
		device.UpdateNum("reservation", strconv.Itoa(deviceId))
		this.jsonResult(200, 1, "预约成功", nil)
	} else {
		this.jsonResult(200, -1, "预约失败,"+err.Error(), err.Error())
	}
}
