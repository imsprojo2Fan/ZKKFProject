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
	RandomId string
	Operate int
	Manager int //业务经理id
	Uid int
	Status int
	Step int
	Msg string
	Updated time.Time
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
	if strings.HasPrefix(obj.RandomId,"A"){
		order := new(Order)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}else{
		order := new(Reservation)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	//assign_detail添加记录
	var assignDetail AssignDetail
	assignDetail.Step = 0
	assignDetail.RandomId = obj.RandomId
	assignDetail.Status = 1
	assignDetail.Uid = obj.Uid
	assignDetail.Role = 3
	err = assignDetail.Insert(o,assignDetail)
	if err!=nil{
		_ = o.Rollback()
		return err
	}

	//更新task状态
	task := new(Task)
	task.RandomId = obj.RandomId
	task.Status = 1
	task.Operate = 0
	err = task.UpdateByRid(o,task)
	if err!=nil{
		_ = o.Rollback()
		return err
	}

	//指派历史
	/*var assignHistory AssignHistory
	assignHistory.Rid = obj.Rid
	assignHistory.Uid = obj.Uid
	assignHistory.Uuid = obj.Uuid
	assignHistory.Status = obj.Status
	err = assignHistory.Insert(&assignHistory)
	if err!=nil{
		_ = o.Rollback()
		return err
	}*/
	_ = o.Commit()
	return err
}

func (this *Assign) Update(obj *Assign) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "title","source", "img", "content", "updated")
	return err
}

func (this *Assign) Update4Init(o orm.Ormer,obj Assign) error {
	_ = o.Begin()
	sqlTxt := "update assign set manager=?,status=?,step=?,uid=?,msg=?,updated=now() where random_id=?"
	_,err := o.Raw(sqlTxt,obj.Manager,obj.Status,obj.Step,obj.Uid,obj.Msg,obj.RandomId).Exec()

	if err!=nil{
		_ = o.Rollback()
		return err
	}
	if strings.HasPrefix(obj.RandomId,"A"){
		order := new(Order)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}else{
		order := new(Reservation)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	return err
}

func (this *Assign) Update4Status(o orm.Ormer,obj Assign) error {
	//更新assign
	sqlTxt := "update assign set step=?,status=?,uid=? where random_id=?"
	_,err := o.Raw(sqlTxt,obj.Step,obj.Status,obj.Uid,obj.RandomId).Exec()
	if err!=nil{
		_ = o.Rollback()
		return err
	}

	if strings.HasPrefix(obj.RandomId,"A"){
		order := new(Order)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}else{
		order := new(Reservation)
		err = order.UpdateStatus(obj.RandomId,obj.Status,o)
	}
	if err!=nil{
		_ = o.Rollback()
		return err
	}
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

func (this *Assign)List4Task()[]Assign{
	var res []Assign
	o := orm.NewOrm()
	sqlTxt := "select * from assign where DATE_SUB(CURDATE(), INTERVAL 1 MONTH) <= date(created);"
	_, _ = o.Raw(sqlTxt).QueryRows(&res)
	return res
}
func (this *Assign) ListByRandomId(rid string) (orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select a.*,u.name from assign a left join user u on a.uid=u.id  where  a.random_id=?"
	_,err := o.Raw(sql,rid).Values(&res)
	if res==nil{
		return nil, err
	}
	return res[0], err
}

