package utils

import (
	_ "github.com/astaxie/beego/cache/redis"
	"github.com/astaxie/beego/cache"
	"fmt"
)

func initRedis()  {
	redis, err := cache.NewCache("redis", `{"conn":"127.0.0.1:6379", "key":"beecacheRedis"}`)
	if err != nil {
		fmt.Println(err)
	}
	GlobalRedis = redis
}
