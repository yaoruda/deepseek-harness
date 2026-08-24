# Agent Note：PWA 连接恢复

Status: implemented

[English](2026-08-24-pwa-connection-recovery.md) | 中文

## 问题

iOS 主屏幕 Web App 没有浏览器刷新控件。WebSocket 传输在后台挂起后失效时，现有自动重试循环可能无法向用户提供立即恢复操作。整页刷新还必须避免丢失当前选择的 Session 和未发送文字草稿。

## 决策

`dsh-client-connection` 将粗粒度连接状态公开为 observable source，并增加 `recover()`。恢复会标记当前连接代次需要立即淘汰，中止它的实时流或正在进行的重试等待，再由现有唯一所有者循环创建替代代次。它不会启动第二个循环或并行 WebSocket 对。

`@deepseek-ai/dsh-client-ui-connection-recovery` 向 `shell.overlay` 贡献一个条目。窄屏和独立显示模式始终保留一个 44 像素的紧凑恢复按钮。连接重试时，它展开为本地化状态提示和立即重连操作；只有逻辑恢复持续六秒仍不可用时才显示整页刷新。应用在后台至少十秒后回到前台时也会淘汰旧代次，以处理经过 iOS 挂起但没有报告关闭的连接。

Web 应用注册同源 Service Worker。它以 cache-first 方式处理带版本的 `/assets/` 和 `/plugins/` 资源，以及安装元数据和图标。页面导航、`/api/` 请求和 `/plugins/events` 始终由网络负责，因此 Session 响应、事件流和可能过期的 HTML 应用外壳都不会进入缓存。manifest 使用 standalone 显示元数据，并提供 180 像素 Apple touch 图标。

刷新恢复复用现有状态所有者：`dsh.sessions.current` 保存当前选择的 Session，`dsh.conversation.chat` 保存各 Session 未发送文字。只存在运行时中的图片草稿仍无法恢复，因为它们的 object URL 不能跨文档替换使用。

## 曾考虑的替代方案

**应用每次可见时都刷新。** 否决，因为短暂切换应用也会反复替换健康文档并中断当前渲染。

**由界面打开一组独立恢复 WebSocket。** 否决，因为这会拆分传输流所有权、产生重复帧，并让用户操作触发资源释放竞态。

**缓存页面导航或 API 响应，以支持离线对话。** 否决，因为本版本提供恢复能力而不是离线能力。缓存 Session 数据会引入第二个持久化所有者，也可能展示过期的认证内容。

## 后果

iOS 安装态用户无需离开应用即可恢复失效连接，整页刷新后会回到当前 Session，并保留未发送文字草稿。静态插件包可以从 Service Worker 缓存重新打开，但实时数据始终来自 Host。应用不是离线 agent：发送消息、历史修复、模型调用和工具仍然需要服务器。缓存格式变化必须重命名 `dsh-shell-v1`，运行时附件则需要独立的持久草稿设计。
