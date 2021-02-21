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
type AssignInfo struct {
	Id int
	Rid string
	RandomId string
	Operate int
	Uid int
	S1 int
	S1Status int
	S2 int
	S2Status int
	S3 int
	S3Status int
	S4 int
	S4Status int
	S5 int
	S5Status int
	Status int
	Updated time.Time
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *AssignInfo) TableName() string {
	return AssignInfoTBName()
}

func AssignInfoTBName() string {
	return TableName("assign_info")
}

func (this *AssignInfo) Insert(obj *AssignInfo) error {

	o := orm.NewOrm()
	_ = o.Begin()
	_,err := o.InsertOrUpdate(obj)
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	if strings.HasPrefix(obj.Rid,"A"){
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

func (this *AssignInfo) Update(obj *AssignInfo) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "title","source", "img", "content", "updated")
	return err
}

func (this *AssignInfo) Update4Init(obj AssignInfo) error {
	o := orm.NewOrm()
	sqlTxt := "update assign_info set status=?,uid=?,s1=?,s1_status=2,s2=?,s3=?,s4=?,s5=?,updated=now() where random_id=?"

	_,err := o.Raw(sqlTxt,obj.Status,obj.Uid,obj.S1,obj.S2,obj.S3,obj.S4,obj.S5,obj.RandomId).Exec()
	return err
}

func (this *AssignInfo) Delete(obj *AssignInfo) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *AssignInfo) SelectByUid(obj *AssignInfo) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *AssignInfo) SelectByName(obj *AssignInfo) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *AssignInfo) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+AssignInfoTBName()+" r where 1=1 "
	sql := "SELECT id from assign_history where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *AssignInfo) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+AssignInfoTBName()+" r where u.id=r.uid "
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

func (this *AssignInfo) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + AssignInfoTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *AssignInfo) DetailByRid(rid string) ([]AssignInfo, error) {
	var res []AssignInfo
	o := orm.NewOrm()
	sql := "select * from "+AssignInfoTBName()+" where  rid=?"
	_,err := o.Raw(sql,rid).QueryRows(&res)
	return res, err
}
func (this *AssignInfo) AssignInfo(rid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	//判断是order或reservation
	t := "order"
	if strings.HasPrefix(rid,"R"){
		t = "reservation"
	}
	sql := "select a.*,u.name,t.status from assign_info a left join user u on a.uuid=u.id left join `"+t+"` t on t.rid=a.rid  where a.rid=?"
	_,err := o.Raw(sql,rid).Values(&res)
	return res, err
}

func (this *AssignInfo)List4Task()[]AssignInfo{
	var res []AssignInfo
	o := orm.NewOrm()
	sqlTxt := "select * from assign_info where DATE_SUB(CURDATE(), INTERVAL 1 MONTH) <= date(created);"
	o.Raw(sqlTxt).QueryRows(&res)
	return res
}
func (this *AssignInfo) ListByRandomId(rid string) (orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select a.*,u.name from assign_info a left join user u on a.uid=u.id  where  random_id=?"
	_,err := o.Raw(sql,rid).Values(&res)
	if res==nil{
		return nil, err
	}
	return res[0], err
}

