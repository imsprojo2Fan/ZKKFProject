# ZkkfProject

1.设置代理
    go env -w GOPROXY=https://goproxy.cn,direct
2.清缓存
    go clean -modcache
    
3.nohup go run zservice.go> /dev/null 2>&1 &