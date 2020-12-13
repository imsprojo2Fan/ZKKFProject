package models

import (
	"github.com/astaxie/beego/orm"
	"fmt"
	"time"
)

// Model Struct
type WXInfo struct {
	Id   int
	Uid string
	Openid string `orm:"size(64)"`
	Unionid string `orm:"size(64)"`
	Type int
	Account string
	Email string
	Password string
	Phone string
	NickName string `orm:"size(128)"`
	Avatar string `orm:"size(128)"`
	Gender string `orm:"size(4)"`
	Country string `orm:"size(16)"`
	Province string `orm:"size(16)"`
	City string `orm:"size(16)"`
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *WXInfo) TableName() string {
	return WXInfoTBName()
}

func(this *WXInfo) Insert(user *WXInfo) int {

	o := orm.NewOrm()

	if user.Account !=""{
		o.Read(user,"account")
		if user.Id>0{
			return -2//账号已存在
		}
	}

	if user.Email !=""{
		o.Read(user,"email")
		if user.Id>0{
			return -2//邮箱已存在
		}
	}

	if user.Phone !=""{
		o.Read(user,"phone")
		if user.Id>0{
			return -2//手机号已存在
		}
	}
	_,err := o.Insert(user)
	if err!=nil{
		return -1
	}else{
		return 1
	}
}

func(this *WXInfo) Update(WXInfo *WXInfo) bool {

	o := orm.NewOrm()
	_,err := o.Update(WXInfo)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *WXInfo) Delete(WXInfo *WXInfo) bool {

	o := orm.NewOrm()
	_,err := o.Delete(WXInfo)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *WXInfo) Read(WXInfo *WXInfo) bool {

	o := orm.NewOrm()
	err := o.Read(WXInfo)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(WXInfo.Id, WXInfo.NickName)
		return true
	}
}

func(this *WXInfo) ReadOrCreate(user WXInfo) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	if created, id, err := o.ReadOrCreate(&user, "uid"); err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	return ID
}

func(this *WXInfo) Login(user *WXInfo) bool{

	o := orm.NewOrm()
	err := o.Raw("SELECT * FROM wxinfo WHERE account = ? OR phone = ? OR email = ? OR uid=?", user.Account,user.Account,user.Account,user.Account).QueryRow(&user)

	if err!=nil{
		return false
	}
	return true
}

func(this *WXInfo) ReadByMail(user *WXInfo) int {

	o := orm.NewOrm()
	o.Read(user,"mail")
	//o.Raw("SELECT id,is_activate  FROM wxinfo WHERE mail = ? AND is_activate=1", user.Mail).QueryRow(&user)
	if user.Email==""{
		return -1
	}
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	/*if created, _, err := o.ReadOrCreate(user, "mail"); err == nil {
		if created {
			return 0
		} else {
			return 1
		}
	}*/
	return 1

}

func(this *WXInfo) Activate(user *WXInfo) bool {

	o := orm.NewOrm()
	err := o.Raw("UPDATE wxinfo SET is_activate = 1 WHERE uid = ?", user.Uid)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *WXInfo) UpdatePassword(user *WXInfo) bool {

	o := orm.NewOrm()
	_, err := o.Raw("UPDATE wxinfo SET password = ? WHERE uid =?", user.Password,user.Uid).Exec()
	if err == nil {
		return true
	}
	return false
}

