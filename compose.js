// Sub-Store Mihomo 配置覆写
// 作用：保留“组合订阅”生成的真实节点。
// 注意：本文件不包含任何机场订阅 URL、UUID、密码等私密信息。

function main(config) {
  if (!config || typeof config !== "object") {
    config = {};
  }

  // Sub-Store 的 Mihomo 配置来源选择“组合订阅”后，
  // 实际节点已经在 config.proxies 中。
  var sourceProxies = Array.isArray(config.proxies)
    ? config.proxies
    : [];

  // 去掉可能已经存在的内建节点，避免重名。
  var subscriptionProxies = sourceProxies.filter(function (proxy) {
    if (!proxy || !proxy.name) return false;

    return proxy.name !== "直连" && proxy.name !== "拒绝";
  });

  // 加回公共配置需要的两个内建节点。
  config.proxies = [
    {
      name: "直连",
      type: "direct"
    },
    {
      name: "拒绝",
      type: "reject"
    }
  ].concat(subscriptionProxies);

  return config;
}
