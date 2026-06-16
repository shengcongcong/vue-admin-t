<template>
  <div class="md-page">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else ref="containerRef" class="md-body" v-copy-code v-html="html" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, type Directive } from "vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import { injectButtons } from "./injectCopyBtn";

const containerRef = ref<HTMLElement>();
const html = ref("");
const loading = ref(true);

// ── marked 实例配置 ──
const marked = new Marked({
  breaks: true,
  gfm: true,
});

// marked v13+ 通过 use() 扩展 renderer 实现代码高亮
marked.use({
  renderer: {
    code(token: any) {
      const lang = token.lang || "";
      const code = token.text;
      let highlighted = code;
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(code, { language: lang }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
      return `<pre class="code-block" data-lang="${lang || "text"}"><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    }
  }
});

// ── 自定义指令：v-copy-code ──
const vCopyCode: Directive<HTMLElement> = {
  mounted(el, _binding, vnode) {
    injectButtons(el, vnode);
  },
  updated(el, _binding, vnode) {
    injectButtons(el, vnode);
  },
};

// ── 流式渲染核心逻辑 ──
let timer: ReturnType<typeof setInterval> | null = null;

async function streamRender() {
  const baseApi = import.meta.env.VITE_APP_BASE_API || "";
  let fullMd = "";

  try {
    const res = await fetch(`${baseApi}/api/v1/md/content`);
    const json = await res.json();
    fullMd = json.data?.content || "";
  } catch (e) {
    console.error("获取 Markdown 失败:", e);
    loading.value = false;
    return;
  }

  loading.value = false;
  let idx = 0;
  const chunkSize = 8;

  timer = setInterval(async () => {
    if (idx >= fullMd.length) {
      if (timer) clearInterval(timer);
      return;
    }
    idx += chunkSize;
    const buf = fullMd.slice(0, idx);
    html.value = await marked.parse(buf) as string;
  }, 200);
}

onMounted(() => streamRender());

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.md-page { min-height: 100vh; background: #fafafa; display: flex; justify-content: center; }
.loading { padding: 48px; color: #999; }
.md-body {
  max-width: 800px; width: 100%; padding: 40px 32px; background: #fff;
  line-height: 1.8; color: #333; word-wrap: break-word;
}
.md-body :deep(h1) { font-size: 24px; margin: 24px 0 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
.md-body :deep(h2) { font-size: 20px; margin: 20px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
.md-body :deep(h3) { font-size: 16px; margin: 16px 0 8px; }
.md-body :deep(p) { margin: 12px 0; }
.md-body :deep(pre) {
  background: #1e1e1e; color: #d4d4d4; padding: 16px;
  border-radius: 0 0 8px 8px; overflow-x: auto; margin: 0;
  font-family: "Consolas","Monaco",monospace; font-size: 13px; line-height: 1.6; white-space: pre;
}
.md-body :deep(.code-wrapper) { margin: 16px 0; border-radius: 8px; overflow: hidden; }
.md-body :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #1e1e1e;
}
.md-body :deep(.code-lang) { font-size: 12px; color: #aaa; }
.md-body :deep(.copy-btn) { flex-shrink: 0; }
</style>
