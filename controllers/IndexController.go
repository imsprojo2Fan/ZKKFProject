package controllers

import (
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"fmt"
	"net/http"
	"net/smtp"
	"strings"
)

type IndexController struct {
	BaseController
}

func (c *IndexController) Index0() {

	//跳转页面及传递数据
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"
	//设置token
	token := c.XSRFToken()
	c.Data["_xsrf"] = token
	c.TplName = "index.html"

}

func (this *IndexController) Index() {
	urlTxt := this.Ctx.Input.Param(":url")
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	id := session.Get("id")
	//首页判断是否已登录过
	if id==nil{
		this.Data["login"] = 0
	}else{
		this.Data["login"] = 1
	}

	if urlTxt==""{
		urlTxt = "index.html"
	}

	//读取本地html文档并解析，动态更改节点信息
	filePath := "./views/"+urlTxt
	if !strings.HasSuffix(filePath,"html"){
		filePath += ".html"
		urlTxt += ".html"
	}
	isExit := utils.CheckFileIsExist(filePath)
	if !isExit{
		urlTxt = "tip/404.html"
	}
	this.TplName = urlTxt

}

func (this *IndexController) Template()  {
	urlTxt := this.Ctx.Input.Param(":url")
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()
	session, _ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	id := session.Get("id")
	//首页判断是否已登录过
	if id==nil{
		this.Data["login"] = 0
	}else{
		this.Data["login"] = 1
	}

	//读取本地html文档并解析，动态更改节点信息
	filePath := "./views/"+urlTxt
	if !strings.HasSuffix(filePath,"html"){
		filePath += ".html"
		urlTxt += ".html"
	}
	isExit := utils.CheckFileIsExist(filePath)
	if !isExit{
		urlTxt = "tip/404.html"
	}
	this.TplName = urlTxt
}

func (this *IndexController) Other() {

	urlTxt := this.Ctx.Input.Param(":url")
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()

	var backUrl string
	//读取本地html文档并解析，动态更改节点信息
	filePath := "./views/other/"+urlTxt
	if strings.Index(urlTxt,".html")>0{
		isExit := utils.CheckFileIsExist(filePath)
		if !isExit{
			backUrl = "tip/404.html"
		}else{
			backUrl = "other/"+urlTxt
		}
	}else{
		backUrl = "tip/404.html"
	}
	this.TplName = backUrl

}

func (this *IndexController) Effect() {

	eType := this.Ctx.Input.Param(":type")
	eType = eType+".html"

	var backUrl string
	//读取本地html文档并解析，动态更改节点信息
	filePath := "./views/effect/"+eType
	isExit := utils.CheckFileIsExist(filePath)
	if !isExit{
		backUrl = "tip/404.html"
	}else{
		backUrl = "effect/"+eType
	}
	this.TplName = backUrl
}

func (this *IndexController) Mail4Index()  {
	contact := this.GetString("contact")
	message := this.GetString("message")
	go SendMail(contact,message)
	this.jsonResult(200,1,"提交成功",nil)
}

func SendMail(parameter1,parameter2 string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{"imsprojo2fan@foxmail.com"}

	nickname := "中科科辅"
	user := "zooori@foxmail.com"
	subject := "中科科辅-首页留言"
	content_type := "Content-Type: text/plain; charset=UTF-8"

	body := "联系方式:"+parameter1+"\r\n留言信息:"+parameter2
	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}
}

func (this *IndexController) SignData() {
	code := this.GetString("code")
	if code==""{
		this.jsonResult(http.StatusOK, -1, "参数错误",nil)
	}
	signName := this.GetString("data")
	if signName!=""{
		sysinit.SignMap.Store(code,signName)
	}
	res,_ := sysinit.SignMap.Load(code)
	this.jsonResult(http.StatusOK, 1, "签名",res)
}


