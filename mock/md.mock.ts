import { defineMock } from "./base";

export default defineMock([
  {
    url: "md/content",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        content: `# Vue3 组件开发指南

## 安装

\`\`\`bash
npm create vue@latest my-app
cd my-app
npm install
\`\`\`

## 基础组件

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
\`\`\`

## API 调用

\`\`\`ts
import request from "@/utils/request";

export async function getUserInfo() {
  const res = await request({ url: "/user/info", method: "get" });
  return res.data;
}
\`\`\`

## 配置

\`\`\`json
{
  "name": "vue3-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
\`\`\`

## 样式

\`\`\`css
.container {
  display: flex;
  align-items: center;
  padding: 16px;
}
\`\`\`
`,
      },
    },
  },
]);
