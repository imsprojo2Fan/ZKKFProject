package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"net/http"
	"strings"
	"time"
)

type MainController struct {
	BaseController
}
var userObj models.User
func (this *MainController) Index() {
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	userInfo := userObj.SelectById(uid)
	//userInfo := session.Get("user").(*models.User)
	tMap := make(map[string]interface{})
	tMap["id"] = userInfo.Id
	tMap["type"] = userInfo.Type
	tMap["account"] = userInfo.Account
	tMap["name"] = userInfo.Name
	tMap["email"] = userInfo.Email
	tMap["phone"] = userInfo.Phone
	tMap["company"] = userInfo.Company
	tMap["address"] = userInfo.Address
	tMap["invoice"] = userInfo.Invoice
	tMap["invoice_code"] = userInfo.InvoiceCode
	this.Data["userInfo"] = tMap
	this.Data["account"] = session.Get("account")
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["random"] = time.Now().Unix()
	/*isPhone := session.Get("isPhone").(int)
	if isPhone==1{
		this.TplName = "main/phoneIndex.html"
	}else{
		this.TplName = "main/index.html"
	}*/
	this.TplName = "main/index.html"
}

func (this *MainController) Redirect() {
	redirect := this.Ctx.Input.Param(":redirect")
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["random"] = time.Now().Unix()
	//处理上传图片跳转
	this.Data["btnId"] = this.GetString("btnId")
	this.Data["domId"] = this.GetString("domId")
	this.Data["maxSize"] = this.GetString("maxSize")
	redirect = "main/" + redirect
	if !strings.Contains(redirect, ".html") {
		redirect = redirect + ".html"
	}
	this.TplName = redirect
}

func (this *MainController) Alive() {
	this.jsonResult(http.StatusOK, 1, "alive!", sysinit.InitTime)
}


