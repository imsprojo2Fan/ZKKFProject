package utils

import (
	"fmt"
	"github.com/holdno/snowFlakeByGo"
	"testing"
)

func Test(t *testing.T) {

	IdWorker, _ := snowFlakeByGo.NewWorker(0) // 传入当前节点id 此id在机器集群中一定要唯一 且从0开始排最多1024个节点，可以根据节点的不同动态调整该算法每毫秒生成的id上限(如何调整会在后面讲到)
	// 获得唯一id
	id1 := IdWorker.GetId()
	fmt.Println("id1:", id1)
	id2 := IdWorker.GetId()
	fmt.Println("id2:", id2)

	fmt.Println(GenerateCode())

}
