---
outline: deep
---

# Flexible sampling-based in-band network telemetry in programmable data plane

> 发表期刊：ICT Express  
> 发表时间：March 2020  
> DOI：10.1016/j.icte.2019.08.005

这篇论文主要研究在 P4 可编程数据平面上，如何通过灵活采样机制改进带内网络遥测（INT，In-band Network Telemetry）的效率，减少带宽和计算开销，同时保持监控准确性。

## 1 研究背景与动机

### 1.1 网络可编程性与遥测需求

- SDN 通过将控制平面与数据平面分离，提高了网络灵活性。
- 然而，OpenFlow 等早期标准存在协议限制，难以处理新协议或用户自定义报文头。
- 为此，P4 语言应运而生，提供协议无关的编程能力，尤其适用于实现 INT。

### 1.2 INT 的局限性

当前 INT 机制需在所有数据包中插入遥测头部（INT header）和交换机内部状态信息（如队列长度、时延等），导致：

- 监控引擎（运行在普通服务器上）处理压力过大；
- 数据包头部冗长，浪费带宽；
- 对小数据包尤其不利，开销相对更高。

## 2 INT 架构概述

INT 系统分为两个部分：

### 2.1 INT 控制平面

- 利用 P4 编译器将 INT 功能编译进交换芯片；
- 使用 P4Runtime API 下发指令，配置各节点为源节点、转发节点或汇聚节点。

### 2.2 INT 数据平面

- 包含源节点、转发节点、汇聚节点；
- 源节点插入 INT 头部和初始遥测信息；
- 中间每个转发节点追加自己的遥测信息；
- 汇聚节点提取遥测信息，送入监控引擎分析。

### 2.3 示例

H1 → H2 数据流经 SW1（源）→ SW2（中继）→ SW3（汇聚），每个节点插入自身 ID 与跳时延。

<p align="center">
    <img width="95%" src="/reading/FS-INT/INT_example.png" alt="INT operation example." />
    <span><b>Fig. 1. </b>INT operation example.</span>
</p>

## 3 FS-INT 方案

为减少上述开销，作者提出 FS-INT（Flexible Sampling-based INT），即基于灵活采样的 INT，允许不对每一个包都添加 INT 头部和元数据。主要支持两种采样策略：

### 3.1 基于频率的采样（Rate-based Sampling）

- 每隔 R 个包插入一次 INT 头（第 R 个包采样），R 可动态配置。
- 减少 INT 元数据插入频率，从而降低带宽和处理负担。
- 图示例：R=2，表示每两个包中只有一个会被采样。
    <div align="center">
        <img width="95%" src="/reading/FS-INT/rate-based_sampling_strategy.png" alt="Rate-based sampling strategy." />
        <span><b>Fig. 2.</b>(a) Rate-based sampling strategy.</span>
    </div>

### 3.2 基于事件的采样（Event-based Sampling）

- 节点判断是否应插入 INT 信息，依据如队列长度是否超阈值等事件触发条件；
- 插入行为基于事件发生与否，因此每跳插入的元数据可能不同；
- 为标明哪些字段被插入，需添加一个插入位图（Insertion Bitmap）。
    <div align="center">
        <img width="95%" src="/reading/FS-INT/event-based_sampling_strategy.png" alt="Event-based sampling strategy." />
        <span><b>Fig. 2.</b>(b) Event-based sampling strategy.</span>
    </div>

### 3.3 示例

<p align="center">
    <img width="95%" src="/reading/FS-INT/Example_for_FS-INT.png" alt="Example for FS-INT." />
    <span><b>Fig. 3. </b>Example for FS-INT.</span>
</p>

FS-INT 实现于 P4 数据平面，通过控制平面注入 3 种策略：

1. 原始 INT（O-INT）
2. Rate-based 采样
3. Event-based 采样

控制器根据监控反馈自动选择策略，例如在负载高时切换为 R 较大的 Rate-based 采样以降低开销。

## 4 仿真与评估结果

### 4.1 实验设定

- 模拟 300 个数据包，跨越 10–30 跳（Hops）；
- 插入的 INT 元数据包括交换机 ID、入口/出口端口 ID、跳延时；
- 小包传输场景（UDP over Ethernet，MSS 为 1472 字节）；
- 跳延时按对数正态分布模拟，均值 10ms，标准差 50ms。

### 4.2 结果分析

#### 4.2.1 协议开销（Protocol Overhead）

<p align="center">
    <img width="70%" src="/reading/FS-INT/Effect_of_path_length_on_per-packet_overhead.png" alt="Effect of path length on per-packet overhead." />
    <span><b>Fig. 4. </b>Effect of path length on per-packet overhead.</span>
</p>

- 原始 INT 的开销随跳数线性增长；
- FS-INT(R) 和 FS-INT(E) 显著减少开销；
- FS-INT(R) 的开销随 R 增大而线性减少；
- FS-INT(E) 的开销随阈值 Δ 的增大而降低。

#### 4.2.2 监控精度

<p style="margin-bottom: -16px;">
<b>Table 1. </b>Average hop latency measurement.
</p>

| Path length           | 10       | 20       | 30       |
| --------------------- | -------- | -------- | -------- |
| O-INT                 | 11.87 ms | 10.7 ms  | 10.16 ms |
| FS-INT(R) (R = 4)     | 10.28 ms | 09.22 ms | 09.15 ms |
| FS-INT(E) (∆ = 30 ms) | 11.85 ms | 10.25 ms | 10.03 ms |

- 以平均跳延时为衡量标准；
- FS-INT(E) 测得的延时更接近原始 INT，比 FS-INT(R) 更准确；
- 原因在于 FS-INT(E) 根据延时变化插入信息，误差有界。

## 5 结论

- FS-INT 通过引入可配置采样机制，大幅降低了带内遥测带来的带宽与处理负担；
- 在保持良好准确性的同时，提升了可扩展性；
- 对未来网络（尤其是高频、低延时的网络场景）具有广泛适用性；
- FS-INT 适合部署于多种可编程网络中，特别是资源受限环境。

## BibTeX 格式引用

```BibTeX
@article{FSINT,
    title = {Flexible sampling-based in-band network telemetry in programmable data plane},
    journal = {ICT Express},
    volume = {6},
    number = {1},
    pages = {62-65},
    year = {2020},
    issn = {2405-9595},
    doi = {https://doi.org/10.1016/j.icte.2019.08.005},
    url = {https://www.sciencedirect.com/science/article/pii/S2405959519302358},
    author = {Dongeun Suh and Seokwon Jang and Sol Han and Sangheon Pack and Xiaofei Wang},
    keywords = {Programmable data plane, In-band network telemetry, Flexible sampling-based INT}
}
```

## 作为相关工作引用示例

> 带内网络遥测（In-band Network Telemetry, INT）是一种通过将遥测元数据嵌入实际数据包中以获取网络状态的关键机制。然而，传统 INT 方法通常需要对所有数据包附加遥测头部，这在高吞吐或资源受限的环境中会引入显著的带宽和处理开销。为解决这一问题，Suh 等人提出了灵活采样机制的 INT（FS-INT），在遥测流程中引入速率控制与事件触发的采样策略，从而在监控精度与系统负载之间实现可调节的权衡 [1]。具体而言，FS-INT 支持基于固定采样率以及基于网络事件（如队列拥塞）进行元数据选择性插入。仿真结果表明，FS-INT 能在不显著降低测量准确性的前提下，显著减少每个数据包的协议开销，尤其适用于无需全面遥测的小包场景。该设计提升了 INT 在可编程数据面下的可扩展性，适合部署于现代 SDN 架构中。
