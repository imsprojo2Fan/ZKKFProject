package sysinit

import (
	"ZkkfProject/utils"
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
	"os"
	"time"
)

var SysLogger *zap.Logger
func init() {
	hook := lumberjack.Logger{
		Filename:   "./log/app.log", // 日志文件路径
		MaxSize:    32,                         // 每个日志文件保存的最大尺寸 单位：M
		MaxBackups: 64,                          // 日志文件最多保存多少个备份
		MaxAge:     7,                           // 文件最多保存多少天
		Compress:   true,                        // 是否压缩
	}
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:       "time",
		LevelKey:      "level",
		NameKey:       "logger",
		CallerKey:     "linenum",
		MessageKey:    "msg",
		StacktraceKey: "stacktrace",
		LineEnding:    zapcore.DefaultLineEnding,
		EncodeLevel:   zapcore.LowercaseLevelEncoder, // 小写编码器
		EncodeTime:    zapcore.ISO8601TimeEncoder,    // ISO8601 UTC 时间格式
		//EncodeTime:TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder, //
		EncodeCaller:   zapcore.FullCallerEncoder,      // 全路径编码器
		EncodeName:     zapcore.FullNameEncoder,
	}

	// 设置日志级别
	atomicLevel := zap.NewAtomicLevel()
	atomicLevel.SetLevel(zap.DebugLevel)

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),                                           // 编码器配置
		zapcore.NewMultiWriteSyncer(/*zapcore.AddSync(os.Stdout),*/ zapcore.AddSync(&hook)), // 打印到控制台和文件
		atomicLevel, // 日志级别
	)

	SysLogger = zap.New(core)

}

func NewLogger(logType string)(Logger *zap.Logger){

	filePath := "./log/"+logType
	flag,_ := utils.PathExists(filePath)
	if !flag{
		_ = os.MkdirAll(filePath, os.ModePerm)
	}

	hook := lumberjack.Logger{
		Filename:   filePath+"/app.log", // 日志文件路径
		MaxSize:    32,// 每个日志文件保存的最大尺寸 单位：M
		MaxBackups: 128,// 日志文件最多保存多少个备份
		MaxAge:     30,// 文件最多保存多少天
		Compress:   true,// 是否压缩
	}

	encoderConfig := zapcore.EncoderConfig{
		TimeKey:       "time",
		LevelKey:      "level",
		NameKey:       "logger",
		CallerKey:     "linenum",
		MessageKey:    "msg",
		StacktraceKey: "stacktrace",
		LineEnding:    zapcore.DefaultLineEnding,
		EncodeLevel:   zapcore.LowercaseLevelEncoder, // 小写编码器
		EncodeTime:    zapcore.ISO8601TimeEncoder,    // ISO8601 UTC 时间格式
		//EncodeTime:TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder, //
		EncodeCaller:   zapcore.FullCallerEncoder,      // 全路径编码器
		EncodeName:     zapcore.FullNameEncoder,
	}

	// 设置日志级别
	atomicLevel := zap.NewAtomicLevel()
	atomicLevel.SetLevel(zap.InfoLevel)

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderConfig),                                           // 编码器配置
		zapcore.NewMultiWriteSyncer(/*zapcore.AddSync(os.Stdout),*/ zapcore.AddSync(&hook)), // 打印到控制台和文件
		atomicLevel, // 日志级别
	)

	Logger = zap.New(core)
	return Logger
}

func ZapInfoLogger(logger *zap.Logger,str ...interface{})  {
	if logger==nil{
		return
	}
	logger.Info("Info", zap.Any("Info", str))
}

func ZapErrLogger(logger *zap.Logger,str ...interface{})  {
	if logger==nil{
		return
	}
	logger.Error("Error", zap.Any("Error", str))
}

func FmtPrintInfo(str ...interface{}) {
	if LogLevel == "" {
		return
	}
	if LogLevel == "debug" {
		FmtPrint(str)
		return
	}
	if LogLevel == "info" {
		SysLogger.Info("Info", zap.Any("Info", str))
	}
}

func FmtPrintError(str ...interface{}) {
	if LogLevel == "" {
		return
	}
	if LogLevel == "debug" {
		FmtPrint(str)
		return
	}
	if LogLevel == "error" {
		SysLogger.Error("Info", zap.Any("Error", str))
	}
}

func FmtPrint(str ...interface{}) {
	SysLogger.Debug("Info", zap.Any("Debug", str))
}

func TimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	loc, _ := time.LoadLocation("Asia/Chongqing")
	enc.AppendString(t.In(loc).Format("2006-01-02 15:04:05.000"))
}

func SysFmt(str ...interface{}) {
	if LogLevel == "console" {
		fmt.Println(str)
	}
}
