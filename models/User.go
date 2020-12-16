package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

type User struct {
	Id       int
	Uid      string
	Type     int
	Sign int //注册入口 0首页注册 1后台注册 2微信注册
	Disabled int //是否禁用
	Account  string
	Password string
	Name string
	Email    string
	Phone    string
	Avatar   string `orm:"size(128)"`
	Gender   string `orm:"size(8)"`
	Birthday string
	Active int //是否激活 0未激活 1激活
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *User) UserTBName() string {
	return UserTBName()
}

func(this *User) Insert(obj *User) error {

	o := orm.NewOrm()
	_,err := o.Insert(obj)
	return err
}

func(this *User) Update(obj *User) bool {

	o := orm.NewOrm()
	_,err := o.Update(obj,"type","disabled","password","phone","email","gender","name","birthday","avatar","active","remark","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) UpdateProfile(obj *User) bool {

	o := orm.NewOrm()
	_,err := o.Update(obj,"password","phone","email","name","birthday","avatar","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Delete(obj *User) bool {

	o := orm.NewOrm()
	_,err := o.Delete(obj)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Read(id string)(u User,err error) {

	o := orm.NewOrm()
	err = o.Raw(" select * from "+UserTBName()+" where id="+id).QueryRow(&u)
	return u,err
}

func(this *User) ReadOrCreate(obj User) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	if created, id, err := o.ReadOrCreate(&obj, "uid"); err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	return ID
}

func(this *User) Login(obj *User) bool{

	o := orm.NewOrm()
	err := o.Raw("SELECT * FROM "+UserTBName()+" WHERE account = ? OR phone = ? OR email = ? OR uid=?", obj.Account,obj.Account,obj.Account,obj.Account).QueryRow(&obj)

	if err!=nil{
		return false
	}
	return true
}

func(this *User) ReadByMail(obj *User) int {

	o := orm.NewOrm()
	_ = o.Read(obj, "email", "active")
	//o.Raw("SELECT id,is_activate  FROM user WHERE email = ? AND is_activate=1", user.Mail).QueryRow(&user)
	if obj.Email==""{
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

func(this *User) Activate(user *User) bool {

	o := orm.NewOrm()
	err := o.Raw("UPDATE "+UserTBName()+" SET activated = 1 WHERE uid = ?", user.Uid)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) UpdatePassword(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Raw("UPDATE "+UserTBName()+" SET password = ? WHERE uid =?", user.Password,user.Uid).Exec()
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdateActive(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Update(user,"email","active")
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdatePasswordByEmail(user *User) bool {

	o := orm.NewOrm()
	_,err := o.Raw("update "+UserTBName()+" set password=? where email=?",user.Password,user.Email).Exec()
	if err!=nil{
		return false
	}
	return true
}

func(this *User) SelectByCol(user *User,col string) {
	o := orm.NewOrm()
	_ = o.Read(user, col)
}

func(this *User) SelectByEmail(email string,dataList *[]User) {
	o := orm.NewOrm()
	_, _ = o.Raw("select * from "+UserTBName()+" where email=?", email).QueryRows(dataList)
}

func(this *User) Count(qMap map[string]interface{})int{

	o := orm.NewOrm()
	//cnt,_ := o.QueryTable(new(User)).Filter("account__startswith",qMap["searchKey"]).Count() // SELECT COUNT(*) FROM USER
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	sql := "SELECT id from "+UserTBName()+" where 1=1 and account!=\"root\""
	if qMap["searchKey"]!=""{
		key:= qMap["searchKey"].(string)
		sql = sql+" and (account like \"%"+key+"%\" or email like\"%"+key+"%\" or phone like \"%"+key+"%\")"
	}
	var arr []orm.Params
	_, _ = o.Raw(sql).Values(&arr)
	return len(arr)
}

func(this *User) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT * from "+UserTBName()+" where 1=1 and account!=\"root\""
	if qMap["searchKey"]!=""{
		key := qMap["searchKey"].(string)
		sql = sql+" and (account like \"%"+key+"%\" or email like\"%"+key+"%\" or phone like \"%"+key+"%\")"
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
	_, _ = o.Raw(sql).Values(&maps)
	return maps
}

func(this *User) All(dataList *[]User) {
	o := orm.NewOrm()
	_, _ = o.Raw("select * from " + UserTBName()).QueryRows(dataList)
}

func(this *User) ListByArr(arr string,uList *[]User) {
	o := orm.NewOrm()
	_, _ = o.Raw("select * from " + UserTBName() + " where id in(" + arr + ")").QueryRows(uList)
}

