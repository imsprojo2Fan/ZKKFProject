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

func StrToTime(str string)  {
	stringTime := "2017-08-30 16:40:41"

	loc, _ := time.LoadLocation("Local")
	the_time, err := time.ParseInLocation("2006-01-02 15:04:05", stringTime, loc)

	if err == nil {

		unix_time := the_time.Unix() //1504082441

		fmt.Println(unix_time)

	}
}