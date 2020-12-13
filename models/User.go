package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

type User struct {
	Id       int64
	Uid      string
	Type     int
	Account  string
	Name string
	Email    string
	Password string
	Phone    string
	Avatar   string `orm:"size(128)"`
	Gender   string `orm:"size(4)"`
	Birthday string
	Actived int
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *User) UserTBName() string {
	return UserTBName()
}

func(this *User) Insert(user *User) error {

	o := orm.NewOrm()
	_,err := o.Insert(user)
	return err
}

func(this *User) Update(User *User) bool {

	o := orm.NewOrm()
	_,err := o.Update(User)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Delete(User *User) bool {

	o := orm.NewOrm()
	_,err := o.Delete(User)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Read(User *User) bool {

	o := orm.NewOrm()
	err := o.Read(User)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(User.Id)
		return true
	}
}

func(this *User) ReadOrCreate(user User) int64  {
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

func(this *User) Login(user *User) bool{

	o := orm.NewOrm()
	err := o.Raw("SELECT * FROM user WHERE account = ? OR phone = ? OR email = ? OR uid=?", user.Account,user.Account,user.Account,user.Account).QueryRow(&user)

	if err!=nil{
		return false
	}
	return true
}

func(this *User) ReadByMail(user *User) int {

	o := orm.NewOrm()
	o.Read(user,"email","actived")
	//o.Raw("SELECT id,is_activate  FROM user WHERE email = ? AND is_activate=1", user.Mail).QueryRow(&user)
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

func(this *User) Activate(user *User) bool {

	o := orm.NewOrm()
	err := o.Raw("UPDATE user SET activated = 1 WHERE uid = ?", user.Uid)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) UpdatePassword(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Raw("UPDATE user SET password = ? WHERE uid =?", user.Password,user.Uid).Exec()
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdateActived(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Update(user,"email","actived")
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdatePasswordByEmail(user *User) bool {

	o := orm.NewOrm()
	_,err := o.Raw("update user set password=? where email=?",user.Password,user.Email).Exec()
	if err!=nil{
		return false
	}
	return true
}

func(this *User) SelectByCol(user *User,col string) {
	o := orm.NewOrm()
	o.Read(user,col)
}

func(this *User) SelectByEmail(email string,dataList *[]User) {
	o := orm.NewOrm()
	o.Raw("select * from user where email=?",email).QueryRows(dataList)
}

func(this *User) Count(qMap map[string]interface{})int{

	o := orm.NewOrm()
	//cnt,_ := o.QueryTable(new(User)).Filter("account__startswith",qMap["searchKey"]).Count() // SELECT COUNT(*) FROM USER
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	sql := "SELECT id from user where 1=1 and account!=\"root\""
	if qMap["searchKey"]!=nil{
		key:= qMap["searchKey"].(string)
		sql = sql+" and (account like \"%"+key+"%\" or email like\"%"+key+"%\")"
	}
	var arr []orm.Params
	_, _ = o.Raw(sql).Values(&arr)
	return len(arr)
}

func(this *User) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	//qs := o.QueryTable("login_log")
	sql := "SELECT * from user where 1=1 and account!=\"root\""
	if qMap["searchKey"]!=""{
		sql = sql+" and account like '%"+qMap["searchKey"].(string)+"%'"
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
	o.Raw("select * from user ").QueryRows(dataList)
}

func(this *User) ListByArr(arr string,uList *[]User) {
	o := orm.NewOrm()
	o.Raw("select * from user where id in("+arr+")").QueryRows(uList)
}

