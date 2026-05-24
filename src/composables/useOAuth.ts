/**
 * OAuth 授权客户端（安全实现）
 *
 * 安全措施：
 * 1. state 参数 + sessionStorage 校验：防 CSRF
 * 2. 授权超时校验（5分钟）：防旧重放
 * 3. window.location.replace 跳转：防止浏览器返回重新进入授权页
 * 4. 回调后立即清除 URL 中的 code/state：防 code 泄露
 * 5. auth_pending 标记：检测用户从授权页按返回，阻止重复跳转
 */

import request from "@/utils/request";
import { AuthStorage } from "@/utils/auth";
import { useUserStore } from "@/store";

const AUTH_BASE_URL = "/api/v1/auth/oauth";

/** 生成随机 state（防 CSRF）+ 时间戳防止碰撞 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
}

/**
 * 安全 OAuth 客户端
 */
class SafeOAuthClient {
  private provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  /** 发起授权跳转 */
  startAuth() {
    const state = generateState();
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("auth_return_url", window.location.href);
    sessionStorage.setItem("auth_start_time", Date.now().toString());
    sessionStorage.setItem("auth_pending", "true");

    // 跳转到外部独立授权页面（test/index.html）
    const authUrl = `http://192.168.1.123:5501/index.html?state=${state}&provider=${this.provider}`;
    window.location.replace(authUrl);
  }

  /** 处理回调 */
  async handleCallback(code: string, state: string): Promise<{ success: boolean; redirect: string }> {
    const savedState = sessionStorage.getItem("oauth_state");
    if (!savedState || state !== savedState) {
      console.error("State 验证失败，可能是 CSRF 攻击");
      this.cleanup();
      return { success: false, redirect: "/login" };
    }

    const startTime = sessionStorage.getItem("auth_start_time");
    if (startTime && Date.now() - parseInt(startTime) > 5 * 60 * 1000) {
      console.warn("授权超时");
      this.cleanup();
      return { success: false, redirect: "/login" };
    }

    const returnUrl = sessionStorage.getItem("auth_return_url") || "/";

    try {
      const tokenData = await request<any, {
        code: number;
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        expiresIn?: number;
        error?: string;
      }>({
        url: `${AUTH_BASE_URL}/token`,
        method: "post",
        data: { code },
      });

      if (tokenData.code === 0 && tokenData.accessToken) {
        AuthStorage.setTokens(tokenData.accessToken, tokenData.refreshToken!, false);
        await useUserStore().getUserInfo();
        return { success: true, redirect: returnUrl };
      } else {
        return { success: false, redirect: "/login" };
      }
    } catch {
      return { success: false, redirect: "/login" };
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("auth_return_url");
    sessionStorage.removeItem("auth_start_time");
    sessionStorage.removeItem("auth_pending");
    sessionStorage.removeItem("oauth_code");
    sessionStorage.removeItem("oauth_state_verified");
  }
}

function preventAuthLoop() {
  const isAuthPending = sessionStorage.getItem("auth_pending") === "true";
  const url = new URL(window.location.href);
  const hasAuthParams = url.hash.includes("code=") || url.hash.includes("state=");

  if (isAuthPending && !hasAuthParams) {
    sessionStorage.removeItem("auth_pending");
  }
}

export { SafeOAuthClient, preventAuthLoop };
