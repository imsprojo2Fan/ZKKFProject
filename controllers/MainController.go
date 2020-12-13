package controllers

import (
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"
)

type MainController struct {
	BaseController
}

func(this *MainController) Index()  {
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	userInfo := session.Get("user")
	this.Data["userInfo"] = userInfo
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

func(this *MainController) Redirect()  {
	redirect := this.Ctx.Input.Param(":redirect")
	this.Data["_xsrf"] = this.XSRFToken()
	this.Data["random"] = time.Now().Unix()
	redirect = "main/"+redirect
	this.TplName = redirect
}

func(this *MainController) Alive()  {
	this.jsonResult(http.StatusOK,1, "alive!", sysinit.SysInitTime)
}

func(this *MainController) Upload4Pic()  {

	f, _, _ := this.GetFile("file")                  //获取上传的文件
	_dir := "../file4resume"
	exist, err := utils.PathExists(_dir)
	if err != nil {
		fmt.Printf("get dir error![%v]\n", err)
		return
	}

	if exist {
		fmt.Printf("has dir![%v]\n", _dir)
	} else {
		fmt.Printf("no dir![%v]\n", _dir)
		// 创建文件夹
		err := os.Mkdir(_dir, os.ModePerm)
		if err != nil {
			fmt.Printf("mkdir failed![%v]\n", err)
		} else {
			fmt.Printf("mkdir success!\n")
		}
	}
	fileName := time.Now().Unix()
	fileName_ := strconv.FormatInt(fileName,10)+".jpg"
	path := _dir+"/"+fileName_          //文件目录
	_ = f.Close()                       //关闭上传的文件，不然的话会出现临时文件不能清除的情况
	err = this.SaveToFile("file", path) //存文件

	if err!=nil{
		this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
	}else{
		this.jsonResult(http.StatusOK,1, "上传文件成功!", fileName_)
	}
}

