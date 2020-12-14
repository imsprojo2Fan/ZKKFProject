package models

import (
	"time"
	"github.com/astaxie/beego/orm"
	"fmt"
)

// Model Struct
type Operate struct {
	Id  int
	Uid int64
	Rid string
	Type int
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Operate) TableName() string {
	return OperateTBName()
}

func(this *Operate) Insert(Operate *Operate) bool {

	o := orm.NewOrm()
	_,err := o.Insert(Operate)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Operate) Update(Operate *Operate) bool {

	o := orm.NewOrm()
	_,err := o.Update(Operate)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Operate) Delete(Operate *Operate) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Operate)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Operate) Read(Operate *Operate) bool {

	o := orm.NewOrm()
	err := o.Read(Operate)
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

func(this *Operate) ReadOrCreate(operate *Operate) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	if created, id, err := o.ReadOrCreate(&operate, "rid","uid"); err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	return ID
}
