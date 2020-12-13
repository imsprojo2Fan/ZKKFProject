package controllers

import (
	"github.com/astaxie/beego"
	"net/http"
	"ZkkfProject/models"
	"fmt"
	"ZkkfProject/utils"
	"ZkkfProject/models/other"
	"net/smtp"
	"strings"
	"encoding/base64"
	"time"
	"ZkkfProject/enums"
)

type LoginController struct {
	beego.Controller
}

func(this *LoginController) LoginIndex()  {
	this.Data["_xsrf"] = this.XSRFToken()
	this.TplName = "login/login.html"
}

func(this *LoginController) Timeout()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	session.Set("id",nil)
	id:= session.Get("id")
	fmt.Println("TimeOutId:",id)
	if !this.IsAjax(){
		this.Data["_xsrf"] = this.XSRFToken()
		this.Data["timeout"]= time.Now()
		this.TplName = "login/login.html"
		return
	}
	//this.Abort("未登录或会话已过期，请重新登录！")
	//this.Ctx.Redirect(302,"/login")
	this.jsonResult(http.StatusOK,-999, "登录已超时，请重新登录！", nil)
}

func(this *LoginController) Validate()  {

	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)

	oType := this.GetString("type")
	if oType== ""{
		this.jsonResult(http.StatusOK,-1, "type can`t be null", nil)
	}
	user := new(models.User)
	key := beego.AppConfig.String("password::key")
	salt := beego.AppConfig.String("password::salt")
	if oType=="login"{
		passKey := this.GetString("passKey")
		if passKey!=""{//密钥登录
			user.Account = passKey
			if !user.Login(user){
				this.jsonResult(http.StatusOK,-1, "登录密钥不正确!", nil)
			}
		}else{//普通登录
			account := this.GetString("account")
			password := this.GetString("password")
			if account==""||password==""{
				this.jsonResult(http.StatusOK,-1, "账号或密码不能为空!", nil)
			}
			user.Account = account
			if !user.Login(user){
				this.jsonResult(http.StatusOK,-1, "账号不存在!", nil)
			}
			result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
			if err != nil {
				panic(err)
			}
			resultStr := base64.StdEncoding.EncodeToString(result)
			if user.Password != resultStr{
				this.jsonResult(http.StatusOK,-1, "账号或密码不正确!", nil)
			}
		}
		session.Set("user",user)
		session.Set("account",user.Account)
		session.Set("id",user.Id)
		_ = session.Set("type", user.Type)
		fmt.Println("Account:",user.Account)
		fmt.Println("id:",session.Get("id"))
		this.jsonResult(http.StatusOK,1, "账号验证登录成功!", user.Id)

	}else if oType=="validate4made"{//已有账号使用简历模板
		account := this.GetString("account")
		password := this.GetString("password")
		if account==""||password==""{
			this.jsonResult(http.StatusOK,-1, "账号或密码不能为空!", nil)
		}
		user.Account = account
		if !user.Login(user){
			this.jsonResult(http.StatusOK,-1, "账号不存在!", nil)
		}
		result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
		if err != nil {
			panic(err)
		}
		resultStr := base64.StdEncoding.EncodeToString(result)
		if user.Password != resultStr{
			this.jsonResult(http.StatusOK,-1, "账号或密码不正确!", nil)
		}
		session.Set("uid4login",user.Uid)
		session.Set("user",user)
		session.Set("account",user.Account)
		session.Set("id",user.Id)
		session.Set("is2made",true)//设置登录成功即跳转到我的制作页面
		fmt.Println("Account:",user.Account)
		//查询用户是否已填写过简历信息
		info4resume := new(models.Info4Resume)
		info4resume.Uid = user.Id
		info4resume.ReadByUid(info4resume)
		if info4resume.Id>0&&info4resume.Rid!=this.GetString("rid"){
			//添加使用当前模板
			info4resume.Id = info4resume.Id+1
			info4resume.Rid = this.GetString("rid")
			info4resume.Sid = utils.RandStringBytesMaskImprSrc(20)
			info4resume.Insert(info4resume)
			//添加当前用户操作记录
			operate := new(models.Operate)
			operate.Uid = user.Id
			operate.Rid = this.GetString("rid")
			operate.Type = 2
			operate.Insert(operate)
			this.jsonResult(http.StatusOK,1, "新建模板成功!", nil)
		}else if info4resume.Rid==this.GetString("rid"){//已使用过当前模板则不再新增记录
			this.jsonResult(http.StatusOK,2, "您已使用过当前模板!", nil)
		}else{
			this.jsonResult(http.StatusOK,3, "账号验证成功!", user.Id)
		}

	}else if oType=="loginByUid"{//无账号状态提交简历信息点击前往登录
		uid := session.Get("uid4login")
		if uid==""{
			this.jsonResult(http.StatusOK,-1, "会话已过期!", nil)
		}
		session.Set("is2setting",true)//设置登录成功即跳转到个人设置页面
		this.jsonResult(http.StatusOK,1, "验证成功!", nil)
		//this.Ctx.Redirect(302, "/main")

	}else if oType=="logout"{//退出登录
		session.Set("id",nil)
		//this.Redirect("/login",302)
		this.jsonResult(http.StatusOK,1, "退出成功!", nil)
	}
}

func(this *LoginController) Operate() {

	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	oType := this.GetString("type")
	if oType== ""{
		this.jsonResult(http.StatusOK,-1, "type can`t be null", nil)
	}
	if oType=="activate"{//激活账号
		MD_mail := this.GetString("_c")
		sessionM := session.Get(MD_mail+"sign")
		uModel := sessionM.(*models.WXInfo)
		if MD_mail=="" || sessionM==nil || MD_mail!=utils.String2md5(uModel.Email){
			//this.jsonResult(-1, "激活链接已过期!", "请重新注册")
			this.Data["code"] = -1
			this.Data["msg"] = "激活账号链接已过期!"
			this.Data["data"] = "3秒后将跳转注册页"
		}else{
			user := new(models.WXInfo)
			user.Email = uModel.Email
			user.Password = uModel.Password
			user.Uid = MD_mail
			flag := user.Insert(user)
			if flag==-2{
				//this.jsonResult(-1, "当前账号已激活过!", nil)
				this.Data["code"] = -1
				this.Data["msg"] = "当前账号已激活过!"
				this.Data["data"] = "3秒后将跳转登录页"
			}else if flag==-1{
				//this.jsonResult(-1, "账号激活失败!", "请联系管理员")
				this.Data["code"] = -1
				this.Data["msg"] = "账号激活失败!"
				this.Data["data"] = "请联系管理员"
			}else if flag==1{
				//this.jsonResult(1, "成功激活账号!", nil)
				this.Data["code"] = 1
				this.Data["msg"] = "成功激活账号!"
				this.Data["data"] = "3秒后将跳转登录页"
			}
		}
		this.TplName = "login/alert4activate.html"
	}else if oType=="resetRedirect"{//重置密码操作
		MD_mail := this.GetString("_c")
		sessionR := session.Get(MD_mail+"reset")
		if MD_mail=="" || sessionR==nil || MD_mail!=sessionR{
			//this.jsonResult(-1, "密码重置页已过期!", "3秒后将跳转登录页重置密码")
			this.Data["code"] = -1
			this.Data["msg"] = "密码重置页已过期!"
			this.Data["data"] = "3秒后将跳转登录页重置密码"
		}
		this.Data["_xsrf"] = this.XSRFToken()
		this.Data["md"] = MD_mail
		this.TplName = "login/alert4reset.html"
	}

}

func(this *LoginController) Forget()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	email := this.GetString("email")
	if email==""{
		this.jsonResult(200,-1,"参数错误!",nil)
	}
	//查询邮箱地址是否存在
	user := new(models.User)
	user.Email = email
	user.Actived = 1
	user.ReadByMail(user)
	if user.Id==0{
		this.jsonResult(200,-1,"邮箱不存在!",nil)
	}
	code := utils.RandomCode()
	session.Set(email,code)
	go SendMail4Forget(email,code)
	this.jsonResult(200,1,"验证码已发送",nil)
}

func(this *LoginController) Reset()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	email := this.GetString("email")
	if email==""{
		this.jsonResult(200,-1,"参数错误!",nil)
	}
	localCode := session.Get(email).(string)
	if localCode==""{
		this.jsonResult(200,-1,"验证码已失效!请重试",nil)
	}

	code := this.GetString("code")
	if code!=localCode{
		this.jsonResult(200,-1,"验证码错误!",nil)
	}
	key := beego.AppConfig.String("password::key")
	salt := beego.AppConfig.String("password::salt")
	//查询邮箱地址是否存在
	password := this.GetString("password")
	user := new(models.User)
	result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
	if err != nil {
		panic(err)
	}
	user.Password = base64.StdEncoding.EncodeToString(result)
	user.Email = email
	if !user.UpdatePasswordByEmail(user){
		this.jsonResult(200,-1,"更新失败,请稍后再试",nil)
	}
	this.jsonResult(200,1,"更新成功",nil)
}

func SendMail4Forget(mail,code string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{"imsprojo2fan@foxmail.com"}

	nickname := "即刻简历"
	user := "zooori@foxmail.com"
	subject := "用户操作-重置密码"
	content_type := "Content-Type: text/plain; charset=UTF-8"

	body := "【账号邮箱】："+mail
	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}

	if mail!=""{
		to[0] = mail
		body = "邮箱重置密码操作-验证码:【"+code+"】\r\n验证码十分钟内有效\r\n如果非本人操作请忽略本条消息"
		msg = []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
			"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
		smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	}
}

func SendMail4Reset(mail string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{"imsprojo2fan@foxmail.com"}

	nickname := "即刻简历"
	user := "zooori@foxmail.com"
	subject := "用户操作-重置密码"
	content_type := "Content-Type: text/plain; charset=UTF-8"

	body := "【账号邮箱】："+mail
	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}

	if mail!=""{
		to[0] = mail
		body = "点击链接重置密码:\n http://www.zooori.cn/login/operate?type=resetRedirect&_a="+utils.RandomString(20)+"&_b="+utils.RandomString(10)+"&_c="+utils.String2md5(mail)
		msg = []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
			"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
		smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	}
}

func (c *LoginController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}

