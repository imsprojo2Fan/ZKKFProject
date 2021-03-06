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
type AssignHistory struct {
	Id int
	Uid int	//创建用户id
	Uuid int //被指派用户id
	Rid string
	Status int
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func AssignHistoryTBName() string {
	return TableName("assign_history")
}

func (a *AssignHistory) TableName() string {
	return AssignHistoryTBName()
}

func (this *AssignHistory) Insert(obj *AssignHistory) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *AssignHistory) Update(obj *AssignHistory) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "title","source", "img", "content", "updated")
	return err
}

func (this *AssignHistory) Delete(obj *AssignHistory) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *AssignHistory) SelectByUid(obj *AssignHistory) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *AssignHistory) SelectByName(obj *AssignHistory) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *AssignHistory) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+AssignHistoryTBName()+" r where 1=1 "
	sql := "SELECT id from assign_history where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *AssignHistory) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+AssignHistoryTBName()+" r where u.id=r.uid "
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

func (this *AssignHistory) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + AssignHistoryTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *AssignHistory) DetailByRid(rid string) ([]AssignHistory, error) {
	var res []AssignHistory
	o := orm.NewOrm()
	sql := "select * from "+AssignHistoryTBName()+" where  rid=?"
	_,err := o.Raw(sql,rid).QueryRows(&res)
	return res, err
}
func (this *AssignHistory) AssignInfo(rid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	//判断是order或reservation
	t := "order"
	if strings.HasPrefix(rid,"R"){
		t = "reservation"
	}
	sql := "select a.*,u.name,t.status from assign_history a left join user u on a.uuid=u.id left join `"+t+"` t on t.rid=a.rid  where a.rid=? order by id desc limit 1"
	_,err := o.Raw(sql,rid).Values(&res)
	return res, err
}