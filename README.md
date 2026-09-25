# mihomo-config

一套适用于 Mihomo / Clash Meta 的公共配置模板，并提供基于 Sub-Store 的移动端配置合成方案。

当前版本：`v1.0.0`

这是本项目的首个正式版本，包含保守域名嗅探和 Fake-IP 例外域名集合。

## 项目用途

这个项目主要解决下面这类场景：

- Windows 上使用 Clash Verge Rev，可以通过 Merge / Override 注入私有节点
- Android 上使用 Clash Meta for Android（CMFA），不方便直接做类似的本地 Merge
- 希望把公共规则、DNS、TUN、策略组与自己的订阅节点分离
- 不希望把机场订阅、节点地址、UUID、密码等敏感信息提交到 GitHub

本仓库只保存公共配置和处理逻辑，不包含任何私人节点信息。
---
## 配置解耦与独立演进

这套方案的核心目标之一，就是把“公共配置”和“私人节点”彻底分离。

这样规则、DNS、TUN、策略组和节点订阅可以分别维护、分别更新，互不覆盖。

### 公共配置独立演进

公共配置主要由以下文件维护：

```text
mihomo.yaml
mihomo-substore.yaml
populate-groups.js
```

其中可以独立调整：

- DNS
- TUN
- 规则
- Rule Providers
- 策略组
- 地区分组
- 节点分类逻辑
- 重名节点处理逻辑

这些配置发生变化时，不需要修改私人订阅或节点信息。

客户端重新更新配置后，就可以获取新的公共规则。

---

### 私人节点独立更新

私人节点来自：

```text
机场订阅
自建节点
Sub-Store 组合订阅
```

节点侧可以独立发生：

- 新增节点
- 删除节点
- IP 变化
- 域名变化
- 端口变化
- UUID 变化
- 协议参数变化
- Reality / TLS / WS 等参数变化

这些变化不会影响公共规则模板。

Sub-Store 每次重新生成配置时，会重新读取当前最新节点，并与公共模板重新合成。

---

### 最终关系

整体关系可以理解为：

```text
公共规则 / DNS / TUN / 策略组
                ↓
mihomo-substore.yaml
                ↓
                +
                ↓
机场订阅 / 自建节点
                ↓
Sub-Store 组合订阅
                ↓
populate-groups.js
                ↓
完整 Mihomo 配置
                ↓
Clash Meta for Android
```

因此可以做到：

```text
规则独立演进
+
节点独立更新
+
最终自动合成
```

两边互不保存对方的私人数据，也不需要因为一边变化而手工重做另一边配置。

---

### Windows 与 Android 分别使用

Windows：

```text
mihomo.yaml
+
本地 Merge / Override
+
私人节点
↓
Clash Verge Rev
```

Android：

```text
私人订阅
↓
Sub-Store
↓
mihomo-substore.yaml
↓
populate-groups.js
↓
完整配置
↓
Clash Meta for Android
```

---

### 注意

当前仓库同时维护：

```text
mihomo.yaml
mihomo-substore.yaml
```

两份公共模板。

如果以后修改公共规则、DNS、TUN、策略组等公共内容，建议同步修改这两个文件。

节点订阅本身则不需要同步修改。
---

## 当前分流与 DNS 约定

当前第一阶段优化保持原有“地区手动 + 自动测速 + 故障转移”结构，只调整分流优先级和解析职责：

- OpenAI、Claude、Gemini、Copilot、Perplexity、Meta AI 以及海外 AI 兜底规则统一进入 `AI服务`。
- Docker、npm、PyPI/Python、Maven 和 JetBrains 等开发服务进入可选的 `开发服务` 策略组，仍可手动选择直连、代理、自动或故障转移。
- `category-ai-!cn` 仅作为 `AI海外兜底`，不建立国内 AI 策略组。
- DeepSeek、智谱、通义、豆包等国内服务继续通过 `China / Domain` 或 `China / IP` 进入 `国内网站`，默认直连。
- Apple 和 Microsoft 的中国区域域名仍由各自的 `Apple`、`Microsoft` 策略组控制，不设置用户看不见的强制直连例外。
- DNS 使用 ARC 缓存、IPv4-only、fake-ip；国内域名使用国内 DoH，海外域名使用遵守路由规则的海外 DoH，代理节点使用独立的国内 DNS，私有域名和 Tailscale 使用系统解析。
- `.lan`、`.local`、`.ts.net` 和 `geosite:private` 保留真实解析，避免局域网设备、NAS 和 Tailscale MagicDNS 被错误分配 fake-ip。

规则集中的 MetaCubeX MRS 文件优先通过 jsDelivr 加载；文字规则仍按其实际格式保持 `classical/text`，不能把 text 规则误标为 MRS。

## 域名嗅探与客户端覆盖关系

两个公共模板都包含一组保守的 Mihomo 域名嗅探设置：

```yaml
sniffer:
  enable: true
  override-destination: false
  force-dns-mapping: false
  parse-pure-ip: true
```

这组设置主要用于从纯 IP 连接中补出域名，让已有的域名规则能够正常参与分流。`override-destination: false` 表示只补充分流信息，不把连接实际访问的目标地址改写成嗅探出来的域名，因此适合做公共默认配置。

模板还跳过了米家云和 Apple Push 等容易受嗅探影响的连接。

### OpenClash 的图形设置优先

OpenClash 会根据图形界面重新生成最终配置。对于它负责管理的字段，界面设置通常优先于订阅 YAML：

| 使用方式 | 最终嗅探状态 |
| --- | --- |
| Mihomo / Clash Meta 直接读取模板 | 使用模板中的 `sniffer` 设置 |
| OpenClash 界面开启域名嗅探 | 通常生成 `sniffer.enable: true`，详细参数由 OpenClash 模板和配置共同决定 |
| OpenClash 界面关闭域名嗅探 | 通常生成 `sniffer.enable: false`，不会被模板中的 `true` 强行打开 |

因此，模板中的 `sniffer` 是没有额外图形覆盖时的合理默认值。在 OpenClash 上，修改界面设置后需要重新生成或重载配置；如果想完全按模板控制，就需要关闭相应的配置覆盖，或使用自己的 OpenClash 自定义模板。

域名嗅探不会替换整份规则列表。它只是在连接没有域名、但协议中包含域名信息时补充分流线索，最终仍由现有 `rules` 和策略组决定出口。

## Fake-IP 例外域名

当前 DNS 使用：

```yaml
enhanced-mode: fake-ip
fake-ip-filter-mode: blacklist
```

`fake-ip-filter` 中除了局域网、Tailscale、私有域名和中国域名外，还引用了两个远程文字规则集：

```text
fakeipfilter-cn
fakeipfilter-!cn
```

它们来自 [qichiyuhub/rule](https://github.com/qichiyuhub/rule)，通过 jsDelivr 加载，模板设置为每 24 小时检查一次更新。规则内容由上游维护，通常覆盖 NTP、STUN、系统连通性检测、游戏、推送和部分设备服务等不适合拿到 Fake-IP 的域名。

命中例外列表的域名会保留真实 DNS 解析，不分配 `198.18.0.0/16` 中的 Fake-IP。这样可以减少设备服务、网络检测和部分游戏连接对 Fake-IP 的兼容性问题。

Fake-IP 例外只改变 DNS 解析方式，不会自动把域名改成直连，也不会绕过现有策略组。域名最终走直连还是代理，仍由 `rules` 和策略组决定。

OpenClash 可能还有自己的内置或自定义 Fake-IP 过滤列表。如果 OpenClash 的 DNS/Fake-IP 设置覆盖了订阅中的同名字段，最终以 OpenClash 生成的配置为准；关闭 Fake-IP 模式时，这些 Fake-IP 例外自然不会生效。

## 客户端使用建议

| 客户端 | 建议使用 | 需要注意 |
| --- | --- | --- |
| Clash Meta for Android | `mihomo-substore.yaml` + `populate-groups.js` | Sub-Store 负责把私人节点合入公共模板 |
| Clash Verge Rev | `mihomo.yaml` | 通过本地 Merge / Override 注入私人节点 |
| OpenClash | `mihomo.yaml` 或合成后的完整配置 | 图形界面的 DNS、Fake-IP、嗅探选项可能覆盖 YAML 对应字段 |

遇到分流结果与预期不一致时，先检查客户端生成的最终配置，而不要只看 GitHub 上的公共模板。重点查看 `dns.enhanced-mode`、`dns.fake-ip-filter`、`sniffer.enable` 和相关 OpenClash 覆盖设置。

## Zashboard 访问安全

公共模板保留 `external-controller: 0.0.0.0:9090`，以支持本机、家庭局域网和 Tailscale 访问，但模板不包含真实 secret。实际部署时必须：

1. 通过本地 Override 注入高强度 `secret`。
2. 不将 9090 做公网端口转发。
3. 在主机或路由器防火墙中只允许本机、局域网和 Tailscale 网段访问。

不要把包含真实 secret、节点地址或订阅凭证的最终配置提交到本仓库。
---


## 文件说明

### mihomo.yaml

标准 Mihomo 公共配置模板。

适合：

- Clash Verge Rev
- Mihomo
- 支持 Merge / Override 的客户端

实际节点建议通过客户端本地 Merge / Override 注入。

### mihomo-substore.yaml

专门用于 Sub-Store 的 Mihomo 配置覆写模板。

与 mihomo.yaml 基本一致，但使用：

```yaml
proxies+:
```

这样可以保留 Sub-Store 组合订阅中的真实节点，同时加入公共模板中的：

- DNS
- TUN
- 策略组
- Rules
- Rule Providers

### populate-groups.js

Sub-Store 后处理脚本。

主要作用：

1. 将订阅中的真实节点写入各策略组
2. 按节点名称自动划分地区
3. 自动生成地区节点列表
4. 自动处理重复节点名称

当前支持的地区包括：

- 香港
- 台湾
- 日本
- 新加坡
- 韩国
- 美国
- 英国
- 其他地区

如果订阅中存在多个同名节点，例如：

```text
移动-443-WS-TLS
移动-443-WS-TLS
移动-443-WS-TLS
```

脚本会自动处理为：

```text
移动-443-WS-TLS
移动-443-WS-TLS #2
移动-443-WS-TLS #3
```

这样可以避免 Mihomo / CMFA 出现：

```text
proxy xxx is the duplicate name
```

---

## 推荐架构

### Windows

```text
mihomo.yaml
+
本地 Merge / Override
+
私人 Proxy Provider / 节点
↓
Clash Verge Rev
```

### Android / Clash Meta for Android

推荐配合 Sub-Store 使用：

```text
机场订阅 / 自建节点
↓
Sub-Store 组合订阅
↓
mihomo-substore.yaml
↓
populate-groups.js
↓
完整 Mihomo 配置
↓
Clash Meta for Android
```

---

## Sub-Store 配置方法

在 Sub-Store 中新建：

```text
Mihomo 配置
```

来源选择：

```text
组合订阅
```

然后依次添加两个“脚本操作”。

### 第一个脚本操作

填写：

```text
https://raw.githubusercontent.com/Nickdong123/mihomo-config/refs/heads/main/mihomo-substore.yaml
```

### 第二个脚本操作

填写：

```text
https://raw.githubusercontent.com/Nickdong123/mihomo-config/refs/heads/main/populate-groups.js
```

执行顺序：

```text
组合订阅
↓
mihomo-substore.yaml
↓
populate-groups.js
```

完成后，通过 Sub-Store 生成最终 Mihomo 配置订阅地址。

然后把最终订阅地址导入 Clash Meta for Android 即可。

---

## 为什么需要 populate-groups.js

部分移动端 Mihomo / Clash Meta 客户端在处理：

```yaml
include-all: true
filter:
```

这类动态策略组时，可能无法正确显示实际节点。

populate-groups.js 会在 Sub-Store 输出最终配置之前，直接把真实节点名称写入 proxy-groups 中的 proxies 列表。

这样可以提高 Clash Meta for Android 等移动端客户端的兼容性。

---

## 地区节点自动分类

populate-groups.js 会根据节点名称中的关键词进行地区分类。

例如日本节点可能匹配：

```text
日本
东京
大阪
Japan
JP
🇯🇵
```

香港节点可能匹配：

```text
香港
Hong Kong
HK
🇭🇰
```

其他地区同理。

如果你的机场使用特殊的节点命名方式，可以自行修改 populate-groups.js 中的地区匹配规则。

---

## 隐私说明

本仓库不会保存：

- 机场订阅地址
- Proxy Provider URL
- 节点 IP
- 节点域名
- UUID
- 密码
- Token
- API Key
- Sub-Store 私有地址
- 其他认证信息

私人节点只应该存在于：

```text
本地客户端配置
```

或者：

```text
你自己的 Sub-Store
```

请不要把 Sub-Store 最终生成的完整 Mihomo 配置上传到公开 GitHub 仓库。

因为最终配置中通常会包含：

- 节点服务器地址
- UUID
- 密码
- Reality 参数
- Trojan 密码
- Shadowsocks 密钥
- 其他连接凭证

---

## 仓库文件结构

```text
mihomo-config/
├── README.md
├── VERSION
├── mihomo.yaml
├── mihomo-substore.yaml
└── populate-groups.js
```

### mihomo.yaml

主要用于：

```text
Windows / Clash Verge Rev
```

### mihomo-substore.yaml

主要用于：

```text
Sub-Store
```

### populate-groups.js

主要用于：

```text
Sub-Store 最终节点分组和重复名称处理
```

---

## 适合谁

如果你同时使用：

- Mihomo
- Clash Verge Rev
- Clash Meta for Android
- Sub-Store

并且希望做到：

```text
一套公共规则
+
多个私人订阅
+
Windows / Android 多端复用
+
私人节点不进入 GitHub
```

这个项目可以作为一个比较简单的实现方案。

---

## 使用流程示例

### Windows

```text
GitHub mihomo.yaml
↓
Clash Verge Rev
↓
本地 Merge / Override
↓
注入私人节点
↓
使用
```

### Android

```text
私人订阅
↓
Sub-Store
↓
组合订阅
↓
mihomo-substore.yaml
↓
populate-groups.js
↓
生成完整 Mihomo 配置
↓
Clash Meta for Android
```

---

## 注意事项

### 1. 不要公开最终 Sub-Store 订阅地址

Sub-Store 最终生成的订阅地址属于私人配置。

请不要：

- 提交到 GitHub
- 发到公开论坛
- 放进公开 README
- 分享给不可信的人

### 2. 不要把私人节点写入本仓库

本仓库应该始终保持：

```text
公共模板
+
公共脚本
```

私人数据应留在：

```text
Sub-Store
```

或者：

```text
本地客户端
```

### 3. 节点命名规则不同可能影响地区分类

不同机场的节点命名方式可能不同。

如果发现某些节点没有进入正确地区，可以修改：

```text
populate-groups.js
```

中的地区匹配正则。

---

## 更新方式

当前版本记录在：

```text
VERSION
```

正式版本使用 Git tag，例如：

```text
v1.0.0
```

公共模板可以直接使用以下地址：

```text
https://raw.githubusercontent.com/Nickdong123/mihomo-config/main/mihomo.yaml
https://raw.githubusercontent.com/Nickdong123/mihomo-config/main/mihomo-substore.yaml
```

如果需要固定某个经过验证的版本，可以把 `main` 换成对应的版本 tag，例如 `v1.0.0`。使用 tag 可以避免后续规则或配置变化立即影响正在运行的客户端。

公共规则或策略组需要调整时：

修改：

```text
mihomo.yaml
```

同时把需要的修改同步到：

```text
mihomo-substore.yaml
```

如果只是节点分组逻辑变化，则修改：

```text
populate-groups.js
```

即可。

---

## 免责声明

本项目仅提供 Mihomo 配置模板和配置处理方法。

请根据当地法律法规以及相关服务条款合理使用。

本仓库不提供：

- 代理节点
- 机场订阅
- VPN 服务
- 商业代理服务

用户需要自行准备合法可用的网络服务。

---

## License

建议使用 MIT License。

如果希望其他人可以自由：

- 使用
- 修改
- Fork
- 二次开发
- 分发

MIT License 是比较合适的选择。
