package utils

import (
	"testing"
	"fmt"
	"encoding/base64"
)

func Test(t *testing.T) {

	stringTime := "2017-08-30"
	fmt.Println(StrToDate(stringTime))


	key := []byte("0123456789abcdef")
	salt := "ZkkfProject_"
	result, err := AesEncrypt([]byte("root"+salt), key)
	if err != nil {
		panic(err)
	}
	fmt.Println("DecData:",base64.StdEncoding.EncodeToString(result))
	origData, err2 := AesDecrypt(result, key)
	if err2 != nil {
		panic(err)
	}
	fmt.Println("OriData:",string(origData))
}
