/**
 * 构建 GitHub Pages 静态演示版。
 *
 * 与常规构建的差别只有两点：
 *   1. 注入 VITE_BASE，让资源指向项目站点子路径（默认 /zhanxu/）；
 *   2. 打开 VITE_STATIC_DEMO，把 /api 请求接到内置示例数据上。
 * 构建后再补一个 404.html，让 BrowserRouter 的深链接在 Pages 上也能回落到应用入口。
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

let base =
  process.env.PAGES_BASE ||
  (process.env.GITHUB_REPOSITORY
    ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1] + '/'
    : '/zhanxu-demo/');
// git-bash 会把 PAGES_BASE=/zhanxu-demo/ 误转成 C:/Program Files/Git/zhanxu-demo/，这里还原回来。
if (/^[A-Za-z]:[\\/]/.test(base)) base = '/' + path.posix.basename(base.replace(/\\/g, '/')) + '/';
if (!base.startsWith('/') || !base.endsWith('/')) {
  console.error('PAGES_BASE 必须是形如 /zhanxu/ 的路径，当前为：' + base);
  process.exit(1);
}

const env = { ...process.env, VITE_BASE: base, VITE_STATIC_DEMO: 'true' };
const build = spawnSync('npm run build', {
  stdio: 'inherit',
  env,
  shell: true,
});
if (build.status !== 0) process.exit(build.status ?? 1);

const dist = path.resolve('dist');
copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('静态演示版构建完成：base=' + base + '，已生成 dist/404.html 与 dist/.nojekyll');
