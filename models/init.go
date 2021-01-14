package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

//初始化
func init() {
	orm.RegisterModel(new(User))
	orm.RegisterModel(new(WXInfo))
	orm.RegisterModel(new(Resume))
	orm.RegisterModel(new(Info4Resume))
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
	orm.RegisterModel(new(AssignHistory))
	orm.RegisterModel(new(File))
}

//下面是统一的表名管理
func TableName(name string) string {
	prefix := beego.AppConfig.String("db_dt_prefix")
	return prefix + name
}

//获取 BackendUser 对应的表名称
func UserTBName() string {
	return TableName("user")
}

//获取 BackendUser 对应的表名称
func WXInfoTBName() string {
	return TableName("wxinfo")
}

func ResumeTBName() string {
	return TableName("resume")
}

func Info4ResumeTBName() string {
	return TableName("info4resume")
}

func OperateTBName() string {
	return TableName("operate")
}

func MessageTBName() string {
	return TableName("message")
}

func TypeTBName() string {
	return TableName("type")
}
func DeviceTBName() string {
	return TableName("device")
}
func ReservationTBName() string {
	return TableName("reservation")
}
func SettingTBName() string {
	return TableName("setting")
}
func NewsTBName() string {
	return TableName("news")
}
func TypeChildTBName() string {
	return TableName("type_child")
}
func OrderTBName() string {
	return TableName("order")
}
func ProtocolTBName() string {
	return TableName("protocol")
}
func AssignHistoryTBName() string {
	return TableName("assign_history")
}
func FileTBName() string {
	return TableName("file")
}