package models

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 15:09 2021/1/4
 * @Modified By:
 */
type OrderDevice struct {
	Id int
	Rid string
	Name string `orm:"-"`
	DeviceId string
	Count int
}