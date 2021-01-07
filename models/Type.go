package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type Type struct {
	Id          int
	Uid         int
	Name        string `orm:"size(255)"`
	Description string `orm:"size(1024)"`
	Img         string
	DetectionCycle int //检测周期，天
	Updated     time.Time `orm:"auto_now_add;type(datetime)"`
	Created     time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Type) TableName() string {
	return TypeTBName()
}

func (this *Type) Insert(obj *Type) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *Type) Update(obj *Type) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "name", "description", "img","detection_cycle", "updated")
	return err
}

func (this *Type) Delete(obj *Type) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Type) Read(obj *Type) bool {

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

func (this *Type) SelectByUid(obj *Type) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Type) SelectByName(obj *Type) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *Type) Count(qMap map[string]interface{}) int {

	o := orm.NewOrm()
	sql := "SELECT id from "+TypeTBName()+" where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql = sql + " and (name like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, _ = o.Raw(sql).Values(&arr)
	return len(arr)
}

func (this *Type) ListByPage(qMap map[string]interface{}) []orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "select * from "+TypeTBName()+" where 1=1"
	if qMap["searchKey"] != "" {
		sql = sql + " and name like '%" + qMap["searchKey"].(string) + "%'"
	}
	if qMap["sortCol"] != "" {
		sortCol := qMap["sortCol"].(string)
		sorType := qMap["sorType"].(string)
		sql = sql + " order by " + sortCol + " " + sorType
	} else {
		sql = sql + " order by id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, _ = o.Raw(sql).Values(&maps)
	return maps
}

func (this *Type) ListByPage4Index(qMap map[string]interface{}, Types *[]Type) {
	o := orm.NewOrm()
	sql := "select * from "+TypeTBName()+" where 1=1"
	_, _ = o.Raw(sql).QueryRows(Types)
}

func (this *Type) All() []orm.Params {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from "+TypeTBName()+" where 1=1"
	_, _ = o.Raw(sql).Values(&res)
	return res
}
