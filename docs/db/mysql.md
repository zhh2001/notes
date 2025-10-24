---
outline: [2, 3]
---

# MySQL

<<< @/db/codes/mysql/conn.sh

## 1 SQL

| 分类 | 全称                       | 说明                                                   |
| ---- | -------------------------- | ------------------------------------------------------ |
| DDL  | Data Definition Language   | 数据定义语言，用来定义数据库对象（数据库、表、字段）   |
| DML  | Data Manipulation Language | 数据操作语言，用来对数据库表中的数据进行增删改         |
| DQL  | Data Query Language        | 数据查询语言，用来查询数据库中表的记录                 |
| DCL  | Data Control Language      | 数据控制语言，用来创建数据库用户、控制数据库的访问权限 |

### 1.1 DDL

#### 1.1.1 数据库操作

- 查询

<<< @/db/codes/mysql/ddl_query.sql

- 创建

<<< @/db/codes/mysql/ddl_create.sql

- 删除

<<< @/db/codes/mysql/ddl_drop.sql

- 使用

<<< @/db/codes/mysql/ddl_use.sql

#### 1.1.2 表操作

- 查询当前数据库所有表

<<< @/db/codes/mysql/ddl_show_tbl.sql

- 查询表结构

<<< @/db/codes/mysql/ddl_desc_tbl.sql

- 查询指定表的建表语句

<<< @/db/codes/mysql/ddl_show_create_tbl.sql

- 创建

<<< @/db/codes/mysql/ddl_create_tbl.sql

- 添加字段

<<< @/db/codes/mysql/ddl_add_field.sql

- 修改数据类型

<<< @/db/codes/mysql/ddl_modify_field.sql

- 修改字段名和字段类型

<<< @/db/codes/mysql/ddl_change_field.sql

- 删除字段

<<< @/db/codes/mysql/ddl_drop_field.sql

- 修改表名

<<< @/db/codes/mysql/ddl_rename_tbl.sql

- 删除表

<<< @/db/codes/mysql/ddl_drop_tbl.sql

- 删除指定表，并重新创建该表

<<< @/db/codes/mysql/ddl_truncate_tbl.sql

#### 1.1.3 数据类型

数值类型：

| 类型               | 大小    |
| ------------------ | ------- |
| `TINYINT`          | 1 byte  |
| `SMALLINT`         | 2 bytes |
| `MEDIUMINT`        | 3 bytes |
| `INT` 或 `INTEGER` | 4 byte  |
| `BIGINT`           | 8 byte  |
| `FLOAT`            | 4 byte  |
| `DOUBLE`           | 8 byte  |
| `DECIMAL`          |         |

字符串类型：`CHAR`、`VARCHAR`、`TINYBLOB`、`TINYTEXT`、`BLOB`、`TEXT`、`MEDIUMBLOB`、`MEDIUMTEXT`、`LONGBLOB`、`LONGTEXT`

日期类型：

| 类型        | 大小    | 格式                  |
| ----------- | ------- | --------------------- |
| `DATE`      | 3 bytes | `YYYY-MM-DD`          |
| `TIME`      | 3 bytes | `HH:MM:SS`            |
| `YEAR`      | 1 byte  | `YYYY`                |
| `DATETIME`  | 8 bytes | `YYYY-MM-DD HH:MM:SS` |
| `TIMESTAMP` | 4 bytes | `YYYY-MM-DD HH:MM:SS` |

### 1.2 DML

- 给指定字段添加数据

<<< @/db/codes/mysql/dml_insert.sql

- 给全部字段添加数据

<<< @/db/codes/mysql/dml_insert_all.sql

- 批量添加数据

<<< @/db/codes/mysql/dml_insert_batch.sql

- 修改数据

<<< @/db/codes/mysql/dml_update.sql

- 删除数据

<<< @/db/codes/mysql/dml_delete.sql

### 1.3 DQL

#### 1.3.1 基础查询

- 查询多个字段

<<< @/db/codes/mysql/dql_base.sql

- 设置别名

<<< @/db/codes/mysql/dql_as.sql

- 去重

<<< @/db/codes/mysql/dql_distinct.sql

#### 1.3.2 条件查询

| 比较运算符            | 功能                                             |
| --------------------- | ------------------------------------------------ |
| `>`                   | 大于                                             |
| `>=`                  | 大于等于                                         |
| `<`                   | 小于                                             |
| `<=`                  | 小于等于                                         |
| `=`                   | 等于                                             |
| `<>` 或 `!=`          | 不等于                                           |
| `BETWEEN ... AND ...` | 在某个范围内（含最大、最小值）                   |
| `IN (...)`            | 在 `IN` 之后的列表中的值                         |
| `LIKE 占位符`         | 模糊匹配（`_` 匹配单个字符，`%` 匹配任意个字符） |
| `IS NULL`             | 是 `NULL`                                        |

| 逻辑运算符     | 功能                     |
| -------------- | ------------------------ |
| `AND` 或 `&&`  | 并且（多个条件同时成立） |
| `OR` 或 `\|\|` | 或者（任一条件成立）     |
| `NOT` 或 `!`   | 非，不是                 |

<<< @/db/codes/mysql/dql_where.sql

#### 1.3.3 聚合函数

将一列数据作为一个整体，进行纵向计算。

| 常见函数 | 功能     |
| -------- | -------- |
| `COUNT`  | 统计数量 |
| `MAX`    | 最大值   |
| `MIN`    | 最小值   |
| `AVG`    | 平均值   |
| `SUM`    | 求和     |

<<< @/db/codes/mysql/dql_agg.sql

`NULL` 值不参与聚合运算。

#### 1.3.4 分组查询

<<< @/db/codes/mysql/dql_group.sql

#### 1.3.5 排序查询

<<< @/db/codes/mysql/dql_order.sql

#### 1.3.6 分页查询

<<< @/db/codes/mysql/dql_limit.sql

### 1.4 DCL

#### 1.4.1 用户管理

- 查询用户

<<< @/db/codes/mysql/dcl_select_user.sql

- 创建用户

<<< @/db/codes/mysql/dcl_create_user.sql

- 修改用户密码

<<< @/db/codes/mysql/dcl_change_pwd.sql

- 删除用户

<<< @/db/codes/mysql/dcl_drop_user.sql

#### 1.4.2 权限控制

| 常用权限                | 说明               |
| ----------------------- | ------------------ |
| `ALL`，`ALL PRIVILEGES` | 所有权限           |
| `SELECT`                | 查询数据           |
| `INSERT`                | 插入数据           |
| `UPDATE`                | 修改数据           |
| `DELETE`                | 删除数据           |
| `ALTER`                 | 修改表             |
| `DROP`                  | 删除数据库/表/视图 |
| `CREATE`                | 创建数据库/表      |

- 查询权限

<<< @/db/codes/mysql/dcl_show_grants.sql

- 授予权限

<<< @/db/codes/mysql/dcl_grant.sql

- 撤销权限

<<< @/db/codes/mysql/dcl_revoke.sql

## 2 函数

### 2.1 字符串函数

| 常用函数                     | 说明                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `CONCAT(S1, S2, ..., Sn)`    | 字符串拼接                                                    |
| `LOWER(str)`                 | 将字符串全部转为小写                                          |
| `UPPER(str)`                 | 将字符串全部转为大写                                          |
| `LPAD(str, n, pad)`          | 左填充，用 `pad` 对 `str` 左边进行填充，达到 `n` 个字符串长度 |
| `RPAD(str, n, pad)`          | 右填充，用 `pad` 对 `str` 右边进行填充，达到 `n` 个字符串长度 |
| `TRIM(str)`                  | 去掉字符串头部和尾部的空格                                    |
| `SUBSTRING(str, start, len)` | 返回字符串 `str` 从 `start` 位置起的 `len` 个长度的子字符串   |

<<< @/db/codes/mysql/func_string.sql

### 2.2 数值函数

| 常用函数      | 说明                                   |
| ------------- | -------------------------------------- |
| `CEIL(x)`     | 向上取整                               |
| `FLOOR(x)`    | 向下取整                               |
| `MOD(x, y)`   | 返回 `x % y`                           |
| `RAND()`      | 返回 `0~1` 的随机数                    |
| `ROUND(x, y)` | 返回 `x` 的四舍五入值，保留 `y` 位小数 |

<<< @/db/codes/mysql/func_math.sql

### 2.3 日期函数

| 常用函数                             | 说明 |
| ------------------------------------ | ---- |
| `CURDATE()`                          |      |
| `CURTIME()`                          |      |
| `NOW()`                              |      |
| `YEAR(date)`                         |      |
| `MONTH(date)`                        |      |
| `DAY(date)`                          |      |
| `DATE_ADD(date, INTERVAL expr type)` |      |
| `DATEDIFF(date1, date2)`             |      |

<<< @/db/codes/mysql/func_date.sql

### 2.4 流程函数

| 常用函数                                                     | 说明                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `IF(value, t, f)`                                            | 如果 `value` 为 `true`，则返回 `t`，否则返回 `f`                       |
| `IFNULL(value1, value2)`                                     | 如果 `value1` 不为 `NULL`，返回 `value1`，否则返回 `value2`            |
| `CASE WHEN [val1] THEN [res1] ... ELSE [default] END`        | 如果 `val1` 为 `true`，返回 `res1`，...，否则返回 `default` 默认值     |
| `CASE [expr] WHEN [val1] THEN [res1] ... ELSE [default] END` | 如果 `expr` 的值为 `val1`，返回 `res1`，...，否则返回 `default` 默认值 |

<<< @/db/codes/mysql/func_flow.sql

## 3 约束

约束是作用于表中字段上的规则，用于限制存储在表中的数据。

| 约束     | 关键字        | 描述                                                     |
| -------- | ------------- | -------------------------------------------------------- |
| 非空约束 | `NOT NULL`    | 限制该字段数据不能为 `NULL`                              |
| 唯一约束 | `UNIQUE`      | 保证该字段数据唯一、不重复                               |
| 主键约束 | `PRIMARY KEY` | 主键是一行数据的唯一标识，要求非空且唯一                 |
| 默认约束 | `DEFAULT`     | 保存数据时，如果未指定该字段的值，则采用默认值           |
| 检查约束 | `CHECK`       | 保证字段值满足一个条件                                   |
| 外键约束 | `FOREIGN KEY` | 用来让两张表的数据之间建立连接，保证数据的一致性和完整性 |

<<< @/db/codes/mysql/constraint.sql

外键用来让两张表的数据之间建立连接，从而保证数据的的一致性和完整性。

- 添加外键

方式一：

<<< @/db/codes/mysql/foreign_key_1.sql

方式二：

<<< @/db/codes/mysql/foreign_key_2.sql

外键的删除/更新行为：

| 行为          | 说明                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NO ACTION`   | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。（与 `RESTRICT` 一致）               |
| `RESTRICT`    | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。（与 `NO ACTION` 一致）              |
| `CASCADE`     | 当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则也删除/更新外键在子表中的记录。                       |
| `SET NULL`    | 当在父表中删除对应记录时，首先检查该记录是否有对应外键，如果有则设置子表中该外键值为 `NULL`。（这个字段需要允许为 `NULL`） |
| `SET DEFAULT` | 父表有变更时，子表将外键列设置成一个默认的值。（Innodb 不支持）                                                            |

<<< @/db/codes/mysql/foreign_key_action.sql

## 4 多表查询

### 4.1 内连接

- 隐式内连接

<<< @/db/codes/mysql/join_inner_where.sql

- 显示内连接

<<< @/db/codes/mysql/join_inner_on.sql

### 4.2 外连接

- 左外连接

<<< @/db/codes/mysql/join_left.sql

- 右外连接

<<< @/db/codes/mysql/join_right.sql

### 4.3 自连接

自连接查询可以是内连接，也可以是外连接。

<<< @/db/codes/mysql/join_self.sql

### 4.4 联合查询

关键字：

- `UNION ALL`：直接合并
- `UNION`：去重合并

<<< @/db/codes/mysql/join_union.sql

### 4.5 子查询

SQL 语句中嵌套 `SELECT` 语句，成为嵌套查询，又称子查询。

#### 4.5.1 标量子查询

子查询返回的结果是单个值（数字、字符串、日期等），这种子查询成为标量子查询。

<<< @/db/codes/mysql/subquery_scalar.sql

#### 4.5.2 列子查询

子查询返回的结果是一列，这种子查询成为列子查询。

<<< @/db/codes/mysql/subquery_column.sql

#### 4.5.3 行子查询

子查询返回的结果是一行，这种子查询成为行子查询。

<<< @/db/codes/mysql/subquery_row.sql

#### 4.5.4 表子查询

子查询返回的结果是多行多列，这种子查询成为表子查询。

<<< @/db/codes/mysql/subquery_table.sql

## 5 事务

事务是一组操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向操作系统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。

默认 MySQL 的事务是自动提交的，当执行一条 DML 语句，MySQL 会立即隐式地提交事务。

- 查看/设置事务的提交方式

<<< @/db/codes/mysql/transaction_auto_commit.sql

- 提交事务

<<< @/db/codes/mysql/transaction_commit.sql

- 回滚事务

<<< @/db/codes/mysql/transaction_rollback.sql

### 5.1 事务操作

- 开启事务

<<< @/db/codes/mysql/transaction_start.sql

或：

<<< @/db/codes/mysql/transaction_begin.sql

- 提交事务

<<< @/db/codes/mysql/transaction_commit.sql

- 回滚事务

<<< @/db/codes/mysql/transaction_rollback.sql

### 5.2 四大特性 ACID

- 原子性（<span style="color:red;">A</span>tomicity）：事务是不可分割的最小操作单元，要么全部成功，要么全部失败。
- 一致性（<span style="color:red;">C</span>onsistency）：事务完成时，必须使所有的数据都保持一致状态。
- 隔离性（<span style="color:red;">I</span>solation）：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下进行。
- 持久性（<span style="color:red;">D</span>urability）：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

### 5.3 并发事务问题

| 问题       | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| 脏读       | 一个事务读取了另一个事务尚未提交的修改数据                   |
| 不可重复读 | 同一事务内，多次读取同一数据，但结果不一致                   |
| 幻读       | 同一事务内，多次执行相同的查询条件，但返回的结果集行数不一致 |

### 5.4 事务隔离级别

| 隔离级别                | 脏读 | 不可重复读 | 幻读 |
| ----------------------- | :--: | :--------: | :--: |
| Read uncommitted        |  √   |     √      |  √   |
| Read committed          |  ×   |     √      |  √   |
| Repeatable Read（默认） |  ×   |     ×      |  √   |
| Serializable            |  ×   |     ×      |  ×   |

- 查看事务隔离级别

<<< @/db/codes/mysql/transaction_isolation_select.sql

- 设置事务隔离级别

<<< @/db/codes/mysql/transaction_isolation_set.sql

`SESSION` 表示当前会话，`GLOBAL` 表示全局。

## 6 存储引擎

- 查询当前数据库支持的存储引擎

<<< @/db/codes/mysql/engine_show.sql

|       Engine       | Support | Comment                                                        | Transactions |  XA  | Savepoints |
| :----------------: | :-----: | -------------------------------------------------------------- | :----------: | :--: | :--------: |
|      ARCHIVE       |   YES   | Archive storage engine                                         |      NO      |  NO  |     NO     |
|     BLACKHOLE      |   YES   | /dev/null storage engine (anything you write to it disappears) |      NO      |  NO  |     NO     |
|     MRG_MYISAM     |   YES   | Collection of identical MyISAM tables                          |      NO      |  NO  |     NO     |
|     FEDERATED      |   NO    | Federated MySQL storage engine                                 |     NULL     | NULL |    NULL    |
|       MyISAM       |   YES   | MyISAM storage engine                                          |      NO      |  NO  |     NO     |
| PERFORMANCE_SCHEMA |   YES   | Performance Schema                                             |      NO      |  NO  |     NO     |
|       InnoDB       | DEFAULT | Supports transactions, row-level locking, and foreign keys     |     YES      | YES  |    YES     |
|       MEMORY       |   YES   | Hash based, stored in memory, useful for temporary tables      |      NO      |  NO  |     NO     |
|        CSV         |   YES   | CSV storage engine                                             |      NO      |  NO  |     NO     |

- 在创建表时指定存储引擎

<<< @/db/codes/mysql/engine_create_table.sql

### 6.1 InnoDB

InnoDB 是一种兼顾高可靠性和高性能的通用存储引擎，在 MySQL 5.5 之后，InnoDB 是 MySQL 默认的存储引擎。

特点：

- DML 操作遵循 ACID 模型，支持事务
- 行级锁，提高并发访问性能
- 支持外键 `FOREIGN KEY` 约束，保证数据的完整性和一致性

文件：每个 InnoDB 引擎的表都会对应一个表空间文件 `tb_name.ibd`，存储该表的表结构（frm、sdi）、数据和索引。

`.ibd` 文件存在的前提是启用了独立表空间（默认启用），可通过以下命令确认：

<<< @/db/codes/mysql/engine_var_idb.sql

Ubuntu 的 `.ibd` 文件默认放在 `/var/lib/mysql/数据库名` 路径下。

例如，我的 `test` 数据库下有两张使用 InnoDB 引擎的表 `tb_user`、`tb_account`。

那么在 `/var/lib/mysql/test` 路径下，就会存在 `tb_user.ibd`、`tb_account.ibd` 两个文件。

`.ibd` 文件是二进制文件，无法直接打开，需要使用命令 `ibd2sdi 表名.ibd` 才能查看。

逻辑存储结构：

1. Tablespace：表空间，一个表空间包含多个段
2. Segment：段，一个段包含多个区
3. Extend：区，一个区大小为 1 M，包含多个页（64 个页）
4. Page：页，一个页大小为 16 K，包含多个行
5. Row：行

### 6.2 MyISAM

MyISAM 是 MySQL 早期的默认存储引擎。

特点：

- 不支持事务，不支持外键
- 支持表锁，不支持行锁
- 访问速度快

文件：

- `tb_name.sdi`：存储表结构信息
- `tb_name.MYD`：存储数据
- `tb_name.MYI`：存储索引

### 6.3 MEMORY

Memory 引擎的表数据存储在内存中，由于收到硬件问题或断电问题的影响，只能将这些表作为临时表或缓存使用。

特点：

- 内存存放
- Hash 索引（默认）

文件：`tb_name.sdi` 存储表结构信息。

### 6.4 对比

|   特点    | InnoDB | MyISAM | MEMORY |
| :-------: | :----: | :----: | :----: |
|   事务    |  支持  |   -    |   -    |
|   外键    |  支持  |   -    |   -    |
|  锁机制   |  行锁  |  表锁  |  表锁  |
| B+ 树索引 |  支持  |  支持  |  支持  |
| Hash 索引 |   -    |   -    |  支持  |

## 7 索引

### 7.1 结构

MySQL 采用 B+ 树作为索引。

| 特性             | B 树                                | B+ 树                                         |
| ---------------- | ----------------------------------- | --------------------------------------------- |
| **存储内容**     | 非叶子节点和叶子节点均存储键+值     | 仅叶子节点存储键+值，非叶子节点仅存键（索引） |
| **叶子节点**     | 孤立存在，无链接                    | 所有叶子节点通过双向链表连接                  |
| **查询效率**     | 随机查询可能更快（找到键即可返回）  | 随机查询略慢（必须遍历到叶子节点）            |
| **范围查询**     | 需回溯父节点，效率低                | 利用叶子节点链表，一次遍历完成，效率高        |
| **节点存储密度** | 低（键+值占用空间大，单节点键数少） | 高（非叶子节点仅存键，单节点键数更多）        |
| **IO 次数**      | 较多（层级可能更深）                | 较少（层级更浅，因单节点键数多）              |
| **数据冗余**     | 无冗余（键仅出现一次）              | 有冗余（非叶子节点的键是叶子节点的副本）      |

### 7.2 分类

| 分类         | 含义                                                 | 特点                     | 关键字     |
| ------------ | ---------------------------------------------------- | ------------------------ | ---------- |
| **主键索引** | 针对于表中主键创建的索引                             | 默认自动创建, 只能有一个 | `PRIMARY`  |
| **唯一索引** | 避免同一个表中某数据列中的值重复                     | 可以有多个               | `UNIQUE`   |
| **常规索引** | 快速定位特定数据                                     | 可以有多个               |            |
| **全文索引** | 全文索引查找的是文本中的关键词，而不是比较索引中的值 | 可以有多个               | `FULLTEXT` |

在 InnoDB 存储引擎中，根据索引的存储形式，又可以分为以下两种：

| 分类                            | 含义                                                       | 特点                 |
| ------------------------------- | ---------------------------------------------------------- | -------------------- |
| **聚簇索引（Clustered Index）** | 将数据存储和索引放到了一块，索引结构的叶子节点保存了行数据 | 必须要，而且只有一个 |
| **二级索引（Secondary Index）** | 将数据与所有分开存储，索引结构的叶子节点关联的是对应的主键 | 可以存在多个         |

聚簇索引选取规则：
- 如果存在主键，主键索引就是聚簇索引
- 如果不存在主键，将使用第一个唯一索引作为聚簇索引
- 如果表没有主键和唯一索引，则 InnoDB 会自动生成一个 `rowid` 作为隐藏的聚簇索引
