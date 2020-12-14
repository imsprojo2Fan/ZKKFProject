package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/utils"
	"fmt"
	"net/http"
	"time"
)
var GlobalDraw int
type ResumeController struct {
	BaseController
}

func(this *ResumeController) Insert()  {
	resume := new(models.Resume)
	resume.Eid = utils.RandStringBytesMaskImprSrc(16)
	name := this.GetString("name")
	url := this.GetString("url")
	theme := this.GetString("theme")
	img := this.GetString("img")
	resume.Likes = utils.RandInt64(800,1500)
	resume.Views = utils.RandInt64(800,1500)
	resume.Mades = utils.RandInt64(800,1500)
	if name==""||theme==""||url==""{
		this.jsonResult(http.StatusOK,-1, "名称或类型、url不能为空!", nil)
	}
	resume.Name = name
	resume.Theme = theme
	resume.Url = url
	resume.Img = img

	//查询名称是否已存在
	resume.SelectByName(resume)
	if resume.Id>0 {
		this.jsonResult(http.StatusOK,-1, "名称已存在!", nil)
	}
	//查询url是否已存在
	resume.SelectByUrl(resume)
	if resume.Id>0 {
		this.jsonResult(http.StatusOK,-1, "url已被使用!", nil)
	}

	if !resume.Insert(resume){
		this.jsonResult(http.StatusOK,-1, "数据库操作失败!", nil)
	}else{
		this.jsonResult(http.StatusOK,1, "数据插入成功!", this.XSRFToken())
	}
}

func(this *ResumeController) Delete()  {
	resume := new(models.Resume)
	id,err := this.GetInt("id")
	if err!=nil{
		this.jsonResult(http.StatusOK,-1, "id错误!", nil)
	}

	if id==0{
		this.jsonResult(http.StatusOK,-1, "id、名称或类型不能为空!", this.XSRFToken())
	}

	resume.Id = id

	if !resume.Delete(resume){
		this.jsonResult(http.StatusOK,-1, "数据库更新失败!", nil)
	}else{
		this.jsonResult(http.StatusOK,1, "数据更新成功!", nil)
	}
}

func(this *ResumeController) Update()  {
	resume := new(models.Resume)
	id,err := this.GetInt("id")
	if err!=nil{
		this.jsonResult(http.StatusOK,-1, "id错误!", nil)
	}
	name := this.GetString("name")
	theme := this.GetString("theme")
	img := this.GetString("img")

	if id==0||name==""||theme==""{
		this.jsonResult(http.StatusOK,-1, "id、名称或类型不能为空!", this.XSRFToken())
	}

	resume.Id = id
	resume.Name = name
	resume.Theme = theme
	resume.Img = img
	var cstSh, _ = time.LoadLocation("Asia/Shanghai") //上海
	fmt.Println("SH : ", time.Now().In(cstSh).Format("2006-01-02 15:04:05"))
	resume.Updated = time.Now()

	if !resume.Update(resume){
		this.jsonResult(http.StatusOK,-1, "数据库操作失败!", nil)
	}else{
		this.jsonResult(http.StatusOK,1, "数据操作成功!", nil)
	}
}

func(this *ResumeController) ListByPage()  {
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []models.Resume
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

	resume := new(models.Resume)

	//获取总记录数
	records := resume.Count(searchKey)
	//total :=(records + pageSize-1) / pageSize;
	resume.ListByPage(qMap,&dataList)

	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	backMap["data"] = dataList

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(http.StatusOK,1,"查询成功",backMap)
}

func(this *ResumeController) ListByPage4Index()  {

	qMap := make(map[string]interface{})
	var dataList []models.Resume
	backMap := make(map[string]interface{})


	resume := new(models.Resume)
	resume.ListByPage4Index(qMap,&dataList)
	backMap["data"] = dataList

	/*this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()*/
	this.jsonResult(http.StatusOK,1,"查询成功",dataList)
}
