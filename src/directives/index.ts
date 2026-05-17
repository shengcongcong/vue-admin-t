import type { App } from "vue";

import { hasPerm, hasRole } from "./permission";

// 全局注册 directive
export function setupDirective(app: App) {
  // 使 v-has-perm 和 v-has-role 在所有组件中都可用
  app.directive("has-perm", hasPerm);
  app.directive("has-role", hasRole);
}
