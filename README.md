# mihomo-config

一套适用于 Mihomo / Clash Meta 的公共配置模板，并提供基于 Sub-Store 的移动端配置合成方案。

## 项目用途

这个项目主要解决下面这类场景：

- Windows 上使用 Clash Verge Rev，可以通过 Merge / Override 注入私有节点
- Android 上使用 Clash Meta for Android（CMFA），不方便直接做类似的本地 Merge
- 希望把公共规则、DNS、TUN、策略组与自己的订阅节点分离
- 不希望把机场订阅、节点地址、UUID、密码等敏感信息提交到 GitHub

本仓库只保存公共配置和处理逻辑，不包含任何私人节点信息。

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
