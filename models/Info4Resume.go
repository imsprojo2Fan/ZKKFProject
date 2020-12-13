package models

import (
	"time"
	"github.com/astaxie/beego/orm"
	"fmt"
)

// Model Struct
type Info4Resume struct {
	Id  int
	Uid int64
	Rid string
	Sid string
	Name string `orm:"size(16)"`
	Objective string
	Gender string
	Birthday string
	Age int
	Avatar string
	Signature string
	Phone string
	Email string
	Province string
	City string
	Address string
	Hobby string
	Educations string
	Works string
	Projects string
	Skills string
	Honors string
	Introduce string
	Rumors string
	BgImg string
	ThemeColor string
	TailorUrl string `orm:"size(255)"`
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Info4Resume) TableName() string {
	return Info4ResumeTBName()
}

func(this *Info4Resume) Insert(Info4Resume *Info4Resume) bool {

	o := orm.NewOrm()
	_,err := o.Insert(Info4Resume)
	if err!=nil{
		return false
	}else{
		return true
	}
}


func(this *Info4Resume) Update(Info4Resume *Info4Resume,col string) bool {

	o := orm.NewOrm()
	var err error
	if col!=""{
		_,err = o.Update(Info4Resume,col)
	}else{
		_,err = o.Update(Info4Resume)
	}

	if err!=nil{
		return false
	}else{
		return true
	}
}


func(this *Info4Resume) Delete(Info4Resume *Info4Resume) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Info4Resume)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Info4Resume) Read(Info4Resume *Info4Resume) bool {

	o := orm.NewOrm()
	err := o.Read(Info4Resume)
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


func(this *Info4Resume) ReadByUid(Info4Resume *Info4Resume) bool {

	o := orm.NewOrm()
	err := o.Read(Info4Resume,"uid")
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

func(this *Info4Resume) ListMade(qMap map[string]interface{},dataList *[]Info4Resume) {
	o := orm.NewOrm()
	uid := qMap["uid"].(string)
	sql := "select * from info4resume where 1=1 and uid="+uid
	o.Raw(sql).QueryRows(dataList)
}

func(this *Info4Resume) ListOne(qMap map[string]interface{},dataList *[]Info4Resume) {
	o := orm.NewOrm()
	uid := qMap["uid"].(string)
	sql := "select * from info4resume where 1=1 and uid="+uid
	o.Raw(sql).QueryRows(dataList)
}

func(this *Info4Resume) SelectBySid(info4resume *Info4Resume) {
	o := orm.NewOrm()
	o.Read(info4resume,"sid")
}
