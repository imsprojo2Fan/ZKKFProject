package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type Device struct {
	Id	int
	Uid	int //用户id
	Tid int //分组id
	Source string //来源
	Name	string `orm:"size(255)"` //设备名称
	Img	string //图片地址
	Sketch 	string `orm:"size(1024)"` //设备简述
	Parameter string `orm:"size(512)"` //设备参数
	Feature	string `orm:"size(512)"` //设备功能
	Range	string `orm:"size(512)"` //应用范围
	Achievement string `orm:"size(512)"` //代表性成果
	Views       int     `orm:"size(16)"`
	Reservation int     `orm:"size(16)"`//预约数
	ReservationDone int     `orm:"size(16)"`//预约完成数
	Updated     time.Time `orm:"auto_now_add;type(datetime)"`
	Created     time.Time `orm:"auto_now_add;Device(datetime)"`
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
	_, err := o.Update(obj, "name","tid","source", "sketch", "img","parameter","feature","range","achievement","","updated")
	return err
}

func (this *Device) Delete(obj *Device) error {
	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Device) Read(obj *Device) bool {

	o := orm.NewOrm()
	err := o.Read(obj)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		return true
	}
}

func (this *Device) SelectByCol(col string,obj *Device) {
	o := orm.NewOrm()
	_ = o.Read(obj, col)
}

func (this *Device) Count(qMap map[string]interface{}) (int,error) {

	o := orm.NewOrm()
	sql := "SELECT id from "+DeviceTBName()+" where 1=1 "
	if qMap["searchKey"] != nil {
		key := qMap["searchKey"].(string)
		sql = sql + " and (name like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr),err
}

func (this *Device) ListByPage(qMap map[string]interface{}) ([]orm.Params,error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "select * from "+DeviceTBName()+" where 1=1"
	if qMap["searchKey"] != "" {
		sql = sql + " and name like '%" + qMap["searchKey"].(string) + "%'"
	}
	if qMap["sortCol"] != "" {
		sortCol := qMap["sortCol"].(string)
		sortType := qMap["sortType"].(string)
		sql = sql + " order by " + sortCol + " " + sortType
	} else {
		sql = sql + " order by id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_,err := o.Raw(sql).Values(&maps)
	return maps,err
}

func (this *Device) All() ([]orm.Params,error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from t_device where 1=1"
	_,err := o.Raw(sql).Values(&res)
	return res,err
}

func UpdateNum(condition,col string)  {
	o := orm.NewOrm()
	sql := "update t_device set "+col+"="+col+"+1 where did=\""+condition+"\""
	_,_ = o.Raw(sql).Exec()
}