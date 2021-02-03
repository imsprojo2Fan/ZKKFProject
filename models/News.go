package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type News struct {
	Id       int
	Uid      int       //创建人id/user表id
	Rid      string    //唯一识别字符串
	Title   string    `orm:"size(255)"`
	Source  string
	Img		string
	Content string //信息
	View 	int //查看数
	Updated  time.Time `orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func NewsTBName() string {
	return TableName("news")
}

func (a *News) TableName() string {
	return NewsTBName()
}

func (this *News) Insert(obj *News) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *News) Update(obj *News) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "title","source", "img", "content", "updated")
	return err
}

func (this *News) Delete(obj *News) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func(this *News) DeleteBatch(idArr string) error {
	o := orm.NewOrm()
	_,err := o.Raw("delete from "+NewsTBName()+" where id in "+idArr).Exec()
	return err
}

func (this *News) Read(obj *News) bool {

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

func (this *News) SelectByUid(obj *News) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *News) SelectByName(obj *News) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *News) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+NewsTBName()+" r where 1=1 "
	sql := "SELECT id from news where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (title like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *News) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+NewsTBName()+" r where u.id=r.uid "
	sql := "SELECT * from news where 1=1 "
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

func (this *News) ListByPage4Index(qMap map[string]interface{}, News *[]News) {
	o := orm.NewOrm()
	sql := "select * from " + NewsTBName() + " where 1=1"
	_, _ = o.Raw(sql).QueryRows(News)
}

func (this *News) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + NewsTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *News) UpdateNum(col, condition string) {
	o := orm.NewOrm()
	sql := "update " + NewsTBName() + " set " + col + "=" + col + "+1 where rid=? or id=?"
	_, _ = o.Raw(sql,condition,condition).Exec()
}

func (this *News) DetailByRid(rid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from "+NewsTBName()+" where  rid=?"
	_,err := o.Raw(sql,rid).Values(&res)
	return res, err
}

