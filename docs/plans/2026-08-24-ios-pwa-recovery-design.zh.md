# iOS PWA 恢复设计

[English](2026-08-24-ios-pwa-recovery-design.md) | 中文

## 目标

当 iOS 挂起已安装 Web 应用或使实时连接失效时，应用为用户提供明确恢复路径。恢复会保留当前选择的 Session 和未发送文字草稿，在不重新发送输入的情况下重连；新的连接代次无法稳定后，再升级为整页刷新。

第一版不支持离线执行 agent 工作，不缓存 API 响应或 Session 历史，也不能在 iOS 终止 Web 应用后继续执行 JavaScript。

## 连接恢复

连接服务公开当前 `connecting`、`connected` 或 `reconnecting` 状态，并提供一个淘汰当前 WebSocket 代次的操作。普通连接控制器仍是两条下行流及其重同步的唯一所有者。恢复请求不会创建第二个控制器、发送 prompt、取消 turn 或修改 Session 历史。

一个 root scope Client Plugin 向 `shell.overlay` 添加紧凑恢复控件。独立显示模式始终可以触达这个控件；连接未就绪时，它显示状态文字。第一个操作会请求新的连接代次。连接在限定时间内仍不可用时，控件会提供整页刷新。应用从较长的后台状态返回时请求新代次；短暂打开通知栏或应用切换器不会重建连接。

Session 运行时已经持久化当前 Session 选择，对话 store 已经按 Session 持久化文字草稿。刷新恢复复用这些所有者，不增加第二种持久化格式。只存在运行时中的图片草稿不在恢复范围内，因为浏览器 `File` 对象和 object URL 无法安全恢复。

## 应用外壳缓存

Web 构建产物包含 Service Worker，并在应用启动后注册。Worker 缓存带版本的前端资源、带修订参数的插件包、manifest 和图标。页面导航及全部 `/api` 请求保持 network-only，因此认证、Session 历史、模型响应和连接状态不会来自缓存。

新 Worker 激活时会删除不属于自己的缓存代次。缓存写入失败不会阻止安装或应用启动。恢复控件通过普通网络导航执行刷新，因此会访问当前已认证部署，而不是缓存的 HTML。

## 移动端呈现

恢复控件遵循 iOS safe area，触控目标至少为 44 CSS 像素，并且不会覆盖 composer。连接正常时显示小图标按钮；重连和需要刷新时展开为带文字的状态条。组件使用现有主题 token，并通过 locale 服务提供中文和英文文案。

## 验证

连接测试证明显式恢复只淘汰一个代次，并在不启动第二个循环的情况下进入新的已连接代次。客户端测试覆盖已连接、重连、前台恢复、超时和刷新状态。Web 构建测试验证 manifest、Service Worker、注册和 network-only 排除规则。组合浏览器 fixture 验证强制断流会显示恢复界面，能够重新连接，保留当前 Session 和草稿，并在 iPhone viewport 下保持可用。
