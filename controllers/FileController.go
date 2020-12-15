package controllers

import (
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"fmt"
	"net/http"
	"os"
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

func(this *FileController) Upload()  {
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

func (this *FileController) Upload4Pic() {

	f, _, _ := this.GetFile("file") //获取上传的文件
	_dir := "./file/img/"
	exist, err := utils.PathExists(_dir)
	if err != nil {
		fmt.Printf("get dir error![%v]\n", err)
		return
	}

	if !exist {
		fmt.Printf("no dir![%v]\n", _dir)
		// 创建文件夹
		err := os.MkdirAll(_dir, os.ModePerm)
		if err != nil {
			fmt.Printf("mkdir failed![%v]\n", err)
		} else {
			fmt.Printf("mkdir success!\n")
		}
	}
	fileName := utils.RandomString(16) + ".jpg"
	path := _dir + "/" + fileName       //文件目录
	_ = f.Close()                       //关闭上传的文件，不然的话会出现临时文件不能清除的情况
	err = this.SaveToFile("file", path) //存文件

	if err != nil {
		this.jsonResult(http.StatusOK, -1, "上传文件失败!", nil)
	} else {
		this.jsonResult(http.StatusOK, 1, "上传文件成功!", fileName)
	}
}

