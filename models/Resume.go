package models

import (
	"time"
	"github.com/astaxie/beego/orm"
	"fmt"
	"strconv"
)

// Model Struct
type Resume struct {
	Id  int
	Eid string
	Name string `orm:"size(32)"`
	Type string `orm:"size(32)"`
	Theme string
	Url string `orm:"size(32)"`
	Img string
	Likes int64 `orm:"size(8)"`
	Views int64 `orm:"size(8)"`
	Mades int64 `orm:"size(8)"`
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Resume) TableName() string {
	return ResumeTBName()
}

func(this *Resume) Insert(Resume *Resume) bool {

	o := orm.NewOrm()
	_,err := o.Insert(Resume)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Resume) Update(Resume *Resume) bool {

	o := orm.NewOrm()
	_,err := o.Update(Resume,"name","theme","img","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Resume) Delete(Resume *Resume) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Resume)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Resume) Read(Resume *Resume) bool {

	o := orm.NewOrm()
	err := o.Read(Resume)
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

func(this *Resume) SelectByEid(resume *Resume)  {
	o := orm.NewOrm()
	o.Read(resume,"eid")
}

func(this *Resume) SelectByName(resume *Resume) {
	o := orm.NewOrm()
	o.Read(resume,"name")
}

func(this *Resume) SelectByUrl(resume *Resume) {
	o := orm.NewOrm()
	o.Read(resume,"url")
}

func(this *Resume) Count(searchKey string)int64{

	o := orm.NewOrm()
	cnt,_ := o.QueryTable("resume").Filter("name__startswith",searchKey).Count() // SELECT COUNT(*) FROM USER
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	return cnt
}

func(this *Resume) ListByPage(qMap map[string]interface{},resumes *[]Resume){

	o := orm.NewOrm()
	//qs := o.QueryTable("login_log")
	sql := "select * from resume where 1=1"
	if qMap["searchKey"]!=""{
		sql = sql+" and name like '%"+qMap["searchKey"].(string)+"%'"
	}
	if qMap["sortCol"]!=""{
		sortCol := qMap["sortCol"].(string)
		sortType := qMap["sortType"].(string)
		sql = sql+" order by "+sortCol+" "+sortType
	}else{
		sql = sql+" order by id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow,10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize,10)
	sql = sql+" LIMIT "+pageNow_+","+pageSize_
	o.Raw(sql).QueryRows(resumes)

}

func(this *Resume) ListByPage4Index(qMap map[string]interface{},resumes *[]Resume){
	o := orm.NewOrm()
	sql := "select * from resume where 1=1"
	o.Raw(sql).QueryRows(resumes)

}


