<template>
  <div class="oauth-callback-page">
    <div class="callback-container">
      <template v-if="status === 'processing'">
        <el-icon class="icon-spin" :size="48" color="#409eff"><Loading /></el-icon>
        <h3>正在处理授权回调...</h3>
        <p>请稍候</p>
      </template>
      <template v-else-if="status === 'success'">
        <el-icon :size="48" color="#67C23A"><CircleCheckFilled /></el-icon>
        <h3>登录成功</h3>
        <p>正在跳转...</p>
      </template>
      <template v-else-if="status === 'error'">
        <el-icon :size="48" color="#F56C6C"><CircleCloseFilled /></el-icon>
        <h3>{{ errTitle }}</h3>
        <p>{{ errMsg }}</p>
        <el-button type="primary" class="mt-20px" @click="goToLogin">返回登录页</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SafeOAuthClient, preventAuthLoop } from "@/composables/useOAuth";

const route = useRoute();
const router = useRouter();
const status = ref<"processing" | "success" | "error">("processing");
const errMsg = ref("");
const errTitle = ref("授权失败");

let cleaned = false;
onBeforeUnmount(() => {
  if (!cleaned) new SafeOAuthClient("").cleanup();
});

onMounted(async () => {
  preventAuthLoop();

  const code = route.query.code as string | undefined;
  const state = route.query.state as string | undefined;
  if (!code || !state) {
    status.value = "error";
    errTitle.value = "无授权请求";
    errMsg.value = "缺少回调参数";
    return;
  }

  const saved = sessionStorage.getItem("oauth_state");
  if (!saved) {
    status.value = "error";
    errTitle.value = "授权已过期";
    errMsg.value = "会话不存在";
    new SafeOAuthClient("").cleanup();
    return;
  }
  if (state !== saved) {
    status.value = "error";
    errTitle.value = "安全校验失败";
    errMsg.value = "State 不匹配";
    new SafeOAuthClient("").cleanup();
    return;
  }

  await router.replace("/oauth/callback");

  const r = await new SafeOAuthClient("").handleCallback(code, state);
  cleaned = true;

  if (r.success) {
    status.value = "success";
    sessionStorage.setItem("__oauth_done", "1");
    sessionStorage.setItem("__oauth_done_ts", Date.now().toString());
    window.addEventListener("pageshow", function clear() {
      window.removeEventListener("pageshow", clear);
      history.pushState(null, "", location.href);
    });
    setTimeout(() => history.go(-2), 300);
  } else {
    status.value = "error";
    errTitle.value = "授权失败";
    errMsg.value = r.error || "请重新登录";
  }
});

function goToLogin() {
  new SafeOAuthClient("").cleanup();
  window.location.replace("/#/login");
}
</script>

<style scoped>
.oauth-callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}
.callback-container {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  padding: 60px 80px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.callback-container h3 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #1a1a1a;
}
.callback-container p {
  margin: 0;
  font-size: 14px;
  color: #999;
}
.icon-spin {
  animation: rotating 2s linear infinite;
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.mt-20px {
  margin-top: 20px;
}
</style>
