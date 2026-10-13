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

- `debug_web`：`deployment/sync-ui.sh` → `web/vendor/material-web`；消费端用 Vite / tsconfig 别名把 `@material/web/*`
  指向该目录，`lit` / `@lit/context` / `tslib` / `safevalues` 由消费端显式声明为依赖。
  （不用 `file:` 依赖：npm 会把链接包的 devDependencies 一并安装，并在产物目录里再建 node_modules。）
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

上游至今没有数据表格、分页器、tooltip、空态、snackbar 等，本仓库按 M3 规范补齐，
放在与上游一致的目录结构下（顶层目录 + `internal/`），并复用官方 token 与系统角色。
样式一律走 `--md-<组件>-*` 组件令牌，默认值取官方系统角色，消费方覆盖令牌即可换肤。

| 组件 | 标签 | 职责边界 |
| --- | --- | --- |
| 数据表容器 | `md-data-table` | 容器外观（表面、圆角、分隔线、表头带、行悬停状态层）、冻结列吸附与滚动状态标记（`data-pin="left\|right"` → 自身反映 `scrollable` / `pinned-left` / `pinned-right`）。列定义、排序、选择、分页仍归消费方。**轻 DOM**：样式要作用到插槽表格的后代，`::slotted()` 做不到，故以 `md-data-table` 前缀选择器注入。 |
| 分页器 | `md-pager` | 页码 / 每页条数 / 总数 / 跳转 / 刷新；事件 `page-change`、`size-mode-change`、`refresh`。 |
| 空态 | `md-empty-state` | 图标 + 标题 + 说明 + 动作插槽，`role="status"`。 |
| 提示条 | `md-snackbar` | 一条短时提示的外观与无障碍语义（`role=status/alert`、关闭按钮）；摆放位置与生命周期归消费方。 |
| 浮层提示 | `md-tooltip` | plain tooltip；锚点属性用 `anchor`（`for` 是 HTML 保留名，属性落不到元素上）。 |

编辑网格（可增删行的表单式表格）、对比矩阵一类的表格**不是**数据表，其外观仍由消费方掌握，不并入 `md-data-table`。

## 主题

主题令牌沿用官方 M3 体系（`--md-sys-color-*` / `--md-sys-typescale-*` / `--md-sys-shape-*` / `--md-sys-state-*` /
`--md-sys-elevation-*` / `--md-sys-motion-*`），消费方通过覆盖这些令牌做品牌化（深色为默认方案，浅色为另一套语义方案），
不修改组件内部样式。
