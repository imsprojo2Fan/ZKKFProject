package controllers

import (
	"ZkkfProject/models"
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"github.com/astaxie/beego/orm"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 14:15 2020/12/15
 * @Modified By:
 */

type FileController struct {
	BaseController
}

func (this *FileController) List() {
	if this.CheckAuth(3){
		this.EmptyData()
		return
	}
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []orm.Params
	backMap := make(map[string]interface{})

	pageNow, err2 := this.GetInt64("start")
	pageSize, err := this.GetInt64("length")

	if err != nil || err2 != nil {
		pageNow = 1
		pageSize = 20
		//this.jsonResult(http.StatusOK,-1, "rows or page should be number", nil)
	}
	sorType := this.GetString("order[0][dir]")
	var sortCol string
	sortNum := this.GetString("order[0][column]")
	if sortNum == "1" {
		sortCol = "type"
	}
	if sortNum == "2" {
		sortCol = "ori_name"
	}
	if sortNum == "3" {
		sortCol = "remark"
	}
	if sortNum == "4" {
		sortCol = "updated"
	}
	if sortNum == "5" {
		sortCol = "created"
	}
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sorType"] = sorType
	qMap["searchKey"] = searchKey

	obj := new(models.File)
	//获取总记录数
	records,_ := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList,_ = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList) == 0 {
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func(this *FileController) Add()  {

	obj := new(models.File)
	obj.Rid = utils.RandomString(9)
	obj.Type,_ = this.GetInt("type")
	obj.Remark = this.GetString("remark")
	file, information, err := this.GetFile("file")  //返回文件，文件信息头，错误信息

	if err != nil {
		this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
		return
	}
	filePath := "./file/upload/"
	if !utils.CheckFileIsExist(filePath){
		_ = os.MkdirAll(filePath, 777)
	}

	//获取文件md5
	md5 := md5.New()
	_, _ = io.Copy(md5,file)
	MD5Str := hex.EncodeToString(md5.Sum(nil))
	fmt.Println(MD5Str)
	obj.Md5 = MD5Str
	//根据md5验证文件是否已存在
	obj.SelectByCol(obj,"md5")
	if obj.Id>0{
		this.jsonResult(200,-1,"文件已存在!",nil)
	}
	fName := information.Filename
	obj.OriName = fName
	obj.SelectByCol(obj,"ori_name")
	if obj.Id>0{
		this.jsonResult(200,-1,"文件名已存在!",nil)
	}

	defer file.Close()    //关闭上传的文件，否则出现临时文件不清除的情况  mmp错了好多次啊
	//fileName := utils.RandomString(9)
	//fName := information.Filename
	//fileName = fileName+fName[strings.LastIndex(fName,"."):]
	obj.FileName = fName
	obj.OriName = fName
	err = this.SaveToFile("file", path.Join(filePath,fName))//保存文件的路径。保存在static/upload中(文件名)

	if err != nil {
		//this.Ctx.WriteString("File upload failed！")
		this.jsonResult(http.StatusOK,-1, "读写文件失败!", nil)
	}
	err = obj.Insert(obj)
	if err==nil{
		this.jsonResult(200,1,"操作成功!",nil)
	}else{
		this.jsonResult(200,-1,"操作失败,"+err.Error(),err.Error())
	}

}

func (this *FileController) Update() {
	var obj models.File
	id, _ := this.GetInt("id")
	obj.Type,_ = this.GetInt("type")
	remark := this.GetString("remark")
	obj.Id = id
	obj.Remark = remark
	obj.Updated = time.Now()
	err := obj.Update(&obj)
	if err == nil {
		this.jsonResult(200, 1, "操作成功", nil)
	} else {
		this.jsonResult(200, -1, "操作失败,"+err.Error(), err.Error())
	}
}

func (this *FileController) Delete() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	obj := new(models.File)
	obj.Id, _ = this.GetInt("id")
	filename := this.GetString("fileName")
	if obj.Id == 0 {
		this.jsonResult(200, -1, "id不能为空！", nil)
	}
	err := obj.Delete(obj)
	if err == nil {
		err = os.Remove("./file/upload/" + filename)
		if err!=nil{
			fmt.Println("FileController,Delete ",err.Error())
		}
		this.jsonResult(200, 1, "删除数据成功！", nil)
	} else {
		this.jsonResult(200, -1, "删除数据失败,"+err.Error(), err.Error())
	}
}

func(this *FileController) Delete4Batch() {
	if this.CheckAuth(1){
		this.jsonResult(200, -1, "无操作权限！", "无操作权限!")
	}
	idArr := this.GetString("idArr")
	if idArr==""{
		this.jsonResult(200,-1,"数据id不能为空！",nil)
	}
	obj := new(models.File)
	idArr = "("+idArr+")"
	//获取文件名删除文件
	fileArr,_ := obj.SelectByIds(idArr)
	err := obj.DeleteBatch(idArr)
	if err!=nil{
		this.jsonResult(200,-1,"批量删除数据失败,"+err.Error(),err.Error())
	}else{
		for _,file := range fileArr{
			_ = os.Remove("./file/upload/" + file.FileName)
		}
		this.jsonResult(200,1,"批量删除数据成功！",nil)
	}

}

func (this *FileController) All() {
	obj := new(models.File)
	res,_ := obj.All()
	this.jsonResult(200, 1, "查询所有信息", res)
}

func (this *FileController) List4Type() {
	t := this.GetString("type")
	obj := new(models.File)
	res,_ := obj.ListByType(t)
	this.jsonResult(200, 1, "按类型查询信息", res)
}

//用于富文本上传图片
func(this *FileController) Upload()  {
	file, information, err := this.GetFile("file")  //返回文件，文件信息头，错误信息
	if err != nil {
		this.Ctx.WriteString("error|服务端错误")
		//this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
		return
	}
	fmt.Println(information.Filename)
	defer file.Close()    //关闭上传的文件，否则出现临时文件不清除的情况  mmp错了好多次啊
	filePath := "./file/img/"
	if !utils.CheckFileIsExist(filePath){
		_ = os.MkdirAll(filePath, 777)
	}
	//fileName := information.Filename           //将文件信息头的信息赋值给filename变量
	fileName := utils.RandomString(16)+".jpg"
	filePath = filePath+fileName
	err = this.SaveToFile("file",filePath)  //保存文件的路径。保存在static/upload中   （文件名）
	if err != nil {
		this.Ctx.WriteString("error|存储错误")
		//this.jsonResult(http.StatusOK,-1, "读写文件失败!", nil)
	}

	fileName = "http://"+sysinit.Host+"/img/"+fileName
	this.Ctx.WriteString("{\"errno\": 0,\"data\": [\""+fileName+"\"]}")

}

func (this *FileController) Upload4Pic() {

	f, _, _ := this.GetFile("file") //获取上传的文件
	_dir := "./file/img/"
	if !utils.CheckFileIsExist(_dir){
		_ = os.MkdirAll(_dir, 777)
	}
	fileName := utils.RandomString(16) + ".jpg"
	filePath := _dir+fileName       //文件目录
	_ = f.Close()                       //关闭上传的文件，不然的话会出现临时文件不能清除的情况
	err := this.SaveToFile("file", filePath) //存文件

	if err != nil {
		this.jsonResult(http.StatusOK, -1, "上传文件失败!", nil)
	} else {
		this.jsonResult(http.StatusOK, 1, "上传文件成功!", fileName)
	}
}

func(this *FileController) Upload4File()  {
	file, information, err := this.GetFile("file")  //返回文件，文件信息头，错误信息
	if err != nil {
		this.Ctx.WriteString("error|服务端错误")
		//this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
		return
	}
	fmt.Println(information.Filename)
	defer file.Close()    //关闭上传的文件，否则出现临时文件不清除的情况  mmp错了好多次啊

	//fileName := information.Filename           //将文件信息头的信息赋值给filename变量
	fileName := utils.RandomString(16)+".jpg"
	filePath := "./file/img/"+fileName
	err = this.SaveToFile("file",filePath)  //保存文件的路径。保存在static/upload中   （文件名）
	if err != nil {
		this.Ctx.WriteString("error|存储错误")
		//this.jsonResult(http.StatusOK,-1, "读写文件失败!", nil)
	}

	fileName = "http://"+sysinit.Host+"/img/"+fileName
	this.Ctx.WriteString("{\"errno\": 0,\"data\": [\""+fileName+"\"]}")

}

func(this *FileController) Report()  {

	obj := new(models.Order)
	table := this.GetString("table")
	rid := this.GetString("rid")
	file,information,err := this.GetFile("file")  //返回文件，文件信息头，错误信息

	if err != nil {
		this.jsonResult(http.StatusOK,-1, "上传文件失败!", nil)
		return
	}
	filePath := "./file/report/"
	if !utils.CheckFileIsExist(filePath){
		_ = os.MkdirAll(filePath, 777)
	}

	defer file.Close()//关闭上传的文件，否则出现临时文件不清除的情况  mmp错了好多次啊
	fileName := "中科科辅实验报告-"+strings.ToLower(utils.RandomString(6))
	fName := information.Filename
	fileName = fileName+fName[strings.LastIndex(fName,"."):]
	err = this.SaveToFile("file", path.Join(filePath,fileName))//保存文件的路径。保存在static/upload中(文件名)
	if err != nil {
		this.jsonResult(http.StatusOK,-1, "读写文件失败!", nil)
	}
	err = obj.UpdateReport(table,rid,fileName)
	if err==nil{
		this.jsonResult(200,1,"操作成功!",nil)
	}else{
		this.jsonResult(200,-1,"操作失败,"+err.Error(),err.Error())
	}

}

