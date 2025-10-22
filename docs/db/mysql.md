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
