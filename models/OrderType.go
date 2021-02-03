package models

import "github.com/astaxie/beego/orm"

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 15:08 2021/1/4
 * @Modified By:
 */

type OrderType struct {
	Id int
	Rid string
	Tid string
	Name string
	Type string `orm:"-"`
	Count int
	Data []OrderDevice `orm:"-"`
	Protocol Protocol `orm:"-"`
}

func (this *OrderType) ListByRid(rid string) (OrderType,error) {
	o := orm.NewOrm()
	var res OrderType
	err := o.Raw("select o.*,t.name,t.detection_cycle from order_type o,`type` t where o.tid=t.id and o.rid=\""+rid+"\"").QueryRow(&res)
	return res,err
}

func (this *OrderType) Insert(o orm.Ormer,obj *OrderType) error {
	_, err := o.Insert(obj)
	return err
}
