package models

import (
	"errors"
	"fmt"
	"github.com/astaxie/beego/orm"

	"strconv"
	"strings"
	"time"
)

// Model Struct
type Order struct {
	Id       int
	Uid      int       //创建人id/user表id
	Tid 	 int //type表id
	Uuid     int       //处理人id
	Rid      string    //订单编号
	Count    int //订单项目数量
	Price    float32 //订单金额
	Status   int    //订单状态，0待确认，1已确认，2已取消，3已完成
	Remark   string    `orm:"size(255)"`
	File string
	Del int //软删除标记
	Updated  time.Time //`orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Order) TableName() string {
	return OrderTBName()
}

func (this *Order) Insert(o orm.Ormer,obj *Order) error {

	//o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func(this *Order) MultiInsert(arr []*Order)(int64,error){

	num, err := orm.NewOrm().InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d order' data!\r\n", num)
	}
	return num,err
}
func(this *Order) MultiInsert4Order(o orm.Ormer,arr []Order)(int64,error){

	num, err := o.InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d order' data!\r\n", num)
	}
	return num,err
}

func(this *Order) MultiInsert4Type(o orm.Ormer,arr []OrderType)(int64,error){

	num, err := o.InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d order_type' data!\r\n", num)
	}
	return num,err
}
func(this *Order) MultiInsert4Device(o orm.Ormer,arr []OrderDevice)(int64,error){

	num, err := o.InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d order_device' data!\r\n", num)
	}
	return num,err
}
func(this *Order) MultiInsert4Protocol(o orm.Ormer,arr []Protocol)(int64,error){

	count, err := o.InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d protocol' data!\r\n", count)
	}
	return count,err
}

func (this *Order) Update(obj *Order) error {

	o := orm.NewOrm()
	_, err := o.Update(obj,"status", "remark","file", "updated")
	return err
}

func (this *Order) UpdateByCol(o orm.Ormer,col string,val,rid interface{}) error {
	sqlTxt := "update `order` set "+col+"=? where rid=?"
	_, err := o.Raw(sqlTxt,val,rid).Exec()
	return err
}

func (this *Order) SoftDelete(rid string) error {

	o := orm.NewOrm()
	_,err := o.Raw("update `order` set del=1,updated=now() where rid=\""+rid+"\"").Exec()
	return err
}

func (this *Order) Delete(obj *Order) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Order) DeleteByRid(rid string) error {

	o := orm.NewOrm()
	_ = o.Begin()
	_,err := o.Raw("delete from `order` where rid=\""+rid+"\"").Exec()
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	_,err = o.Raw("delete from order_type where rid=\""+rid+"\"").Exec()
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	_,err = o.Raw("delete from order_device where rid=\""+rid+"\"").Exec()
	if err!=nil{
		_ = o.Rollback()
		return err
	}
	_ = o.Commit()
	return err
}

func (this *Order) SelectByUid(obj *Order) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Order) SelectByName(obj *Order) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *Order) DataCount(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+OrderTBName()+" r where 1=1 "
	sql := "SELECT o.id from `order` o,user u where o.uid=u.id and o.del=0 "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and o.uid="+strconv.Itoa(uid)
	}
	if qMap["tid"].(string) != "0" {
		tid := qMap["tid"].(string)
		sql = sql + " and o.tid="+tid
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (o.remark like \"%" + key +"%\" or o.rid like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
	}
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Order) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	sql := "SELECT o.*,u.name,u.phone,u.company from `order` o,user u where o.uid=u.id and o.del=0 "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and o.uid="+strconv.Itoa(uid)
	}
	if qMap["tid"].(string) != "0" {
		tid := qMap["tid"].(string)
		sql = sql + " and o.tid="+tid
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (o.remark like \"%" + key +"%\" or o.rid like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
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
		sql = sql + " order by o.id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, err := o.Raw(sql).Values(&maps)
	return maps, err
}

func (this *Order) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + OrderTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Order) ListByRid4Type(rid string) (string,error) {

	o := orm.NewOrm()
	var tArr []orm.Params
	_,err := o.Raw("select * from order_type o,type t where o.tid=t.id and o.rid=\""+rid+"\"").Values(&tArr)
	if err!=nil{
		return "",err
	}
	res := tArr[0]["name"].(string)
	return res,err
}

func (this *Order) ListByRid(rid string) (error,[]map[string]interface{}) {

	o := orm.NewOrm()
	var tArr []orm.Params
	_,err := o.Raw("select * from order_type o,type t where o.tid=t.id and o.rid=\""+rid+"\"").Values(&tArr)
	if err!=nil{
		return err,nil
	}
	var dArr []orm.Params
	_,err = o.Raw("select d.name,d.id,o.count,t.id as tid from order_device o,device d,type t,type_child c where o.device_id=d.id and d.ttid=c.id and c.tid=t.id and o.rid=\""+rid+"\"").Values(&dArr)
	if err!=nil{
		return err,nil
	}
	var backArr []map[string]interface{}
	for _,item1 := range tArr{
		temp := make(map[string]interface{})
		temp["name"] = item1["name"]
		temp["count"] = item1["count"]
		tid := item1["tid"].(string)
		temp["tid"] = tid
		var tempArr []interface{}
		for _,item2 := range dArr{
			tid2 := item2["tid"].(string)
			if tid==tid2{
				tempArr = append(tempArr,item2)
			}
		}
		temp["data"] = tempArr
		backArr = append(backArr,temp)
	}

	return err,backArr
}

func (this *Order) UpdateStatus(rid,status string,o orm.Ormer)error{
	if o==nil{
		o = orm.NewOrm()
	}
	_,err := o.Raw("update `order` set status=? where rid=?",status,rid).Exec()
	return err
}

func (this *Order) UpdateReport(rid,file string)error{
	_,err := orm.NewOrm().Raw("update `order` set file=? where rid=?",file,rid).Exec()
	return err
}

func (this *Order) Info(rid string) (map[string]interface{},error) {
	bMap := make(map[string]interface{})
	o := orm.NewOrm()
	//查询用户信息
	var res []orm.Params
	_,err := o.Raw("select * from `order` where rid=?",rid).Values(&res)
	if err!=nil{
		return nil, err
	}
	if res==nil{
		return nil, errors.New("No  data!")
	}
	bMap = res[0]

	//获取设备信息
	var dArr []orm.Params
	_,err = o.Raw("select d.name,d.id,o.count,t.id as tid from order_device o,device d,type t,type_child c where o.device_id=d.id and d.ttid=c.id and c.tid=t.id and o.rid=\""+rid+"\"").Values(&dArr)
	if err!=nil{
		return nil,err
	}
	bMap["selectDeviceArr"] = dArr
	//获取协议信息
	var protocol Protocol
	err = o.Raw("select * from protocol where random_id=?",rid).QueryRow(&protocol)
	if err!=nil{
		return nil,err
	}
	bMap["protocol"] = protocol

	//按type返回对应设备
	var deviceArr []orm.Params
	_,err = o.Raw("select * from device where tid=?",res[0]["tid"]).Values(&deviceArr)
	bMap["deviceArr"] = deviceArr
	return bMap,err
}

