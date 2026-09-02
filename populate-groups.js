function main(config) {
  var proxies = Array.isArray(config.proxies) ? config.proxies : [];
  var groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];

  // 所有真实节点
  var nodes = proxies
    .map(function (p) { return p && p.name; })
    .filter(function (name) {
      return name && name !== "直连" && name !== "拒绝";
    });

  var rules = {
    "香港": /广港|香港|hong ?kong|🇭🇰|(^|[^a-z])hk([^a-z]|$)/i,
    "台湾": /广台|台湾|台灣|tai ?wan|taiwan|🇹🇼|(^|[^a-z])tw([^a-z]|$)/i,
    "日本": /广日|日本|川日|东京|大阪|泉日|埼玉|沪日|深日|japan|🇯🇵|(^|[^a-z])jp([^a-z]|$)/i,
    "新加坡": /广新|新加坡|坡|狮城|singapore|🇸🇬|(^|[^a-z])sg([^a-z]|$)/i,
    "韩国": /韩国|韓國|首尔|首爾|korea|🇰🇷|(^|[^a-z])kr([^a-z]|$)/i,
    "美国": /美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|西雅圖|纽约|紐約|united ?states|america|🇺🇸|(^|[^a-z])us([^a-z]|$)/i,
    "英国": /英国|英國|伦敦|倫敦|united ?kingdom|britain|🇬🇧|(^|[^a-z])uk([^a-z]|$)/i
  };

  function matched(region) {
    return nodes.filter(function (name) {
      return rules[region].test(name);
    });
  }

  function otherNodes() {
    return nodes.filter(function (name) {
      for (var key in rules) {
        if (rules[key].test(name)) return false;
      }
      return true;
    });
  }

  groups.forEach(function (group) {
    if (!group || !group.name) return;

    var list = null;

    if (group.name === "所有-手动" || group.name === "所有-自动") {
      list = nodes;
    } else if (group.name === "其他地区-手动" || group.name === "其他地区-自动") {
      list = otherNodes();
    } else {
      for (var region in rules) {
        if (
          group.name === region + "-手动" ||
          group.name === region + "-自动"
        ) {
          list = matched(region);
          break;
        }
      }
    }

    if (list !== null) {
      group.proxies = list.length ? list : ["直连"];

      // 不再依赖 CMFA 的 include-all/filter
      delete group["include-all"];
      delete group.filter;
    }
  });

  config["proxy-groups"] = groups;
  return config;
}
