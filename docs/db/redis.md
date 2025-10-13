---
outline: [2, 3]
---

# Redis

Redis 诞生于 2009 年，全称是 <span style="color:red;">Re</span>mote <span style="color:red;">Di</span>ctionary <span style="color:red;">S</span>erver。

## 1 通用命令

### 1.1 `KEYS`

- 语法：`KEYS pattern`
- 功能：查看符合模版的所有 `key`，不建议在生产环境使用
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

## 6 Set 类型

Redis 的 Set 结构与 Java 中的 HashSet 类似，可以看作是一个 `value` 为 `null` 的 HashMap。因为也是一个 hash 表，因此具备与 HashSet 类似的特征：

- 无序
- 元素不重复
- 查找快
- 支持交集、并集、差集等功能

### 6.1 `SADD`

- 语法：`SADD key member [member ...]`
- 功能：往集合中添加元素

```txt
redis> SADD myset "Hello" "World"
(integer) 2
redis> SADD myset "World"
(integer) 0
```

### 6.2 `SREM`

- 语法：`SREM key member [member ...]`
- 功能：移除集合中的指定元素

```txt
redis> SADD myset "one" "two" "three"
(integer) 3
redis> SREM myset "one" "three"
(integer) 2
redis> SREM myset "four"
(integer) 0
```

### 6.3 `SCARD`

- 语法：`SCARD key`
- 功能：返回集合中的元素数量

```txt
redis> SADD myset "one" "two" "three"
(integer) 3
redis> SCARD myset
(integer) 3
```

### 6.4 `SISMEMBER`

- 语法：`SISMEMBER key member`
- 功能：判断元素是否在集合中

```txt
redis> SADD myset "one"
(integer) 1
redis> SISMEMBER myset "one"
(integer) 1
redis> SISMEMBER myset "two"
(integer) 0
```

### 6.5 `SMEMBERS`

- 语法：`SMEMBERS key`
- 功能：获取集合中的全部元素

```txt
redis> SADD myset Hello World
(integer) 2
redis> SMEMBERS myset
1) "Hello"
2) "World"
```

### 6.6 `SINTER`

- 语法：`SINTER key [key ...]`
- 功能：求交集（intersection）

```txt
redis> SADD s1 a b c d
(integer) 4
redis> SADD s2 c
(integer) 1
redis> SADD s2 a c e
(integer) 3
redis> SINTER s1 s2 s3
1) "c"
```

### 6.7 `SDIFF`

- 语法：`SDIFF key [key ...]`
- 功能：求差集（difference set）

```txt
redis> SADD s1 a b c d
(integer) 4
redis> SADD s2 c
(integer) 1
redis> SADD s2 a c e
(integer) 3
redis> SDIFF s1 s2 s3
1) "d"
2) "b"
```

### 6.8 `SUNION`

- 语法：`SUNION key [key ...]`
- 功能：求并集（union）

```txt
redis> SADD s1 a b c d
(integer) 4
redis> SADD s2 c
(integer) 1
redis> SADD s2 a c e
(integer) 3
redis> SUNION s1 s2 s3
1) "c"
2) "e"
3) "b"
4) "d"
5) "a"
```

## 7 SortedSet 类型

Redis 的 SortedSet 是一个可排序的集合，与 Java 中的 TreeSet 有些类似，但底层数据结构差别很大。SortedSet 中每个元素都带有一个 score 属性，可以基于 score 属性对元素排序，底层实现是一个跳表（SkipList）加 hash 表。

SortedSet 具备下列特性：

- 可排序
- 元素不重复
- 查询速度快

因为 SortedSet 的可排序特性，经常被用来实现排行榜这样的功能。

### 7.1 `ZADD`

- 语法：`ZADD key [NX | XX] score member [score member ...]`
- 功能：添加元素到有序集合，如果已存在则更新 `score`
- 可选项：
  - `XX`：仅更新已存在的元素。不添加新元素。
  - `NX`：只添加新元素。不更新现有元素。

```txt
redis> ZADD myzset 1 one 1 uno 2 two 3 three
(integer) 4
```

### 7.2 `ZREM`

- 语法：`ZREM key member [member ...]`
- 功能：删除有序集合中的指定元素

```txt
redis> ZADD myzset 1 one 1 uno 2 two 3 three
(integer) 4
redis> ZREM myzset two
(integer) 1
```

### 7.3 `ZSCORE`

- 语法：`ZSCORE key member`
- 功能：查询指定元素的 `score`

```txt
redis> ZADD myzset 1 one
(integer) 1
redis> ZSCORE myzset one
"1"
```

### 7.4 `ZRANK`

- 语法：`ZRANK key member`
- 功能：获取指定元素在有序集合中的排名

```txt
127.0.0.1:6379> ZADD z 1 one 2 two 3 three
(integer) 3
127.0.0.1:6379> ZRANK z three
(integer) 2
127.0.0.1:6379> ZRANK z four
(nil)
```

### 7.5 `ZCARD`

- 语法：`ZCARD key`
- 功能：获取有序集合中的元素数量

```txt
127.0.0.1:6379> ZADD z 1 one 2 two 3 three
(integer) 3
127.0.0.1:6379> ZCARD z
(integer) 3
```

### 7.6 `ZCOUNT`

- 语法：`ZCOUNT key min max`
- 功能：获取有序集合中的 `score` 在 `[min, max]` 内的元素数量

```txt
127.0.0.1:6379> ZADD z 1 one 2 two 3 three
(integer) 3
127.0.0.1:6379> ZCOUNT z -inf +inf
(integer) 3
127.0.0.1:6379> ZCOUNT z 2 3
(integer) 2
```

### 7.7 `ZINCRBY`

- 语法：`ZINCRBY key increment member`
- 功能：让有序集合中指定元素的 `score` 自增，步长为 `increment`

```txt
redis> ZADD myzset 1 "one" 2 "two"
(integer) 2
redis> ZINCRBY myzset 2 "one"
"3"
```

### 7.8 `ZRANGE`

- 语法：`ZRANGE key start stop [BYSCORE | BYLEX] [REV] [WITHSCORES]`
- 功能：按照 `score` 升序排序后，获取指定排名范围内的元素，排名从 0 开始
- 参数：
  - `REV`：是否降序顺序
  - `WITHSCORES`：是否返回 `score`

```txt
127.0.0.1:6379> ZADD z 1 one 2 two 3 three
(integer) 3
127.0.0.1:6379> ZRANGE z 1 99
1) "two"
2) "three"
127.0.0.1:6379> ZRANGE z 0 1 WITHSCORES
1) "one"
2) "1"
3) "two"
4) "2"
```

### 7.9 `ZRANGEBYSCORE`

> 弃用，推荐 `ZRANGE`

- 语法：`ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]`
- 功能：按照 `score` 排序后，获取指定 `score` 范围内的元素

### 7.10 `ZDIFF`

- 语法：`ZDIFF numkeys key [key ...] [WITHSCORES]`
- 功能：求差集（difference set）

```txt
redis> ZADD zset1 1 "one" 2 "two" 3 "three"
(integer) 3
redis> ZADD zset2 1 "one" 2 "two"
(integer) 2
redis> ZDIFF 2 zset1 zset2
1) "three"
redis> ZDIFF 2 zset1 zset2 WITHSCORES
1) "three"
2) "3"
```

### 7.11 `ZDIFF`

- 语法：`ZDIFF numkeys key [key ...] [WITHSCORES]`
- 功能：求差集（difference set）

```txt
redis> ZADD zset1 1 "one" 2 "two" 3 "three"
(integer) 3
redis> ZADD zset2 1 "one" 2 "two"
(integer) 2
redis> ZDIFF 2 zset1 zset2
1) "three"
redis> ZDIFF 2 zset1 zset2 WITHSCORES
1) "three"
2) "3"
```

### 7.12 `ZINTER`

- 语法：`ZINTER numkeys key [key ...] [WITHSCORES]`
- 功能：求交集（intersection）

```txt
redis> ZADD zset1 1 "one" 2 "two"
(integer) 2
redis> ZADD zset2 1 "one" 2 "two" 3 "three"
(integer) 3
redis> ZINTER 2 zset1 zset2
1) "one"
2) "two"
redis> ZINTER 2 zset1 zset2 WITHSCORES
1) "one"
2) "2"
3) "two"
4) "4"
```

### 7.13 `ZUNION`

- 语法：`ZUNION numkeys key [key ...] [WITHSCORES]`
- 功能：求并集（union）

```txt
redis> ZADD zset1 1 "one" 2 "two"
(integer) 2
redis> ZADD zset2 1 "one" 2 "two" 3 "three"
(integer) 3
redis> ZUNION 2 zset1 zset2
1) "one"
2) "three"
3) "two"
redis> ZUNION 2 zset1 zset2 WITHSCORES
1) "one"
2) "2"
3) "three"
4) "3"
5) "two"
6) "4"
```
