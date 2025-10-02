---
outline: [2, 3]
---

# Go 面试题

## 1 基础篇

### 1.1 Go包管理的方式有哪些

发展历史：
- `< Go1.5`：GOPATH
  - 通过统一包存放的路径实现包管理
  - 不支持依赖包的版本控制
- `>= Go1.5`：GO Vendor
  - Go1.5 引入，需要通过环境变量 `GO15VENDOREXPERIMENT=1` 开启
  - Go1.6 Vendor 机制默认开启
  - 把源码拷贝到 `vendor` 目录并维护 `vendor.json` 文件，指定版本
- `>= Go1.11`：GO Modules
  - Go1.11 中，`GO111MODULE` 的默认值是 `auto`：
    - 当项目在 GOPATH 之外，且包含 `go.mod` 文件时，自动启用 Modules；
    - 当项目在 GOPATH 内时，默认不启用（仍使用 GOPATH 模式）。
  - Go1.13 起，`GO111MODULE` 默认值改为 `on`，彻底以 Modules 为主要包管理方式。

### 1.2 `init()` 是什么时候执行的

`init()` 函数的作用：
- 程序执行前包的初始化

`init()` 函数的执行顺序：
- 在同一个 Go 文件中的多个 init 方法，按照代码顺序依次执行
- 同一个包内不同文件中的 `init()` 函数，按照文件名顺序执行
- 不同的包且不相互依赖，按照 `import` 顺序执行
- 存在依赖关系的包，被依赖的包先执行 `init()`

go 文件的初始化顺序：
1. 引入的包
2. 当前包中的常量
3. 当前包中的变量
4. 当前包的 `init()` 函数
5. 若为 `main` 包，最终执行 `main()` 函数

### 1.3 `new` 和 `make` 的区别

- `make` 不仅分配内存，还会初始化。`new` 只会分配零值填充的值（例如，`int` 的零值是 `0`，`*int` 的零值是 `nil`，`[]int` 的零值是 `nil`）
- `make` 只适用于 `slice`、`map`、`channel` 的数据，`new` 没有限制
- `make` 返回原始类型(T)，`new` 返回类型的指针(*T)

### 1.4 内存逃逸

#### 1.4.1 什么是内存逃逸

Go 中，函数内的局部变量默认分配在栈上（栈内存由编译器自动分配和释放，效率极高）。但在某些情况下，变量会被移动到堆上分配，这种现象称为**内存逃逸**。逃逸分析是编译器决定变量分配位置的过程。

核心区别：
- 栈分配：函数退出后，栈内存自动释放，无需垃圾回收（GC）。
- 堆分配：变量生命周期不确定，需由 GC 管理，会增加 GC 压力。

#### 1.4.2 发生内存逃逸的常见场景

编译器进行逃逸分析时，若发现变量的生命周期无法在编译期确定或栈无法容纳，就会将其分配到堆上。常见场景包括：

1. **变量被外部引用（跨函数生命周期）**

若函数返回变量的指针或引用，且该指针被外部持有（变量需在函数退出后继续存在），变量会逃逸到堆。

```go
func create() *int {
	x := 10   // x 会逃逸到堆
	return &x // 返回指针，x 需在函数外存活
}

func main() {
	p := create()
	fmt.Println(*p)
}
```

*原因：函数退出后，栈会被销毁，若变量仍被外部引用，必须放在堆上。*

2. **变量大小超过栈的承载能力**

栈的空间有限，若变量体积过大（如超大数组），编译器会将其分配到堆上。

```go
func bigData() {
	data := [1000000]int64{} // 大小超过栈限制，逃逸到堆
}
```

*原因：避免栈溢出（stack overflow），堆的空间更大且动态分配。*

3. **闭包引用并修改外部变量**

闭包会捕获外部变量的引用，若闭包的生命周期长于变量的原始作用域，变量会逃逸到堆。

```go
func closure() func() {
	x := 10
	return func() {
		x++ // 闭包修改 x，x 需在 closure 退出后存活
		fmt.Println(x)
	}
}

func main() {
	f := closure()
	f() // 调用闭包时，x 仍需存在
}
```

*原因：闭包可能在函数退出后被调用，变量需脱离原函数栈存活。*

4. **变量类型为接口（动态类型不确定）**

当变量被赋值给接口类型，且编译器无法在编译期确定其具体类型（动态类型），变量会逃逸到堆。

```go
type animal interface {
	run()
}

type dog struct{}

func (d dog) run() {}

func main() {
	// 声明的同时赋值了，不会发生逃逸
	var a1 animal = dog{}
	a1.run()

	// 接口类型声明时没赋值，动态类型不确定，发生内存逃逸
	var a2 animal
	a2 = dog{}
	a2.run()
}
```

*原因：接口的动态类型处理需要 runtime 支持，堆分配更灵活。*

5. **切片 / 映射的动态扩容或长度不确定**

若切片的长度是动态计算的（非编译期常量），或可能发生扩容（底层数组需更换），其底层数组可能逃逸到堆。

```go
func main() {
	n, _ := strconv.Atoi(os.Args[1])
	_ = make([]int, n)
}
```

### 1.5 如何手动修改容量和长度

正常情况下无法直接修改，必须通过反射的 `SetLen` 和 `SetCap` 方法操作。这两个方法本质是**直接修改切片头中的长度和容量字段**，而非改变底层数组本身。

- `SetLen(n)` 的限制：`n` 必须满足 `0 ≤ n ≤ cap(slice)`
- `SetCap(n)` 的限制：`n` 必须满足 `len(slice) ≤ n ≤ 原 cap(slice)`

```go
func main() {
	slice := make([]int, 3, 5)
	fmt.Println(len(slice), cap(slice), slice) // 3 5 [0 0 0]
	reflect.ValueOf(&slice).Elem().SetLen(2)
	fmt.Println(len(slice), cap(slice), slice) // 2 5 [0 0]
	reflect.ValueOf(&slice).Elem().SetCap(4)
	fmt.Println(len(slice), cap(slice), slice) // 2 4 [0 0]
}
```

### 1.6 切片和浮点数能作为 `map` 的键吗

只有可比较类型才能作为 `map` 的键。所以切片不行，浮点数可以。

但是如果用浮点数做 `map` 的键会存在问题。例如：

```go
func main() {
	m := make(map[float64]int)
	m[0.1] = 1
	m[0.2] = 2
	m[0.3] = 5
	m[0.30000000000000001] = 6
	fmt.Printf("%v\n", m) // map[0.1:1 0.2:2 0.3:6]
}
```

出现上面问题，是由于浮点数自身的二进制表示精度限制，导致不同十进制数对应同一二进制值，进而引发键冲突。当浮点型作为 `map` 的 `key` 的时候会做一些特别的处理，它会先通过 `math.Float64bit` 函数转为 `uint64` 类型，再作为 `key`：

```go
fmt.Println(math.Float64bits(0.3))                 // 4599075939470750515
fmt.Println(math.Float64bits(0.30000000000000001)) // 4599075939470750515
```

除了精度导致的冲突，浮点数键还有一个常见问题：`NaN` 与任何值都不相等，导致存入 `NaN` 后无法取出：

```go
m := make(map[float64]int)
m[math.NaN()] = 100
fmt.Println(m[math.NaN()] == 100)     // false
fmt.Println(math.NaN() == math.NaN()) // false
```

### 1.7 判断两个对象是否完全相同
