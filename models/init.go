package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

//初始化
func init() {
	orm.RegisterModel(new(User))
	orm.RegisterModel(new(WXInfo))
	orm.RegisterModel(new(Operate))
	orm.RegisterModel(new(Message))
	orm.RegisterModel(new(Type))
	orm.RegisterModel(new(Device))
	orm.RegisterModel(new(Reservation))
	orm.RegisterModel(new(Setting))
	orm.RegisterModel(new(News))
	orm.RegisterModel(new(TypeChild))
	orm.RegisterModel(new(Order))
	orm.RegisterModel(new(OrderType))
	orm.RegisterModel(new(OrderDevice))
	orm.RegisterModel(new(Protocol))
	orm.RegisterModel(new(Assign))
	orm.RegisterModel(new(AssignHistory))
	orm.RegisterModel(new(File))
	orm.RegisterModel(new(Evaluate))
}

//下面是统一的表名管理
func TableName(name string) string {
	prefix := beego.AppConfig.String("db_dt_prefix")
	return prefix + name
}
