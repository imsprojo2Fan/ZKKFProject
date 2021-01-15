package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type File struct {
	Id       int
	Uid      int       //创建人id/user表id
	Rid      string    //唯一识别字符串
	OriName   string    `orm:"size(255)"`
	FileName  string
	Type int //文件类型 0项目文件、1内部文件、2共享文件、3其他文件
	Md5 string
	Remark string `orm:"size(255)"`
	Updated  time.Time `orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *File) TableName() string {
	return FileTBName()
}

func (this *File) Insert(obj *File) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *File) Update(obj *File) error {

	o := orm.NewOrm()
	_, err := o.Update(obj, "type","remark","updated")
	return err
}

func (this *File) Delete(obj *File) error {
	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func(this *File) DeleteBatch(idArr string) error {
	o := orm.NewOrm()
	_,err := o.Raw("delete from file where id in "+idArr).Exec()
	return err
}

func(this *File) SelectByCol(obj *File,col string) {
	o := orm.NewOrm()
	_ = o.Read(obj, col)
}
func(this *File) SelectByIds(ids string)([]File,error) {
	o := orm.NewOrm()
	var res []File
	_,err := o.Raw("select * from file where id in "+ids).QueryRows(&res)
	return res,err
}

func (this *File) SelectByUid(obj *File) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *File) SelectByName(obj *File) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *File) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	sql := "SELECT id from file where 1=1 "
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (ori_name like \"%" + key + "%\" or remark like \"%"+key+"%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *File) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT * from file where 1=1 "
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

func (this *File) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + FileTBName()
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *File) ListByType(t string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + FileTBName()+" where `type`="+t
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *File) ListByIds(ids string) ([]File, error) {
	var res []File
	o := orm.NewOrm()
	sql := "select id,ori_name from " + FileTBName()+" where id in ("+ids+")"
	_, err := o.Raw(sql).QueryRows(&res)
	return res, err
}


