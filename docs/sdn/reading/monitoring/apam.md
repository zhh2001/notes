---
outline: deep
---

# A Lightweight Scheme of Active-Port-Aware Monitoring in Software-Defined Networks

> 发表期刊：IEEE Transactions on Network and Service Management  
> 发表时间：17 March 2021  
> DOI：10.1109/TNSM.2021.3066273

## 1 研究背景与动机

- **SDN 监控的挑战**  
SDN 通过解耦控制平面与数据平面，实现了网络的可编程性与集中控制。然而，为了让控制器能够及时、准确地了解全网流量状况，就必须不断地从各交换机轮询端口/流表统计数据，这既消耗**网络带宽**又增加**计算开销**，在大规模或多租户网络下显得尤为沉重和低效。
- **现有方法的不足**  
流量监控方案大致分为：基于流的监控（开销随流表条目数线性增长）、采样监控（需要专门硬件或带宽）、以及被动监听（如 FlowSense，依赖流过期消息）。这些方案或多或少都无法在低开销与高精度间进行灵活平衡。

## 2 APAM 总体框架

论文提出了**主动端口感知监控**（APAM，Active‑Port Aware Monitoring）机制，核心思路是：

1. **仅监控活跃端口**：即当前已被流表项使用的端口，避免对空闲或不关心的链路重复轮询。
2. **按端口利用率自适应地调整轮询间隔**：将活跃端口按利用率分入不同监控区间，利用率高则轮询频率高，利用率低则延长间隔，以减少不必要的控制消息。

### 2.1 架构集成

APAM 作为 SDN 控制器（如 Ryu）中的一个微服务，通过南向接口获取流表、端口统计和网络拓扑，向上为各种 SDN 应用（如负载均衡、切片管理）提供轻量化的全局流量视图。
<p align="center">
    <img width="55%" src="/reading/apam/arch.png" alt="SDN architecture and framework." />
    <span>架构和框架图</span>
</p>

## 3 关键技术细节

### 3.1 活跃端口的检索

控制器定期或在流表变更事件触发时，解析各交换机上的流表项，识别出所有含有 `output_port` 动作的端口，统称为活跃端口。

检索活动端口的伪代码如下：

```pseudo
for switch in switches do
    flow_rules = Fetch flow rules in switch
    for flow_rule in flow_rules do
        condition = there is an 'output_port' action in flow_rule
        if condition and output_port != controller_port then
            active_ports[switch].append(output_port)
        end if
    end for
end for
```

### 3.2 监控端口的选择

为了避免对同一链路的双重计数，APAM 将活跃端口分为：

- 网络端口（连接到其他交换机）
- 终端端口（连接到主机或终端）

对于网络端口，APAM 会在链路两端只选取一侧进行监控，并尽量将监控任务均匀分配给活跃端口数较少的交换机，以平衡负载。

选择端口的伪代码如下：

```pseudo
/** Term
 * * port_an = an active network port
 * * port_at = an active terminal port
 */

active_network_ports = find active network ports from active_ports
N = CountActivePorts(active_ports)
sorted_switches = Sort(switches, ascending, N)
while N != 0 do
    for switch in sorted_switches do
        N_switch = CountActivePorts(active_network_ports[switch])
        if N_switch != 0 then
            port_an = find a active network port which its neighbor switch has the most number of active ports
            if port_an is not monitored by other switches then
                monitoring_active_ports.append(port_an)
            end if
            active_network_ports[switch].pop(port_an)
        end if
    end for
end while

active_terminal_ports = find active terminal ports from active_ports
for port_at in active_terminal_ports do
    monitoring_active_ports.append(port_at)
end for
```

### 3.3 分区自适应监控

将监控端口根据带宽利用率分入 N 个区间，每个区间有固定的阈值和轮询间隔：

$$ \text{thold}_{S_i} = \frac{i}{N_{Si}}, \quad i = 1, 2, \ldots, N_{Si}, $$

$$ \text{intvl}_{S_i} = \text{intvl}_{\text{max}} - \text{thold}_{S_i} \cdot (\text{intvl}_{\text{max}} - \text{intvl}_{\text{min}}). $$

端口利用率上升时，它会逐级进入更高区间，从而缩短轮询间隔；利用率下降则回退至更低区间，以降低开销。

### 3.4 动态管理与切换

流表变更（如增、删、改）时，APAM 可采用内置更新或事件驱动更新两种模式，分别以定期拉取或即时推送方式同步活跃端口列表。

当 APAM 的监控开销（消息数/秒）超过传统全网轮询方式时，会自动退回到常规全端口轮询，避免额外负担。

## 4 性能评估亮点

### 4.1 监控间隔自适应

在单链路测试中，随着链路利用率从 0% 增加到 80%，APAM 能将平均轮询间隔从 5.5s 缩短到不到 1s，保持高精度同时节省带宽。
<p align="center">
    <img width="75%" src="/reading/apam/fig6.png" alt="Average port monitoring period versus link utilization." />
    <span>平均端口监控周期与链路利用率</span>
</p>

### 4.2 全网可扩展性

在 36 台交换机、100 端口的大规模 Mininet 拓扑中，仅监控 10% 活跃端口时，APAM 的监控消息比传统轮询减少超过 80%，且可根据链路拥塞集中监控热点链路。

### 4.3 响应性与鲁棒性

对短时冲击流量（spike）具有良好捕获能力：背景流量越高（即 APAM 进入高频监控区间），对 spike 流量的检测延迟越低、峰值捕获率越高。

事件驱动更新相比定期拉取，能将活跃端口更新延迟从平均 3.7s 降至 <0.1s。
<p align="center">
    <img width="75%" src="/reading/apam/update_active_ports.png" alt="Required time to update active ports." />
    <span>更新活动端口的耗时</span>
</p>

## 5 结论与应用前景

APAM 通过 只监控活跃端口 + 利用率自适应轮询 双重机制，成功在 SDN 网络中实现了低开销与高精度的平衡。其轻量化、易集成的特点，使其可直接部署于商业 SDN 控制器（如基于 Ryu、ONOS、OpenDaylight），并为负载均衡、切片管理、拥塞控制等上层应用提供更为及时、经济的全局流量视图。

## BibTeX 格式引用

```BibTeX
@ARTICLE{APAM,
  author={Oh, Bong-Hwan and Vural, Serdar and Wang, Ning},
  journal={IEEE Transactions on Network and Service Management}, 
  title={A Lightweight Scheme of Active-Port-Aware Monitoring in Software-Defined Networks}, 
  year={2021},
  volume={18},
  number={3},
  pages={2888-2901},
  doi={10.1109/TNSM.2021.3066273}
}
```

## 作为相关工作引用示例

> 在 SDN 监控领域，Oh 等人首次提出了主动端口感知监控机制（Active‑Port Aware Monitoring, APAM），该方法基于流表信息动态识别活跃端口（即当前被流规则实际转发的端口），并仅对这些端口进行统计轮询，从而在不损失全局流量感知能力的前提下，大幅降低监控开销。APAM 进一步按照端口带宽利用率将活跃端口划分至多个监控分区，不同分区对应不同的轮询间隔──利用率越高，轮询频率越快；反之，则延长轮询周期，以减轻网络与控制器的负载。此外，为避免对同一物理链路的冗余计量，APAM 仅选择链路两端之一进行统计，并通过匀负载算法将监控任务尽可能分配至活跃端口较少的交换机上，实现了监控流量与计算资源的双重均衡［1］。实验结果表明，APAM 在保持高精度流量感知的同时，相比传统全网轮询可减少近 80％ 的控制消息，并能自适应捕获突发流量峰值，充分验证了其在大规模、多策略 SDN 环境下的实用性和可扩展性。
