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

type OrderController struct {
	BaseController
}

func (this *OrderController) List() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	uType := session.Get("type").(int)
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
	/*if sortNum == "6" {
		sortCol = "updated"
	}*/
	if sortNum == "6" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")
	tid := this.GetString("tid")
	qMap["tid"] = tid
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey
	//处理只看到自己负责的订单
	qMap["uType"] = uType
	if uType>3&&uType!=7{
		qMap["uid"] = uid
	}

	obj := new(models.Order)
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

func (this *OrderController) ListForPerson() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	uid := session.Get("id").(int)
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
		sortCol = "rid"
	}
	if sortNum == "3" {
		sortCol = "status"
	}
	if sortNum == "4" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")
	tid := this.GetString("tid")
	qMap["tid"] = tid
	qMap["uid"] = uid
	qMap["uType"] = uType
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey

	obj := new(models.Order)
	//获取总记录数
	var records int
	var dataList []orm.Params
	records, err = obj.DataCount(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList, err = obj.ListByPage(qMap)
	var tempList []orm.Params
	for _,item:=range dataList{
		rid := item["rid"].(string)
		res,_ := obj.ListByRid4Type(rid)
		item["typeName"] = res
		tempList = append(tempList,item)
	}
	backMap["data"] = tempList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *OrderController) Add() {

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
		this.jsonResult(http.StatusOK, -1, "参数解析错误!"+err.Error(), err.Error())
	}
	if len(tArr) == 0 {
		this.jsonResult(http.StatusOK, -1, "无订单数据!", nil)
	}
	o := orm.NewOrm()
	_ = o.Begin()
	var obj models.Order
	var orderArr []models.Order
	var tAddArr []models.OrderType
	var deviceArr []models.OrderDevice
	var protocolArr []models.Protocol
	//查询公司信息
	res := settingObj.SelectByGroup("LocalInfo")
	for _,item := range tArr{
		Rid := "A"+strconv.FormatInt(time.Now().UnixNano(),10)
		//处理订单
		var obj models.Order
		obj.Rid = Rid
		obj.Uid = item.Protocol.Uid//用户id
		obj.Tid,_ = strconv.Atoi(item.Tid)
		obj.Status = 0
		obj.Count = item.Count
		orderArr = append(orderArr,obj)
		//处理订单分类
		item.Rid = Rid
		tAddArr = append(tAddArr,item)
		dataArr := item.Data
		//处理设备分类
		var ids string
		for _,item1 := range dataArr{
			item1.Rid = Rid
			deviceArr = append(deviceArr,item1)
			ids += item1.DeviceId+","
		}
		ids = ids[0:len(ids)-1]

		//处理协议
		var protocol models.Protocol
		protocol = item.Protocol
		protocol.Rid = "A"+strconv.FormatInt(time.Now().UnixNano()-10,10)
		protocol.RandomId = Rid
		protocol.Tid = item.Tid
		protocol.DeviceId = ids
		protocol.Uuid = uid//创建人id
		protocol.City = models.RangeValue(res,"city")
		protocolArr = append(protocolArr,protocol)
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
	//处理协议
	_,err = obj.MultiInsert4Protocol(o,protocolArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	_,err = obj.MultiInsert4Order(o,orderArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	//更新订单数
	var device models.Device
	var ids string
	for _,item := range deviceArr{
		ids += item.DeviceId+","
	}
	ids = ids[0:len(ids)-1]
	device.UpdateOrderNum(ids)
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *OrderController) Update() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	if session.Get("id")==nil{
		this.jsonResult(200, -1, "会话已过期，请重新登录!", nil)
	}
	rid := this.GetString("rid")
	dataStr := this.GetString("data")
	if dataStr == "" {
		this.jsonResult(http.StatusOK, -1, "参数不能为空!", nil)
	}
	var data models.OrderType
	//fmt.Println(str)
	err := json.Unmarshal([]byte(dataStr), &data)
	if err != nil {
		this.jsonResult(http.StatusOK, -1, "参数解析错误!"+err.Error(), err.Error())
	}

	o := orm.NewOrm()
	_ = o.Begin()
	var obj models.Order
	//更新order表
	obj.Rid = rid
	err = obj.UpdateByCol(o,"count",data.Count,rid)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(http.StatusOK, -1, "操作order表失败!"+err.Error(), err.Error())
	}
	//更新protocol表
	var protocol models.Protocol
	protocol = data.Protocol
	protocol.Rid = rid
	err = protocol.UpdateByRid(o,&protocol)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(http.StatusOK, -1, "操作protocol表失败!"+err.Error(), err.Error())
	}
	//处理order_device
	var orderDevice models.OrderDevice
	err = orderDevice.DelByRid(o,rid)
	if err!=nil{
		_ = o.Rollback()
		this.jsonResult(http.StatusOK, -1, "操作order_device表失败!"+err.Error(), err.Error())
	}
	dataArr := data.Data
	var ids string
	var deviceArr []models.OrderDevice
	for _,item1 := range dataArr{
		item1.Rid = rid
		deviceArr = append(deviceArr,item1)
		ids += item1.DeviceId+","
	}
	ids = ids[0:len(ids)-1]
	_,err = obj.MultiInsert4Device(o,deviceArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	//更新订单数
	var device models.Device
	device.UpdateOrderNum(ids)
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *OrderController) SoftDelete() {
	obj := new(models.Order)
	Rid := this.GetString("rid")
	if Rid == "" {
		this.jsonResult(200, -1, "rid不能为空！", nil)
	}
	err := obj.SoftDelete(Rid)
	if err == nil {
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func (this *OrderController) Delete() {
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

func (this *OrderController) All() {
	obj := new(models.Order)
	res, _ := obj.All()
	this.jsonResult(200, 1, "查询所有信息成功", res)
}

func (this *OrderController) Detail() {
	rid := this.GetString("rid")
	obj := new(models.Order)
	_, res := obj.ListByRid(rid)
	this.jsonResult(200, 1, "查询信息成功", res)
}

func (this *OrderController) Protocol() {
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

func (this *OrderController) IndexAdd() {

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
	o := orm.NewOrm()
	_ = o.Begin()
	var obj models.Order
	var orderArr []models.Order
	var tAddArr []models.OrderType
	var deviceArr []models.OrderDevice
	var protocolArr []models.Protocol
	for _,item := range tArr{
		Rid := "A"+strconv.FormatInt(time.Now().UnixNano(),10)
		//处理订单
		var obj models.Order
		obj.Rid = Rid
		obj.Uid = uid
		obj.Tid,_ = strconv.Atoi(item.Tid)
		obj.Status = 0
		obj.Count = item.Count
		orderArr = append(orderArr,obj)
		//处理订单分类
		item.Rid = Rid
		tAddArr = append(tAddArr,item)
		dataArr := item.Data
		//处理设备分类
		var ids string
		for _,item1 := range dataArr{
			item1.Rid = Rid
			deviceArr = append(deviceArr,item1)
			ids += item1.DeviceId+","
		}
		ids = ids[0:len(ids)-1]
		//处理协议
		var protocol models.Protocol
		protocol = item.Protocol
		protocol.Rid = "A"+strconv.FormatInt(time.Now().UnixNano()-10,10)
		protocol.RandomId = Rid
		protocol.Tid = item.Tid
		protocol.DeviceId = ids
		protocol.Uid = uid
		protocolArr = append(protocolArr,protocol)
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
	//处理协议
	_,err = obj.MultiInsert4Protocol(o,protocolArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	_,err = obj.MultiInsert4Order(o,orderArr)
	if err != nil {
		_ = o.Rollback()
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
	//更新订单数
	var device models.Device
	var ids string
	for _,item := range deviceArr{
		ids += item.DeviceId+","
	}
	ids = ids[0:len(ids)-1]
	device.UpdateOrderNum(ids)
	_ = o.Commit()
	this.jsonResult(200, 1, "操作成功", nil)
}

func (this *OrderController) Info() {
	rid := this.GetString("rid")
	obj := new(models.Order)
	res, err := obj.Info(rid)
	if err!=nil{
		this.jsonResult(200, -1, "查询信息失败,"+err.Error(), nil)
	}else{
		this.jsonResult(200, 1, "查询信息成功", res)
	}
}
