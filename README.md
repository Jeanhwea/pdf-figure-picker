# PDF Figure Picker

纯前端网页工具：打开多页 PDF，框选区域并裁剪下载。所有处理都在浏览器本地完成，文件不会上传任何服务器。

> **在线使用：[https://jeanhwea.github.io/apps/pdf-figure-picker/](https://jeanhwea.github.io/apps/pdf-figure-picker/)**

## 功能

- 支持多页 PDF，侧边栏缩略图预览
- 拖动鼠标框选裁剪区域，支持缩放
- 两种导出：下载裁剪后的 PDF / 下载整页
- 明暗主题切换

## 技术栈

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
pdf.js 渲染页面 · pdf-lib 裁剪导出

## 本地开发

```bash
pnpm install
pnpm dev
```

## License

MIT
