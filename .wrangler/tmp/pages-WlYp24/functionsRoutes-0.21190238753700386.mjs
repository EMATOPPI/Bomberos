import { onRequestPost as __github_proxy_js_onRequestPost } from "C:\\Users\\Etoppi\\Desktop\\Proyectos\\BomberosCaazapá\\functions\\github-proxy.js"

export const routes = [
    {
      routePath: "/github-proxy",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__github_proxy_js_onRequestPost],
    },
  ]