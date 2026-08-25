# @deepseek-ai/dsh-client-ui-skin-presets

[English](README.md) | 中文

浏览器本地的整页固定皮肤插件。它通过 `ThemeRuntime` 注册机械未来与自然莫兰迪定义，通过 `body[data-dsh-skin]` 投影当前选择，并在通用设置中贡献默认、机械未来和自然莫兰迪三个选项。主题状态、`--dsw-*` token 投影、配色模式元数据与 DOM 调色板应用仍只由 ThemeRuntime 和 ui-layout 持有。

插件接受 `hostnameDefaults`，即由精确域名与皮肤组成的列表。它的 Host 半边会在页面引导数据中发布经过校验的列表，因此浏览器插件不依赖 Loader 转发配置。随附的 Web bundle 把 `assistant.ruda.work`、`localhost`、`127.0.0.1` 与 `[::1]` 配置为机械未来，把 `ailin.ruda.work` 配置为自然莫兰迪；其他域名默认采用原生主题。已保存的默认是对域名选择的显式退出，并通过 ThemeRuntime 的 `system` 偏好解析。在已有外观设置中选择浅色、深色或跟随系统时，固定皮肤设置也会回到默认。

经过校验的偏好保存在当前浏览器配置的 `dsh.skin-preset.v1` 下。它有意与受保护的 Host settings API 分离，因此远程浏览器不需要访问凭据或模型提供方配置就能切换皮肤。存储被拒绝或数据格式错误时会回退到域名默认值，不会阻止当前文档工作。

## 模型体验

无。皮肤选择只改变浏览器呈现，不会增加模型输入、工具 schema、提示词或 Session 事件。

#### KV Cache 影响

无。切换皮肤不会发起轮次，也不会重新构建模型请求。

## 已知限制与后续工作

- 偏好只保存在浏览器配置中，不会在设备之间或两个认证站点之间同步。
- 框架加载页会在客户端插件激活前使用内建的浅色或深色调色板；ThemeRuntime 注册固定皮肤后才会应用皮肤。
- 地图瓦片和外部图片等功能自有的字面媒体颜色不会随语义 UI token 重新着色。
