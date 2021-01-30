package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"encoding/json"
	"github.com/astaxie/beego/orm"
	"net/http"
	"strconv"
	"time"
)

type ProtocolController struct {
	BaseController
}

func (this *ProtocolController) List() {
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
	if sortNum == "1" {
		sortCol = "name"
	}
	if sortNum == "2" {
		sortCol = "company"
	}
	if sortNum == "3" {
		sortCol = "phone"
	}
	if sortNum == "4" {
		sortCol = "status"
	}
	if sortNum == "5" {
		sortCol = "remark"
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

	obj := new(models.Protocol)
	//获取总记录数
	var records int
	var dataList []orm.Params
	records, err = obj.DataCount(qMap)
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

func (this *ProtocolController) ListForPerson() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
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
	if sortNum == "1" {
		sortCol = "rid"
	}
	if sortNum == "2" {
		sortCol = "status"
	}
	if sortNum == "3" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["uid"] = uid
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey

	obj := new(models.Protocol)
	//获取总记录数
	var records int
	var dataList []orm.Params
	records, err = obj.DataCount(qMap)
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

func (this *ProtocolController) Add() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	remark := this.GetString("remark")
	dataStr := this.GetString("data")
	if dataStr == "" {
		this.jsonResult(http.StatusOK, -1, "参数不能为空!", nil)
	}
	var tArr []models.OrderType
	//fmt.Println(str)
	err := json.Unmarshal([]byte(dataStr), &tArr)
	if err != nil {
		this.jsonResult(http.StatusOK, -1, "参数解析错误!", err.Error())
	}
	if len(tArr) == 0 {
		this.jsonResult(http.StatusOK, -1, "无订单数据!", nil)
	}

	var obj models.Order
	obj.Rid = "A"+strconv.FormatInt(time.Now().UnixNano(),10)
	obj.Uid = uid
	obj.Status = 0
	obj.Remark = remark
	o := orm.NewOrm()
	_ = o.Begin()
	err = obj.Insert(o,&obj)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	_,err = obj.MultiInsert4Type(o,tArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	var deviceArr []models.OrderDevice
	for _,item := range tArr{
		dataArr := item.Data
		for _,item1 := range dataArr{
			deviceArr = append(deviceArr,item1)
		}
	}
	_,err = obj.MultiInsert4Device(o,deviceArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	//更新预约数
	var device models.Device
	var ids string
	for _,item := range deviceArr{
		ids += strconv.Itoa(item.Id)+","
	}
	device.UpdateOrderNum(ids[0:len(ids)-1])
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *ProtocolController) Update() {
	var obj models.Order
	obj.Id, _ = this.GetInt("id")
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

func (this *ProtocolController) Delete() {
	obj := new(models.Order)
	obj.Rid = this.GetString("rid")
	if obj.Rid == "" {
		this.jsonResult(200, -1, "id不能为空！", nil)
	}
	err := obj.DeleteByRid(obj.Rid)
	if err == nil {
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func (this *ProtocolController) All() {
	obj := new(models.Order)
	res, _ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}

func (this *ProtocolController) Detail() {
	rid := this.GetString("rid")
	obj := new(models.Order)
	_, res := obj.ListByRid(rid)
	this.jsonResult(200, 1, "查询信息成功", res)
}

func (this *ProtocolController) IndexAdd() {

	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	uid := session.Get("id").(int)
	dataStr := this.GetString("data")
	if dataStr == "" {
		this.jsonResult(http.StatusOK, -1, "参数不能为空!", nil)
	}
	var tArr []models.OrderType
	//fmt.Println(str)
	err := json.Unmarshal([]byte(dataStr), &tArr)
	if err != nil {
		this.jsonResult(http.StatusOK, -1, "参数解析错误!", err.Error())
	}
	if len(tArr) == 0 {
		this.jsonResult(http.StatusOK, -1, "无订单数据!", nil)
	}
	Rid := "A"+strconv.FormatInt(time.Now().UnixNano(),10)
	o := orm.NewOrm()
	_ = o.Begin()
	var obj models.Order
	var allCount int

	var tAddArr []models.OrderType
	var deviceArr []models.OrderDevice
	for _,item := range tArr{
		allCount += item.Count
		item.Rid = Rid
		tAddArr = append(tAddArr,item)
		dataArr := item.Data
		for _,item1 := range dataArr{
			item1.Rid = Rid
			deviceArr = append(deviceArr,item1)
		}
	}
	_,err = obj.MultiInsert4Type(o,tAddArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}

	_,err = obj.MultiInsert4Device(o,deviceArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}

	obj.Rid = Rid
	obj.Uid = uid
	obj.Status = 0
	obj.Count = allCount
	err = obj.Insert(o,&obj)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	//更新预约数
	var device models.Device
	var ids string
	for _,item := range deviceArr{
		ids += item.DeviceId+","
	}
	device.UpdateOrderNum(ids[0:len(ids)-1])
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *ProtocolController) Info() {
	rid := this.GetString("rid")
	protocol := new(models.Protocol)
	protocolRes, err := protocol.ListByRid(rid)
	if err!=nil{
		this.jsonResult(200, -1, "查询失败,"+err.Error(), nil)
	}
	orderType := new(models.OrderType)
	var typeRes models.OrderType
	typeRes,err = orderType.ListByRid(rid)
	if err!=nil{
		this.jsonResult(200, -1, "查询失败,"+err.Error(), nil)
	}
	orderDevice := new(models.OrderDevice)
	var deviceRes []models.OrderDevice
	deviceRes,err = orderDevice.ListByRid(rid)
	if err!=nil{
		this.jsonResult(200, -1, "查询失败,"+err.Error(), nil)
	}
	user := new(models.User)
	u := user.SelectById(protocolRes.Uid)
	bMap := make(map[string]interface{})
	bMap["type"] = typeRes
	bMap["deviceArr"] = deviceRes
	bMap["user"] = u
	bMap["protocol"] = protocolRes
	res := settingObj.SelectByGroup("LocalInfo")
	bMap["company"] = models.RangeValue(res,"company")
	bMap["phone"] = models.RangeValue(res,"phone")
	bMap["home"] = models.RangeValue(res,"home")
	bMap["email"] = models.RangeValue(res,"email")
	bMap["wechat"] = models.RangeValue(res,"wechat")
	bMap["address"] = models.RangeValue(res,"address")
	bMap["city"] = models.RangeValue(res,"city")
	bMap["sign"] = models.RangeValue(res,"sign")
	this.jsonResult(200, 1, "查询成功", bMap)
}
