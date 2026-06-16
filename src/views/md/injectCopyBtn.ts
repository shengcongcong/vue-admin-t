import { h, render, type VNode } from "vue";
import { ElMessage, ElButton } from "element-plus";

export function injectButtons(el: HTMLElement, vnode: any) {
  el.querySelectorAll<HTMLElement>("pre:not(.copy-injected)").forEach((pre) => {
    pre.classList.add("copy-injected");
    const source = pre.textContent || "";
    const codeEl = pre.querySelector("code");
    const lang = codeEl?.className.replace(/hljs language-/, "") || "";

    const wrapper = document.createElement("div");
    wrapper.className = "code-wrapper";

    const header = document.createElement("div");
    header.className = "code-header";

    const langTag = document.createElement("span");
    langTag.className = "code-lang";
    langTag.textContent = lang;

    const mount = document.createElement("span");
    mount.className = "copy-btn";

    const btnProps = {
      size: "small",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(source);
          ElMessage.success("复制成功");
        } catch {
          ElMessage.error("复制失败");
        }
      }
    };

    const btnVNode = h(ElButton, btnProps, () => "复制") as VNode;
    (btnVNode as any).appContext = vnode.appContext;
    render(btnVNode, mount);

    header.appendChild(langTag);
    header.appendChild(mount);

    pre.parentNode!.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}
