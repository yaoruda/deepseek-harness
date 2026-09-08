---
description: "可重放的 MapLibre 展示，用于持久化酒店标点、路线几何、出行时间和服务署名。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-hotel-map

[English](README.md) | 中文

## 概述

用于持久化 `travel-map/show` 事件的浏览器渲染器。插件注册一个 `hotel-map` 聊天 Conversation Node，并通过 MapLibre 渲染完整载荷；历史重放不会再次请求地理或路线服务。

## 目录

- [展示](#presentation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="presentation"></a>

## 展示

响应式节点显示带编号的酒店标点、可选目的地标点、可切换的驾车或公交路线、时长与距离、未解析地址以及服务署名。宽屏将列表置于地图旁，窄屏将地图置于适合触摸的列表上方。无法操作地图画布的键盘用户仍可通过列表选择酒店。

浏览器会为当前视口请求 OpenStreetMap 栅格瓦片。坐标和路线只来自持久化事件。卸载客户端插件会移除 Conversation Definition、渲染器、字典和注入的 CSS。

<a id="model-experience"></a>
## 模型体验

### 持久化地图节点

#### 模型看到的内容

渲染器不增加模型可见内容。`@deepseek-ai/dsh-tool-hotel-map` 拥有 `hotel_map` 工具和持久化事件。

#### Token 影响

直接 Token 影响为零；所属 Host 工具贡献 schema 和结果文本。

#### KV Cache 影响

纯浏览器渲染器不直接影响 token 或 KV Cache。

## 已知限制与延后工作

<a id="known-limitations-and-deferred-work"></a>

- **栅格瓦片端点固定** — 初始渲染器使用 OpenStreetMap 公共瓦片端点；可发布的高频部署需要可配置或自建瓦片源。
- **MapLibre 包体积** — 客户端插件内联 MapLibre，启用后在传输压缩前约增加 1.5 MB。
- **不含离线瓦片** — 重放不会请求地址和路线服务，但绘制底图仍需访问瓦片服务。

<a id="dev-note"></a>
### 开发备注

无。
