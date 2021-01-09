package models

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
	Type string `orm:"-"`
	Count int
	Data []OrderDevice `orm:"-"`
	Protocol Protocol `orm:"-"`
}