#!/bin/bash
#nohup go run /root/go/src/ZkkfProject/zservice.go > /dev/null 2>&1 &

int=1
while(( $int<5 ))
do
	NOWTIME=$(date "+%Y-%m-%d %H:%M:%S")
	sleep 10
	#查询当前zservice进程是否存在
	count=`pgrep -f zservice | wc -l`
	if [ 1 == $count ];then
		echo "start process....."
		#nohup go run /root/go/src/ZkkfProject/zservice.go > /dev/null 2>&1 &
		cd /root/go/src/ZkkfProject/&&go run zservice.go > /dev/null 2>&1 &
		#echo $NOWTIME"-->restart...">>/opt/go/src/NgrokProject/log/shellLog/log.txt
	else
		echo $NOWTIME"	count..."$count
	fi
done