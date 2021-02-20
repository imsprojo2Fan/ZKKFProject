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
type AssignDetail struct {
	Id int
	Rid string
	RandomId string
	Step int
	Uid int
	Status int
	Updated time.Time
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *AssignDetail) TableName() string {
	return AssignDetailTBName()
}

func AssignDetailTBName() string {
	return TableName("assign_detail")
}

func (this *AssignDetail) Insert(obj *AssignDetail) error {

	o := orm.NewOrm()
	_,err := o.Insert(obj)
	return err
}

func (this *AssignDetail) Insert2(o orm.Ormer,obj *AssignDetail) error {
	_,err := o.Insert(obj)
	return err
}

func (this *AssignDetail) Update(obj *AssignDetail) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "status","operate","updated")
	return err
}

func (this *AssignDetail) Delete(obj *AssignDetail) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *AssignDetail) SelectByUid(obj *AssignDetail) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}


func (this *AssignDetail) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+AssignDetailTBName()+" r where 1=1 "
	sql := "SELECT id from assign_detail where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *AssignDetail) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+AssignDetailTBName()+" r where u.id=r.uid "
	sql := "SELECT * from assign_detail where 1=1 "
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

func (this *AssignDetail)ListByStep(step,status int)([]AssignDetail,error){
	var res []AssignDetail
	sqlTxt := "select * from assign_detail where step=? and status=?"
	_,err := orm.NewOrm().Raw(sqlTxt,step,status).QueryRows(&res)
	return res,err
}

func (this *AssignDetail)ListByRid(rid string)([]AssignDetail,error){
	var res []AssignDetail
	sqlTxt := "select * from assign_detail where random_id=?"
	_,err := orm.NewOrm().Raw(sqlTxt,rid).QueryRows(&res)
	return res,err
}
