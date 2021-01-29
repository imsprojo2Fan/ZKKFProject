package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type Device struct {
	Id              int
	Rid             string //唯一识别
	Uid             int    //用户id
	Tid             int    //type表id
	Ttid            int    //type_child表id
	Source          string //来源
	Name            string `orm:"size(255)"` //设备名称
	Title           string //副标题
	Img             string //图片地址
	Sketch          string `orm:"size(1024)"` //设备简述
	Parameter       string `orm:"size(512)"`  //设备参数
	Feature         string `orm:"size(512)"`  //设备功能
	Range           string `orm:"size(512)"`  //应用范围
	Achievement     string `orm:"size(512)"`  //代表性成果
	Disabled        int    //是否上线
	IsOrder			int //是否为可预约设备 0否 1是
	View            int    `orm:"size(16)"`
	Reservation     int    `orm:"size(16)"` //预约数
	ReservationDone int    `orm:"size(16)"` //预约完成数
	Order     int    `orm:"size(16)"` //订单数
	OrderDone int    `orm:"size(16)"` //订单完成数
	Standard string //实验标准，file表id
	Drawing string //图纸，file表id
	Remark          string
	Updated         time.Time `orm:"auto_now_add;type(datetime)"`
	Created         time.Time `orm:"auto_now_add;Device(datetime)"`
	TypeName		string `orm:"-"` //设备
}

func (a *Device) TableName() string {
	return DeviceTBName()
}

func (this *Device) Insert(Device *Device) error {

	o := orm.NewOrm()
	_, err := o.Insert(Device)
	return err
}

func (this *Device) Update(obj *Device) error {
	o := orm.NewOrm()
	_, err := o.Update(obj, "name", "title","is_order", "tid","ttid", "source", "sketch", "img", "parameter", "feature", "range", "achievement", "disabled","standard","drawing", "remark", "updated")
	return err
}

func (this *Device) Delete(obj *Device) error {
	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func(this *Device) DeleteBatch(idArr string) error {
	o := orm.NewOrm()
	_ = o.Begin()
	_,err := o.Raw("delete from device where id in "+idArr).Exec()
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	_ = o.Commit()
	return err
}

func (this *Device) DeleteByTid(o orm.Ormer,tid string) error {
	_, err := o.Raw("delete from device where tid="+tid).Exec()
	return err
}
func (this *Device) DeleteByTtid(o orm.Ormer,ttid string) error {
	_, err := o.Raw("delete from device where ttid="+ttid).Exec()
	return err
}

func (this *Device) SelectByCol(col string, obj *Device) {
	o := orm.NewOrm()
	_ = o.Read(obj, col)
}

func (this *Device) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	sql := "select d.*,t.name as typeName,c.name as childName from " + DeviceTBName() + " d,type t,type_child c where d.ttid=c.id and t.id=c.tid "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (d.name like \"%" + key + "%\")"
	}
	if qMap["tid"].(string) != "0" {
		tid := qMap["tid"].(string)
		sql = sql + " and d.tid="+tid
	}
	if qMap["tid"].(string) != "0"&&qMap["ttid"].(string) != "0" {
		ttid := qMap["ttid"].(string)
		sql = sql + " and d.ttid="+ttid
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Device) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "select d.*,t.name as typeName,c.name as childName from " + DeviceTBName() + " d,type t,type_child c where d.ttid=c.id and t.id=c.tid "
	if qMap["searchKey"] != "" {
		sql += " and d.name like '%" + qMap["searchKey"].(string) + "%'"
	}
	if qMap["tid"].(string) != "0" {
		tid := qMap["tid"].(string)
		sql = sql + " and d.tid="+tid
	}
	if qMap["tid"].(string) != "0"&&qMap["ttid"].(string) != "0" {
		ttid := qMap["ttid"].(string)
		sql = sql + " and d.ttid="+ttid
	}
	if qMap["sortCol"] != "" {
		sortCol := qMap["sortCol"].(string)
		sortType := qMap["sortType"].(string)
		sql += " order by d." + sortCol + " " + sortType
	} else {
		sql += " order by d.id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, err := o.Raw(sql).Values(&maps)
	return maps, err
}

func (this *Device) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + DeviceTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Device) ReservationData() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select d.*,t.request from device d,`type` t where is_order=0 and d.tid=t.id"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Device) UpdateNum(col, condition string) {
	o := orm.NewOrm()
	sql := "update " + DeviceTBName() + " set " + col + "=" + col + "+1 where rid=? or id=?"
	_, _ = o.Raw(sql,condition,condition).Exec()
}

func (this *Device) UpdateOrderNum(ids string) {
	o := orm.NewOrm()
	sql := "update " + DeviceTBName() + " set `order`=`order`+1 where id IN ("+ids+")"
	_, _ = o.Raw(sql).Exec()
}

func (this *Device) DetailByRid(rid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select d.id,d.rid,d.tid,d.ttid,d.name as name,d.title,d.is_order,d.source,d.img,d.sketch,d.parameter,d.feature,d.`range`,d.achievement,d.view,d.created,d.standard,d.drawing,t.name as typeName,t.id as tid,t.detection_cycle as detectionCycle,t.request,c.id as ttid,c.name as childName from device d,type t,type_child c where d.ttid=c.id and c.tid=t.id and d.rid=?"
	_,err := o.Raw(sql,rid).Values(&res)
	return res, err
}

func (this *Device) ListByType(tid,ttid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select d.id,d.tid,d.ttid,d.name,d.sketch,d.is_order,d.img,d.rid,t.name as typeName,t.request,c.name as childName,c.detection_cycle as detectionCycle from device d,`type` t,type_child c where d.tid=t.id and d.ttid=c.id"
	if tid!="0"&&ttid!=""{
		sql += " and d.tid="+tid+" and d.ttid="+ttid
	}
	_, err := o.Raw(sql).Values(&res)
	return res, err
}
