# PDF Figure Picker

一个纯前端的网页工具：打开多页 PDF，选择任意一页框选区域并裁剪，然后下载裁剪后的 PDF。所有处理都在浏览器本地完成，文件不会上传到任何服务器。

## 功能特性

- 拖拽或点击上传 PDF，支持多页文档
- 侧边栏缩略图，快速预览并切换页面
- 在页面上拖动鼠标框选裁剪区域
  - 拖动选框可移动，拖动控制点可调整大小
  - 按住 `Ctrl`（或 `Cmd`）滚动滚轮可缩放页面
- 缩放控制：放大、缩小、一键恢复 100%
- 两种导出方式：
  - **下载裁剪后的 PDF**：仅导出框选区域
  - **下载本页**：导出完整的当前页
- 明暗主题切换
- 全程本地处理，保护隐私

## 技术栈

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 构建工具
- [pdf.js](https://mozilla.github.io/pdf.js/)（`pdfjs-dist`）用于页面渲染
- [pdf-lib](https://pdf-lib.js.org/) 用于裁剪与导出 PDF
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) 构建界面
- [lucide-react](https://lucide.dev/) 图标库

## 开始使用

依赖管理使用 [pnpm](https://pnpm.io/)。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 本地预览构建产物
pnpm preview
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 类型检查（`tsc -b`）并打包生产版本 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm format` | 使用 Prettier 格式化 `src` 目录 |
| `pnpm format:check` | 检查代码格式是否符合 Prettier 规范 |

## 使用方法

1. 打开应用后，点击或拖拽一个 PDF 文件到上传区域。
2. 在左侧缩略图列表中选择要处理的页面。
3. 在页面上按住鼠标拖动，框选需要裁剪的区域。
4. 通过拖动选框移动位置，或拖动控制点调整大小。
5. 点击 **下载裁剪后的 PDF** 导出框选区域，或点击 **下载本页** 导出整页。

## 项目结构

```
src/
├── app/            # 应用主组件
├── components/     # 通用 UI 组件（主题切换、shadcn/ui 等）
├── features/       # 功能模块（上传、缩略图、裁剪舞台）
├── hooks/          # 自定义 Hook（PDF 文档加载）
├── lib/            # 工具库（pdf.js 封装、裁剪导出逻辑）
├── index.css       # 全局样式
└── main.tsx        # 应用入口
```

## 许可证

[MIT](LICENSE) © jeanhwea
