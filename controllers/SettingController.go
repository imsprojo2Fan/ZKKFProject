package controllers

import (
	"ZkkfProject/models"
	"github.com/astaxie/beego/orm"
	"time"
)

type SettingController struct {
	BaseController
}

func(this *SettingController) List()  {
	if this.CheckAuth(1){
		this.EmptyData()
		return
	}
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []orm.Params
	backMap := make(map[string]interface{})

	pageNow,err2 := this.GetInt64("start")
	pageSize,err := this.GetInt64("length")

	if err!=nil || err2!=nil{
		pageNow = 1
		pageSize = 20
		//this.jsonResult(http.StatusOK,-1, "rows or page should be number", nil)
	}
	sortType := this.GetString("order[0][dir]")
	sortCol := "created"
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey

	obj := new(models.Setting)
	//获取总记录数
	records := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList)==0{
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func(this *SettingController) Add()  {

	group := this.GetString("group")
	key := this.GetString("key")
	value := this.GetString("value")
	remark := this.GetString("remark")
	if key==""||value==""{
		this.jsonResult(200,-1,"提交失败，参数不能为空!",nil)
	}
	obj := new(models.Setting)
	obj.Grouping = group
	obj.Key = key
	obj.Value = value
	obj.Remark = remark

	err := obj.Insert(obj)
	if err==nil{
		this.jsonResult(200,1,"提交成功",nil)
	}else{
		this.jsonResult(200,-1,"提交失败,"+err.Error(),err.Error())
	}
}

func(this *SettingController) Update() {
	id,_ := this.GetInt("id")
	group := this.GetString("group")
	key := this.GetString("key")
	value := this.GetString("value")
	remark := this.GetString("remark")
	if id==0||key==""||value==""{
		this.jsonResult(200,-1,"提交失败，参数不能为空!",nil)
	}
	obj := new(models.Setting)
	obj.Id = id
	obj.Grouping = group
	obj.Key = key
	obj.Value = value
	obj.Remark = remark
	obj.Updated = time.Now()
	err := obj.Update(obj)
	if err==nil{
		this.jsonResult(200,1,"更新信息成功",nil)
	}else{
		this.jsonResult(200,-1,"更新信息失败,"+err.Error(),nil)
	}
}

func(this *SettingController) Delete() {
	obj := new(models.Setting)
	obj.Id,_ = this.GetInt("id")
	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	err := obj.Delete(obj)
	if err==nil{
		this.jsonResult(200,1,"删除数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"删除数据失败,"+err.Error(),nil)
	}
}

func(this *SettingController) ListByGroup()  {
	group := this.GetString("group")
	var obj models.Setting
	this.jsonResult(200,1,"查询成功!",obj.SelectByGroup(group))
}


