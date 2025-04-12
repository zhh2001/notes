# Gin

Gin 是一个 Go 语言写的 Web 框架。

## 1 安装

```shell
go get -u github.com/gin-gonic/gin
```

## 2 HelloWorld

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func helloWorld(context *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "message": "world",
    })
}

func main() {
	router := gin.Default()
	router.GET("/hello", helloWorld)
	router.Run("localhost:8000")
}
```

## 3 路由分组

假设现在有这些请求路径：`/goods/list`、`goods/add`、`goods/del`，在不使用路由分组的情况下，通常会这样写：

```go
router := gin.Default()
router.GET("/goods/list", goodsList)
router.POST("/goods/add", addGoods)
router.POST("/goods/del", delGoods)
```

这些路径都包含 `/goods`，可以通过路由分组进行管理：

```go
router := gin.Default()
goodsGroup := router.Group("/goods")
goodsGroup.GET("/list", goodsList)
goodsGroup.POST("/add", addGoods)
goodsGroup.POST("/del", delGoods)
```

## 4 获取 URL 上的变量

假设现在需要通过 `/goods/[商品ID]` 访问对应商品的详情，通过如下方法可以识别 URL 中的 ID 变量：

```go
router := gin.Default()
router.GET("/goods/:id", func(context *gin.Context) {
	id := context.Param("id")
	context.JSON(http.StatusOK, gin.H{
		"id": id,
	})
})
```

假设现在想通过 `/goods/[商品ID]/[动作]` 来对商品进行操作，可以这样做：

```go
router.GET("/goods/:id/:action", func(context *gin.Context) {
	id := context.Param("id")
	action := context.Param("action")
	context.JSON(http.StatusOK, gin.H{
		"id":     id,
		"action": action,
	})
})
```

```http
### 请求
GET http://localhost:8000/goods/123/delete

### 响应
{
  "action": "delete",
  "id": "123"
}
```

通过 `/goods/:id/*action` 也能实现，但是和 `/:action` 有些区别：

```go
router.GET("/goods/:id/*action", func(context *gin.Context) {
	id := context.Param("id")
	action := context.Param("action")
	context.JSON(http.StatusOK, gin.H{
		"id":     id,
		"action": action,
	})
})
```

```http
### 请求
GET http://localhost:8000/goods/123/delete

### 响应
{
  "action": "/delete",
  "id": "123"
}


### 请求
GET http://localhost:8000/goods/123/delete/test

### 响应
{
  "action": "/delete/test",
  "id": "123"
}


### 请求
GET http://localhost:8000/goods/123

### 响应
{
  "action": "/",
  "id": "123"
}


### 请求
GET http://localhost:8000/goods/123/

### 响应
{
  "action": "/",
  "id": "123"
}
```

还可以直接绑定 Uri 到一个结构体：

```go
type Goods struct {
	Id   int    `uri:"id"   binding:"required"`
	Name string `uri:"name" binding:"required"`
}

func main() {
	router := gin.Default()
	router.GET("/goods/:id/:name", func(context *gin.Context) {
		var goods Goods
		if err := context.ShouldBindUri(&goods); err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{
			"id":   goods.Id,
			"name": goods.Name,
		})
	})
	router.Run("localhost:8000")
}
```

```http
GET http://localhost:8000/goods/123/abc

# 响应
{
  "id": 123,
  "name": "abc"
}
```

## 5 获取表单信息

### 5.1 Get 请求

```go
func main() {
	router := gin.Default()
	router.GET("/hello", hello)
	router.Run("localhost:8000")
}

func hello(context *gin.Context) {
	// 如果参数没取到，则使用空字符串""
	lang := context.Query("lang")
	// 如果参数没取到，则使用默认值"Gin"
	framework := context.DefaultQuery("framework", "Gin")
	context.JSON(http.StatusOK, gin.H{
		"lang":      lang,
		"framework": framework,
	})
}
```

测试：

```http
GET http://localhost:8000/hello

# 响应
{
  "framework": "Gin",
  "lang": ""
}
```

```http
GET http://localhost:8000/hello?lang=Java&framework=Spring

# 响应
{
  "framework": "Spring",
  "lang": "Java"
}
```

### 5.2 Post 请求

```go
func main() {
	router := gin.Default()
	router.GET("/hello", hello)   // [!code --]
	router.POST("/hello", hello)  // [!code ++]
	router.Run("localhost:8000")
}

func hello(context *gin.Context) {
	lang := context.Query("lang")                             // [!code --]
	lang := context.PostForm("lang")                          // [!code ++]
	framework := context.DefaultQuery("framework", "Gin")     // [!code --]
	framework := context.DefaultPostForm("framework", "Gin")  // [!code ++]
	context.JSON(http.StatusOK, gin.H{
		"lang":      lang,
		"framework": framework,
	})
}
```

测试：

```http
### 请求
POST http://localhost:8000/hello
Content-Type: application/x-www-form-urlencoded

lang = Go &
framework = Gin


# 响应
{
  "framework": "Gin",
  "lang": "Go"
}
```

## 6 Protobuf 渲染

定义 Protobuf 消息：

```proto
syntax = "proto3";

option go_package = '.;proto';

message Teacher {
  string name = 1;
  repeated string courses = 2;
}
```

生成 Go 包，在程序中导入使用：

```go{12}
func main() {
	router := gin.Default()
	router.GET("/hello", hello)
	router.Run("localhost:8000")
}

func hello(context *gin.Context) {
	user := &proto.Teacher{
		Name:    "zhang",
		Courses: []string{"Gin", "GoLang"},
	}
	context.ProtoBuf(http.StatusOK, user)
}
```

## 7 表单验证

```go
type SignUpInfo struct {
	Username   string `json:"username" binding:"required,min=3,max=20"`        // 必传字段，要求 3 <= length <= 20
	Password   string `json:"password" binding:"required,min=8,max=20"`        // 必传字段，要求 3 <= length <= 20
	RePassword string `json:"rePassword" binding:"required,eqfield=Password"`  // 必传字段，要求和 password 字段一致
	Email      string `json:"email" binding:"required,email"`                  // 必传字段，要求符合邮箱格式
	Age        uint8  `json:"age" binding:"gte=0,lte=120"`                     // 要求 0 <= age <= 120
}

func main() {
	router := gin.Default()
	router.POST("/signUp", signUp)
	router.Run("localhost:8000")
}

func signUp(context *gin.Context) {
	var info SignUpInfo
	if err := context.ShouldBindJSON(&info); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"msg": "注册成功"})
}
```

验证不通过时，返回的信息是英文的，如下所示：

```json
{
    "error": "
		Key: 'SignUpInfo.Username' Error:Field validation for 'Username' failed on the 'min' tag\n
		Key: 'SignUpInfo.RePassword' Error:Field validation for 'RePassword' failed on the 'eqfield' tag\n
		Key: 'SignUpInfo.Email' Error:Field validation for 'Email' failed on the 'email' tag\n
		Key: 'SignUpInfo.Age' Error:Field validation for 'Age' failed on the 'lte' tag
	"
}
```

可将错误信息转成中文：

```go
import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/locales/en"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	en_translations "github.com/go-playground/validator/v10/translations/en"
	zh_translations "github.com/go-playground/validator/v10/translations/zh"
	"net/http"
)

func InitTrans(locale string) (err error) {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		zhT := zh.New()
		enT := en.New()
		uni := ut.New(zhT, zhT, enT)
		trans, ok = uni.GetTranslator(locale)
		if !ok {
			return errors.New("translator not found")
		}
		switch locale {
		case "zh":
			if err := zh_translations.RegisterDefaultTranslations(v, trans); err != nil {
				return err
			}
		case "en":
			if err := en_translations.RegisterDefaultTranslations(v, trans); err != nil {
				return err
			}
		}
	}
	return nil
}

var trans ut.Translator

func main() {
	if err := InitTrans("zh"); err != nil {
		fmt.Println(err)
	}
	router := gin.Default()
	router.POST("/signUp", signUp)
	router.Run("localhost:8000")
}

func signUp(context *gin.Context) {
	var info SignUpInfo
	if err := context.ShouldBindJSON(&info); err != nil {
		errs, _ := err.(validator.ValidationErrors)
		context.JSON(http.StatusBadRequest, gin.H{"error": errs.Translate(trans)})
		return
	}
	context.JSON(http.StatusOK, gin.H{"msg": "注册成功"})
}
```

此时，错误信息将转为中文：

```json
{
    "error": {
        "SignUpInfo.Age": "Age必须小于或等于120",
        "SignUpInfo.Email": "Email必须是一个有效的邮箱",
        "SignUpInfo.RePassword": "RePassword必须等于Password",
        "SignUpInfo.Username": "Username长度必须至少为3个字符"
    }
}
```

## 8 中间件

```go
func MyLogger() gin.HandlerFunc {
  return func(context *gin.Context) {
    t := time.Now()
	// context.Abort()  终止请求
    context.Next()   // 处理请求
    latency := time.Since(t)
    log.Print(latency)
  }
}

func main() {
  router := gin.New()
  router.Use(gin.Logger())  // 全局中间件
  router.GET("/signUp", MyLogger(), signUp)  // 路由中间件
  router.Run("localhost:8000")
}
```

中间件后续逻辑的执行终止，必须使用 `context.Abort()`，直接 `return` 无法阻止执行：

```go
func MyLogger() gin.HandlerFunc {
  return func(context *gin.Context) {
	return  // 后续逻辑依旧会被执行
    context.Next()
  }
}
```

从添加中间件的 `Use` 函数源码上看：

```go
func (group *RouterGroup) Use(middleware ...HandlerFunc) IRoutes {
	group.Handlers = append(group.Handlers, middleware...)
	return group.returnObj()
}
```

本质上是把中间件追加到了 `group.Handlers` 切片的后面。

而在 `GET/POST` 函数内部执行了一个 `combineHandlers` 函数：

```go
func (group *RouterGroup) combineHandlers(handlers HandlersChain) HandlersChain {
	finalSize := len(group.Handlers) + len(handlers)
	assert1(finalSize < int(abortIndex), "too many handlers")
	mergedHandlers := make(HandlersChain, finalSize)
	copy(mergedHandlers, group.Handlers)
	copy(mergedHandlers[len(group.Handlers):], handlers)
	return mergedHandlers
}
```

这里将我们处理请求的函数和之前的 `Handlers` 拼在了一起。

而 `context.Next()` 的调用过程如下：

```go
func (c *Context) Next() {
	c.index++
	for c.index < int8(len(c.handlers)) {
		c.handlers[c.index](c)
		c.index++
	}
}
```

如果在自定义中间件里直接 `return` 了，只代表当前中间件的逻辑结束了，`Handlers` 中后续的函数仍然会依次执行。

从 `context.Next()` 的源码逻辑可以看出，真正决定 `Handlers` 中的函数调用的是 `c.index`。而 `context.Abort()` 的作用正是修改这个变量：

```go
const abortIndex int8 = math.MaxInt8 >> 1

func (c *Context) Abort() {
	c.index = abortIndex
}
```

## 9 优雅退出

关闭程序的时候可能有请求还没有处理完，此时处理过程就会被迫中断。优雅退出其实就是在程序关闭时，不暴力关闭，而是要等待进程中的逻辑处理完成后，才关闭。

```go
import (
	"fmt"
	"net/http"
	"os"
	"os/signal"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	go func() {
		_ = router.Run(":8000")
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	fmt.Println("关闭服务")
}
```
