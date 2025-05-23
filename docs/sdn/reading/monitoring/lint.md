---
outline: deep
---

# Deterministic and Probabilistic P4-Enabled Lightweight In-Band Network Telemetry

> 发表期刊：IEEE Transactions on Network and Service Management  
> 发表时间：03 August 2023  
> DOI：10.1109/TNSM.2023.3301839

## 1 研究背景与动机

现代网络需要高精度监控以满足服务质量（QoS）需求。然而，传统 INT 框架（如 P4-INT）虽然能实时记录每跳信息（如 switch ID、队列长度、端口利用率），但会带来线性增长的传输开销，尤其在多跳路径和多指标采集场景中更为明显。这会影响有效载荷（payload）比例、降低吞吐率并延长流完成时间（FCT）。

<p align="center">
    <img width="90%" src="/reading/lint/fig2.gif" alt="Example of path tracing with INT." />
    <span>图 2. 使用 INT 进行路径跟踪的示例</span>
</p>

## 2 核心贡献

作者提出两种轻量级 INT 方法：

- **DLINT（Deterministic Lightweight INT）**：
  - 采用**确定性每流聚合**（per-flow aggregation, PFA）。
  - 将遥测指标分散在流的多个数据包中，每个包携带一跳信息，通过包序组合完整路径。
  - 使用 **P4 可编程交换机中的状态管理** 实现无控制器的协作，并借助 **布隆过滤器（Bloom Filter）** 压缩状态表。
- **PLINT（Probabilistic Lightweight INT）**：
  - 利用 **水库抽样（reservoir sampling）** 的概率方式，每个交换机以相等概率插入自身 ID。
  - 无需交换机间协作，实现更低复杂度。
  - 头部结构中加入 TTL 信息用于辅助路径重建。

## 3 技术设计

### 3.1 DLINT 的详细机制

**目标：**

- 精确、连续地获取路径信息。
- 在流的生命周期中重复进行路径记录以检测路径变化。

**核心机制：**

- 交换机维护 3 种遥测状态：
  1. `Awaiting Init`：等待初始化信号。
  2. `Ready to Insert ID`：准备插入 ID。
  3. `Inserted ID`：已插入 ID，等待重置。

**流程示意（5 跳网络）：**

1. 第一个数据包携带 `INIT` 信号，逐跳激活 `Ready to Insert ID`。
2. 接下来每个包轮流携带一个交换机的 ID（按状态插入），直至完整路径形成。
3. 第 5 个包后，INT sink 发送 `RESET` 信号（嵌入 TCP ACK），沿反向路径重置各交换机状态。
4. 重复上述过程，实现持续路径监控。

<p align="center">
    <img width="90%" src="/reading/lint/fig4.gif" alt="Sequence of steps taken by DLINT for path tracing across five switches." />
    <span>图 4. DLINT 跨五台交换机进行路径跟踪的步骤</span>
</p>

**布隆过滤器用途：**

- 压缩每个交换机上的状态映射表，以 2 位状态码表示每个流。
- 避免注册器资源耗尽。

**支持多指标：**

- 可根据 INT 控制器的配置，扩展头部插槽数，携带多个遥测值。

### 3.2 PLINT 的详细机制

**核心思想：**

- 每个交换机以概率方式插入 ID，避免协调开销。

**水库抽样过程：**

- 第一个交换机总是插入自身 ID；
- 第 $i$ 跳交换机以 $1 / i$ 概率替换包中的 ID；
- 使所有节点 ID 有相同概率保留在包中。

<p align="center">
    <img width="85%" src="/reading/lint/fig7.gif" alt="Telemetry data delivery with PLINT." />
    <span>图 7. 使用 PLINT 进行遥测数据传输</span>
</p>

**关键字段：**

- `initTTL`：初始 TTL
- `hopNum`：计算当前位置，用于服务器重建路径

<p align="center">
    <img width="20%" src="/reading/lint/fig6.gif" alt="PLINT telemetry header." />
    <span>图 6. PLINT 遥测报头</span>
</p>

**支持多个指标插入：**

- 每个 slot 独立进行水库抽样，可能出现多个 slot 值相同（冗余问题）。

## 4 实验评估

**环境：**

- 使用 BMv2 模拟交换机 + Mininet 拓扑（27 节点）
- 使用 D-ITG 生成约 400 条流量（Zipf 分布）

### 4.1 对比指标

1. **传输开销（Transmission Overhead）**
   - DLINT/PLINT：固定开销（例如 1 跳 4 bytes）
   - P4-INT：随跳数和指标数线性增长（例如 5 跳 5 值需 116 bytes）
<p align="center">
    <img width="75%" src="/reading/lint/fig8.gif" alt="Transmission overhead of P4-INT, PLINT and DLINT with one and five telemetry values." />
    <span>图 8. P4-INT、PLINT 和 DLINT 具有一个和五个遥测值的传输开销</span>
</p>

2. **路径追踪效率**
   - DLINT 整体传递路径数多于 PLINT（尤其布隆过滤器足够大时）
   - BF 碰撞会导致路径信息缺失，但可通过后续包弥补

3. **INT 报头利用率**
   - PLINT 利用率高，但因重复 ID 造成信息密度不高
<p align="center">
    <img width="75%" src="/reading/lint/fig10.gif" alt="INT header space utilization with a diverse range of telemetry values." />
    <span>图 10. INT 报头利用率</span>
</p>

4. **路径更新检测**
   - PLINT 更快检测路径更新（无状态丢失）
   - DLINT 在 BF 冲突下检测率与时效性下降

5. **与 PINT 对比**
   - PLINT 比 PINT 更快检测路径变更（因为携带 hopNum）
   - PINT 不携带 hopNum，无法精确定位更新位置

## 5 优势与不足对比

| 特性         | DLINT                          | PLINT                        |
| ------------ | ------------------------------ | ---------------------------- |
| 协调需求     | 有，靠 BF 状态管理             | 无                           |
| 路径追踪效率 | 高，信息组织良好               | 较低，需要更多包来重构路径   |
| INT 头利用率 | 受 INIT/RESET 影响，字段有浪费 | 高，但存在重复数据           |
| 更新检测能力 | 中，受 BF 冲突影响             | 高，响应快                   |
| 适用场景     | 精确路径追踪、长流量           | 快速检测路径变化、大流量统计 |

## 6 结论与未来方向

- **总结**：DLINT 和 PLINT 均能有效降低 INT 的传输负担，并在不同场景下各有优势。
- **未来工作**：将两者部署到真实硬件 P4 设备（如 SmartNIC）中，研究在真实环境中的延迟与性能瓶颈。
