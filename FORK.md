# b01 material-web（长期维护的 UI 基座 fork）

本仓库是 [material-components/material-web](https://github.com/material-components/material-web)（Google 官方 Material 3 Web Components）
的**长期 fork**，作为本产品线多个 Web 前端共用的 UI 基座维护。上游改动通过 `upstream` 远端合并进来，我们的改动与新增组件在本仓库内演进。

## 关系与位置

```
zjkj-t113s3-towerCrane/          (父仓库,子模块清单见 .gitmodules)
├── server/material-web          ← 本仓库: UI 基座(fork),子模块
├── server/debug_web             ← 消费方: B01 调试控制台
├── server/tibiot                ← 同族范例: 多产品共用的库(子模块)
└── ...
```

- `origin` = `git@github.com:hsqmoon/material-web.git`（我们的 fork，长期维护）
- `upstream` = 官方仓库（只读，用于跟进上游）

## 基线

- fork 基线：上游 `master` 的 `e3471c04`（对应官方 `@material/web` 2.5.0 / 2.5.1-nightly 线）
- 本仓库版本号形如 `2.5.0-b01.N`，`N` 为我们的迭代序号；保留包名 `@material/web` 以便消费方 import 路径与官方文档一致。

## 消费方式（不要在消费端重复上游工具链）

本仓库是 TS + SCSS 源码工程，构建需要上游的工具链（wireit + sass + tsc + css-to-ts + manifest）：

```sh
npm ci --no-audit --no-fund --ignore-scripts   # 只构建，不需要浏览器
npm run build
```

消费方**不**直接依赖源码，而是用各自仓库里的 `deployment/sync-ui.sh` 把构建产物（`*.js` / `*.d.ts` /
`custom-elements.json` / `LICENSE` / `README.md` / `package.json`，不含 scss/map）同步成内嵌快照：

- `debug_web`：`deployment/sync-ui.sh` → `web/vendor/material-web`，`package.json` 以 `file:vendor/material-web` 消费；
  Docker 构建只拷贝该产物，因此部署镜像不依赖私有远端与上游工具链。

新增/调整组件后：在本仓库提交 → 在消费方跑同步脚本 → 提交消费方的快照差异。

## 我们用到的官方组件

| 场景 | 组件 |
| --- | --- |
| 按钮 | `button/{filled,outlined,elevated,filled-tonal}-button` |
| 图标按钮 | `iconbutton/{filled,outlined,standard,filled-tonal}-icon-button` |
| 输入 | `textfield/{filled,outlined}-text-field` |
| 选择 | `select/{filled,outlined}-select` + `menu` |
| 勾选/开关/滑杆 | `checkbox`、`switch`、`radio`、`slider` |
| 页签 | `tabs`（主/次）、`labs/navigationtab` |
| 对话框 | `dialog` |
| 菜单/列表 | `menu`、`list`、`labs/item` |
| 卡片 | `labs/card/{elevated,filled,outlined}-card` |
| 导航抽屉 | `labs/navigationdrawer/navigation-drawer(-modal)` |
| 分段按钮 | `labs/segmentedbuttonset/outlined-segmented-button-set` |
| 徽标 | `labs/badge/badge` |
| 进度 | `progress/{linear,circular}-progress` |
| 状态层/焦点 | `ripple`、`focus`、`elevation` |
| 图标 | `icon`（Material Symbols） |

## 官方缺失、由本仓库补齐的部分（按 M3 规范实现）

上游至今没有数据表格、分页器、tooltip、日期选择器、上传字段、空态等，本仓库按 M3 规范补齐，
放在与上游一致的目录结构下（顶层目录 + `internal/`），并复用官方 token、`ripple`、`focus`、`elevation`：

- 数据表格（含冻结列、列宽自适应、行选择、列设置、排序）——本项目最核心的补齐项
- 分页器、tooltip、日期字段、文件上传字段、空态

## 主题

主题令牌沿用官方 M3 体系（`--md-sys-color-*` / `--md-sys-typescale-*` / `--md-sys-shape-*` / `--md-sys-state-*` /
`--md-sys-elevation-*` / `--md-sys-motion-*`），消费方通过覆盖这些令牌做品牌化（深色为默认方案，浅色为另一套语义方案），
不修改组件内部样式。
