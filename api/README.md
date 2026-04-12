# 接口与后端对接说明

## 一、config.js 的作用

`api/config.js` 用来配置**接口根地址**和**超时时间**。与后端连接时只需改这里，所有接口都会自动拼上这个根地址。

- **baseURL**：后端地址，不要以 `/` 结尾。例如本地开发填 `http://localhost:3000`，正式环境填 `https://api.xxx.edu.cn`。
- **timeout**：请求超时时间（毫秒）。

```js
export const config = {
  baseURL: 'http://localhost:3000',
  timeout: 15000
};
```

---

## 二、request.js 的作用

`api/request.js` 对 `uni.request` 做了统一封装，提供：

- **自动带 token**：除登录、验证码等接口外，请求头自动带 `Authorization: Bearer <token>`（token 从本地存储读取）。
- **统一错误处理**：请求失败或网络异常时自动 `uni.showToast` 提示。
- **401/403 处理**：遇到未授权时清除本地 token 并跳转登录页。

对外提供五个方法：`get`、`post`、`put`、`del`、`uploadFile`。接口 JS 文件只调用这五个方法，不要直接写 `uni.request`。

---

## 三、接口 JS 文件怎么写

接口写在 `api/` 目录下的模块里（如 `user.js`、`paper.js`）。每个文件：

1. 顶部从 `./request.js` 引入需要的方法：`import { get, post } from './request.js';`
2. 一个接口一个函数：`export function 接口名(...) { return get/post/...(url, data, needAuth); }`
3. **路径**：只写以 `/` 开头的路径（如 `/api/user/login`），不要写 baseURL。

**方法说明：**

| 方法 | 用途 | 示例 |
|------|------|------|
| `get(url, data?, needAuth?)` | GET，参数拼成查询串 | `get('/api/xxx', { id: 1 })` |
| `post(url, data?, needAuth?)` | POST，参数在请求体 | `post('/api/xxx', { name: 'xx' })` |
| `put(url, data?, needAuth?)` | PUT | `put('/api/xxx/1', { name: 'xx' })` |
| `del(url, needAuth?)` | DELETE | `del('/api/xxx/1')` |
| `uploadFile(url, filePath, name?, formData?)` | 上传文件 | `uploadFile('/api/upload', path, 'file', { id: 1 })` |

- **needAuth**：是否带 token。默认 `true`；登录、验证码、忘记密码等接口传 **`false`**。

**示例：**

```js
import { get, post } from './request.js';

/** 登录（不带 token） */
export function login(params) {
  return post('/api/user/login', {
    username: params.username,
    password: params.password,
    captcha: params.captcha,
    role: params.role
  }, false);
}

/** 获取用户信息（带 token） */
export function getUserInfo() {
  return get('/api/user/info');
}

/** GET 带查询参数 */
export function getPaperList(params = {}) {
  return get('/api/student/paper/list', params);
}

/** 上传文件 */
import { uploadFile } from './request.js';
export function uploadPaper(params) {
  return uploadFile('/api/student/paper/upload', params.filePath, 'file', {
    paperId: params.paperId,
    isFinal: params.isFinal || 0
  });
}
```

---

## 四、在代码里怎么使用

1. **引入**：在页面或组件里 `import { 函数名 } from '@/api/xxx.js';`（没有 `@` 则写相对路径如 `../../api/user.js`）。
2. **调用**：接口返回 Promise，resolve 的是后端返回的整段数据（一般包含 `code`、`data`、`message`）。用 `.then` 或 `async/await` 取 `res.data` 做业务数据。

```js
import { login } from '@/api/user.js';

login({
  username: this.loginForm.username,
  password: this.loginForm.password,
  captcha: this.loginForm.captcha,
  role: this.currentRole
}).then(res => {
  if (res.code === 200 && res.data) {
    uni.setStorageSync('token', res.data.token);
    uni.setStorageSync('userInfo', res.data.userInfo);
    uni.reLaunch({ url: '/pages/student/workbench' });
  } else {
    uni.showToast({ title: res.message || '登录失败', icon: 'none' });
  }
}).catch(() => {});
```

```js
import { getWorkbenchData } from '@/api/paper.js';

getWorkbenchData().then(res => {
  if (res.code === 200 && res.data) {
    this.paperGroups = res.data;
    this.updateStats();
  }
}).catch(() => {});
```

**async/await：**

```js
async loadData() {
  try {
    const res = await getWorkbenchData();
    if (res.code === 200 && res.data) {
      this.paperGroups = res.data;
      this.updateStats();
    }
  } catch (e) {
    console.error(e);
  }
}
```
