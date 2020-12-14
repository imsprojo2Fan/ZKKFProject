package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"encoding/base64"
	"fmt"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	"net/smtp"
	"strings"
	"time"
)

type UserController struct {
	BaseController
}

func(this *UserController) ListOne() {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := session.Get("id").(int)
	user := new(models.User)
	user.Id = uid
	user.Read(user)
	this.jsonResult(200,1,"用户信息",user)
}

func(this *UserController) List()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := session.Get("type").(int)
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
	var sortCol string
	sortNum := this.GetString("order[0][column]")
	if sortNum=="4"{
		sortCol = "updated"
	}
	if sortNum=="5"{
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey
	if uType<2{//账号类型小于3的用户可查看所有信息
		this.jsonResult(200,-1,"查询成功！","无权限")
	}

	obj := new(models.User)
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

func(this *UserController) Add()  {
	key := beego.AppConfig.String("password::key")
	salt := beego.AppConfig.String("password::salt")
	user := new(models.User)
	user.Actived,_ = this.GetInt("actived")
	user.Account = this.GetString("account")
	user.Email = this.GetString("email")
	user.Type,_ = this.GetInt("type")
	password := this.GetString("password")
	if user.Account==""||password==""{
		this.jsonResult(200,-1,"参数错误!",nil)
	}
	//密码加密处理
	result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
	if err != nil {
		panic(err)
	}
	user.Password = base64.StdEncoding.EncodeToString(result)
	user.Remark = this.GetString("remark")
	user.SelectByCol(user,"account")//查询账号是否已被用
	if user.Id>0{
		this.jsonResult(200,-1,"当前账号不可用!",nil)
	}
	if user.Email!=""{
		user.SelectByCol(user,"email")//查询邮箱是否已被用
		if user.Id>0{
			this.jsonResult(200,-1,"邮箱不可用!",nil)
		}
	}
	if user.Phone!=""{
		user.SelectByCol(user,"phone")//查询邮箱是否已被用
		if user.Id>0{
			this.jsonResult(200,-1,"手机号已存在!",nil)
		}
	}

	err =user.Insert(user)//插入用户表记录
	if err==nil{
		this.jsonResult(200,1,"提交成功",nil)
	}else{
		this.jsonResult(200,-1,"提交失败",err.Error())
	}
}

func(this *UserController) Update() {

	user := new(models.User)
	dbUser := new(models.User)
	dbUser.Id,_ = this.GetInt("id")
	dbUser.Read(dbUser)//查询数据库的用户信息
	dType:=this.GetString("type")
	if dType==""{
		user.Type = dbUser.Type
		user.Actived = dbUser.Actived
	}else{
		user.Type,_ = this.GetInt("type")
		user.Actived,_ = this.GetInt("actived")
	}
	user.Id,_ = this.GetInt("id")
	user.Password = this.GetString("password")
	if user.Password!=dbUser.Password{
		key := beego.AppConfig.String("password::key")
		salt := beego.AppConfig.String("password::salt")
		//密码加密
		result, err := utils.AesEncrypt([]byte(user.Password+salt), []byte(key))
		if err != nil {
			panic(err)
		}
		user.Password = base64.StdEncoding.EncodeToString(result)
	}
	user.Account = dbUser.Account
	user.Created = dbUser.Created
	user.Updated = time.Now()
	user.Email = this.GetString("email")
	/*if user.Email!=""{
		user.SelectByCol(user,"email")//查询邮箱是否已被用
		if user.Account!=""{
			this.jsonResult(200,-1,"邮箱地址已存在!",nil)
		}
	}*/
	user.Remark = this.GetString("remark")

	if user.Update(user){
		this.jsonResult(200,1,"更新用户信息成功",nil)
	}else{
		this.jsonResult(200,-1,"更新用户信息失败,请稍后再试",nil)
	}
}

func(this *UserController) Delete() {
	obj := new(models.User)
	obj.Id,_ = this.GetInt("id")
	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	if obj.Delete(obj){
		this.jsonResult(200,1,"删除数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"删除数据失败,请稍后再试！",nil)
	}
}

func(this *UserController) All() {
	user := new(models.User)
	var dataList []models.User
	user.All(&dataList)
	this.jsonResult(200,1,"查询所有用户信息",dataList)
}

func(this *UserController) Validate4mail() {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)

	var dataList []models.User
	email := this.GetString("email")
	if email==""{
		this.jsonResult(200,-1,"参数错误",nil)
	}
	user := new(models.User)
	user.Email = email
	user.SelectByEmail(email,&dataList)
	for _,item:= range dataList{
		if item.Actived==1{
			this.jsonResult(200,-1,"当前邮箱不可用!",nil)
			break
		}
	}
	code := utils.RandomCode()
	_ = session.Set("email", email)
	_ = session.Set("code", code)
	go SendMail4Validate(email,code)
	this.jsonResult(200,1,"验证码已发送",nil)
}

func(this *UserController) Mail4confirm() {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	var changeMail string
	type_ := this.GetString("type")
	if type_=="edit"{
		changeMail = this.GetString("changeMail")
		if changeMail==""{
			this.jsonResult(200,-1,"更换的邮箱不能为空!",nil)
		}
		localMail := session.Get("email")
		if localMail!=changeMail{
			this.jsonResult(200,-1,"邮箱不一致!",nil)
		}
	}

	code := this.GetString("code")
	if code==""{
		this.jsonResult(200,-1,"验证码不能为空!",nil)
	}

	localCode := session.Get("code")
	if code!=localCode{
		this.jsonResult(200,-1,"验证码错误!",nil)
	}
	user := new(models.User)
	user.Id = session.Get("id").(int)
	user.Email = session.Get("email").(string)
	user.Actived = 1
	if !user.UpdateActived(user){
		this.jsonResult(200,-1,"数据库更新失败,请稍后再试!",nil)
	}
	this.jsonResult(200,1,"邮箱验证成功",nil)
}

func SendMail4Validate(mail,code string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{mail}

	nickname := "中科科辅"
	user := "zooori@foxmail.com"
	subject := "用户操作-验证邮箱"
	contentType := "Content-Type: text/plain; charset=UTF-8"
	body := "【验证码】:"+code+"\r\n 十分钟内有效!请尽快验证邮箱"

	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + contentType + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}
}
