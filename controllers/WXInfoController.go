package controllers

import (
	"github.com/astaxie/beego"
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"net/http"
)

type WXInfoController struct {
	beego.Controller
}

func (this *WXInfoController)Insert()  {
	rJson := new(utils.ResultJson)
	name:= this.GetString("name","")
	user := new(models.WXInfo)
	user.NickName = name
	if user.Insert(user)>0{
		rJson.Status = http.StatusOK
		rJson.Code = 1
		rJson.Message = "Add Success"
		rJson.Data = nil
	}else{
		rJson.Status = http.StatusOK
		rJson.Code = -1
		rJson.Message = "Add Failure"
		rJson.Data = nil
	}
	this.Data["json"] = rJson
	this.ServeJSON()
	this.StopRun()

}
