---
outline: [2, 3]
---

# Redis

Redis 诞生于 2009 年，全称是 <span style="color:red;">Re</span>mote <span style="color:red;">Di</span>ctionary <span style="color:red;">S</span>erver。

## 1 通用命令

### 1.1 `KEYS`

- 语法：`KEYS pattern`
- 功能：查看复合模版的所有 `key`，不建议在生产环境使用
- 时间复杂度：`O(N)`，其中 `N` 是数据库中的键数

```txt
redis> MSET firstname Jack lastname Stuntman age 35
"OK"
redis> KEYS *name*
1) "firstname"
2) "lastname"
redis> KEYS a??
1) "age"
redis> KEYS *
1) "age"
2) "firstname"
3) "lastname"
```

### 1.2 `DEL`

- 语法：`DEL key [key ...]`
- 功能：删除指定的 `key`，如果 `key` 不存在则忽略

```txt
redis> SET key1 "Hello"
"OK"
redis> SET key2 "World"
"OK"
redis> DEL key1 key2 key3
(integer) 2
```

### 1.3 `EXISTS`

- 语法：`EXISTS key [key ...]`
- 功能：判断指定的 `key` 是否存在

```txt
redis> SET key1 "Hello"
"OK"
redis> EXISTS key1
(integer) 1
redis> EXISTS nosuchkey
(integer) 0
redis> SET key2 "World"
"OK"
redis> EXISTS key1 key2 nosuchkey
(integer) 2
```

### 1.4 `EXPIRE`

- 语法：`EXPIRE key seconds`
- 功能：设置 `key` 的过期时长

### 1.5 `TTL`

- 语法：`TTL key`
- 功能：查看指定 `key` 的剩余有效时长（秒）

如果 `key` 存在但是没有设置过期时长，返回 `-1`。如果 `key` 不存在返回 `-2`。

## 2 String 类型

String 类型，也就是字符串类型，是 Redis 中最简单的存储类型。

其 value 是字符串，不过根据字符串的格式不同，又可以分为 3 类：
- string：普通字符串
- int：整数类型，可以进行自增自减
- float：浮点类型，可以进行自增自减

不管哪种格式，底层都是字节数组形式存储，只不过是编码方式不同。字符串类型的最大空间不能超过 512m

### 2.1 `SET`

- 语法：`SET key value [NX | XX] [EX seconds | KEEPTTL]`
- 功能：添加或修改一个 String 类型的键值对
- 可选项：
  - `NX`：只有 `key` 不存在时才设置
  - `XX`：只有 `key` 已存在时才设置
  - `EX`：设置过期时长
  - `KEEPTTL`：保留 `key` 原有的过期时长

### 2.2 `GET`

- 语法：`GET key`
- 功能：根据 `key` 获取 String 类型的 `value`

### 2.3 `MSET`

- 语法：`MSET key value [key value ...]`
- 功能：批量添加多个 String 类型的键值对

### 2.4 `MGET`

- 语法：`MGET key [key ...]`
- 功能：批量获取多个 `key` 的 `value`

### 2.5 `INCR`

- 语法：`INCR key`
- 功能：整型自增 `1`

### 2.6 `INCRBY`

- 语法：`INCRBY key increment`
- 功能：整型自增 `increment`

### 2.7 `INCRBYFLOAT`

- 语法：`INCRBYFLOAT key increment`
- 功能：浮点型自增 `increment`

### 2.8 `SETNX`

> 弃用，推荐采用 `SET key value NX`

- 语法：`SETNX key value`
- 功能：如果 `key` 不存在才新增。

`SETNX` 是 **SET** if **N**ot e**X**ists 的简写。

### 2.9 `SETEX`

> 弃用，推荐采用 `SET key value EX seconds`

- 语法：`SETEX key seconds value`
- 功能：新增 `key` 并设置有效时长

## 3 Key 的层级格式

Redis 的 `key` 允许有多个单词形成层级结构，多个单词间用 `:` 隔开。

## 4 Hash 类型

Hash 类型，也叫散列，其 `value` 是一个无需字典，类似于 Java 中的 HashMap 结构。

String 结构将对象的所有字段保存为一整个字符串，如果要修改其中某个字段很不方便。

Hash 结构可以将对象中的每次字段独立存储，可以针对单个字段做 CRUD。

### 4.1 `HSET`

- 语法：`HSET key field value [field value ...]`
- 功能：添加或修改 hash 类型 `key` 的 `filed` 的值

### 4.2 `HGET`

- 语法：`HGET key field`
- 功能：获取一个 hash 类型 `key` 的 `filed` 的值

### 4.3 `HMSET`

> 弃用，采用 `HSET` 效果一样

- 语法：`HMSET key field value [field value ...]`
- 功能：批量添加多个 hash 类型 `key` 的 `filed` 的值

```txt
redis> HMSET myhash field1 "Hello" field2 "World"
"OK"
redis> HGET myhash field1
"Hello"
redis> HGET myhash field2
"World"
```

### 4.4 `HMGET`

- 语法：`HMGET key field [field ...]`
- 功能：批量获取多个 hash 类型 `key` 的 `filed` 的值

```txt
redis> HSET myhash field1 "Hello" field2 "World"
(integer) 2
redis> HMGET myhash field1 field2 nofield
1) "Hello"
2) "World"
3) (nil)
```

### 4.5 `HGETALL`

- 语法：`HGETALL key`
- 功能：获取一个 hash 类型的 `key` 中的所有 `filed` 和对应 `value`

```txt
redis> HSET myhash field1 "Hello" field2 "World"
(integer) 2
redis> HGETALL myhash
1) "field1"
2) "Hello"
3) "field2"
4) "World"
```

### 4.6 `HKEYS`

- 语法：`HKEYS key`
- 功能：获取一个 hash 类型的 `key` 中的所有的 `filed`

```txt
redis> HSET myhash field1 "Hello" field2 "World"
(integer) 2
redis> HKEYS myhash
1) "field1"
2) "field2"
```

### 4.7 `HVALS`

- 语法：`HVALS key`
- 功能：获取一个 hash 类型的 `key` 中的所有的 `value`

```txt
redis> HSET myhash field1 "Hello" field2 "World"
(integer) 2
redis> HVALS myhash
1) "Hello"
2) "World"
```

### 4.8 `HINCRBY`

- 语法：`HINCRBY key field increment`
- 功能：让一个 hash 类型的 `key` 的字段值增加指定步长

```txt
redis> HSET myhash field 5
(integer) 1
redis> HINCRBY myhash field 1
(integer) 6
redis> HINCRBY myhash field -10
(integer) -4
```

### 4.9 `HINCRBY`

- 语法：`HINCRBY key field increment`
- 功能：让一个 hash 类型的 `key` 的字段值增加指定步长

```txt
redis> HSET myhash field 5
(integer) 1
redis> HINCRBY myhash field 1
(integer) 6
redis> HINCRBY myhash field -10
(integer) -4
```

### 4.9 `HSETNX`

- 语法：`HSETNX key field value`
- 功能：只有这个 `key` 的字段不存在才能设置

```txt
redis> HSETNX myhash field "Hello"
(integer) 1
redis> HSETNX myhash field "World"
(integer) 0
redis> HGET myhash field
"Hello"
```

## 5 List 类型

Redis 的 List 类型与 Java 的 LinkedList 类似，可以看作双向链表。既可以正向检索也可以反向检索。

### 5.1 `LPUSH`

- 语法：`LPUSH key element [element ...]`
- 功能：向列表左侧插入元素，`key` 不存在则会创建

```txt
redis> LPUSH mylist "world"
(integer) 1
redis> LPUSH mylist "hello"
(integer) 2
```

### 5.2 `RPUSH`

- 语法：`RPUSH key element [element ...]`
- 功能：向列表右侧插入元素，`key` 不存在则会创建

```txt
redis> RPUSH mylist "one" "two" "three" "four" "five"
(integer) 5
```

### 5.3 `LPOP`

- 语法：`LPOP key [count]`
- 功能：从列表左侧移除元素

```txt
redis> RPUSH mylist "one" "two" "three" "four" "five"
(integer) 5
redis> LPOP mylist
"one"
redis> LPOP mylist 2
1) "two"
2) "three"
```

### 5.4 `RPOP`

- 语法：`RPOP key [count]`
- 功能：从列表右侧移除元素

```txt
redis> RPUSH mylist "one" "two" "three" "four" "five"
(integer) 5
redis> RPOP mylist
"five"
redis> RPOP mylist 2
1) "four"
2) "three"
```

### 5.5 `LRANGE`

- 语法：`LRANGE key start stop`
- 功能：返回索引在 `[start stop]` 内的所有元素

```txt
redis> RPUSH mylist "one" "two" "three"
(integer) 3
redis> LRANGE mylist 0 0
1) "one"
redis> LRANGE mylist -3 2
1) "one"
2) "two"
3) "three"
redis> LRANGE mylist -100 100
1) "one"
2) "two"
3) "three"
redis> LRANGE mylist 5 10
(empty array)
```

### 5.6 
