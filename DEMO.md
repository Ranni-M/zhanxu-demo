# 展序 ZHANXU · 静态演示版

这是 **展序 ZHANXU** 的纯静态演示构建，用来在 GitHub Pages 上提供一个公网可打开的预览地址。

它和真正上线的服务器版本**共用同一份前端源码**，差异只有一件事：**这里没有服务端**。

## 与完整版的差别

| 能力 | 完整版（服务器部署） | 本仓库（静态） |
| --- | --- | --- |
| 首页、模板页、示例作品页 | ✅ | ✅（4 个内置示例） |
| 注册 / 登录 / 工作台 | ✅ | ❌ 接口返回提示 |
| 上传素材、发布作品、导出 | ✅ | ❌ |
| 收藏 | ✅ | ❌ |

## 实现方式

静态版**不修改任何业务逻辑**，只在入口挂一层 `/api` 拦截（`src/lib/static-demo.ts`），
把请求接到 `src/data/catalog.ts` 里的内置示例数据上。全部由构建期变量开关控制：

- `VITE_STATIC_DEMO=true` —— 启用拦截；未设置时就是普通构建，行为与完整版一致
- `VITE_BASE=/<repo>/` —— 让资源指向 GitHub Pages 的项目子路径，否则 `/assets/*` 会 404

另外 `BrowserRouter` 的 `basename` 取自 `import.meta.env.BASE_URL`，
静态资源统一走 `src/lib/asset.ts` 的 `asset()` 补前缀。

## 本地跑一遍

```sh
npm ci
npm run build:pages                # 产出 dist/，并生成 404.html 与 .nojekyll
```

预览时记得同时给 preview 注入 base：

```sh
MSYS_NO_PATHCONV=1 VITE_BASE=/zhanxu-demo/ npx vite preview --port 4173
```

（`MSYS_NO_PATHCONV=1` 是为了绕开 git-bash 把 `/zhanxu-demo/` 转成 Windows 路径的老毛病。）

## 自动部署

`.github/workflows/pages.yml` 在 push 到 `main` 时自动构建并发布到 GitHub Pages，
其中的 `actions/configure-pages` 带 `enablement: true`，首次运行会自动开启 Pages，不需要手动去设置里点。

## 完整版部署

完整功能需要一台服务器，步骤见 `docs/deploy-cn-free.md`。
