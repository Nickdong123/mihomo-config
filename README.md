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

### `mihomo.yaml`

标准 Mihomo 公共配置模板。

适合：

- Clash Verge Rev
- Mihomo
- 支持 Merge / Override 的客户端

实际节点建议通过客户端本地 Merge / Override 注入。

---

### `mihomo-substore.yaml`

专门用于 Sub-Store 的 Mihomo 配置覆写模板。

与 `mihomo.yaml` 基本一致，但使用：

```yaml
proxies+:
