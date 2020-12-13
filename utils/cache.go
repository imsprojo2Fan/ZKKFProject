package utils

import (
	"bytes"
	"encoding/gob"
	"errors"
	"time"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/cache"
	_ "github.com/astaxie/beego/cache/redis"
)

var GlobalRedis cache.Cache
var ExpireTime int64

func InitCache() {
	host := beego.AppConfig.String("cache::redis_host")
	//passWord := beego.AppConfig.String("cache::GlobalRedis_password")
	ExpireTime,_ = beego.AppConfig.Int64("cache::cache_expire")
	var err error
	defer func() {
		if r := recover(); r != nil {
			GlobalRedis = nil
		}
	}()
	//GlobalRedis, err = cache.NewCache("GlobalRedis", `{"conn":"`+host+`","password":"`+passWord+`"}`)
	GlobalRedis, err = cache.NewCache("redis", `{"conn":"`+host+`"}`)
	if err != nil {
		LogError("Connect to the GlobalRedis host " + host + " failed")
		LogError(err)
	}
}

// SetCache
func SetCache(key string, value interface{}, timeout int) error {
	data, err := Encode(value)
	if err != nil {
		return err
	}
	if GlobalRedis == nil {
		return errors.New("GlobalRedis is nil")
	}

	defer func() {
		if r := recover(); r != nil {
			LogError(r)
			GlobalRedis = nil
		}
	}()
	timeouts := time.Duration(timeout) * time.Second
	err = GlobalRedis.Put(key, data, timeouts)
	if err != nil {
		LogError(err)
		LogError("SetCache失败，key:" + key)
		return err
	} else {
		return nil
	}
}

func GetCache(key string, to interface{}) error {
	if GlobalRedis == nil {
		return errors.New("GlobalRedis is nil")
	}

	defer func() {
		if r := recover(); r != nil {
			LogError(r)
			GlobalRedis = nil
		}
	}()

	data := GlobalRedis.Get(key)
	if data == nil {
		return errors.New("Cache不存在")
	}

	err := Decode(data.([]byte), to)
	if err != nil {
		LogError(err)
		LogError("GetCache失败，key:" + key)
	}

	return err
}

// DelCache
func DelCache(key string) error {
	if GlobalRedis == nil {
		return errors.New("GlobalRedis is nil")
	}
	defer func() {
		if r := recover(); r != nil {
			//fmt.Println("get cache error caught: %v\n", r)
			GlobalRedis = nil
		}
	}()
	err := GlobalRedis.Delete(key)
	if err != nil {
		return errors.New("Cache删除失败")
	} else {
		return nil
	}
}

// Encode
// 用gob进行数据编码
//
func Encode(data interface{}) ([]byte, error) {
	buf := bytes.NewBuffer(nil)
	enc := gob.NewEncoder(buf)
	err := enc.Encode(data)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Decode
// 用gob进行数据解码
//
func Decode(data []byte, to interface{}) error {
	buf := bytes.NewBuffer(data)
	dec := gob.NewDecoder(buf)
	return dec.Decode(to)
}
