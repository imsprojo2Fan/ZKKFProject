package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 13:55 2021/2/23
 * @Modified By:
 */
type AssignDetail struct {
	Id int
	RandomId string `json:"random_id"`
	Step int
	Uid int
	Status int
	Role int
}

func(this *AssignDetail)Insert(o orm.Ormer,item AssignDetail)error{
	_,err := o.Insert(&item)
	return err
}

func(this *AssignDetail) MultiInsert(o orm.Ormer,rid string,arr []AssignDetail)(int64,error){

	_,err := o.Raw("delete from assign_detail where random_id=?",rid).Exec()
	if err!=nil{
		return 0, err
	}
	var count int64
	count, err = o.InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d assign_detail' data!\r\n", count)
	}
	return count,err
}
func(this *AssignDetail)UpdateByRid(o orm.Ormer,item AssignDetail)error{
	sqlTxt := " update assign_detail set status=? where random_id=?"
	_,err := o.Raw(sqlTxt,item.Status,item.RandomId).Exec()
	return err
}

func(this *AssignDetail)AssignList(rid string)(res[]AssignDetail){
	_, _ = orm.NewOrm().Raw("select a.* from assign_detail a where a.random_id=? order by a.step asc", rid).QueryRows(&res)
	return res
}
func(this *AssignDetail)ListByStep(rid,step string)(res AssignDetail){
	_ = orm.NewOrm().Raw("select * from assign_detail where random_id=? and step=?",rid,step).QueryRow(&res)
	return res
}
