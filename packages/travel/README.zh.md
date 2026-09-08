---
description: "旅行展示工具的包目录：把已研究的地点与路线转化为持久化交互结果。"
kind: "package-group"
---

# travel/ — 交互式旅行结果

[English](README.md) | 中文

## 概述

travel 组把已经研究好的地点集合转化为可重放的交互结果。hotel-map 包通过可配置的免费服务解析已知酒店地址，可选地比较每家酒店到一个目的地的路线，并把完整地图载荷存入所属 Session。它不搜索酒店价格、可订状态、图片或预订。

## 目录

- [包](#packages)
- [相关文档](#related-documentation)
- [开发备注](#dev-note)

-----

<a id="packages"></a>
## 包

| 包 | 职责 | ctx 键 |
|---|---|---|
| [`tool-hotel-map/`](tool-hotel-map/README.zh.md) | 构建持久化酒店标点，并可选比较驾车或公交路线 | 在 `ctx.tools` 上注册 `hotel_map` |

<a id="related-documentation"></a>
## 相关文档

- [酒店地图浏览器渲染器](../client/ui-hotel-map/README.zh.md)——展示持久化地图事件，不会重放服务请求。
- [生成的工具目录](../../docs/tool-catalog.zh.md)——记录模型可见的工具 schema。

<a id="dev-note"></a>
## 开发备注

无。
