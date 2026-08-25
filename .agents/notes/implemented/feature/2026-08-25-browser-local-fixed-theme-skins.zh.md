# Agent Note：浏览器本地固定主题皮肤

状态：已实现

[English](2026-08-25-browser-local-fixed-theme-skins.md) | 中文

## 问题

Web 客户端已有浅色、深色和跟随系统选项，但两个认证部署仍呈现相同的中性产品调色板。私人助理站点与 Ailin 站点需要不同的默认识别，同时远程浏览器不能仅为保存呈现偏好就获得受保护的 Host settings API 访问权。用户还需要显式把任一部署恢复到产品默认样式。

## 决策

`@deepseek-ai/dsh-client-ui-skin-presets` 持有两份固定 ThemeRuntime 定义和一项浏览器本地偏好。机械未来是带青色和紫色强调色的深色机械调色板；自然莫兰迪是由暖中性色和植物色组成的浅色低饱和调色板。两者只覆盖语义 `--dsw-*` token；ThemeRuntime 与 ui-layout presenter 继续持有解析状态、DOM token 应用、原生 `color-scheme` 和浏览器主题色元数据。

偏好使用经过校验的字符串键 `dsh.skin-preset.v1`，取值为 `default`、`cyberpunk` 或 `morandi`。插件接受经过校验的 `hostnameDefaults` 列表，而不把部署域名写进代码。它的 Host 半边通过结构化页面注入表序列化该列表，因为客户端模块图有意只携带包身份和依赖关系，不携带 Loader 配置。随附的 Web bundle 把 `assistant.ruda.work` 和回环地址映射为机械未来，把 `ailin.ruda.work` 映射为自然莫兰迪；未知域名采用默认。已保存的默认是一项显式选择，它映射到 ThemeRuntime 的 `system` 偏好，而不会重新应用域名选择。

插件在 `settings.general.item` 中注册由功能持有的设置行。选择固定皮肤会用其已注册 id 调用 `ThemeRuntime.setTheme()`。已有外观设置选择浅色、深色或跟随系统时，`theme/change` 投影会把固定皮肤状态切到默认并保存这次退出。插件随 Cordis fiber 移除设置行、主题定义和 `body[data-dsh-skin]` 投影。

ThemeRuntime 把已注册的进程内主题视为当前浏览器选择，因此 Host 随后采纳上一次内置偏好时不能替换它。显式的外观设置操作仍会用内置 id 调用 `setTheme()` 并立即取得控制权。ui-layout 呈现器会复用 PWA 外壳已有的 `meta[name="theme-color"]` 节点，并在释放时恢复其原始内容，而不会创建重复的浏览器界面元数据。

## 考虑过的替代方案

**把皮肤保存在 Host settings 中。** 远程浏览器不能使用只允许回环访问的 settings transport。扩大该 API 会把无害的呈现状态与模型提供方凭据和授权敏感配置混在一起。

**拆分两个 Web 应用或维护部署专用 CSS。** 两份构建会逐渐漂移，并提高每次上游更新和本地迁移的成本。由 bundle 配置的域名默认策略只需要一份构建产物和一个设置表层。

**替换内建外观设置行。** 浅色、深色和跟随系统仍是有用的独立选项，并由 ui-theme 持有。固定皮肤设置行与它并列组合，并监听相同的权威运行时。

**增加组件专用样式覆盖。** 布局、排版和功能 CSS 会让每套皮肤的维护成本很高。语义主题 token 在保留组件约定的同时形成整页识别。

## 结果

同一份 Web 构建产物会在助理站点和本地站点以机械未来风格启动，在 Ailin 站点以莫兰迪风格启动。每个浏览器都能在不调用受保护 RPC 的情况下切换三个选项，显式默认选择也能跨刷新保留。该选择不会跨设备同步。固定 token 在客户端插件树激活后生效，PWA 元数据在主题切换期间保持单一，地图瓦片等字面外部媒体不在调色范围内。
