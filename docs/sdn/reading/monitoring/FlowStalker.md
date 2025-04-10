---
outline: deep
---

# FlowStalker: Comprehensive Traffic Flow Monitoring on the Data Plane Using P4

> 发表会议：2019 IEEE International Conference on Communications (ICC)  
> 发表时间：15 July 2019  
> 会议时间：20-24 May 2019  
> 会议地点：Shanghai, China  
> DOI：10.1109/ICC.2019.8761197

FlowStalker 是一种基于 P4 的网络监控系统，通过[两阶段监控](#21-两阶段监控机制)和[ Cp 数据收集机制](#22-数据收集机制)，实现了高效、准确的网络流量监控。它减少了对控制平面的依赖，降低了通信开销，并为未来的网络监控方法提供了一个新的思路。

## 1 背景与动机

### 1.1 传统网络监控的局限性

- 传统交换机只暴露有限的转发平面信息，导致网络状态的获取依赖于低效的方法。
- 这些方法通常需要大量的计算资源，并且无法提供实时的网络状态信息。
- 例如，sFlow [[4]](#sFlow) 和 NetFlow [[6]](#NetFlow) 等传统监控方法通过采样或聚合流量信息来减少开销，但这种方法可能导致数据不准确。

### 1.2 P4 语言的潜力

- P4 是一种专门为数据平面编程设计的语言，允许直接在交换机上编程，从而实现更灵活的网络操作。
- P4 的可编程性为重新设计网络监控方法提供了机会，可以在数据平面直接完成许多传统上由控制平面完成的任务（如流量监控和信息聚合）。

### 1.3 FlowStalker 的目标

- 提出一种基于 P4 的高效监控机制，能够在数据平面直接完成流量监控和信息聚合。
- 通过减少对控制平面的依赖，降低控制路径的通信开销，同时提高监控的准确性和效率。

## 2 FlowStalker 的设计

### 2.1 两阶段监控机制

FlowStalker 的监控机制分为两个阶段：

1. **主动阶段（Proactive Phase）**

   - **功能:** 过滤掉不相关的流量，只关注目标流量。
   - **实现:**
     - 每个进入交换机的流量都会被检查。
     - 通过简单的计数器和低阈值来识别目标流量。
     - 当流量的计数器超过低阈值时，该流量被标记为目标流量，进入反应阶段。

2. **反应阶段（Reactive Phase）**

   - **功能:** 对目标流量进行详细的监控和数据采集。
   - **实现:**
     - 在交换机中维护一个哈希表，用于存储目标流量的详细信息。
     - 每个目标流量的每个数据包都会被监控并记录，包括：
       - **每流数据:** 如字节数、包数、RTT 的移动平均值等。
       - **每包数据:** 如时间戳、包大小等。
     - 当流量的计数器超过高阈值时，触发警告并通知控制器。

   下表展示了数据平面收集到的原始数据，以及可推导出来的数据：
    <table>
    <caption><strong>DERIVATIONS OF RAW METRICS</strong></caption>
    <thead><tr><th></th><th>原始数据</th><th>派生数据</th></tr></thead>
    <tbody>
    <tr><td rowspan="4"><strong>Per-Flow</strong></td><td>Byte Counts</td><td>Bytes/Second</td></tr>
    <tr><td>Packet Drops</td><td rowspan="2">Flow Error Rate</td></tr>
    <tr><td>Packet Counts</td></tr>
    <tr><td>Flow Start</td><td>Flow Duration</td></tr>
    <tr><td rowspan="3"><strong>Per-Packet</strong></td><td>Packet Size</td><td>Packet Length variance</td></tr>
    <tr><td rowspan="2">Timestamps</td><td>Processing Latency</td></tr>
    <tr><td>Inter-Packet Arrival Times</td></tr>
    </tbody>
    </table>

### 2.2 数据收集机制

FlowStalker 引入了一种称为 **Crawler Packet (Cp)** 的机制，用于高效地收集数据平面中的状态信息：

<p align="center"><img width="95%" src="/reading/FlowStalker/CrawlerPacket.png" /></p>

- **Crawler Packet 的作用**：
  - 当控制器收到警告后，会生成一个 Cp 并注入到目标集群中。
  - Cp 在集群内按照预定义的路径传播，每个交换机将状态信息附加到 Cp 中。
  - 最终，Cp 返回控制器，携带所有交换机的状态信息。

- **优势:**
  - 避免了传统方法中控制器逐个轮询交换机的高开销。
  - 减少了控制路径的通信量，提高了数据收集的效率。

### 2.3 网络分簇

- 为了进一步优化数据收集，网络被划分为多个逻辑组（集群）。
- 每个集群内的交换机通过 DFS 算法确定一条路径，用于 Cp 的传播。
- 这种分簇方法减少了控制器的通信负担，并避免了控制路径的瓶颈。

## 3 实验评估

### 3.1 监控系统的性能

- **实验设置:** 在 BMv2 P4 软件交换机上运行 FlowStalker，使用 iPerf 测试 TCP 流的吞吐量。
- **结果:**
  - FlowStalker 的监控机制对吞吐量的影响较小（约 12% 的下降）。
  - 增加监控的指标数量对吞吐量没有显著影响，表明 FlowStalker 的开销是固定的。

<p align="center"><img width="70%" src="/reading/FlowStalker/throughput.png" /></p>

### 3.2 数据收集系统的性能

- **通信开销实验:**

  - 比较了 FlowStalker 和传统 OpenFlow 方法在不同数据负载下的通信开销。
  - 结果表明，FlowStalker 的通信开销显著低于 OpenFlow 方法。

<p align="center"><img width="80%" src="/reading/FlowStalker/overhead.png" /></p>

::: warning 注意
上面实验对比的 OpenFlow 方法不是真的基于 OpenFlow 的方法，而是 BMv2 软件交换机的 P4Runtime Thrift API，作者认为和 OpenFlow 类似，所以这样叫。
:::

- **延迟实验:**

  - 测试了 Cp 在不同集群大小下的端到端延迟。
  - 结果显示，Cp 的延迟随集群大小线性增长，但总体延迟较低，表明 FlowStalker 的数据收集机制非常高效。

<p align="center"><img width="70%" src="/reading/FlowStalker/latency.png" /></p>

## 4 相关工作

- **传统监控方法:** 如 sFlow [[4]](#sFlow) 和 NetFlow [[6]](#NetFlow)，通过采样或聚合流量信息来减少开销，但可能牺牲了数据的准确性。
- **新兴监控方法:** 如 In-band Network Telemetry (INT) [[5]](#INT1) [[11]](#INT2)，通过在数据包头部附加元数据来监控网络状态，但需要控制平面的持续参与。
- **类似工作:** 如 Marple [[12]](#Marple) 和 StreaMon [[13]](#StreaMon)，也利用数据平面的可编程性进行监控，但 FlowStalker 更注重与控制平面的分离和效率。

## 5 结论与未来工作

### 5.1 结论

- FlowStalker 提供了一种高效、准确的网络流量监控方法，通过 P4 实现了数据平面的可编程性。
- 通过两阶段监控机制和 Cp 数据收集机制，FlowStalker 减少了对控制平面的依赖，降低了通信开销，同时保持了较高的监控精度。

### 5.2 未来工作

- 开发 FlowStalker 的控制平面对应模块，以实现数据平面和控制平面之间的协同工作。
- 允许控制平面运行更复杂的处理算法，并通过 Cp 定期交换信息。


## 文献引用

<span id="sFlow">[4]</span> sFlow, "sFlow - making the network visible," Available at: https://sflow.org/, last accessed in Feb 17, 2019.

<span id="INT1">[5]</span> C. Kim, A. Sivaraman, N. Katta, A. Bas, A. Dixit, and L. J. Wobker, "In-band network telemetry via programmable dataplanes," in ACM SIGCOMM, 2015.

<span id="NetFlow">[6]</span> Cisco, "Introduction to Cisco IOS NetFlow - a technical overview," https://www.cisco.com/c/en/us/products/collateral/ios-nx-os-software/ios-netflow/prod_white_paper0900aecd80406232.html, last accessed in Feb 17, 2019.

<span id="INT2">[11]</span> N. Van Tu, J. Hyun, and J. W.-K. Hong, "Towards onos-based sdn monitoring using in-band network telemetry," in Network Operations and Management Symposium (APNOMS), 2017 19th Asia-Pacific. IEEE, 2017, pp. 76–81.

<span id="Marple">[12]</span> S. Narayana, A. Sivaraman, V. Nathan, P. Goyal, V. Arun, M. Alizadeh, V. Jeyakumar, and C. Kim, "Language-Directed Hardware Design for Network Performance Monitoring," in SIGCOMM 2017, Los Angeles, CA, August 2017.

<span id="StreaMon">[13]</span> M. Bonola, G. Bianchi, G. Picierro, S. Pontarelli, and M. Monaci, "Streamon: A data-plane programming abstraction for software-defined stream monitoring," IEEE Transactions on Dependable and Secure Computing, vol. 14, no. 6, pp. 664–678, Nov 2017.

## BibTeX 格式引用

```BibTeX
@INPROCEEDINGS{FlowStalker,
  author={Castanheira, Lucas and Parizotto, Ricardo and Schaeffer-Filho, Alberto E.},
  booktitle={ICC 2019 - 2019 IEEE International Conference on Communications (ICC)}, 
  title={FlowStalker: Comprehensive Traffic Flow Monitoring on the Data Plane using P4}, 
  year={2019},
  volume={},
  number={},
  pages={1-6},
  keywords={Monitoring;Control systems;Crawlers;Measurement;IP networks;Registers;Telemetry},
  doi={10.1109/ICC.2019.8761197}
}
```
