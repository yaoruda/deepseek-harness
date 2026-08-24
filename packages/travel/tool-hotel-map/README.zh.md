# @deepseek-ai/dsh-tool-hotel-map

[English](README.md) | 中文

使用免费服务为具备所属 Agent 会话的调用生成酒店地址地图。插件注册 `hotel_map`，解析有上限的酒店列表，可选地比较每家已定位酒店到一个目的地的路线，并在所有服务请求结束后追加一条完整的 `travel-map/show` 事件。

## 配置

`userAgent` 为必填项，必须标识部署及联系网址或地址。`geocoderBaseUrl`、`drivingBaseUrl` 和 `transitBaseUrl` 分别选择兼容 Nominatim、OSRM 和 Transitous MOTIS 的服务。`requestTimeoutMs`、`geocodeIntervalMs` 和 `maxHotels` 限制网络工作量。随附组合使用适合低频调用的社区端点；高频部署应将这些字段指向自建服务。

## 结果与持久化

地址解析或路线查询失败时，对应酒店仍保留在结果中。路线状态区分有效行程（`available`）、没有可用行程（`unavailable`）和服务失败（`failed`）。事件保存标点、路线几何、时长、距离、诊断和署名，因此历史重放不会再次请求服务。

地址解析串行执行，遵守配置的调用间隔，并在进程内缓存成功坐标。每个请求都携带取消信号、超时和配置的 User-Agent。服务凭据和不受限的原始响应不会持久化。

## 模型体验

### `hotel_map` 工具

#### 模型看到的内容

模型看到一个有酒店数量上限的地址地图工具，包含必填 `hotels` 以及可选 `destination` 和 `departure_time` 字段。结果报告 `mapId`、`resolvedHotels`、`unresolvedHotels` 和 `destinationResolved`；持久化地图事件供客户端使用，不额外进入模型上下文。

#### Token 影响

插件启用时工具 schema 固定存在。每次成功调用向保留的工具历史追加一段简短结果。

#### KV Cache 影响

固定工具 schema 保持可复用前缀。调用只追加普通工具历史，不替换先前请求 token。

## 已知限制与延后工作

- **社区服务容量** — 公共默认服务按尽力原则提供，要求署名，不适合未经协调的高频使用。
- **开放数据覆盖** — 公交依赖公开时刻表；`unavailable` 并不能证明当地没有公共交通。
- **进程内地址缓存** — 重启会丢失缓存坐标；需要持久去重的部署必须增加服务端缓存。
- **不含酒店交易数据** — 工具接收已知酒店，不搜索价格、库存、可订状态、图片或预订。
