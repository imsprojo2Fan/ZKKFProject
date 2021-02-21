package timer

import (
	"ZkkfProject/models"
	"ZkkfProject/sysinit"
	"ZkkfProject/utils"
	"fmt"
	"github.com/robfig/cron"
	"go.uber.org/zap"
	"runtime"
	"strconv"
	"strings"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 8:46 2021/2/20
 * @Modified By:
 */

var (
	gTask models.Task
	gUser models.User
	gAssignInfo models.AssignInfo
	taskLogger = sysinit.NewLogger("task")
)


func Timer()  {
	fmt.Println("InitTimer...")
	system := runtime.GOOS
	if system=="windows"{
		//return
	}

	c := cron.New()
	//每天凌晨1点执行
	spec := "0 0 1 * * *"
	_ = c.AddFunc(spec, func() {

	})
	//每分钟
	spec = "0 */1 * * * *"
	_ = c.AddFunc(spec, func() {
		//fmt.Println("Timer One Minute...",time.Now())
	})
	//每30秒
	spec = "*/30 * * * * *"
	_ = c.AddFunc(spec, func() {
		//fmt.Println("Timer One Minute/2...",time.Now())
		AllotTask()
	})
	//每30秒
	spec = "*/15 * * * * *"
	_ = c.AddFunc(spec, func() {
		//fmt.Println("Timer One Minute/4...",time.Now())
	})
	c.Start()
}

func AllotTask(){

	//待分配任务
	taskArr,_ := gTask.ListByStatus("0")

	if taskArr==nil{
		return
	}

	uArr := RankAssignUser()
	if uArr==nil||len(uArr)==0{
		taskLogger.Info("Info", zap.Any("Info", "AllotTask RankAssignUser No User!"))
		return
	}

	for _,task := range taskArr{
		tid1 := task.Tid
		//判断是否有匹配用户
		flag := false
		for index,user := range uArr{
			tid2 := user["typeJob"].(string)
			//对负责领域匹配
			if strings.Contains(tid2,strconv.Itoa(tid1)){
				flag = true
				var assign models.AssignInfo
				assign.Rid = utils.RandomString(16)
				assign.RandomId = task.RandomId
				assign.Operate = 0
				assign.S1 = user["uid"].(int)
				assign.Uid = user["uid"].(int)
				err := assign.Insert(&assign)
				if err==nil{
					//将已分配的用户移至末尾
					uArr = DeleteSlice1(index,uArr)
					uArr = append(uArr,user)
				}
				break
			}
		}
		if !flag{
			taskLogger.Info("Info", zap.Any("Info", "Rid:"+task.RandomId+",Tid:"+strconv.Itoa(task.Tid)+" AllotTask No User!"))
		}
	}
}

func RankAssignUser() []map[string]interface{} {
	//获取包含业务经理角色的用户
	uArr,_ := gUser.SelectByRole(3)
	//已完成任务
	assignArr := gAssignInfo.List4Task()
	var tempArr []map[string]interface{}
	for _,user := range uArr{
		tMap := make(map[string]interface{})
		uid1 := user.Id
		tMap["uid"] = uid1
		tMap["typeJob"] = user.TypeJob
		var count int
		for _,assign := range assignArr{
			uid2 := assign.S1//业务经理id
			if uid1==uid2{
				count++
			}
		}
		tMap["count"] = count
		tempArr = append(tempArr,tMap)
	}
	if tempArr==nil{
		return nil
	}
	//排序
	length := len(tempArr)
	for i:=0;i<length;i++{
		for j:=0;j<length-1-i;j++ {
			count1 := tempArr[j]["count"].(int)
			count2 := tempArr[j+1]["count"].(int)
			if count1>count2 {//相邻元素两两对比
				var temp = tempArr[j+1]       //元素交换
				tempArr[j+1] = tempArr[j]
				tempArr[j] = temp
			}
		}
	}
	return tempArr

}


func DeleteSlice1(delIndex int,a []map[string]interface{}) []map[string]interface{} {
	var ret []map[string]interface{}
	for index, item := range a {
		if delIndex != index {
			ret = append(ret, item)
		}
	}
	return ret
}

func DeleteSlice2(delIndex int,a []map[string]interface{}) []map[string]interface{}{
	j := 0
	for index, val := range a {
		if delIndex != index {
			a[j] = val
			j++
		}
	}
	return a[:j]
}