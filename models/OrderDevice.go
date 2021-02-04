package models

import "github.com/astaxie/beego/orm"

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 15:09 2021/1/4
 * @Modified By:
 */
type OrderDevice struct {
	Id int
	Rid string
	Name string
	DeviceId string
	Count int
	DetectionCycle string
}

func (this *OrderDevice) ListByRid(rid string) ([]OrderDevice,error) {
	o := orm.NewOrm()
	var res []OrderDevice
	_,err := o.Raw("select o.*,d.name,c.detection_cycle from order_device o,device d,type_child c where o.device_id=d.id and c.id=d.ttid and o.rid=\""+rid+"\"").QueryRows(&res)
	return res,err
}

func (this *OrderDevice) ListByRid2(rid string) ([]OrderDevice,error) {
	o := orm.NewOrm()
	var res []OrderDevice
	_,err := o.Raw("select * from order_device where rid=?",rid).QueryRows(&res)
	return res,err
}

func (this *OrderDevice)DelByRid(o orm.Ormer,rid string)error{
	sqlTxt := "delete from order_device where rid=?"
	_,err := o.Raw(sqlTxt,rid).Exec()
	return err
}
func (this *OrderDevice) Insert(o orm.Ormer,obj *OrderDevice) error {
	_, err := o.Insert(obj)
	return err
}