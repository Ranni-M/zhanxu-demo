/**
 * 静态演示模式：在没有服务端的情况下，把 /api 请求接到内置示例数据上。
 *
 * 只在 VITE_STATIC_DEMO=true 的构建里生效（见 scripts/build-pages.mjs），
 * 供 GitHub Pages 这类纯静态托管使用：可以浏览首页、模板页与示例作品页，
 * 但登录、上传、导出等依赖服务端的能力会明确提示不可用。
 */
import type { Project } from '../domain/project';
import { samples } from '../data/catalog';

/**
 * 当前构建是否为静态演示版（由 scripts/build-pages.mjs 注入 VITE_STATIC_DEMO）。
 * 为 true 时界面隐藏登录入口，并把 /api 请求接到内置示例数据上。
 */
export const isStaticDemo = import.meta.env.VITE_STATIC_DEMO === 'true';

/** 静态演示版里所有需要服务端的能力，统一用这句话解释。 */
export const staticDemoNotice =
  '这是静态演示版，没有服务端：登录、创建、上传与导出请使用完整部署版本。';

/** 示例素材用的是根路径绝对地址，部署到子路径（例如 /zhanxu/）时要补上 base。 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const withBase = (src: string) => (src.startsWith('/') ? base + src : src);

const demoProjects: Project[] = samples.map((project) => ({
  ...project,
  images: project.images.map((image) => ({ ...image, src: withBase(image.src) })),
  attachments: (project.attachments ?? []).map((attachment) => ({
    ...attachment,
    src: withBase(attachment.src),
  })),
}));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** 返回 null 表示该接口在静态演示版里没有对应数据。 */
function route(method: string, path: string): Response | null {
  if (method !== 'GET') return json(503, { error: staticDemoNotice });
  if (path === '/auth/me') return json(200, { user: null });
  if (path === '/bookmarks') return json(200, { ids: [] });
  if (path === '/publications') return json(200, { projects: demoProjects, nextOffset: null });
  if (path === '/projects') return json(200, { projects: [] });
  const slug = path.match(/^\/publications\/(.+)$/)?.[1];
  if (slug) {
    const project = demoProjects.find((item) => item.id === decodeURIComponent(slug));
    return project
      ? json(200, { project })
      : json(404, { error: '静态演示版只包含内置示例作品。' });
  }
  return null;
}

function install() {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/'))
      return nativeFetch(input, init);
    const method = (
      init?.method ?? (typeof input === 'object' && !(input instanceof URL) ? input.method : 'GET')
    ).toUpperCase();
    return Promise.resolve(
      route(method, url.pathname.slice('/api'.length)) ?? json(503, { error: staticDemoNotice }),
    );
  }) as typeof window.fetch;
}

if (isStaticDemo && typeof window !== 'undefined') install();
