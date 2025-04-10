---
outline: deep
---

# P4-Based Proactive Monitoring Scheme in Software-Defined Networks

> 发表期刊：IEEE Transactions on Network and Service Management  
> 发表时间：06 August 2024  
> DOI：10.1109/TNSM.2024.3439472

总体来看，这篇论文利用 P4 的可编程特性，提出了一种创新的主动监控机制，既提高了监控效率，又降低了网络管理的开销，为 SDN 环境下的流量监控提供了新的思路和解决方案。

## 1 研究背景与动机

传统的 SDN 中，控制器通常采用基于轮询（polling）的方式来采集各交换机上的流量统计数据。这种方式虽然简单易用，但存在两个主要缺陷：

- **监控负担集中在控制器上:** 控制器需要定期发送请求，并处理所有交换机返回的统计数据。
- **性能与开销之间的权衡问题:** 为了保证监控的准确性，轮询频率必须较高，这会带来大量控制消息，从而消耗网络和计算资源。

随着 P4 语言的发展，数据平面变得可编程，支持自定义处理逻辑。这为网络监控提供了全新的思路，即利用交换机本身主动检测并上报监控信息，从而减轻控制器的负担。

## 2 PPM 方案的基本思想

论文提出了一种基于 P4 的主动监控方案（P4-based Proactive Monitoring，简称 PPM），其主要思想是：

- **主动上报:** 当交换机上某一流的监控指标（例如累计字节数或数据包数）达到预设的监控阈值（例如监控周期 _prd<sub>m</sub>_）时，交换机主动将监控数据上报给控制器，而不再依赖控制器周期性地轮询。
- **动态控制:** 控制器可以根据实际网络情况动态调整各个流的监控阈值，从而在监控准确性与系统开销之间做出平衡。
- **分布式负载:** 通过将监控计算任务下放到数据平面（即交换机），有效分散了原本集中在控制器上的监控管理压力。

## 3 PPM 方案的实现机制

论文中对 PPM 的实现主要分为三个部分：

### 3.1 数据平面中监控数据的采集与阈值设置

- **采集信息:** 在每个流规则中，可以根据需要采集诸如累计字节数、累计数据包数等监控信息。监控信息的采集嵌入到流规则的动作中。
- **监控阈值（_thld<sub>m</sub>_）:** 文中以监控周期（_prd<sub>m</sub>_）为例，作为判断是否需要上报监控信息的阈值。当流中经过的数据包触发时，交换机会检查自上次上报以来经过的时间间隔是否超过了 _prd<sub>m</sub>_，若超过则触发上报动作。

算法 1：通过监控阈值（_prd<sub>m</sub>_）收集监控信息
```p4
/* P4 伪代码 */
#include <v1model.p4>

// Nreg 是监控的流的数量
register<bit<32>>(Nreg) ppm_byte;
register<bit<32>>(Nreg) ppm_pkt;
register<bit<48>>(Nreg) ppm_timestamp;  // 监控间隔的时间戳

control Ingress(hdr,meta, standard_metadata) {
    action ppm_flow_action(flow_num, prdm) {
        // 对流的其他操作
        ...

        /* === 下面是与 PPM 相关的操作 === */
        // 收集监控信息
        tmp_byte = ppm_byte.Read(flow_num);
        tmp_pkt = ppm_pkt.Read(flow_num);
        tmp_byte += standard_metadata.packet_length;
        tmp_pkt += 1;
        ppm_byte.Write(flow_num, tmp_byte);
        ppm_pkt.Write(flow_num, tmp_pkt);
        // 计算时间间隔
        tmp_stamp = ppm_timestamp.Read(flow_num);
        tmp_now = standard_metadata.ingress_global_timestamp;
        time_intvl = tmp_now - tmp_stamp;
        // 监控信息的发送条件
        if(prdm > 0 && time_intvl >= prdm) {
            send_ppm_pkt=flow_num;
            meta.flow_num, meta.bytes, meta.pkts = flow_num, tmp_byte, tmp_pkt;
        }
    }

    action forward_ppm_pkt() {
        now = standard_metadata.ingress_global_timestamp;
        ppm_timestamp.Write(flow_num, now);
        // 生成克隆数据包
        clone_preserving_field_list(CloneType, MIRROR_SESSION, meta);
    }

    table flow_table {
        key = {
            ...
        }
        action = {
            ppm_flow_action;
            ...
        }
    }

    apply {
        if (condition enabling 'flow_table') {
             flow_table.apply();
        }
        if (send_ppm_pkt > 0) {
            forward_ppm_pkt() Or forwardingPPM_digest()
        }
    }
}
```

### 3.2 主动上报监控信息

上报机制有两种实现方式：

- **克隆数据包方式:** 当监控条件满足时，交换机会克隆出一份数据包，这个数据包中包含了监控元数据（如流编号、累计字节和数据包数等），随后通过专门定义的 PPM 头部格式上报给控制器。[图 2](#fig2) 和[算法 2](#alg2) 描述了这一过程。

<div align="center" id="fig2">
  <img width="82%" src="/reading/ppm/fig2.png" alt="Internal process of PPM (cloned packets)." />
  <span>图 2. PPM 内部过程（克隆数据包）。</span>
</div>

<p id="alg2">算法 2：发送监控信息到控制器（克隆数据包）</p>

```p4
/* P4 伪代码 */

header PPM_header {
    bit<16> protocol;
    bit<8>  reserved;
    bit<8>  length;
    bit<32> flow_num;
    bit<32> bytes;
    bit<32> pkts;
}

control Egress(hdr, meta, standard_metadata) {

    // 下面的动作是创建 PPM 数据包报头
    action PPM_header(meta) {
        egress_port = CONTROL_PORT;
        PPM_header.protocol = PROTO_PPM;
        PPM_header.length = LENGTH_PPM;
        PPM_header.flow_num = meta.flow_num;
        PPM_header.bytes = meta.bytes;
        PPM_header.pkts = meta.pkts;
        PPM_header.setValid();  // enable PPM header
    }

    apply {
        ...  // 其他出口操作

        if (packet is a clone packet for PPM) {
            PPM_header(meta);
        }
    }

}
```

- **Digest 消息方式:** 另一种方法是直接生成一个 Digest 消息，消息中携带监控信息，通过 P4Runtime 接口上报给控制器（见[算法 3](#alg3)）。这种方式相比克隆数据包更为轻量，适用于只需上报数据而不影响转发的场景。

<div align="center" id="fig4">
  <img width="82%" src="/reading/ppm/fig4.png" alt="Internal process of PPM (digest messages)." />
  <span>图 4. PPM 内部过程（digest 消息）。</span>
</div>

<p id="alg3">算法 3：发送监控信息到控制器（Digest 消息）</p>

```p4
/* P4 伪代码 */

struct PPM_digest {
    bit<16> protocol;
    bit<8>  reserved;
    bit<8>  length;
    bit<32> flow_num;
    bit<32> bytes;
    bit<32> pkts;
}

// 下面的动作是向控制器发送摘要信息
action forwardingPPM_digest() {
    now = standard_metadata.ingress_global_timestamp;
    ppm_timestamp.Write(meta.flow_num, now);

    PPM_digest PPM_msg;
    PPM_msg.protocol = PROTO_PPM;
    PPM_msg.length = LENGTH_PPM;
    PPM_msg.flow_num = meta.flow_num;
    PPM_msg.bytes = meta.bytes;
    PPM_msg.pkts = meta.pkts;
    digest<PPM_digest>(1, PPM_msg);  // 发送摘要信息
}
```

### 3.3 控制器端的处理

- 控制器在启用 PPM 后，会在对应流规则中标记上监控参数（如 *thld<sub>m</sub>* 和 *flow_num*）。
- 当接收到来自交换机的 PPM 消息时，控制器需要解析 PPM 头部或 Digest 消息，根据监控数据进行相应的管理操作。
- 控制器还可以选择采用纯 PPM、传统轮询或两者结合的混合方式，以达到更全面的监控效果（如[图 5](#fig5) 所示）。
<div align="center" id="fig5">
  <img width="82%" src="/reading/ppm/fig5.png" alt="An example of the cooperation method between PPM and a polling based method." />
  <span>图 5. PPM 和基于轮询的方法结合。</span>
</div>

## 4 性能评估与实验结果

实验环境：

- 硬件：
    - i7-1165G7 @ 2.80GHz
    - 16GB of RAM
- 软件：
    - 虚拟机：64-bit Ubuntu 20.04
    - P4 版本：P4<sub>16</sub>
    - 交换机架构：V1Model
    - 可编辑交换机：BMv2 软件交换机
    - 仿真网络：Mininet
    - 流量生成：Scapy、iPerf
    - 网络拓扑：1 个控制器、2 个 BMv2 交换机、2 个主机，如[图 6](#fig6) 所示。

<div align="center" id="fig6">
  <img width="80%" src="/reading/ppm/fig6.png" alt="Measurement environment: network topology." />
  <span>图 6. 实验环境：网络拓扑。</span>
</div>

论文通过实验验证了 PPM 方案的有效性，主要包括以下几个方面：

### 4.1 监控性能

- **监控周期准确性:** 实验表明，当流量匹配频繁时，PPM 能严格按照设定的监控周期（*prd<sub>m</sub>*）上报信息；在流量间隔较长的情况下，上报时间会受到流量匹配事件的影响。
- **初始流量检测时间:** PPM 能在毫秒级别内检测到新流的到来，与传统轮询相比响应更快。
- **对吞吐量的监控能力:** 使用 iPerf 生成可变的 UDP 流量（10-15 Mbps），流量的数据包大小为 1512 字节。流量从主机 1 转发到主机 2，持续 30 秒。结果如[图 10](#fig10) 所示：
    <p align="center" id="fig10">
       <img width="75%" src="/reading/ppm/fig10.png" alt="Throughput monitoring by using PPM." />
       <span>图 10. 监控吞吐量。</span>
    </p>

### 4.2 监控开销

- **减少控制消息:** 由于不需要周期性请求，PPM 显著减少了控制消息的数量和传输的字节数。如[图 13](#fig13) 和[图 14](#fig14) 所示。
    <p align="center" id="fig13">
       <img width="80%" src="/reading/ppm/fig13.png" alt="Required bytes to retrieve monitoring information per flow." />
       <span>图 13. Required bytes to retrieve monitoring information per flow.</span>
    </p>
    <p align="center" id="fig14">
       <img width="80%" src="/reading/ppm/fig14.png" alt="Monitoring overhead according to the ratio of monitoring flows." />
       <span>图 14. 监控的流的比例产生的开销。</span>
    </p>
- **动态调整:** PPM 能根据实际流量情况动态减少在无流量时段的不必要监控开销，从而进一步降低总体监控负担。如下图所示。
    <p align="center" id="fig18">
       <img width="82%" src="/reading/ppm/fig18.png" alt="Adaptive capacity of PPM." />
       <span>图 18. PPM 的适应能力。</span>
    </p>

### 4.3 对转发性能的影响

- 由于监控任务由交换机自主完成，在硬件交换机上（尽管本文实验基于软件交换机 BMv2）预计不会对正常数据转发产生明显影响，且在带宽瓶颈时差异较小。使用 iPerf 生成从主机 1 到主机 2 的 TCP 流量，持续 60 秒，流量的数据包大小为 1514 字节。重复测量 10 次以获得平均结果。结果如[图 11](#fig11) 所示。
    <p align="center" id="fig11">
       <img width="80%" src="/reading/ppm/fig11.png" alt="The impact of PPM on switch throughput performance based on BMv2 software switch." />
       <span>图 11. 基于 BMv2 软件交换机的 PPM 对吞吐性能的影响。</span>
    </p>

### 4.4 混合监控策略

- 论文还探讨了将 PPM 与传统轮询方法结合的方案，通过混合方式既能确保监控精度，也能在某些情况下进一步减小监控开销，从而获得更全面的网络状态信息。如[图 19](#fig19) 所示。
    <p align="center" id="fig19">
       <img width="78%" src="/reading/ppm/fig19.png" alt="Throughput monitoring by using the cooperative monitoring method." />
       <span>图 19. 采用混合监控进行吞吐量检测。</span>
    </p>

## 5 结论与未来工作

论文最后总结了 PPM 方案的优势：

- **降低监控开销:** 通过主动上报机制和数据平面内的计算，显著减少了因频繁轮询而产生的开销。
- **分布式监控管理:** 将监控负担分散到各个交换机上，从而减轻控制器压力。
- **动态适应性:** 控制器能够实时调整监控阈值，实现高效且精确的流量监控。

未来工作的方向包括在更大规模和实际网络环境下（尤其是硬件 P4 交换机环境中）进一步验证 PPM 的性能，以及探索更多基于 P4 的监控创新方案。

## BibTeX 格式引用

```BibTeX
@ARTICLE{PPM,
  author={Oh, Bong-Hwan},
  journal={IEEE Transactions on Network and Service Management}, 
  title={P4-Based Proactive Monitoring Scheme in Software-Defined Networks}, 
  year={2024},
  volume={21},
  number={5},
  pages={5781-5794},
  doi={10.1109/TNSM.2024.3439472}
}
```
