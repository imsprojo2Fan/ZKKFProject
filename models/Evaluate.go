package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type Evaluate struct {
	Id       int
	Uid      int       //创建人id/user表id
	RandomId string    //order/reservation表rid
	DeviceRid string  //device表rid
	Satisfied int //满意度 0非常满意 1满意 2一般 3不满意
	Content string //评价内容
	Updated  time.Time `orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func EvaluateTBName() string {
	return TableName("file")
}

func (a *Evaluate) TableName() string {
	return EvaluateTBName()
}

func (this *Evaluate) Insert(obj *Evaluate) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *Evaluate) Update(obj *Evaluate) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "type","remark","updated")
	return err
}

func (this *Evaluate) Delete(obj *Evaluate) error {
	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func(this *Evaluate) DeleteBatch(idArr string) error {
	o := orm.NewOrm()
	_,err := o.Raw("delete from Evaluate where id in "+idArr).Exec()
	return err
}

func(this *Evaluate) SelectByCol(obj *Evaluate,col string) {
	o := orm.NewOrm()
	_ = o.Read(obj, col)
}

func(this *Evaluate) SelectByIds(ids string)([]Evaluate,error) {
	o := orm.NewOrm()
	var res []Evaluate
	_,err := o.Raw("select * from Evaluate where id in "+ids).QueryRows(&res)
	return res,err
}

func (this *Evaluate) SelectByUid(obj *Evaluate) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Evaluate) SelectByName(obj *Evaluate) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *Evaluate) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	sql := "SELECT id from Evaluate where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (ori_name like \"%" + key + "%\" or remark like \"%"+key+"%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Evaluate) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT * from Evaluate where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (ori_name like \"%" + key + "%\" or remark like \"%"+key+"%\")"
	}
	if qMap["sortCol"] != nil && qMap["sortType"] != nil {
		sortCol := qMap["sortCol"].(string)
		sorType := qMap["sortType"].(string)
		sql = sql + " order by " + sortCol + " " + sorType
	} else {
		sql = sql + " order by id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, err := o.Raw(sql).Values(&maps)
	return maps, err
}

func (this *Evaluate) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + EvaluateTBName()
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Evaluate) ListByType(t string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + EvaluateTBName()+" where `type`="+t
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Evaluate) ListByIds(ids string) ([]Evaluate, error) {
	var res []Evaluate
	o := orm.NewOrm()
	sql := "select id,ori_name,Evaluate_name from " + EvaluateTBName()+" where id in ("+ids+")"
	_, err := o.Raw(sql).QueryRows(&res)
	return res, err
}


