package utils

import (
	"fmt"
	"time"
)

/**
 * @Author: Fan IMSProJo
 * @Description:
 * @Date: Created in 16:57 2020/12/18
 * @Modified By:
 */

func StrToDate(str string) time.Time{
	//stringTime := "2017-08-30"
	loc, _ := time.LoadLocation("Local")
	theTime, err := time.ParseInLocation("2006-01-02", str, loc)

	if err != nil {
		fmt.Println("StrToDate",err.Error())
	}
	return theTime
}

func TimeStrToUnix(str string)(unixTime int64)  {
	//stringTime := "2017-08-30 16:40:41"
	loc, _ := time.LoadLocation("Local")
	theTime, err := time.ParseInLocation("2006-01-02 15:04:05", str, loc)
	if err == nil {
		unixTime = theTime.Unix() //1504082441
	}
	return unixTime
}

func DateStrToUnix(str string)(unixTime int64)  {
	//stringTime := "2017-08-30"
	loc, _ := time.LoadLocation("Local")
	theTime, err := time.ParseInLocation("2006-01-02", str, loc)
	if err == nil {
		unixTime = theTime.Unix() //1504082441
	}
	return unixTime
}

/**
获取本周周一的日期
*/
func GetFirstDateOfWeek() (weekMonday string) {
	now := time.Now()

	offset := int(time.Monday - now.Weekday())
	if offset > 0 {
		offset = -6
	}
	weekStartDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local).AddDate(0, 0, offset)
	weekMonday = weekStartDate.Format("2006-01-02")
	return
}

/**
获取上周的周一日期
*/
func GetLastWeekFirstDate() (weekMonday string) {
	thisWeekMonday := GetFirstDateOfWeek()
	TimeMonday, _ := time.Parse("2006-01-02", thisWeekMonday)
	lastWeekMonday := TimeMonday.AddDate(0, 0, -7)
	weekMonday = lastWeekMonday.Format("2006-01-02")
	return
}
/**
获取上周的周一日期
*/
func WeekByDate(num int) (weekMonday string) {
	thisWeekMonday := GetFirstDateOfWeek()
	TimeMonday, _ := time.Parse("2006-01-02", thisWeekMonday)
	lastWeekMonday := TimeMonday.AddDate(0, 0, num)
	weekMonday = lastWeekMonday.Format("2006-01-02")
	return
}
func Now()string  {
	timeStr := time.Now().Format("2006-01-02 15:04:05")
	return timeStr
}
func NowDate()string  {
	timeStr := time.Now().Format("2006-01-02")
	return timeStr
}

func LastDate()string  {
	nTime := time.Now()
	yesTime := nTime.AddDate(0,0,-1)
	yesterday := yesTime.Format("2006-01-02")
	return yesterday
}

func Str2Timestamp(para string) int64{
	//toBeCharge := "2015-01-01 00:00:00"                             //待转化为时间戳的字符串 注意 这里的小时和分钟还要秒必须写 因为是跟着模板走的 修改模板的话也可以不写
	timeLayout := "2006-01-02 15:04:05"                             //转化所需模板
	loc, _ := time.LoadLocation("Local")                            //重要：获取时区
	theTime, _ := time.ParseInLocation(timeLayout, para, loc) //使用模板在对应时区转化为time.time类型
	sr := theTime.Unix()                                           //转化为时间戳 类型是int64
	return  sr
}

func Str2Timestamp2(para string) int64{
	//toBeCharge := "2015-01-01 00:00:00"                             //待转化为时间戳的字符串 注意 这里的小时和分钟还要秒必须写 因为是跟着模板走的 修改模板的话也可以不写
	timeLayout := "2006-01-02"                             //转化所需模板
	loc, _ := time.LoadLocation("Local")                            //重要：获取时区
	theTime, _ := time.ParseInLocation(timeLayout, para, loc) //使用模板在对应时区转化为time.time类型
	sr := theTime.Unix()                                           //转化为时间戳 类型是int64
	return  sr
}