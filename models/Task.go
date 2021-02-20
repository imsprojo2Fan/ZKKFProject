package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 19:31 2021/1/13
 * @Modified By:
 */
type Task struct {
	Id int
	RandomId string
	Tid int
	Status int
	Operate int
	Updated time.Time
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Task) TableName() string {
	return TaskTBName()
}

func TaskTBName() string {
	return TableName("task")
}

func (this *Task) Insert(obj *Task) error {

	o := orm.NewOrm()
	_,err := o.Insert(obj)
	return err
}

func (this *Task) Insert2(o orm.Ormer,obj *Task) error {
	_,err := o.Insert(obj)
	return err
}

func (this *Task) Update(obj *Task) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "status","operate","updated")
	return err
}

func (this *Task) UpdateByRid(o orm.Ormer,obj *Task) error {
	sqlTxt := "update task set status=?,operate=?,updated=now() where random_id=?"
	_, err := o.Raw(sqlTxt,obj.Status,obj.Operate,obj.RandomId).Exec()
	return err
}

func (this *Task) Delete(obj *Task) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Task) SelectByUid(obj *Task) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}


func (this *Task) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+TaskTBName()+" r where 1=1 "
	sql := "SELECT id from task where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Task) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+TaskTBName()+" r where u.id=r.uid "
	sql := "SELECT * from task where 1=1 "
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

func (this *Task) ListByStatus(status string) ([]Task, error) {
	var res []Task
	o := orm.NewOrm()
	sql := "select * from " + TaskTBName() + " where status=?"
	_, err := o.Raw(sql,status).QueryRows(&res)
	return res, err
}

func (this *Task) DetailByRid(rid string) ([]Task, error) {
	var res []Task
	o := orm.NewOrm()
	sql := "select * from "+TaskTBName()+" where  random_id=?"
	_,err := o.Raw(sql,rid).QueryRows(&res)
	return res, err
}