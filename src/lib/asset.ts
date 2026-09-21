/**
 * 补上部署基路径。
 *
 * public/ 里的静态文件如果写成 `/previews/x.webp` 这种根路径，
 * 部署到子路径（例如 GitHub Pages 的 /zhanxu-demo/）就会 404。
 * 该函数只在浏览器构建里使用，BASE_URL 由 Vite 注入，根路径部署时结果不变。
 */
export function asset(path: string) {
  if (!path.startsWith('/')) return path;
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
