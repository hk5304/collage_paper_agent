# 前端接口地址修复说明

本文档用于指导前端把构建产物中的硬编码后端地址统一收敛，确保前端页面通过 `8.136.35.215` 正常访问后端服务，并且后续重新构建时不会再次把地址打死到旧域名或旧端口。

## 现状

- 前端静态站点部署在 `http://8.136.35.215:8007`
- 后端 FastAPI 服务实际监听在 `http://8.136.35.215:8006`
- 当前构建产物里存在硬编码地址，例如：
  - `http://8.136.35.215:8006`
  - `hzapi.xin`
- 这些地址分散在多个打包后的 JS 文件中，不能手工逐个改产物，必须回到前端源码统一处理后再重新构建

## 目标

前端只保留一处接口基址配置，所有请求、下载、预览、文件访问都从这一个配置读取。发布后前端页面应满足：

- 页面地址使用 `http://8.136.35.215:8007`
- API 请求能稳定访问 `http://8.136.35.215:8006`
- 不再出现 `hzapi.xin`
- 不再在构建产物中散落多个后端地址

## 推荐方案

推荐把前端接口地址改成“统一配置 + 重新构建”的方式，不要直接改 `assets/` 里的生成文件。

### 方案 A：继续直连后端 8006

适合当前部署方式。前端保持跨端口请求后端，所有请求统一指向：

```text
http://8.136.35.215:8006
```

需要保证后端 CORS 允许前端源：

```text
http://8.136.35.215:8007
```

### 方案 B：改成同源反代

如果你们后续想完全避免跨端口和 CORS，可以让前端请求都改成相对路径，比如：

```text
/api/v1
/doc
/uploads
```

然后由 8007 上的 Nginx 统一反代到后端 8006。

这种方式更稳，但需要同时改前端请求地址和 nginx 配置。

## 前端需要改哪里

请把所有后端地址统一收敛到一个配置文件或环境变量里，不要在组件代码里直接拼地址。

### 1. 请求基址

把类似下面的写法统一替换掉：

```js
const baseURL = "http://hzapi.xin:8006"
const baseURL = "http://8.136.35.215:8006"
```

建议改成环境变量：

```ts
// request.ts / config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://8.136.35.215:8006"
```

如果采用同源反代，则改成：

```ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1"
```

### 2. 文件下载和预览地址

下面这些类型的地址也要统一处理，不要和接口基址分开写死：

```text
/doc/essay/...
/doc/attachment/...
/uploads/...
```

建议做法：

- 普通 API 请求走 `API_BASE_URL`
- 文件下载和预览也走同一个 `API_BASE_URL` 或者单独的 `FILE_BASE_URL`
- 如果后端返回的是相对路径，前端只负责拼接一次，不要在多个组件里重复拼接

### 3. 搜索并替换所有硬编码

在前端源码里搜索下面这些关键字：

```text
hzapi.xin
8.136.35.215:8006
localhost:8006
127.0.0.1:8006
baseURL
API_URL
VITE_API
```

原则是：

- 只允许一个总入口配置接口地址
- 业务组件不要直接写完整后端 URL
- 打包后的 `assets/` 目录不要手工补丁修地址，要重新构建

## 推荐代码结构

下面是一个可维护的写法示例。

```ts
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://8.136.35.215:8006"

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || API_BASE_URL
```

```ts
// src/utils/request.ts
import { API_BASE_URL } from "@/config/api"

export function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${API_BASE_URL}${path}`
}
```

```ts
// 业务代码里只写相对路径
request.get("/api/v1/papers/list")
request.post("/api/v1/materials/upload", formData)
```

如果你们要做同源反代，把 `API_BASE_URL` 改为 `/api/v1`，其余业务代码不用再动。

## 打包配置建议

### .env.production

如果继续直连 8006：

```env
VITE_API_BASE_URL=http://8.136.35.215:8006
VITE_FILE_BASE_URL=http://8.136.35.215:8006
```

如果改成同源反代：

```env
VITE_API_BASE_URL=/api/v1
VITE_FILE_BASE_URL=/
```

### Vite 配置

确保构建时不会把旧域名写死进产物：

```ts
// vite.config.ts
export default defineConfig({
  define: {
    __APP_API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL),
  },
})
```

更推荐直接使用 `import.meta.env`，避免手工二次注入。

## 如果只剩下构建产物

如果当前仓库只有 `assets/` 这类构建结果，没有源码，请不要直接在打包 JS 里批量改字符串。原因是：

- 文件名带 hash，重新构建后会变化
- 产物里往往有多处复制地址，容易漏改
- 以后再次构建时改动会被覆盖

正确做法是：

1. 找到前端源码仓库
2. 修改统一配置入口
3. 删除所有硬编码后端地址
4. 重新构建
5. 用新产物替换线上静态文件

## 验证方式

前端改完并重新构建后，请按下面顺序验证：

1. 打开 `http://8.136.35.215:8007`
2. 登录后检查网络请求是否发向 `8.136.35.215:8006` 或 `/api/v1`
3. 打开浏览器开发者工具，看是否还有 `hzapi.xin` 请求
4. 测试以下接口是否正常返回：

```text
GET  /api/v1/users/login
GET  /api/v1/papers/list
GET  /api/v1/materials/names
GET  /openapi.json
```

5. 如果是跨端口直连，请确认响应头包含允许前端源：

```text
Access-Control-Allow-Origin: http://8.136.35.215:8007
```

## 最终建议

- 短期：继续使用 `http://8.136.35.215:8006` 作为统一 API 基址，修掉所有 `hzapi.xin`
- 中期：把前端改成相对路径请求，由 8007 的 Nginx 反代到 8006
- 长期：把接口地址完全配置化，打包时只通过环境变量注入
