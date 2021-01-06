package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"
	"strconv"
	"strings"
	"time"
)

// Model Struct
type Protocol struct {
	Id       int
	Uid      int       //创建人id/user表id
	Uuid     int       //处理人id
	Rid      string    //订单编号
	Count    int //订单项目数量
	Price    float32 //订单金额
	Status   int    //订单状态，0待确认，1已确认，2已取消，3已完成
	Remark   string    `orm:"size(255)"`
	Updated  time.Time //`orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Protocol) TableName() string {
	return ProtocolTBName()
}

func (this *Protocol) Insert(o orm.Ormer,obj *Protocol) error {

	//o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func(this *Protocol) MultiInsert(arr []*Protocol)(int64,error){
	var count int64
	var err error
	if num, err := orm.NewOrm().InsertMulti(len(arr), arr); err != nil {
		fmt.Println(err)
	} else {
		count = num
		fmt.Printf("Insert %d Protocol' data!\r\n", num)
	}
	return count,err
}

func (this *Protocol) Update(obj *Protocol) error {

	o := orm.NewOrm()
	_, err := o.Update(obj,"status", "remark", "updated")
	return err
}

func (this *Protocol) Delete(obj *Protocol) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Protocol) SelectByUid(obj *Protocol) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Protocol) DataCount(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+ProtocolTBName()+" r where 1=1 "
	sql := "SELECT o.id from protocol p,user u where p.uid=u.id "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and p.uid="+strconv.Itoa(uid)
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (p.remark like \"%" + key +"%\" or p.rid like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Protocol) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT o.*,u.name,u.phone,u.company from protocol p,user u where p.uid=u.id "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and p.uid="+strconv.Itoa(uid)
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (p.remark like \"%" + key +"%\" or p.rid like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
	}
	if qMap["sortCol"] != nil && qMap["sortType"] != nil {
		sortCol := qMap["sortCol"].(string)
		if strings.Contains(sortCol,"name")||strings.Contains(sortCol,"phone")||strings.Contains(sortCol,"company"){
			sortCol = "u."+sortCol
		}else{
			sortCol = "o."+sortCol
		}
		sorType := qMap["sortType"].(string)
		sql = sql + " order by " + sortCol + " " + sorType
	} else {
		sql = sql + " order by p.id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, err := o.Raw(sql).Values(&maps)
	return maps, err
}

func (this *Protocol) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + ProtocolTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}


