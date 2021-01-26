package models

import (
	"github.com/astaxie/beego/orm"
	"strconv"
	"time"
)

// Model Struct
type Reservation struct {
	Id       int
	Uid      int       //创建人id/user表id
	Uuid     int       //预约人id/user表id，可能为0，有可能为管理员创建
	DeviceId int       //设备id
	Rid      string    //唯一识别字符串
	Date     string //预约日期
	TimeId   int       //系统设置表id，时间段选择
	Status   int       //预约状态，0待确认，1已确认，2已取消，3已完成
	Remark   string    `orm:"size(255)"`
	Message string //留言信息
	Del int //软删除标记
	Updated  time.Time //`orm:"auto_now_add;type(datetime)"`
	Created  time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *Reservation) TableName() string {
	return ReservationTBName()
}

func (this *Reservation) Insert(obj *Reservation) error {

	o := orm.NewOrm()
	_, err := o.Insert(obj)
	return err
}

func (this *Reservation) Insert2(obj *Reservation,o orm.Ormer) error {
	_, err := o.Insert(obj)
	return err
}

func (this *Reservation) Update(obj *Reservation) error {

	o := orm.NewOrm()
	_, err := o.Update(obj,"status", "remark", "updated")
	return err
}

func (this *Reservation) Delete(obj *Reservation) error {

	o := orm.NewOrm()
	_, err := o.Delete(obj)
	return err
}

func (this *Reservation) SoftDelete(id string) error {

	o := orm.NewOrm()
	_,err := o.Raw("update reservation set del=1,updated=now() where id=\""+id+"\"").Exec()
	return err
}

func (this *Reservation) SelectByUid(obj *Reservation) {
	o := orm.NewOrm()
	_ = o.Read(obj, "uid")
}

func (this *Reservation) SelectByName(obj *Reservation) {
	o := orm.NewOrm()
	_ = o.Read(obj, "name")
}

func (this *Reservation) Count(qMap map[string]interface{}) (int, error) {

	o := orm.NewOrm()
	//sql := "SELECT id from "+ReservationTBName()+" r where 1=1 "
	sql := "SELECT r.id from reservation r LEFT JOIN user u on r.uuid=u.id LEFT JOIN device d on r.device_id=d.id LEFT JOIN setting s on r.time_id=s.id and r.del=0 "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and r.uuid="+strconv.Itoa(uid)
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (r.remark like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
	}
	sql += " where r.del=0"
	var arr []orm.Params
	_, err := o.Raw(sql).Values(&arr)
	return len(arr), err
}

func (this *Reservation) ListByPage(qMap map[string]interface{}) ([]orm.Params, error) {
	var maps []orm.Params
	o := orm.NewOrm()
	//sql := "SELECT r.*,u.name,u.phone from user u,"+ReservationTBName()+" r where u.id=r.uid "
	sql := "SELECT r.*,u.name,u.company,u.phone,d.name as deviceName,s.value as time from reservation r LEFT JOIN user u on r.uuid=u.id LEFT JOIN device d on r.device_id=d.id LEFT JOIN setting s on r.time_id=s.id "
	if qMap["uid"] !=nil{
		uid := qMap["uid"].(int)
		sql += " and r.uuid="+strconv.Itoa(uid)
	}
	if qMap["searchKey"] != "" {
		key := qMap["searchKey"].(string)
		sql += " and (r.remark like \"%" + key + "%\" or u.name like \"%" + key + "%\" or u.phone like \"%" + key + "%\")"
	}
	if qMap["sortCol"] != nil && qMap["sortType"] != nil {
		sortCol := qMap["sortCol"].(string)
		sorType := qMap["sortType"].(string)
		sql = sql + " where r.del=0 order by r." + sortCol + " " + sorType
	} else {
		sql = sql + " where r.del=0 order by r.id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow, 10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize, 10)
	sql = sql + " LIMIT " + pageNow_ + "," + pageSize_
	_, err := o.Raw(sql).Values(&maps)
	return maps, err
}

func (this *Reservation) All() ([]orm.Params, error) {
	var res []orm.Params
	o := orm.NewOrm()
	sql := "select * from " + ReservationTBName() + " where 1=1"
	_, err := o.Raw(sql).Values(&res)
	return res, err
}
func (this *Reservation) TimeQuery(deviceId, startDate,endDate string) ([]Reservation, error) {
	var res []Reservation
	o := orm.NewOrm()
	sql := "select * from " + ReservationTBName() + " where device_id=" + deviceId + " and date between \"" + startDate + "\" and \""+endDate+"\" and status!=2 and del=0 "
	_, err := o.Raw(sql).QueryRows(&res)
	return res, err
}

func (this *Reservation) ListByUidAndDate(uid string) ([]Reservation, error) {
	var res []Reservation
	o := orm.NewOrm()
	sql := "select * from " + ReservationTBName() + " where uid="+uid+" and TO_DAYS(created) = TO_DAYS(NOW()) and status!=2 and del=0 "
	_, err := o.Raw(sql).QueryRows(&res)
	return res,err
}
