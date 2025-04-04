---
outline: deep
---

# P4 练习

在 [P4 安装](/sdn/p4#_1-安装) 完成后，P4 官方准备了 12 个练习，位于 `./tutorials/exercises` 目录下。

## 1 练习一：基础转发

练习所在路径：`./tutorials/exercises/basic`

在这个练习中，将使用 P4 实现基本的 IPv4 数据包转发。通过完善提供的 <a href="/sdn/codes/basic_p4.html" target="_blank">`basic.p4`</a> 文件，我们将实现以下逻辑：

1. 更新源和目的 MAC 地址
2. 递减 IP 报头中的 TTL 值
3. 根据预定义规则转发数据包

最终在 Mininet 上使用胖树拓扑完成测试。

::: tip TTL
TTL（Time to Live）是IP数据包头中的一个字段，用于限制数据包在网络中的存活时间。每当数据包经过一个路由器时，TTL值会递减1。当TTL值减为0时，数据包会被丢弃，防止其在网络中无限循环。TTL的主要作用是提高网络的可靠性和效率。
:::

### 1.1 介绍

已经写好的交换机将有个单一的表，控制平面将用静态规则填充该表。每条规则将 IP 地址映射到下一跳的 MAC 地址和输出端口。练习中已经定义了控制平面的规则，因此我们只需实现 P4 程序的数据平面逻辑。

使用的拓扑结构如下：

![胖树拓扑](/p4/pod-topo.png)

该程序基于 V1Model 架构，其<a href="/sdn/codes/v1model_p4.html" target="_blank">源码</a>位于 `/usr/local/share/p4c/p4include/v1model.p4`。在 `basic.p4` 中通过 `#include <v1model.p4>` 进行引用。


### 1.2 步骤一：运行初始代码

该程序最初会丢弃所有数据包。我们先编译初始的 `basic.p4` 并在 Mininet 中启动一个交换机以测试其行为。

1. 在命令行执行：

```shell
make run
```

这将会：

- 编译 `basic.p4`，
- 在 Mininet 中创建胖树拓扑并使用 P4 程序和表项配置所有交换机，
- 使用 `pod-topo/topology.json` 中列出的命令配置所有主机。

2. 现在，我们能看到 Mininet 命令提示符。尝试在拓扑中的主机间进行 `ping` 操作：

```shell
mininet> h1 ping h2
mininet> pingall
```

3. 输入 `exit` 退出 Mininet 命令行。然后停止 Mininet：

```shell
make stop
```

4. 删除所有的 pcap、构建文件和日志：

```shell
make clean
```

`ping` 不通是因为我们还没有完成转发功能，所有数据包都被丢弃了。

::: details pcap
pcap（Packet Capture）是一种文件格式，用于存储网络数据包捕获的信息。通过使用pcap工具，网络分析人员可以记录和分析网络流量，查看数据包的内容和传输情况。
:::

### 1.3 步骤二：实现 L3 转发

在 `basic.p4` 文件的 `TODO` 注释处实现缺失的逻辑。

完整的 `basic.p4` 包含下面几个部分：

1. 以太网（ethernet_t）和 IPv4（ipv4_t）的报头类型定义。
2. **TODO**：以太网和 IPv4 的解析器。需要解析数据包的 `ethernet_t` 和 `ipv4_t` 字段。
3. 丢包动作 `mark_to_drop`。
4. **TODO**：转发动作 `ipv4_forward`：  
    （1）设置下一跳的输出端口。  
    （2）使用下一跳的地址更新以太网目的地址。  
    （3）使用交换机的地址更新以太网源地址。
    （4）递减 TTL 值。
5. **TODO**：控制部分：  
    （1）一个表，用于读取 IPv4 目的地址并调用动作 `drop` 或者 `ipv4_forward`。  
    （2）一个 `apply` 块，应用该表。
6. **TODO**：一个反解析器，用于选择字段插入到传出数据包中。
7. 一个包 `package` 的实例化。
> 一般来说，包还需要一个控件用于校验、验证和重新计算。但是这些对于该练习来说不是必需的，取而代之的是空控件的实例化。

::: tip L3
L3 是 Layer 3 的简称，属于 OSI 模型中的一个层级，为网络层。网络层的主要功能是实现不同网络之间的数据包转发和路由。它使用 IP 地址来识别设备的位置，并负责数据包的寻址、路由选择和传输，确保数据能够从源设备正确送达目标设备。常见的 L3 协议包括 IPv4 和 IPv6。
:::

### 1.4 步骤三：分析代码

分析一下初始的 `basic.p4` 代码。

#### 1.4.1 文件头部

```p4
#include <core.p4>
#include <v1model.p4>

const bit<16> TYPE_IPV4 = 0x800;
```

首先引入了 P4 核心库和 V1 模型，随后定义了一个值为 `0x800` 常量 `TYPE_IPV4` 用于指示 IPv4 协议的数据包类型。

::: tip 数据包类型标识
以太网帧中的一个字段，占用16位，通常用于标识以太网帧所承载的数据包类型。例如：
1. IPv4：`0x0800`
2. IPv6：`0x86DD`
3. ARP：`0x0806`
:::

#### 1.4.2 报头部分

```p4
typedef bit<9>  egressSpec_t;
typedef bit<48> macAddr_t;
typedef bit<32> ip4Addr_t;

header ethernet_t {
    macAddr_t dstAddr;
    macAddr_t srcAddr;
    bit<16>   etherType;
}

header ipv4_t {
    bit<4>    version;
    bit<4>    ihl;
    bit<8>    diffserv;
    bit<16>   totalLen;
    bit<16>   identification;
    bit<3>    flags;
    bit<13>   fragOffset;
    bit<8>    ttl;
    bit<8>    protocol;
    bit<16>   hdrChecksum;
    ip4Addr_t srcAddr;
    ip4Addr_t dstAddr;
}

struct metadata {
    /* empty */
}

struct headers {
    ethernet_t   ethernet;
    ipv4_t       ipv4;
}
```

定义了以下结构：

1. 类型别名：
    - `egressSpec_t`：指定的输出端口
    - `macAddr_t`：MAC 地址
    - `ip4Addr_t`：IPv4 地址
2. 报头：
    - `ethernet_t`：包含目的 MAC 地址、源 MAC 地址和数据包类型字段
    - `ipv4_t`：包含 IPv4 协议的各种字段，如版本、报头长度、总长度等
3. 结构体：
    - `metadata`：元数据结构体
    - `headers`：报头结构体，包含上述的以太网报头和 IPv4 报头。

#### 1.4.3 解析器部分

```p4{7}
parser MyParser(packet_in packet,
                out headers hdr,
                inout metadata meta,
                inout standard_metadata_t standard_metadata) {

    state start {
        /* TODO: add parser logic */
        transition accept;
    }
}
```

此处包含需要完善的逻辑，需要从数据包中提取出以太网报头和 IPv4 报头。使用以下代码替换 `TODO` 部分：

```p4
state start {
    packet.extract(hdr.ethernet);
    packet.extract(hdr.ipv4);
    transition accept;
}
```

#### 1.4.4 验证校验和部分

```p4
control MyVerifyChecksum(inout headers hdr, inout metadata meta) {
    apply {  }
}
```

用于计算校验和，以确保数据包在传输过程中未被损坏。

#### 1.4.5 Ingress部分

```p4{19,20,38,39,40}
control MyIngress(inout headers hdr,
                  inout metadata meta,
                  inout standard_metadata_t standard_metadata) {
    action drop() {
        mark_to_drop(standard_metadata);
    }

    action ipv4_forward(macAddr_t dstAddr, egressSpec_t port) {
        /*
            Action function for forwarding IPv4 packets.

            This function is responsible for forwarding IPv4 packets to the specified
            destination MAC address and egress port.

            Parameters:
            - dstAddr: Destination MAC address of the packet.
            - port: Egress port where the packet should be forwarded.

            TODO: Implement the logic for forwarding the IPv4 packet based on the
            destination MAC address and egress port.
        */
    }

    table ipv4_lpm {
        key = {
            hdr.ipv4.dstAddr: lpm;
        }
        actions = {
            ipv4_forward;
            drop;
            NoAction;
        }
        size = 1024;
        default_action = NoAction();
    }

    apply {
        /* TODO: fix ingress control logic
         *  - ipv4_lpm should be applied only when IPv4 header is valid
         */
        ipv4_lpm.apply();
    }
}
```

此处包含两个 `TODO` 待完成。先看看代码：

1. 动作（actions）：
    - `drop`：通过调用 `mark_to_drop(standard_metadata)` 丢包
    - `ipv4_forward`：转发 IPv4 数据包到指定的目标 MAC 地址和端口
2. 表（table）：包含动作 `drop`、`ipv4_forward`、`NoAction`，键为 `hdr.ipv4.dstAddr` 字段，其采用最长前缀匹配（lpm），表项最大数量为 1024，默认动作为 `NoAction()`。

完成第一个 `TODO` 部分：

```p4{2-5}
action ipv4_forward(macAddr_t dstAddr, egressSpec_t port) {
    standard_metadata.egress_spec = port;
    hdr.ethernet.srcAddr = hdr.ethernet.dstAddr;
    hdr.ethernet.dstAddr = dstAddr;
    hdr.ipv4.ttl = hdr.ipv4.ttl - 1;
}
```

完成第二个 `TODO` 部分：

```p4
apply {
    if (hdr.ipv4.isValid()) {
        ipv4_lpm.apply();
    }
}
```

#### 1.4.6 Egress部分

```p4
control MyEgress(inout headers hdr,
                 inout metadata meta,
                 inout standard_metadata_t standard_metadata) {
    apply {  }
}
```

Egress 的作用是执行在数据包即将离开设备时的处理逻辑。

#### 1.4.7 计算校验和部分

```p4
control MyComputeChecksum(inout headers hdr, inout metadata meta) {
     apply {
        update_checksum(
            hdr.ipv4.isValid(),
            { hdr.ipv4.version,
              hdr.ipv4.ihl,
              hdr.ipv4.diffserv,
              hdr.ipv4.totalLen,
              hdr.ipv4.identification,
              hdr.ipv4.flags,
              hdr.ipv4.fragOffset,
              hdr.ipv4.ttl,
              hdr.ipv4.protocol,
              hdr.ipv4.srcAddr,
              hdr.ipv4.dstAddr },
            hdr.ipv4.hdrChecksum,
            HashAlgorithm.csum16);
    }
}
```

用于计算和更新IPv4头部的校验和。

#### 1.4.8 反解析器部分

```p4{13,14}
control MyDeparser(packet_out packet, in headers hdr) {
    apply {
        /*
        Control function for deparser.

        This function is responsible for constructing the output packet by appending
        headers to it based on the input headers.

        Parameters:
        - packet: Output packet to be constructed.
        - hdr: Input headers to be added to the output packet.

        TODO: Implement the logic for constructing the output packet by appending
        headers based on the input headers.
        */
    }
}
```

主要用于构建输出数据包。补全 `TODO` 部分，将以太网报头和 IPv4 报头添加到输出数据包：

```p4{3,4}
control MyDeparser(packet_out packet, in headers hdr) {
    apply {
        packet.emit(hdr.ethernet);
        packet.emit(hdr.ipv4);
    }
}
```

### 1.5 步骤四：验证代码

在步骤三中代码已经完成全部的 `TODO` 部分的代码编写。输入 `make run` 并在出现的 Mininet 命令提示符后输入 `pingall`，此时所有主机间都能成功 ping 通。

### 1.6 完整代码

完整代码如下：

```p4
#include <core.p4>
#include <v1model.p4>

const bit<16> TYPE_IPV4 = 0x800;

typedef bit<9>  egressSpec_t;
typedef bit<48> macAddr_t;
typedef bit<32> ip4Addr_t;

header ethernet_t {
    macAddr_t dstAddr;
    macAddr_t srcAddr;
    bit<16>   etherType;
}

header ipv4_t {
    bit<4>    version;
    bit<4>    ihl;
    bit<8>    diffserv;
    bit<16>   totalLen;
    bit<16>   identification;
    bit<3>    flags;
    bit<13>   fragOffset;
    bit<8>    ttl;
    bit<8>    protocol;
    bit<16>   hdrChecksum;
    ip4Addr_t srcAddr;
    ip4Addr_t dstAddr;
}

struct metadata {}
struct headers {
    ethernet_t   ethernet;
    ipv4_t       ipv4;
}

parser MyParser(packet_in packet,
                out headers hdr,
                inout metadata meta,
                inout standard_metadata_t standard_metadata) {

    state start {
        packet.extract(hdr.ethernet);
        packet.extract(hdr.ipv4);
        transition accept;
    }

}

control MyVerifyChecksum(inout headers hdr, inout metadata meta) {
    apply {}
}

control MyIngress(inout headers hdr,
                  inout metadata meta,
                  inout standard_metadata_t standard_metadata) {
    action drop() {
        mark_to_drop(standard_metadata);
    }

    action ipv4_forward(macAddr_t dstAddr, egressSpec_t port) {
        standard_metadata.egress_spec = port;
        hdr.ethernet.srcAddr = hdr.ethernet.dstAddr;
        hdr.ethernet.dstAddr = dstAddr;
        hdr.ipv4.ttl = hdr.ipv4.ttl - 1;
    }

    table ipv4_lpm {
        key = {
            hdr.ipv4.dstAddr: lpm;
        }
        actions = {
            ipv4_forward;
            drop;
            NoAction;
        }
        size = 1024;
        default_action = NoAction();
    }

    apply {
        if (hdr.ipv4.isValid()) {
            ipv4_lpm.apply();
        }
    }
}

control MyEgress(inout headers hdr,
                 inout metadata meta,
                 inout standard_metadata_t standard_metadata) {
    apply {}
}

control MyComputeChecksum(inout headers hdr, inout metadata meta) {
     apply {
        update_checksum(
            hdr.ipv4.isValid(),
            {
                hdr.ipv4.version,
                hdr.ipv4.ihl,
                hdr.ipv4.diffserv,
                hdr.ipv4.totalLen,
                hdr.ipv4.identification,
                hdr.ipv4.flags,
                hdr.ipv4.fragOffset,
                hdr.ipv4.ttl,
                hdr.ipv4.protocol,
                hdr.ipv4.srcAddr,
                hdr.ipv4.dstAddr
            },
            hdr.ipv4.hdrChecksum,
            HashAlgorithm.csum16
        );
    }
}

control MyDeparser(packet_out packet, in headers hdr) {
    apply {
        packet.emit(hdr.ethernet);
        packet.emit(hdr.ipv4);
    }
}

V1Switch(
    MyParser(),
    MyVerifyChecksum(),
    MyIngress(),
    MyEgress(),
    MyComputeChecksum(),
    MyDeparser()
) main;
```

## 2 练习二：基础隧道

练习所在路径：`./tutorials/exercises/basic_tunnel`

在这个练习中，通过添加基础的隧道支持来增强 IP 路由器，使其能够封装 IP 数据包以实现自定义转发。

### 2.1 介绍

我们需要定义一种新的报头类型，以便封装 IP 数据包，并修改交换机代码，使其根据新的隧道报头决定目的端口。

新的报头类型需要包含一个协议 ID，指示被封装数据包的类型，以及一个目的 ID 用于路由。

要修改的代码文件为 <a href="/sdn/codes/basic_tunnel_p4" target="_blank">`basic_tunnel.p4`</a>，其内容为练习一的 IP 路由器代码。

### 2.2 步骤一：实现隧道

`basic_tunnel.p4` 文件还包含一些带有 TODO 标记的注释，提示了需要实现的功能。交换机将能够根据自定义封装头的内容进行转发，并在数据包中不存在封装头时执行正常的 IP 转发。

任务内容如下：

1. 更新解析器，根据以太网报头中的 `etherType` 字段提取 `myTunnel` 报头或 `ipv4` 报头。与 `myTunnel` 报头对应的 `etherType` 为 `0x1212`。如果 `proto_id == TYPE_IPV4`，解析器还应在 `myTunnel` 报头后提取 `ipv4` 报头。

2. 定义一个名为 `myTunnel_forward` 的新动作，该动作简单地将输出端口设置为控制平面提供的端口号。

3. 定义一个名为 `myTunnel_exact` 的新表，该表对 `myTunnel` 报头的 `dst_id` 字段进行精确匹配。如果表中存在匹配，则调用 `myTunnel_forward` 动作，否则调用 `drop` 动作。

4. 更新 `MyIngress` 控制块，在 `myTunnel` 报头有效时应用 `myTunnel_exact` 表。否则，在 `ipv4` 头部有效时调用 `ipv4_lpm` 表。

5. 更新反解析器，按顺序添加以太网、`myTunnel` 和 `ipv4` 报头。

::: tip 提示
反解析器只会在报头有效时添加该报头。头部的隐式有效性位在提取时由解析器设置，因此在此处无需检查头部的有效性。
:::

6. 为新定义的表添加静态规则，以确保交换机能够根据 `dst_id` 正确转发。需要将转发规则添加到 `sX-runtime.json` 文件中，该文件包含拓扑的端口配置以及主机 ID 的分配方式。

![basic_tunnel-topo](/p4/basic_tunnel-topo.png)

### 2.3 步骤二：执行代码

1. 运行命令：

```shell
make run
```

这将会：

- 编译 `basic_tunnel.p4`
- 启动 Mininet，配置三个交换机 `s1`、`s2`、`s3` 组成三角形拓扑，并且分别连接主机 `h1`、`h2`、`h3`
- 三个主机的 IP 分别为 `10.0.1.1`、`10.0.2.2`、`10.0.3.3`

2. 此时会进入 Mininet 命令提示符。分别为 `h1`、`h2` 打开终端：

```shell
mininet> xterm h1 h2
```

3. 每个主机都包含一个基于 Python 的通讯客户端和服务器。在 `h2` 的 `xterm` 终端中，启动服务器：

```shell
./receive.py
```

4. 先不使用隧道进行测试，在 `h1` 的 `xterm` 终端中，向 `h2` 发送一条消息：

```shell
./send.py 10.0.2.2 "P4 is cool"
```

数据包在 `h2` 被接收到。数据包由以太网报头、IP 报头、TCP 报头和消息组成。

5. 现在测试隧道，在 `h1` 的 `xterm` 终端中，向 `h2` 发送一条消息：

```shell
./send.py 10.0.2.2 "P4 is cool" --dst_id 2
```

数据包在 `h2` 被接收到。数据包由以太网报头、隧道报头、IP 报头、TCP 报头和消息组成。

6. 在 `h1` 的 `xterm` 终端中，发送一条消息：

```shell
./send.py 10.0.3.3 "P4 is cool" --dst_id 2
```

虽然指定的 IP 地址是 `h3` 的地址，但是数据包会在 `h2` 被接收到。这是因为当数据包中包含 `MyTunnel` 报头时，交换机不再使用 IP 报头进行路由。

7. 输入 `exit` 或按 `Ctrl + D` 关闭每个 xterm 窗口并退出 Mininet 命令行。

> Python Scapy 本身并不支持我们自定义的 `myTunnel` 报头类型，P4 官方提供了一个名为 <a href="/sdn/codes/myTunnel_header_py" target="_blank">`myTunnel_header.py`</a> 的文件，让 Scapy 支持自定义头部。

### 2.4 完整代码

```p4
#include <core.p4>
#include <v1model.p4>

const bit<16> TYPE_MYTUNNEL = 0x1212;
const bit<16> TYPE_IPV4     = 0x0800;

typedef bit<9>  egressSpec_t;
typedef bit<48> macAddr_t;
typedef bit<32> ip4Addr_t;

header ethernet_t {
    macAddr_t dstAddr;
    macAddr_t srcAddr;
    bit<16>   etherType;
}

header myTunnel_t {
    bit<16> proto_id;
    bit<16> dst_id;
}

header ipv4_t {
    bit<4>    version;
    bit<4>    ihl;
    bit<8>    diffserv;
    bit<16>   totalLen;
    bit<16>   identification;
    bit<3>    flags;
    bit<13>   fragOffset;
    bit<8>    ttl;
    bit<8>    protocol;
    bit<16>   hdrChecksum;
    ip4Addr_t srcAddr;
    ip4Addr_t dstAddr;
}

struct metadata {}
struct headers {
    ethernet_t   ethernet;
    myTunnel_t   myTunnel;
    ipv4_t       ipv4;
}

parser MyParser(packet_in packet,
                out headers hdr,
                inout metadata meta,
                inout standard_metadata_t standard_metadata) {

    state start {
        transition parse_ethernet;
    }

    state parse_ethernet {
        packet.extract(hdr.ethernet);
        transition select(hdr.ethernet.etherType) {
            TYPE_MYTUNNEL: parse_myTunnel;
            TYPE_IPV4: parse_ipv4;
            default: accept;
        }
    }

    state parse_myTunnel {
        packet.extract(hdr.myTunnel);
        transition select(hdr.myTunnel.proto_id) {
            TYPE_IPV4: parse_ipv4;
            default: accept;
        }
    }

    state parse_ipv4 {
        packet.extract(hdr.ipv4);
        transition accept;
    }

}

control MyVerifyChecksum(inout headers hdr, inout metadata meta) {
    apply {}
}

control MyIngress(inout headers hdr,
                  inout metadata meta,
                  inout standard_metadata_t standard_metadata) {
    action drop() {
        mark_to_drop(standard_metadata);
    }

    action ipv4_forward(macAddr_t dstAddr, egressSpec_t port) {
        standard_metadata.egress_spec = port;
        hdr.ethernet.srcAddr = hdr.ethernet.dstAddr;
        hdr.ethernet.dstAddr = dstAddr;
        hdr.ipv4.ttl = hdr.ipv4.ttl - 1;
    }

    table ipv4_lpm {
        key = {
            hdr.ipv4.dstAddr: lpm;
        }
        actions = {
            ipv4_forward;
            drop;
            NoAction;
        }
        size = 1024;
        default_action = drop();
    }

    action myTunnel_forward(egressSpec_t port) {
        standard_metadata.egress_spec = port;
    }

    table myTunnel_exact {
        key = {
            hdr.myTunnel.dst_id: exact;
        }
        actions = {
            myTunnel_forward;
            drop;
        }
        size = 1024;
        default_action = drop();
    }

    apply {
        if (hdr.ipv4.isValid() && !hdr.myTunnel.isValid()) {
            ipv4_lpm.apply();
        }

        if (hdr.myTunnel.isValid()) {
            myTunnel_exact.apply();
        }
    }
}

control MyEgress(inout headers hdr,
                 inout metadata meta,
                 inout standard_metadata_t standard_metadata) {
    apply {}
}

control MyComputeChecksum(inout headers  hdr, inout metadata meta) {
     apply {
        update_checksum(
            hdr.ipv4.isValid(),
            {
                hdr.ipv4.version,
                hdr.ipv4.ihl,
                hdr.ipv4.diffserv,
                hdr.ipv4.totalLen,
                hdr.ipv4.identification,
                hdr.ipv4.flags,
                hdr.ipv4.fragOffset,
                hdr.ipv4.ttl,
                hdr.ipv4.protocol,
                hdr.ipv4.srcAddr,
                hdr.ipv4.dstAddr
            },
            hdr.ipv4.hdrChecksum,
            HashAlgorithm.csum16
        );
    }
}

control MyDeparser(packet_out packet, in headers hdr) {
    apply {
        packet.emit(hdr.ethernet);
        packet.emit(hdr.myTunnel);
        packet.emit(hdr.ipv4);
    }
}

V1Switch(
    MyParser(),
    MyVerifyChecksum(),
    MyIngress(),
    MyEgress(),
    MyComputeChecksum(),
    MyDeparser()
) main;
```

## 3 练习三：P4Runtime

练习所在路径：`./tutorials/exercises/p4runtime`

### 3.1 介绍


本练习使用 P4Runtime 实现控制平面，向交换机发送流表项，以便在主机之间进行流量隧道传输。我们需要修改提供的 P4 程序和控制器脚本，以建立连接、推送 P4 程序、安装隧道入口规则，并读取隧道计数器。

P4 代码文件为 <a href="/sdn/codes/advanced_tunnel_p4" target="_blank">`advanced_tunnel.p4`</a>，基于练习二中完成的 P4 程序，并增加了两个计数器（`ingressTunnelCounter`，`egressTunnelCounter`）和两个新动作（`myTunnel_ingress`，`myTunnel_egress`）。

我们将使用起始程序 `mycontroller.py` 和 `p4runtime_lib` 目录中的一些辅助库，创建在主机 1 和主机 2 之间进行流量隧道传输所需的表项。

### 3.2 步骤一：运行初始代码

初始代码在 <a href="/sdn/codes/mycontroller_py" target="_blank">`mycontroller.py`</a> 的文件中。先编译源码文件，启动网络看看效果，使用 `mycontroller.py` 安装一些规则，并查看计数器 `ingressTunnelCounter`。

1. 在 Shell 命令行中，执行：

```shell
make
```

这将会：

- 编译 `advanced_tunnel.p4`
- 启动一个 Mininet 实例，包含三个交换机（`s1`，`s2`，`s3`）组成一个三角形拓扑，每个交换机分别各连了一个主机（`h1`，`h2`，`h3`）
- 给三台主机分别分配 IP 地址：`10.0.1.1`、`10.0.2.2`、`10.0.3.3`

2. 此时会看到 Mininet 命令提示符。在 `h1` 和 `h2` 之间 `ping` 一下：

```shell
mininet> h1 ping h2
```

因为交换机上没有规则，此时肯定是 `ping` 不同的。让 `ping` 命令在这个终端中运行。

3. 新开一个 Shell 终端，运行初始代码：

```shell
cd ~/tutorials/exercises/p4runtime
./mycontroller.py
```

这会把 `advanced_tunnel.p4` 程序安装到交换机上，并推送隧道入口规则。该程序每 2 秒打印一次隧道入口和出口计数器。此时可以看到 `s1` 的入口隧道计数器在增加：

```text
s1 ingressTunnelCounter 100: 2 packets
```

其他的计数器保持为 0：

```text
----- Reading tunnel counters -----
s1 MyIngress.ingressTunnelCounter 100: 2 packets (38416 bytes)
s2 MyIngress.egressTunnelCounter  100: 0 packets (0 bytes)
s2 MyIngress.ingressTunnelCounter 200: 0 packets (0 bytes)
s1 MyIngress.egressTunnelCounter  200: 0 packets (0 bytes)
```

4. 按 `Ctrl-C` 停止 `mycontroller.py`。

目前交换机之间根据目标 IP 地址将流量映射到隧道中。需要我们做的是编写规则，根据隧道 ID 在交换机之间转发流量。

#### 3.2.1 潜在问题

如果在运行 `mycontroller.py` 时看到以下错误消息，则表示一个或多个交换机上的 gRPC 服务器未运行。

```text
p4@p4:~/tutorials/exercises/p4runtime$ ./mycontroller.py
...
grpc._channel._Rendezvous: <_Rendezvous of RPC that terminated with (StatusCode.UNAVAILABLE, Connect Failed)>
```

可以通过运行以下命令检查机器上哪些 gRPC 端口正在监听：

```shell
sudo netstat -lpnt
```

最简单的解决办法就是 `Ctrl-D` 或者在 Mininet 命令提示符后面输入 `exit`，然后重新执行 `make`。

### 3.3 步骤二：实现隧道转发

`mycontroller.py` 文件是一个基本的控制平面，执行以下操作：

- 建立与交换机的 gRPC 连接来使用 P4Runtime 服务
- 将 P4 程序推送到每个交换机
- 为 `h1` 和 `h2` 之间的隧道写入相关规则
- 每 2 秒读取一次隧道入口和出口计数器

文件中包含标记为 `TODO` 的注释，提示了需要实现的功能。

主要任务是在 `writeTunnelRules` 函数中编写隧道转发规则，用来匹配隧道 ID 并将数据包转发到下一跳。

![](/p4/basic_tunnel-topo.png)

在这个练习中，需要使用到 `p4runtime_lib` 库中的一些类和方法。以下是库中每个文件的摘要：

- `helper.py`
    - 包含 `P4InfoHelper` 类，用来解析 `p4info` 文件
    - 提供转换实体名称和 ID 的方法
- `switch.py`
    - 包含 `SwitchConnection` 类，创建 gRPC 客户端并建立与交换机的连接
    - 调用 P4Runtime gRPC 服务
- `bmv2.py`
    - 包含 `Bmv2SwitchConnection` 类，扩展 `SwitchConnections` 并提供 BMv2 特定的设备负载，用来加载 P4 程序。
- `convert.py`
    - 用来将字符串和数字编码或者解码为字节串
    - 在 `helper.py` 中调用

### 3.4 步骤三：运行完整代码

按照步骤一的操作。如果 Mininet 网络没关，只需要在第二个终端中运行以下命令：

```shell
./mycontroller.py
```

如果代码正确，此时就可以在 Mininet 提示符中看到 ICMP 响应，同时所有计数器的值都在增加。

### 3.5 完整代码

```py
import argparse
import os
import sys
from time import sleep

import grpc

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../utils/'))
import p4runtime_lib.bmv2
import p4runtime_lib.helper
from p4runtime_lib.switch import ShutdownAllSwitchConnections

SWITCH_TO_HOST_PORT = 1
SWITCH_TO_SWITCH_PORT = 2


def writeTunnelRules(p4info_helper, ingress_sw, egress_sw, tunnel_id, dst_eth_addr, dst_ip_addr):
    table_entry = p4info_helper.buildTableEntry(
        table_name="MyIngress.ipv4_lpm",
        match_fields={ "hdr.ipv4.dstAddr": (dst_ip_addr, 32) },
        action_name="MyIngress.myTunnel_ingress",
        action_params={ "dst_id": tunnel_id })
    ingress_sw.WriteTableEntry(table_entry)
    print("Installed ingress tunnel rule on %s" % ingress_sw.name)

    table_entry = p4info_helper.buildTableEntry(
        table_name="MyIngress.myTunnel_exact",
        match_fields={ "hdr.myTunnel.dst_id": tunnel_id },
        action_name="MyIngress.myTunnel_forward",
        action_params={ "port": SWITCH_TO_SWITCH_PORT })
    ingress_sw.WriteTableEntry(table_entry)
    print("Installed transit tunnel rule on %s" % ingress_sw.name)

    table_entry = p4info_helper.buildTableEntry(
        table_name="MyIngress.myTunnel_exact",
        match_fields={ "hdr.myTunnel.dst_id": tunnel_id },
        action_name="MyIngress.myTunnel_egress",
        action_params={
            "dstAddr": dst_eth_addr,
            "port": SWITCH_TO_HOST_PORT
        })
    egress_sw.WriteTableEntry(table_entry)
    print("Installed egress tunnel rule on %s" % egress_sw.name)


def readTableRules(p4info_helper, sw):
    print('\n----- Reading tables rules for %s -----' % sw.name)
    for response in sw.ReadTableEntries():
        for entity in response.entities:
            entry = entity.table_entry
            table_name = p4info_helper.get_tables_name(entry.table_id)
            print('%s: ' % table_name, end=' ')
            for m in entry.match:
                print(p4info_helper.get_match_field_name(table_name, m.field_id), end=' ')
                print('%r' % (p4info_helper.get_match_field_value(m),), end=' ')
            action = entry.action.action
            action_name = p4info_helper.get_actions_name(action.action_id)
            print('->', action_name, end=' ')
            for p in action.params:
                print(p4info_helper.get_action_param_name(action_name, p.param_id), end=' ')
                print('%r' % p.value, end=' ')
            print()

def printCounter(p4info_helper, sw, counter_name, index):
    for response in sw.ReadCounters(p4info_helper.get_counters_id(counter_name), index):
        for entity in response.entities:
            counter = entity.counter_entry
            print("%s %s %d: %d packets (%d bytes)" % (
                sw.name, counter_name, index,
                counter.data.packet_count, counter.data.byte_count
            ))

def printGrpcError(e):
    print("gRPC Error:", e.details(), end=' ')
    status_code = e.code()
    print("(%s)" % status_code.name, end=' ')
    traceback = sys.exc_info()[2]
    print("[%s:%d]" % (traceback.tb_frame.f_code.co_filename, traceback.tb_lineno))

def main(p4info_file_path, bmv2_file_path):
    p4info_helper = p4runtime_lib.helper.P4InfoHelper(p4info_file_path)

    try:
        s1 = p4runtime_lib.bmv2.Bmv2SwitchConnection(
            name='s1',
            address='127.0.0.1:50051',
            device_id=0,
            proto_dump_file='logs/s1-p4runtime-requests.txt')
        s2 = p4runtime_lib.bmv2.Bmv2SwitchConnection(
            name='s2',
            address='127.0.0.1:50052',
            device_id=1,
            proto_dump_file='logs/s2-p4runtime-requests.txt')

        s1.MasterArbitrationUpdate()
        s2.MasterArbitrationUpdate()

        s1.SetForwardingPipelineConfig(p4info=p4info_helper.p4info, bmv2_json_file_path=bmv2_file_path)
        print("Installed P4 Program using SetForwardingPipelineConfig on s1")
        s2.SetForwardingPipelineConfig(p4info=p4info_helper.p4info, bmv2_json_file_path=bmv2_file_path)
        print("Installed P4 Program using SetForwardingPipelineConfig on s2")

        writeTunnelRules(p4info_helper, ingress_sw=s1, egress_sw=s2, tunnel_id=100, dst_eth_addr="08:00:00:00:02:22", dst_ip_addr="10.0.2.2")
        writeTunnelRules(p4info_helper, ingress_sw=s2, egress_sw=s1, tunnel_id=200, dst_eth_addr="08:00:00:00:01:11", dst_ip_addr="10.0.1.1")

        readTableRules(p4info_helper, s1)
        readTableRules(p4info_helper, s2)

        while True:
            sleep(2)
            print('\n----- Reading tunnel counters -----')
            printCounter(p4info_helper, s1, "MyIngress.ingressTunnelCounter", 100)
            printCounter(p4info_helper, s2, "MyIngress.egressTunnelCounter", 100)
            printCounter(p4info_helper, s2, "MyIngress.ingressTunnelCounter", 200)
            printCounter(p4info_helper, s1, "MyIngress.egressTunnelCounter", 200)

    except KeyboardInterrupt:
        print(" Shutting down.")
    except grpc.RpcError as e:
        printGrpcError(e)

    ShutdownAllSwitchConnections()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='P4Runtime Controller')
    parser.add_argument('--p4info', help='p4info proto in text format from p4c', type=str, action="store", required=False, default='./build/advanced_tunnel.p4.p4info.txt')
    parser.add_argument('--bmv2-json', help='BMv2 JSON file from p4c', type=str, action="store", required=False, default='./build/advanced_tunnel.json')
    args = parser.parse_args()

    if not os.path.exists(args.p4info):
        parser.print_help()
        print("\np4info file not found: %s\nHave you run 'make'?" % args.p4info)
        parser.exit(1)
    if not os.path.exists(args.bmv2_json):
        parser.print_help()
        print("\nBMv2 JSON file not found: %s\nHave you run 'make'?" % args.bmv2_json)
        parser.exit(1)
    main(args.p4info, args.bmv2_json)

```

## 4 练习四：显式拥塞通知

练习所在路径：`./tutorials/exercises/ecn`

### 4.1 介绍

当前练习的目标是通过实现显式拥塞通知（ECN，Explicit Congestion Notification）来扩展基本的 L3 转发。

ECN 允许在不丢弃数据包的情况下进行网络拥塞的端到端通知。如果终端主机支持 ECN，它会在 `ipv4.ecn` 字段中放置值 1 或 2。对于这样的数据包，每个交换机在队列大小超过阈值时，可以将该值更改为 3。接收方将该值复制给发送方，发送方可以降低发送速率。

::: tip IPv4 的 ECN 字段
用于在网络中实现拥塞控制。其作用如下：
1. **拥塞指示**：ECN 字段可以标识网络中的拥塞状态，而无需丢弃数据包。当网络设备（如交换机）检测到队列长度超过预设阈值时，可以在数据包的 ECN 字段中设置特定值，以指示拥塞情况。
2. **支持流量调节**：接收方在接收到标记为拥塞的数据包后，可以通知发送方（例如通过 TCP ACK），从而让发送方降低发送速率。这种机制帮助避免进一步的拥塞，保持网络性能。
3. **提高网络效率**：通过使用 ECN，网络可以在拥塞发生时采取措施，而不是丢弃数据包，从而减少重传次数，提高整体数据传输效率。

ECN字段通常包含以下值：
- 0：未标记
- 1 或 2：表示支持ECN
- 3：表示检测到拥塞
:::

练习已经定义了路由的控制平面规则，我们只需实现 P4 程序的数据平面逻辑。

### 4.2 步骤一：运行初始代码

该目录包含一个 P4 程序 `ecn.p4`，它实现了 L3 转发。我们需要扩展它，正确设置 `ECN` 位。

在此之前，先编译不完整的 `ecn.p4`，并在 Mininet 中启动一个网络测试其行为。

1. 在 Shell 中执行：

```shell
make
```

这将会：

- 编译 `ecn.p4`
- 启动一个 Mininet 的实例，创建三个交换机（`s1`、`s2`、`s3`）组成三角形拓扑，创建五个主机，其中 `h1` 和 `h11` 连接在 `s1` 上，`h2` 和 `h22` 连接在 `s2` 上，`h3` 连接在 `s3` 上。
- 主机 IP 的格式为 `10.0.<Switchid>.<hostID>`
- 控制平面根据 `sx-runtime.json` 在各个交换机中配置 P4 表。

2. 从 `h1` 到 `h2` 发送低速流量，同时从 `h11` 到 `h22` 发送高速 iperf 流量。`s1` 和 `s2` 之间的链路在这两种流量之间是共享的，并且由于我们在 `topology.json` 中将其带宽减少到 512kbps。如果我们在 `h2` 捕获数据包，应当要看到正确的 `ECN` 值。

![](/p4/excerise_ecn_topo.png)

3. 此时能看到 Mininet 命令提示符，分别为 `h1`、`h11`、`h2`、`h22` 打开终端：

```shell
mininet> xterm h1 h11 h2 h22
```

4. 在 `h2` 的 XTerm 里，启动捕获数据包的服务器：

```shell
./receive.py
```

5. 在 `h22` 的 XTerm 中，启动 iperf UDP 服务器：

```shell
iperf -s -u
```

6. 在 `h1` 的 XTerm 中，使用 `send.py` 每秒发送一个数据包到 `h2`，持续 30 秒：

```shell
./send.py 10.0.2.2 "P4 is cool" 30
```

消息“P4 is cool”将在 `h2` 的 xterm 中收到。

7. 在 `h11` 的 XTerm 中，启动 iperf 客户端，持续发送数据 15 秒：

```shell
iperf -c 10.0.2.22 -t 15 -u
```

8. 在 `h2` 中，字段 `ipv4.tos`（DiffServ+ECN）始终为 1。

9. 输入 `exit` 以关闭 XTerm 窗口。

::: tip `ipv4.tos`
字段 `ipv4.tos` 是 IPv4 头部中的“Type of Service”（服务类型）字段，它用于指示数据包的优先级和处理要求。在 ECN 和 DiffServ 的上下文中，它通常用于控制流量的拥塞和服务质量（QoS）。

- DiffServ：通过不同的值来区分不同的服务等级，以便网络可以根据流量类型采取不同的处理措施。
- ECN：在此字段中，特定位用于表示拥塞通知。

当 `ipv4.tos` 字段的值为 1 时，表示数据包被标记为需要特定的服务处理，通常与 ECN 或其他网络策略相关。
:::

该练习的任务是扩展 `ecn.p4` 中的代码，设置 `ECN` 标志。

### 4.3 步骤二：实现 ECN

首先需要修改报头 `ipv4_t`，将 `TOS` 字段拆分为 `DiffServ` 和 `ECN` 字段。记得更新相应的校验和块。然后，在出口控制块中，我们必须将队列长度与 `ECN_THRESHOLD` 进行比较。如果队列长度超过阈值，`ECN` 标志将被设置。请注意，此逻辑仅在原始 `ECN` 设置为 `1` 或 `2` 的终端主机上有效。

完整的 `ecn.p4` 将包含以下组成部分：

1. **报头类型定义**：以太网（`ethernet_t`）和 IPv4（`ipv4_t`）。
2. **解析器**：用来解析以太网和 IPv4 数据包。
3. **丢包动作**：`mark_to_drop()`。
4. **转发动作**（`ipv4_forward`）：  
    （1）设置下一跳的出口端口。  
    （2）更新以太网目标地址为下一跳的地址。  
    （3）更新以太网源地址为交换机的地址。  
    （4）递减TTL。
5. **出口控制块**：检查 `ECN` 和 `standard_metadata.enq_qdepth` 并设置 `ipv4.ecn`。
6. **反解析器**：选择插入到输出数据包中的字段顺序。

### 4.4 运行完整代码

按照步骤一进行操作。当来自 `h1` 的消息发送到 `h2` 时，可以看到 `tos` 值在队列增加时从 1 变为 3。当 iperf 结束，队列减少时，`tos` 可能会变回 1。

为了方便跟踪 `tos` 值，在 `h2` 上运行以下命令将输出重定向到文件：

```shell
./receive.py > h2.log
```

然后，在另一个窗口中，使用命令 `grep tos h2.log` 只打印 `tos` 值：

```text
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x3
     tos       = 0x3
     tos       = 0x3
     tos       = 0x3
     tos       = 0x3
     tos       = 0x3
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
     tos       = 0x1
```
