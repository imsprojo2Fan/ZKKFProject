package utils

import (
	"os"
	"fmt"
	"io"
	"strconv"
	"bufio"
	"io/ioutil"
	"strings"
	"path/filepath"
	"archive/zip"
	"testing"
	"path"
	"errors"
	"archive/tar"
	"math"
	"crypto/md5"
	"net/http"
	"bytes"
	"mime/multipart"
)

// 判断文件夹是否存在
func PathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

/**
 * 判断文件是否存在  存在返回 true 不存在返回false
 */
func CheckFileIsExist(filename string) bool {
	var exist = true
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		exist = false
	}
	return exist
}

func Check(e error) (flag bool){
	if e != nil {
		flag = true
	}
	flag = false
	return flag
}

func WriteFile(fileName, content string)(flag bool)  {
	/***************************** 第一种方式: 使用 io.WriteString 写入文件 ***********************************************/
	var f *os.File
	var err error
	os.Remove(fileName)
	if CheckFileIsExist(fileName) { //如果文件存在
		f, err = os.OpenFile(fileName,os.O_WRONLY|os.O_TRUNC|os.O_CREATE, os.ModePerm) //打开文件
	} else {
		f, err = os.Create(fileName) //创建文件
	}
	flag = Check(err)
	n, err := io.WriteString(f, content) //写入文件(字符串)
	flag = Check(err)
	fmt.Println("写入 "+strconv.Itoa(n)+" 个字节")
	return flag
}

// content: 写入的内容
func AppendToFile(fileName string, content string) error {
	if !CheckFileIsExist(fileName) { //如果文件存在
		os.Create(fileName) //创建文件
		//fmt.Println("创建文件")
	}
	// 以只写的模式，打开文件
	f, err := os.OpenFile(fileName, os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("cacheFileList.yml file create failed. err: " + err.Error())
	} else {
		// 查找文件末尾的偏移量
		n, _ := f.Seek(0, os.SEEK_END)
		// 从末尾的偏移量开始写入内容
		_, err = f.WriteAt([]byte(content), n)
	}
	defer f.Close()
	return err
}

//逐行读取
func ReadLine(filePath string)(res string) {
	file ,err := os.Open(filePath)
	if err != nil {
		fmt.Println(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)
	/*
		ScanLines (默认)
		ScanWords
		ScanRunes (遍历UTF-8字符非常有用)
		ScanBytes
	*/
	//是否有下一行
	for scanner.Scan() {
		res = res+scanner.Text()
	}
	return res
}

func ReadAll(filePath string)(res string){
	b, e := ioutil.ReadFile(filePath)
	if e != nil {
		fmt.Println(e)
		return
	}
	return string(b)
}

func ListAllFile(path string)([]os.FileInfo, error){
	fs, err:= ioutil.ReadDir(path)
	/*for _, v := range fs {
		// 遍历得到文件名
		fmt.Println(v.Name())
	}*/
	return fs,err
}

func CheckIsExist(src,desName string)string {
	var fName string
	fs, err:= ioutil.ReadDir(src)
	if err!=nil{
		fmt.Println(err.Error())
	}
	for _,file:=range fs{
		fName = file.Name()
		if strings.Index(fName,desName)>-1{
			break
		}
	}
	return fName
}

func CopyDir(src string, des string) {
	if !CheckFileIsExist(des){
		fmt.Println("创建文件夹:"+des)
		os.Mkdir(des,0777)
	}
	src_original := src
	err := filepath.Walk(src, func(src string, f os.FileInfo, err error) error {
		if f == nil {
			return err
		}
		if f.IsDir() {
			//			fmt.Println(f.Name())
			//			copyDir(f.Name(), dest+"/"+f.Name())
		} else {
			//fmt.Println(src)
			//fmt.Println(src_original)
			//fmt.Println(dest)

			dest_new := strings.Replace(src, src_original, des, -1)
			//fmt.Println(dest_new)
			//fmt.Println("CopyFile:" + src + " to " + dest_new)
			CopyFile(src, dest_new)
		}
		//println(path)
		return nil
	})
	if err != nil {
		fmt.Printf("filepath.Walk() returned %v\n", err)
	}
}

//copy file
func CopyFile(src, dst string) (w int64, err error) {
	srcFile, err := os.Open(src)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer srcFile.Close()
	//fmt.Println("dst:" + dst)
	dst_slices := strings.Split(dst, "\\")
	dst_slices_len := len(dst_slices)
	dest_dir := ""
	for i := 0; i < dst_slices_len-1; i++ {
		dest_dir = dest_dir + dst_slices[i] + "\\"
	}
	//dest_dir := getParentDirectory(dst)
	//fmt.Println("dest_dir:" + dest_dir)
	b, err := PathExists(dest_dir)
	if b == false {
		err := os.Mkdir(dest_dir, os.ModePerm) //在当前目录下生成md目录
		if err != nil {
			fmt.Println(err)
		}
	}
	dstFile, err := os.Create(dst)

	if err != nil {
		fmt.Println(err.Error())
		return
	}

	defer dstFile.Close()

	return io.Copy(dstFile, srcFile)
}

func GetCurrentDirectory() string {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))  //返回绝对路径  filepath.Dir(os.Args[0])去除最后一个元素的路径
	if err != nil {
		fmt.Println(err.Error())
	}
	return strings.Replace(dir, "\\", "/", -1) //将\替换成/
}

//压缩文件
//files 文件数组，可以是不同dir下的文件或者文件夹
//dest 压缩文件存放地址
func Compress(files []*os.File, dest string) error {
	d, _ := os.Create(dest)
	defer d.Close()
	w := zip.NewWriter(d)
	defer w.Close()
	for _, file := range files {
		err := compress(file, "", w)
		if err != nil {
			return err
		}
	}
	return nil
}

//解压
func DeCompress(zipFile, dest string) error {
	reader, err := zip.OpenReader(zipFile)
	if err != nil {
		return err
	}
	defer reader.Close()
	for _, file := range reader.File {
		rc, err := file.Open()
		if err != nil {
			return err
		}
		defer rc.Close()
		filename := dest + file.Name
		err = os.MkdirAll(getDir(filename), 0755)
		if err != nil {
			return err
		}
		w, err := os.Create(filename)
		if err != nil {
			return err
		}
		defer w.Close()
		_, err = io.Copy(w, rc)
		if err != nil {
			return err
		}
		w.Close()
		rc.Close()
	}
	return nil
}

func compress(file *os.File, prefix string, zw *zip.Writer) error {
	info, err := file.Stat()
	if err != nil {
		return err
	}
	if info.IsDir() {
		prefix = prefix + "/" + info.Name()
		fileInfos, err := file.Readdir(-1)
		if err != nil {
			return err
		}
		for _, fi := range fileInfos {
			f, err := os.Open(file.Name() + "/" + fi.Name())
			if err != nil {
				return err
			}
			err = compress(f, prefix, zw)
			if err != nil {
				return err
			}
		}
	} else {
		header, err := zip.FileInfoHeader(info)
		header.Name = prefix + "/" + header.Name
		if err != nil {
			return err
		}
		writer, err := zw.CreateHeader(header)
		if err != nil {
			return err
		}
		_, err = io.Copy(writer, file)
		file.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

func getDir(path string) string {
	return subString(path, 0, strings.LastIndex(path, "/"))
}

func subString(str string, start, end int) string {
	rs := []rune(str)
	length := len(rs)

	if start < 0 || start > length {
		panic("start is wrong")
	}

	if end < start || end > length {
		panic("end is wrong")
	}

	return string(rs[start:end])
}

func TestCompress(t *testing.T) {
	f1, err := os.Open("/home/zzw/test_data/ziptest/gophercolor16x16.png")
	if err != nil {
		t.Fatal(err)
	}
	defer f1.Close()
	f2, err := os.Open("/home/zzw/test_data/ziptest/readme.notzip")
	if err != nil {
		t.Fatal(err)
	}
	defer f2.Close()
	f3, err := os.Open("/home/zzw/test_data")
	if err != nil {
		t.Fatal(err)
	}
	defer f3.Close()
	var files = []*os.File{f1, f2, f3}
	dest := "/home/zzw/test_data/test.zip"
	err = Compress(files, dest)
	if err != nil {
		t.Fatal(err)
	}
}
func TestDeCompress(t *testing.T) {
	err := DeCompress("/home/zzw/test_data/test.zip", "/home/zzw/test_data/de")
	if err != nil {
		t.Fatal(err)
	}
}

func ZipDir(dir, zipFile string) {

	fz, err := os.Create(zipFile)
	if err != nil {
	}
	defer fz.Close()

	w := zip.NewWriter(fz)
	defer w.Close()

	filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if !info.IsDir() {
			fDest, err := w.Create(path[len(dir)+1:])
			if err != nil {
				return nil
			}
			fSrc, err := os.Open(path)
			if err != nil {
				return nil
			}
			defer fSrc.Close()
			_, err = io.Copy(fDest, fSrc)
			if err != nil {
				return nil
			}
		}
		return nil
	})
}
/*
	ZipDir("F:\\dumps", "F:\\dumps.zip")
    UnZipDir("F:\\dumps.zip", "F:\\dumps_copy")
*/
func UnZipDir(zipFile, dir string) {

	r, err := zip.OpenReader(zipFile)
	if err != nil {
	}
	defer r.Close()

	for _, f := range r.File {
		func() {
			path := dir + string(filepath.Separator) + f.Name
			os.MkdirAll(filepath.Dir(path), 0755)
			fDest, err := os.Create(path)
			if err != nil {
				return
			}
			defer fDest.Close()

			fSrc, err := f.Open()
			if err != nil {
				return
			}
			defer fSrc.Close()

			_, err = io.Copy(fDest, fSrc)
			if err != nil {
				return
			}
		}()
	}
}

// 将文件或目录打包成 .tar 文件
// src 是要打包的文件或目录的路径
// dstTar 是要生成的 .tar 文件的路径
// failIfExist 标记如果 dstTar 文件存在，是否放弃打包，如果否，则会覆盖已存在的文件
func Tar(src string, dstTar string, failIfExist bool) (err error) {
	// 清理路径字符串
	src = path.Clean(src)

	// 判断要打包的文件或目录是否存在
	if !Exists(src) {
		return errors.New("要打包的文件或目录不存在：" + src)
	}

	// 判断目标文件是否存在
	if FileExists(dstTar) {
		if failIfExist { // 不覆盖已存在的文件
			return errors.New("目标文件已经存在：" + dstTar)
		} else { // 覆盖已存在的文件
			if er := os.Remove(dstTar); er != nil {
				return er
			}
		}
	}

	// 创建空的目标文件
	fw, er := os.Create(dstTar)
	if er != nil {
		return er
	}
	defer fw.Close()

	// 创建 tar.Writer，执行打包操作
	tw := tar.NewWriter(fw)
	defer func() {
		// 这里要判断 tw 是否关闭成功，如果关闭失败，则 .tar 文件可能不完整
		if er := tw.Close(); er != nil {
			err = er
		}
	}()

	// 获取文件或目录信息
	fi, er := os.Stat(src)
	if er != nil {
		return er
	}

	// 获取要打包的文件或目录的所在位置和名称
	srcBase, srcRelative := path.Split(path.Clean(src))

	// 开始打包
	if fi.IsDir() {
		tarDir(srcBase, srcRelative, tw, fi)
	} else {
		tarFile(srcBase, srcRelative, tw, fi)
	}

	return nil
}

// 因为要执行遍历操作，所以要单独创建一个函数
func tarDir(srcBase, srcRelative string, tw *tar.Writer, fi os.FileInfo) (err error) {
	// 获取完整路径
	srcFull := srcBase + srcRelative

	// 在结尾添加 "/"
	last := len(srcRelative) - 1
	if srcRelative[last] != os.PathSeparator {
		srcRelative += string(os.PathSeparator)
	}

	// 获取 srcFull 下的文件或子目录列表
	fis, er := ioutil.ReadDir(srcFull)
	if er != nil {
		return er
	}

	// 开始遍历
	for _, fi := range fis {
		if fi.IsDir() {
			tarDir(srcBase, srcRelative+fi.Name(), tw, fi)
		} else {
			tarFile(srcBase, srcRelative+fi.Name(), tw, fi)
		}
	}

	// 写入目录信息
	if len(srcRelative) > 0 {
		hdr, er := tar.FileInfoHeader(fi, "")
		if er != nil {
			return er
		}
		hdr.Name = srcRelative

		if er = tw.WriteHeader(hdr); er != nil {
			return er
		}
	}

	return nil
}

// 因为要在 defer 中关闭文件，所以要单独创建一个函数
func tarFile(srcBase, srcRelative string, tw *tar.Writer, fi os.FileInfo) (err error) {
	// 获取完整路径
	srcFull := srcBase + srcRelative

	// 写入文件信息
	hdr, er := tar.FileInfoHeader(fi, "")
	if er != nil {
		return er
	}
	hdr.Name = srcRelative

	if er = tw.WriteHeader(hdr); er != nil {
		return er
	}

	// 打开要打包的文件，准备读取
	fr, er := os.Open(srcFull)
	if er != nil {
		return er
	}
	defer fr.Close()

	// 将文件数据写入 tw 中
	if _, er = io.Copy(tw, fr); er != nil {
		return er
	}
	return nil
}

func UnTar(srcTar string, dstDir string) (err error) {
	// 清理路径字符串
	dstDir = path.Clean(dstDir) + string(os.PathSeparator)

	// 打开要解包的文件
	fr, er := os.Open(srcTar)
	if er != nil {
		return er
	}
	defer fr.Close()

	// 创建 tar.Reader，准备执行解包操作
	tr := tar.NewReader(fr)

	// 遍历包中的文件
	for hdr, er := tr.Next(); er != io.EOF; hdr, er = tr.Next() {
		if er != nil {
			return er
		}

		// 获取文件信息
		fi := hdr.FileInfo()

		// 获取绝对路径
		dstFullPath := dstDir + hdr.Name

		if hdr.Typeflag == tar.TypeDir {
			// 创建目录
			os.MkdirAll(dstFullPath, fi.Mode().Perm())
			// 设置目录权限
			os.Chmod(dstFullPath, fi.Mode().Perm())
		} else {
			// 创建文件所在的目录
			os.MkdirAll(path.Dir(dstFullPath), os.ModePerm)
			// 将 tr 中的数据写入文件中
			if er := unTarFile(dstFullPath, tr); er != nil {
				return er
			}
			// 设置文件权限
			os.Chmod(dstFullPath, fi.Mode().Perm())
		}
	}
	return nil
}

// 因为要在 defer 中关闭文件，所以要单独创建一个函数
func unTarFile(dstFile string, tr *tar.Reader) error {
	// 创建空文件，准备写入解包后的数据
	fw, er := os.Create(dstFile)
	if er != nil {
		return er
	}
	defer fw.Close()

	// 写入解包后的数据
	_, er = io.Copy(fw, tr)
	if er != nil {
		return er
	}

	return nil
}

// 判断档案是否存在
func Exists(name string) bool {
	_, err := os.Stat(name)
	return err == nil || os.IsExist(err)
}

// 判断文件是否存在
func FileExists(filename string) bool {
	fi, err := os.Stat(filename)
	return (err == nil || os.IsExist(err)) && !fi.IsDir()
}

// 判断目录是否存在
func DirExists(dirname string) bool {
	fi, err := os.Stat(dirname)
	return (err == nil || os.IsExist(err)) && fi.IsDir()
}

const fileChunk = 8192000 // 8000KB
func CountFileMd5(filePath string) string {
	file, err := os.Open(filePath)
	if err != nil {
		return err.Error()
	}
	defer file.Close()

	info, _ := file.Stat()
	fileSize := info.Size()

	blocks := uint64(math.Ceil(float64(fileSize) / float64(fileChunk)))
	hash := md5.New()

	for i := uint64(0); i < blocks; i++ {
		blockSize := int(math.Min(fileChunk, float64(fileSize-int64(i*fileChunk))))
		buf := make([]byte, blockSize)

		file.Read(buf)
		io.WriteString(hash, string(buf))
	}

	return fmt.Sprintf("%x", hash.Sum(nil))
}

func GetSize(path string) int64 {
	fileInfo, err := os.Stat(path)
	if err != nil {
		panic(err)
	}
	fileSize := fileInfo.Size() //获取size
	fmt.Println(path+"的大小为", fileSize, "byte")
	return fileSize
}

// ZipFiles compresses one or many files into a single zip archive file.
//压缩多个文件到一个文件里面
// Param 1: 输出的zip文件的名字
// Param 2: 需要添加到zip文件里面的文件
//Param 3: 由于file是绝对路径，打包后可能不是想要的目录，oldform就是filename中需要被替换的掉的路径
//Param 4: 要替换成的路径
/*
	path := "C:\\Go\\workspace\\src\\GPSClient\\2019-06-04.log"
	fileList := []string{path}
	//保留原来文件的结构
	err := ZipFiles("../test.zip", fileList, "C:\\Go\\workspace\\src\\GPSClient","")
	if err != nil {
		fmt.Println(err)
	}
*/
func ZipFiles(filename string, files []string, oldform, newform string) error {

	newZipFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer newZipFile.Close()

	zipWriter := zip.NewWriter(newZipFile)
	defer zipWriter.Close()

	// 把files添加到zip中
	for _, file := range files {

		zipfile, err := os.Open(file)
		if err != nil {
			return err
		}
		defer zipfile.Close()

		// 获取file的基础信息
		info, err := zipfile.Stat()
		if err != nil {
			return err
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		//使用上面的FileInforHeader() 就可以把文件保存的路径替换成我们自己想要的了，如下面
		header.Name = strings.Replace(file, oldform, newform, -1)

		// 优化压缩
		// 更多参考see http://golang.org/pkg/archive/zip/#pkg-constants
		header.Method = zip.Deflate

		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}
		if _, err = io.Copy(writer, zipfile); err != nil {
			return err
		}
	}
	return nil
}

// ZipFiles compresses one or many files into a single zip archive file.
//压缩多个文件到一个文件里面
// Param 1: 输出的zip文件的名字
// Param 2: 需要添加到zip文件里面的文件
//Param 3: 由于file是绝对路径，打包后可能不是想要的目录，oldform就是filename中需要被替换的掉的路径
//Param 4: 要替换成的路径
/*
	path := "C:\\Go\\workspace\\src\\GPSClient\\2019-06-04.log"
	fileList := []string{path}
	//保留原来文件的结构
	err := ZipFiles("../test.zip", fileList, "C:\\Go\\workspace\\src\\GPSClient","")
	if err != nil {
		fmt.Println(err)
	}
*/
func ZipFile(filename string, files []string, oldform, newform string) error {

	newZipFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer newZipFile.Close()

	zipWriter := zip.NewWriter(newZipFile)
	defer zipWriter.Close()

	// 把files添加到zip中
	for _, file := range files {

		zipfile, err := os.Open(file)
		if err != nil {
			return err
		}
		defer zipfile.Close()

		// 获取file的基础信息
		info, err := zipfile.Stat()
		if err != nil {
			return err
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		//使用上面的FileInforHeader() 就可以把文件保存的路径替换成我们自己想要的了，如下面
		header.Name = strings.Replace(file, oldform, newform, -1)

		// 优化压缩
		// 更多参考see http://golang.org/pkg/archive/zip/#pkg-constants
		header.Method = zip.Deflate

		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}
		if _, err = io.Copy(writer, zipfile); err != nil {
			return err
		}
	}
	return nil
}

/*

	//压缩日志文件
	files, _ := ioutil.ReadDir("/tmp/gpsLog/")
	var logFile string
	zipPath := "/tmp/log.zip"
	for _, f := range files {
		logFile = "/tmp/gpsLog/"+f.Name()
	}
	fileList := []string{logFile,"/cache.txt"}
	//压缩文件
	util.ZipFiles(zipPath, fileList, "/tmp/gpsLog/","")

	extraParams := map[string]string{
		"mac":       Mac,
	}
	request, err := util.NewfileUploadRequest("http://ngrok.movingdt.com/upload4log", extraParams, "file", zipPath)
	if err != nil {
		RuningLog("LogFile-Err:"+err.Error())
	}
	client := &http.Client{}
	resp, err := client.Do(request)
	if err != nil {
		RuningLog("LogFile-Err:"+err.Error())
	} else {
		body := &bytes.Buffer{}
		_, err := body.ReadFrom(resp.Body)
		if err != nil {
			RuningLog("LogFile-Err:"+err.Error())
		}
		resp.Body.Close()
		RuningLog("LogFile-Status:"+strconv.Itoa(resp.StatusCode))
	}

*/

func NewfileUploadRequest(uri string, params map[string]string, paramName, path string) (*http.Request, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(paramName, filepath.Base(path))
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(part, file)

	for key, val := range params {
		_ = writer.WriteField(key, val)
	}
	err = writer.Close()
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequest("GET", uri, body)
	request.Header.Add("Content-Type", writer.FormDataContentType())
	return request, err
}




