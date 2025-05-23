---
outline: deep
---

# FAPM: A Fake Amplification Phenomenon Monitor to Filter DRDoS Attacks With P4 Data Plane

> 发表期刊：IEEE Transactions on Network and Service Management  
> 发表时间：26 August 2024  
> DOI：10.1109/TNSM.2024.3449889

## 1 研究背景与动机

### 1.1 DRDoS 攻击简介

Distributed Reflection Denial-of-Service (DRDoS) 是一种常见且破坏性极强的 DDoS 攻击形式，其关键机制是通过伪造源 IP 发送请求，引诱中间服务器向受害者主机反射大规模响应，从而实现攻击放大。

<p align="center">
    <img width="65%" src="/reading/fapm/fig1.gif" alt="Principle of DRDoS attack." />
    <span>图 1. DRDos 攻击原理</span>
</p>

### 1.2 面临的挑战

- 常规方法部署于服务器端，负载高，响应慢。
- 多数检测方案针对已知协议，难以应对新型攻击。
- 数据平面 P4 方案虽具低延迟，但受限于计算与状态存储能力。

## 2 FAPM 系统简介

FAPM 是一个部署于受害者网络边缘交换机上的**轻量级**检测系统，创新性地提出 **伪放大现象（Fake Amplification Phenomenon）** 作为攻击识别特征。

**核心思想：**

- DRDoS 攻击会导致**双向流中一方流量远大于另一方。**
- 在数据平面计算双向包长度差异，判断是否存在伪放大现象。
- 控制平面负责决策、防御规则下发和动态调参。

## 3 关键技术设计

<p align="center">
    <img width="98%" src="/reading/fapm/fig8.gif" alt="The architecture of FAPM." />
    <span>图 8. FAPM 架构</span>
</p>

### 3.1 “后窗辅助前窗”机制（Latter Window Assisting Former Window）

为解决 P4 无法一次性高效统计并清理滑动窗口数据的问题，FAPM 设计了双 Sketch 结构（$S$与$S'$）：

- 当前窗口收集统计值（Working Sketch）
- 上一窗口延迟一个窗口周期处理（Reserving Sketch）
- 引入三个子窗口（$W_T$, $W_{N1}$, $W_{N2}$）均匀分摊工作负载，避免数据面突发计算压力。

<p align="center">
    <img width="75%" src="/reading/fapm/fig5.gif" alt="Schematic diagram of the “latter window assisting former window” mechanism." />
    <span>图 5. “后窗辅助前窗”机制示意图</span>
</p>

<p align="center">
    <img width="75%" src="/reading/fapm/fig6.gif" alt="The workflow of the “latter window assisting former window”." />
    <span>图 6. “后窗辅助前窗”的工作流程</span>
</p>

### 3.2 放大因子计算器

由于 P4 不支持除法，FAPM 使用位运算替代：

- 取两方向包长的最高位“1”索引差（表示放大倍数的 2 的指数级差异）
- 分类为 11 档（0~10），显著减少上报数据量

### 3.3 控制平面逻辑

- 利用 **Wasserstein 距离（EMD）** 比对当前窗口放大因子分布与攻击/正常模型的相似度。
- 实现状态迁移图：
  - 正常状态 → 可疑状态（重模式收集）
  - 若连续 3 个窗口异常 → 确认攻击 → 下发丢包规则
  - 攻击缓解后恢复轻模式

<p align="center">
    <img width="75%" src="/reading/fapm/fig9.gif" alt="State transition mechanism of FAPM." />
    <span>图 9. FAPM 的状态转换机制</span>
</p>

### 3.4 动态窗口调整

控制面根据流量速率动态调整窗口长度 $W_T$：

- 流量高：减少窗口，降低哈希冲突
- 流量低：延长窗口，降低通信负载

## 4 实验评估与结果

### 4.1 实验平台

- Mininet + BMv2 仿真
- 数据平面程序用 P4 语言编写，控制平面通过 P4Runtime 通信

### 4.2 实验亮点

- 与传统窗口方案对比，FAPM 避免末包延迟抖动，稳定性强。
- 动态调窗显著降低哈希冲突与通信频率。
- 在 CIC-DDoS2019 数据集上，使用 k-means（EMD 距离）聚类，检测准确率达 91.36%。
- 定义新指标“Mitigation Efforts (ME)”综合评估检测时效与缓解响应，FAPM 均值 >2，表现优异。
- 通信开销低于 1Kbps，内存占用仅数 KB 级，极具实用性。

## 5 对比与创新点

| 特性               | NETHCF   | DIDA       | FAPM             |
| ------------------ | -------- | ---------- | ---------------- |
| 是否全部署于数据面 | 部分     | 是         | 否               |
| 是否需多交换机协同 | 否       | 是         | 否               |
| 支持动态调窗       | 否       | 否         | ✅               |
| 放大因子计算方式   | TTL 跳数 | 请求响应比 | 位移近似计算 ✅  |
| 数据压缩           | 无       | 无         | ✅ 11 类因子压缩 |
| 通信负载           | 较高     | 较高       | ✅ 1 Kbps 以内   |

## 6 总结与启示

FAPM 为网络边缘防护提供了一种低成本、高效率、实用性强的轻量级 DRDoS 攻击防御方案。其设计在可编程数据面资源有限的背景下，通过精妙的结构分工与近似计算方式，实现了高性能反射攻击识别。

**后续工作建议：**
- 硬件平台（如 Tofino）部署测试
- 支持多类型 DDoS 攻击识别
- 探索更丰富的控制平面-数据平面协同机制
