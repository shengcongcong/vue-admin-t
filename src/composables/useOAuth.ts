import request from "@/utils/request";
import { AuthStorage } from "@/utils/auth";
import { useUserStore } from "@/store";

function randState() {
  return Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
}

class SafeOAuthClient {
  private provider: string;
  constructor(provider: string) { this.provider = provider; }

  startAuth() {
    const state = randState();
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("auth_start_time", Date.now().toString());
    sessionStorage.setItem("auth_pending", "true");
    window.location.href =
      `http://127.0.0.1:5501/index.html?state=${state}&provider=${this.provider}`;
  }

  async handleCallback(code: string, state: string) {
    const saved = sessionStorage.getItem("oauth_state");
    if (!saved || state !== saved) { this.cleanup(); return { success: false, error: "State 校验失败" }; }
    const ts = sessionStorage.getItem("auth_start_time");
    if (ts && Date.now() - +ts > 5 * 60 * 1000) { this.cleanup(); return { success: false, error: "授权已超时（5分钟）" }; }

    try {
      const d = await request<any, { code: number; accessToken?: string; refreshToken?: string; msg?: string }>({
        url: "/api/v1/auth/oauth/token", method: "post", data: { code },
      });
      if (d.code === 0 && d.accessToken) {
        AuthStorage.setTokens(d.accessToken, d.refreshToken!, false);
        await useUserStore().getUserInfo();
        return { success: true, error: "" };
      }
      return { success: false, error: d.msg || "服务端拒绝" };
    } catch {
      return { success: false, error: "网络请求失败" };
    } finally { this.cleanup(); }
  }

  cleanup() {
    ["oauth_state", "auth_start_time", "auth_pending"].forEach(
      (k) => sessionStorage.removeItem(k)
    );
  }
}

function preventAuthLoop() {
  if (sessionStorage.getItem("auth_pending") === "true") {
    const hasAuth = location.hash.includes("code=") || location.hash.includes("state=");
    if (!hasAuth) sessionStorage.removeItem("auth_pending");
  }
}

function initAuthGuard() {
  const raw = sessionStorage.getItem("__oauth_done");
  if (raw !== "1") return;
  const ts = sessionStorage.getItem("__oauth_done_ts");
  if (ts && Date.now() - +ts > 30_000) { sessionStorage.removeItem("__oauth_done"); return; }
  sessionStorage.removeItem("__oauth_done");
  sessionStorage.removeItem("__oauth_done_ts");
  history.pushState(null, "", location.href);
}

export { SafeOAuthClient, preventAuthLoop, initAuthGuard };
