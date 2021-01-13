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
}

func (this *OrderDevice) ListByRid(rid string) ([]OrderDevice,error) {

	o := orm.NewOrm()
	var res []OrderDevice
	_,err := o.Raw("select o.*,d.name from order_device o,device d where o.device_id=d.id and o.rid=\""+rid+"\"").QueryRows(&res)
	return res,err
}