package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

type Setting struct {
	Id       int
	Grouping string
	Key  	 string
	Value    string
	Remark  string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (this *Setting) SettingTBName() string {
	return SettingTBName()
}

func(this *Setting) Insert(model *Setting) error {

	o := orm.NewOrm()
	_,err := o.Insert(model)
	return err
}

func(this *Setting) InsertOrUpdate(model *Setting) int {

	o := orm.NewOrm()
	_,err := o.InsertOrUpdate(model,"key")
	if err!=nil{
		fmt.Println(err)
		return -1
	}else{
		return 1
	}
}

func(this *Setting) Update(Setting *Setting) error {

	o := orm.NewOrm()
	_,err := o.Update(Setting,"grouping","key","value","remark","updated")
	return err

}

func(this *Setting) UpdateVal(Setting *Setting) error {

	o := orm.NewOrm()
	sqlTxt := "update setting set value='"+Setting.Value+"',updated=now() where grouping='"+Setting.Grouping+"' and `key`='"+Setting.Key+"'"
	_,err := o.Raw(sqlTxt).Exec()
	return err

}

func(this *Setting) Delete(Setting *Setting) error {

	o := orm.NewOrm()
	_,err := o.Delete(Setting)
	return err
}

func(this *Setting) Read(Setting *Setting) bool {

	o := orm.NewOrm()
	err := o.Read(Setting)
	if err == orm.ErrNoRows {
		fmt.Println(err)
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(Setting.Id)
		return true
	}
}

func(this *Setting) SelectByCol(model *Setting,col string) {
	o := orm.NewOrm()
	_ = o.Read(model, col)
}

func(this *Setting) SelectByKey(val string)(orm.Params,error) {
	o := orm.NewOrm()
	var res []orm.Params
	_,err :=o.Raw("SELECT * from setting where `key`=\"" + val + "\"").Values(&res)
	if err!=nil{
		return nil,err
	}
	return res[0],err
}

func(this *Setting) SelectByGroup(val string)(res []Setting) {
	o := orm.NewOrm()
	_, _ = o.Raw("SELECT * from setting where grouping=\"" + val + "\"").QueryRows(&res)
	return res
}

func(this *Setting) All()[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	_, _ = o.Raw("SELECT * from setting").Values(&maps)
	return maps
}

func(this *Setting) MultiInsert(arr []*Setting)int64{
	var count int64
	if num, err := orm.NewOrm().InsertMulti(len(arr), arr); err != nil {
		fmt.Println(err)
	} else {
		count = num
		fmt.Printf("Insert %d setting' data!\r\n", num)
	}
	return count
}

func RangeValue(param []Setting,key string)string{
	var val string
	for _,item := range param{
		if item.Key==key{
			val = item.Value
			break
		}
	}
	return val
}

func(this *Setting) Count(qMap map[string]interface{})int{

	o := orm.NewOrm()
	sql := "SELECT id from setting where 1=1 "
	if qMap["searchKey"]!=nil{
		key:= qMap["searchKey"].(string)
		sql = sql+" and (`key` like \"%"+key+"%\" or value like\"%"+key+"%\")"
	}
	var arr []orm.Params
	_, _ = o.Raw(sql).Values(&arr)
	return len(arr)
}

func(this *Setting) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT * from setting where 1=1 "
	if qMap["searchKey"]!=""{
		key:= qMap["searchKey"].(string)
		sql = sql+" and (`key` like \"%"+key+"%\" or value like\"%"+key+"%\")"
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
