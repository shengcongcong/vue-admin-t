<template>
  <div class="test-page">
    <h2>测试工具</h2>

    <el-card class="mb-16">
      <template #header>历史栈</template>
      <p>length: <strong>{{ historyLength }}</strong></p>
      <p>当前: <code>{{ currentUrl }}</code></p>
      <el-space>
        <el-button size="small" @click="refresh">刷新</el-button>
        <component :is="copyBtn" />
      </el-space>
    </el-card>

    <el-card class="mb-16">
      <template #header>跳转测试</template>
      <el-space wrap>
        <el-button @click="push('/dashboard')">push /dashboard</el-button>
        <el-button @click="push('/profile')">push /profile</el-button>
        <el-button @click="push('/test')">push /test</el-button>
        <el-button @click="replace('/dashboard')">replace /dashboard</el-button>
        <el-button type="danger" @click="goBack">go(-1)</el-button>
        <el-button type="danger" @click="goForward">go(+1)</el-button>
      </el-space>
    </el-card>

    <el-card class="mb-16">
      <template #header>sessionStorage</template>
      <div v-for="key in sessionKeys" :key="key" class="flex gap-8">
        <code>{{ key }}</code>: <span>{{ sessionVals[key] }}</span>
      </div>
      <div v-if="!sessionKeys.length">空</div>
    </el-card>

    <el-card>
      <template #header>localStorage OAuth 相关</template>
      <div v-if="!localKeys.length">空</div>
      <div v-for="key in localKeys" :key="key">
        <code>{{ key }}</code>: {{ localVals[key]?.slice(0, 80) }}
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElButton } from "element-plus";

const router = useRouter();

const copyBtn = h(
  ElButton,
  { size: "small", onClick: copyUrl },
  () => "复制 URL"
);
const currentUrl = ref(window.location.href);
const historyLength = ref(history.length);
const sessionKeys = ref<string[]>([]);
const sessionVals = ref<Record<string, string>>({});
const localKeys = ref<string[]>([]);
const localVals = ref<Record<string, string>>({});

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    ElMessage.success("复制成功");
  } catch {
    ElMessage.error("复制失败");
  }
}

function refresh() {
  currentUrl.value = window.location.href;
  historyLength.value = history.length;
  const sk: string[] = [];
  const sv: Record<string, string> = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i)!;
    sk.push(k);
    sv[k] = sessionStorage.getItem(k) || "";
  }
  sessionKeys.value = sk;
  sessionVals.value = sv;

  const lk: string[] = [];
  const lv: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.includes("oauth")) {
      lk.push(k);
      lv[k] = localStorage.getItem(k) || "";
    }
  }
  localKeys.value = lk;
  localVals.value = lv;
}

function push(path: string) {
  router.push(path);
  setTimeout(refresh, 100);
}

function replace(path: string) {
  router.replace(path);
  setTimeout(refresh, 100);
}

function goBack() {
  history.go(-1);
  setTimeout(refresh, 100);
}

function goForward() {
  history.go(1);
  setTimeout(refresh, 100);
}

onMounted(refresh);
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background: #f0f2f5;
}
.mb-16 {
  margin-bottom: 16px;
}
.flex {
  display: flex;
}
.gap-8 {
  gap: 8px;
}
code {
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 13px;
}
</style>
