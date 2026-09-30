# 规则来源审核

审核日期：2026-09-30。此次结论来自规则文件、上游发布数据和 Google 官方文档的静态对照，没有使用用户的实际连接记录，也没有进行应用功能测试。

## 比较口径与来源

主分支基线：`d3e768163359947075eedc0dd63ce4b2b94632b1`。

对照的发布快照：

| 来源 | 分支 | 提交 |
| --- | --- | --- |
| MetaCubeX/meta-rules-dat | meta | `dff97e403383374dbfe39792d3dfdcf6717e385e` |
| blackmatrix7/ios_rule_script | master | `c9b2158695596a1ba866adcf74def8d5ab348e25` |
| liandu2024/clash | main | `681d30136e2d9b79fc93d310638cb7eca1e236e9` |
| ifanrBook/ClashConfig | main | `c5b2d51d9a28abe0cb7bcda1161b33c2e21ab18d` |
| sev7enshare/Clash-Config | main | `e63da28ae014b581ed4446fcdb8b1e744c2c14c3` |
| qichiyuhub/rule | main | `a91ff49f216df0da6952f5607430af55647a729c` |

MetaCubeX 的域名 MRS 以同一发布快照下的 `.list` 配套文件进行内容对照；不以 V2Fly 分类父文件的直接行数判断完整覆盖。分类父文件会引用其他文件，需要看展开后的发布内容。

区分三种差异：完整的后缀匹配未覆盖、根域名或具体主机名未覆盖、IP/关键词等无法由纯域名分类替代的匹配。域名被收录、规则最后修改时间较新，均不能证明它仍是应用的实际必要依赖。

## 开发服务：分类作为主体，保留开发域名补充

[完整 category-dev 发布列表](https://github.com/MetaCubeX/meta-rules-dat/blob/dff97e403383374dbfe39792d3dfdcf6717e385e/geo/geosite/category-dev.list)有 665 条记录，覆盖 Go、Rust、Python、Docker、JetBrains、GitLab 等生态。

- npm 原列表的三条后缀 `npmjs.org`、`npmjs.com`、`npm.community` 均已包含。早期仅查看父列表后得出的“npm 未覆盖”结论已纠正，两条重复补充已移除。
- Python 原列表的六条域名匹配均被覆盖。
- 模板补充 13 条后缀：`dockerhub.com`、`jetbrains.io`、`jetbra.in`、`atlassian.com`、`elastic.co`、`elastic.com`、`jitpack.io`、`maven.org`、`mvnrepository.com`、`postman-echo.com`、`sonatype.org`、`spring.io`、`spring.net`。
- 这些补充用于延续旧列表的开发服务匹配，不代表逐一确认了域名当前的所有权、可用性或每个子域名的用途。
- 旧 Docker 列表的三个 CloudFront 主机已有前置 Amazon 域名规则覆盖。Apple、Microsoft、GitHub、AI 等前置专用规则继续优先。
- 旧 Developer 列表中的 `medium.com`、`reddit.com`、`macosicons.com`、`debian.com` 不补入开发组，交由后续通用规则处理。这是开发组范围的调整，并非声明这些域名已停用。

## AI：合并来源，暂时保留共享服务兼容匹配

原 Claude、Copilot、Gemini、Meta AI 四个小列表共 21 条规则。与 [category-ai-!cn 发布列表](https://github.com/MetaCubeX/meta-rules-dat/blob/dff97e403383374dbfe39792d3dfdcf6717e385e/geo/geosite/category-ai-%21cn.list)比较后，模板保留九条未被完整覆盖的匹配，其余依靠分类集覆盖。

| 保留的补充 | 原来源 | 处理依据 |
| --- | --- | --- |
| `gemini-pa.googleapis.com` | Gemini | 原匹配暂予保留，避免只依据分类集删掉接口域名 |
| `aistudio-pa.clients6.google.com` | Gemini | 同上 |
| `metademolab.com` | Meta AI | 分类未覆盖，保留原匹配 |
| `genspark.ai` | Meta AI | 同上 |
| `skywork.ai` | Meta AI | 同上 |
| `googleusercontent.com` | Gemini | 共享资源域名，保留兼容范围并注明影响 |
| `android.googleapis.com` | Gemini | 共享 Google/Android 服务，保留兼容范围 |
| `bing.com` | Copilot | 整域范围超出 Copilot，暂时保留原匹配 |
| `cdn.usefathom.com`（精确主机） | Claude | 共享服务，暂时保留原匹配 |

### 关于 googleusercontent.com 的判断

[Google Workspace 官方防火墙文档](https://knowledge.workspace.google.com/admin/drive/drive-and-sites-firewall-and-proxy-settings?hl=en)将 `*.googleusercontent.com` 列为 Drive、Docs、Sites 所用的主机。

[Google Drive 官方下载说明](https://support.google.com/drive/answer/2423534?hl=en)也指出，针对 `googleusercontent.com` 的 Cookie 阻止设置可能影响 Drive 下载。这些证据能确认它并非 Gemini 独占域名。

模板使用 `DOMAIN-SUFFIX,googleusercontent.com,AI服务` 且放在 Google 规则前，因此这些共享资源只要未被更早规则匹配，就进入 AI 组。依据 [Mihomo 规则说明](https://wiki.metacubex.one/config/rules/)，这是规则优先级和后缀匹配的结果。

**能够确认的是匹配范围偏宽；不能确认的是删除整域规则对 Gemini 功能无影响。** [Gemini API 官方服务端点](https://ai.google.dev/api/all-methods)为 `generativelanguage.googleapis.com`，但 API 文档不能替代 Gemini 网页、移动应用、附件、生成图片等功能的完整依赖清单。

此次保留原范围。后续收窄需要在实际客户端区分 Gemini 与 Drive 等服务的连接，观察上传、生成图片、展示、下载等操作；共享同一主机时，单靠域名规则也不能区分请求属于哪个产品。

### CDN 更新差异

审核时，主分支 52 个规则地址均能下载，其中 51 个与对应 GitHub 快照字节一致。AI 兜底的 `.mrs` 不一致。

进一步比较 CDN 上同名 `.list`，比 GitHub 快照少六条：

```text
geminiweb-pa.clients.google.com
geminiweb-pa.clients6.google.com
+.metaaivm.com
+.muse.ai
+.opencode.ai
+.labstailwind.pa.googleapis.com
```

这些现象支持“CDN 更新可能滞后”的推断；未解码 CDN MRS，不能断言二进制文件缺少的内容恰好也是这六条。AI 分类改为直接读取 GitHub 的 `meta` 分支，其他下载来源保持现状。直读 GitHub 仍依赖本地网络能访问该地址。

## 游戏：暂不整体替换

域名根主机的静态对照：

| 旧列表 | 对应 MetaCubeX 厂商分类的差异 |
| --- | --- |
| Epic | 缺少共享客服域名 `helpshift.com` |
| EA | 缺少 `eaasserts-a.akamaihd.net`、`originasserts.akamaized.net`，是否仍有效尚未确认；另有后缀范围收窄 |
| UBI | 根主机均覆盖，但部分后缀匹配变为精确主机匹配 |
| PlayStation | 缺少 `playstationnetwork.com` |
| Nintendo | 缺少三个域名，另有一条 IP 规则不能由 GeoSite 替代 |
| Blizzard | 缺少 16 个根主机或域名，另有 23 条 IP 规则不能由 GeoSite 替代 |

[暴雪旧列表](https://github.com/blackmatrix7/ios_rule_script/blob/c9b2158695596a1ba866adcf74def8d5ab348e25/rule/Clash/Blizzard/Blizzard.list)包含国服及网易相关资源匹配。更大的 `category-games` 也不能完整接住旧列表。保留现有厂商规则，差异的必要性有实际依据后再替换。

## 通用代理与直连：已定位问题，删除需要实际依据

[ifanrBook Proxy 列表](https://github.com/ifanrBook/ClashConfig/blob/c5b2d51d9a28abe0cb7bcda1161b33c2e21ab18d/list/proxy.list)包含 291 条规则：146 条后缀、5 条关键词、140 条 IP 规则。命名为 `Proxy / Domain` 不代表其内容只有域名。

- 混有个人站点、Tracker、IP/DNS 检测站点等用途，内容最后修改于 2025-09-09；这说明需要审查，不直接证明整份列表失效。
- 与 Globe 存在 20 条完全相同的规则，但也有未被 Globe/GFW 覆盖的域名和 IP。删除整个来源不能保证原分流保持一致。
- `rarbg.to`、`itzmx.com`、`ip111.cn`、`browserleaks.com`、`ldmnq.com`、`piaohua.com` 在后续 Direct/CN 也有匹配；应逐项结合前置服务规则和实际连接确定期望出口。
- Globe 与 Direct 的相同后缀包括 `simplecd.me`、`synology.com` 和三条 PlayStation 域名。PlayStation 已有前置 Game 规则；另外两个后置直连匹配会被前置 Globe 匹配挡住。

本轮保留这些来源与顺序，避免在缺少实际用途依据时删除或重排。后续优先记录上述交叉域名及 Proxy IP 的实际命中，再决定保留哪些补充、移除哪些 IP，以及这些交叉域名的出口。

## 本轮变更范围

- 两份模板同步完善开发分类及补充，修正 npm 覆盖说明。
- 两份模板删除四个 AI 小列表提供者，以分类集及九条模板补充承接；共享服务规则暂时保留。
- AI 分类下载地址改为 GitHub 原始文件地址。
- 游戏、通用 Proxy/Globe/GFW/Direct 的来源与顺序本轮没有调整。
- 配置的解析、核心加载以及应用实际功能尚未测试。
