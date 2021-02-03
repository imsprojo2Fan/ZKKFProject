package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"strings"
	"time"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 19:31 2021/1/13
 * @Modified By:
 */
type Assign struct {
	Id int
	Uid int	//创建用户id
	Uuid int //被指派用户id
	Rid string
	Status int
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Assign) TableName() string {
	return AssignTBName()
}

func AssignTBName() string {
	return TableName("assign")
}

func (this *Assign) Insert(obj *Assign) error {

	o := orm.NewOrm()
	_ = o.Begin()
	_,err := o.InsertOrUpdate(obj)
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	if strings.HasPrefix(obj.Rid,"A"){
		order := new(Order)
		err = order.UpdateStatus(obj.Rid,obj.Status,o)
	}else{
		order := new(Reservation)
		err = order.UpdateStatus(obj.Rid,obj.Status,o)
	}
	if err!=nil{
		_ = o.Rollback()
		return err
	}

	//指派历史
	var assignHistory AssignHistory
	assignHistory.Rid = obj.Rid
	assignHistory.Uid = obj.Uid
	assignHistory.Uuid = obj.Uuid
	assignHistory.Status = obj.Status
	err = assignHistory.Insert(&assignHistory)
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	_ = o.Commit()
	return err
}

func (this *Assign) Update(obj *Assign) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "title","source", "img", "content", "updated")
	return err
}

func (this *Assign) Delete(obj *Assign) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Assign) SelectByUid(obj *Assign) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Assign) SelectByName(obj *Assign) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *Assign) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+AssignTBName()+" r where 1=1 "
	sql := "SELECT id from assign_history where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Assign) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+AssignTBName()+" r where u.id=r.uid "
	sql := "SELECT * from assign_history where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
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

func (this *Assign) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + AssignTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Assign) DetailByRid(rid string) ([]Assign, error) {
	var res []Assign
	o := orm.NewOrm()
	sql := "select * from "+AssignTBName()+" where  rid=?"
	_,err := o.Raw(sql,rid).QueryRows(&res)
	return res, err
}
func (this *Assign) AssignInfo(rid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	//判断是order或reservation
	t := "order"
	if strings.HasPrefix(rid,"R"){
		t = "reservation"
	}
	sql := "select a.*,u.name,t.status from assign a left join user u on a.uuid=u.id left join `"+t+"` t on t.rid=a.rid  where a.rid=?"
	_,err := o.Raw(sql,rid).Values(&res)
	return res, err
}