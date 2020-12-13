package models

import (
	"time"
	"github.com/astaxie/beego/orm"
	"fmt"
)

// Model Struct
type Message struct {
	Id  int
	Uid int64
	Company string
	Name string
	Phone string
	Email string
	Message string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Message) TableName() string {
	return MessageTBName()
}

func(this *Message) Insert(Message *Message) bool {

	o := orm.NewOrm()
	_,err := o.Insert(Message)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Message) Update(Message *Message) bool {

	o := orm.NewOrm()
	_,err := o.Update(Message)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Message) Delete(Message *Message) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Message)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Message) Read(Message *Message) bool {

	o := orm.NewOrm()
	err := o.Read(Message)
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

func(this *Message) ListAll(uid interface{},dataList *[]Message){

	o := orm.NewOrm()
	o.Raw("select * from message where uid=?",uid).QueryRows(dataList)
}
