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
	Rid      string    //协议编号
	OrderRid string    //订单编号
	Tid int //type表id
	DeviceId string //设备id可选多项
	Uid      int       //user表id
	Sign     string    //签名
	Date    string //协议日期
	Pay string //付费方式
	TestResult string //是否接受测试结果
	City    string //协议签订城市
	SampleName string //样品名称
	SampleCount string //样品数量
	SampleCode string //样品编号
	DetectionCycle string //检测周期
	DetectionReport string //检测报告
	SampleProcessing string //样品处理
	About string //关于样品
	Parameter string //实验参数要求
	Other string //其他特殊要求
	Result string //参考结果图片
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

	num, err := orm.NewOrm().InsertMulti(len(arr), arr)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Insert %d Protocol' data!\r\n", num)
	}
	return num,err
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

func (this *Protocol) ListByUidAndTid(uid,tid string) ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + ProtocolTBName() + " where uid="+uid+" and tid="+tid
	_, err := o.Raw(sql).Values(&res)
	return res, err
}

func (this *Protocol) ListByRid(rid string) (Protocol,error) {

	o := orm.NewOrm()
	var res Protocol
	err := o.Raw("select * from protocol where order_rid=\""+rid+"\"").QueryRow(&res)
	return res,err
}


