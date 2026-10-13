/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {styles} from './data-table-styles.cssresult.js';

/**
 * b01 fork 补齐：官方至今没有数据表容器，这里按 M3 规范实现。
 *
 * 职责边界：只负责数据表的容器外观（表面、圆角、分隔线、表头带、行悬停状态层）、
 * 冻结列的吸附与滚动状态标记；列定义、排序、选择、分页等业务语义留给消费方。
 *
 * 用法：把原生 `<table>` 直接放进 `<md-data-table>`；需要吸附在滚动边界的列，
 * 在对应的 `th`/`td` 上标 `data-pin="left"` 或 `data-pin="right"`。组件在滚动或
 * 尺寸变化后，会在自身上反映 `scrollable`、`pinned-left`、`pinned-right` 三个
 * 状态属性，样式据此决定是否画冻结列的分隔阴影。
 *
 * 为什么是轻 DOM：样式要作用到插槽表格的**后代**（`thead`/`td`），而 `::slotted()`
 * 只能匹配插槽的直接子节点，阴影 DOM 做不到。因此这里不建影子根，样式表以
 * `md-data-table` 前缀选择器注入元素内部——元素选择器天然限定在本组件实例上。
 *
 * @cssprop --md-data-table-container-color - 容器表面色，默认 surface-container-low。
 * @cssprop --md-data-table-container-shape - 容器圆角，默认 shape-corner-large。
 * @cssprop --md-data-table-divider-color - 行分隔线颜色，默认 outline-variant。
 * @cssprop --md-data-table-header-color - 表头带背景，默认 surface-container。
 * @cssprop --md-data-table-header-text-color - 表头文字色，默认 on-surface-variant。
 * @cssprop --md-data-table-row-hover-color - 行悬停状态层颜色，默认 surface-container。
 * @cssprop --md-data-table-pin-color - 冻结列背景（需不透明，默认跟随容器表面）。
 * @cssprop --md-data-table-pin-shadow-color - 冻结列分隔阴影颜色。
 * @cssprop --md-data-table-cell-padding-block - 单元格纵向内边距，默认 14px。
 * @cssprop --md-data-table-cell-padding-inline - 单元格横向内边距，默认 12px。
 * @cssprop --md-data-table-font-size - 表格字号，默认 0.875rem。
 */
export class DataTable extends HTMLElement {
  /**
   * 皮肤样式表：轻 DOM 下用不了 Lit 的 static styles——adoptedStyleSheets 只存在于
   * Document 与 ShadowRoot，赋到普通元素上是静默失效，所以这里显式注入 <style>。
   */
  #styleSheet?: HTMLStyleElement;

  /** 监听容器与表格自身尺寸变化：列增减、容器变宽都会改变滚动状态。 */
  #resizeObserver?: ResizeObserver;

  /** 待处理的动画帧句柄：滚动事件高频，统一在下一帧读写布局。 */
  #frame = 0;

  connectedCallback() {
    this.#injectStyles();
    this.addEventListener('scroll', this.#onScroll, {passive: true});
    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(() => this.#schedule());
      this.#resizeObserver.observe(this);
      const table = this.querySelector('table');
      if (table) this.#resizeObserver.observe(table);
    }
    // 首次连接时布局还没完成，推迟一帧再量。
    this.#schedule();
  }

  disconnectedCallback() {
    this.removeEventListener('scroll', this.#onScroll);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    if (this.#frame) {
      cancelAnimationFrame(this.#frame);
      this.#frame = 0;
    }
  }

  /**
   * injectStyles 注入皮肤样式表（幂等）：样式表随元素存活，元素销毁时一并移除。
   */
  #injectStyles(): void {
    if (this.#styleSheet) return;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles.cssText;
    this.#styleSheet = styleSheet;
    this.prepend(styleSheet);
  }

  /** onScroll 滚动事件：状态在下一帧统一更新。 */
  #onScroll = () => {
    this.#schedule();
  };

  /** schedule 合并同一帧内的多次触发。 */
  #schedule(): void {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#update();
    });
  }

  /**
   * update 按真实滚动位置反映状态属性。
   *
   * 容差 1px：高 DPI 下 scrollLeft/clientWidth 取整会让"刚好滚到底"差一个像素，
   * 不留容差会出现滚到底了右冻结列还挂着阴影的情况。
   */
  #update(): void {
    const scrollable = this.scrollWidth > this.clientWidth + 1;
    const atStart = this.scrollLeft <= 0;
    const atEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 1;
    this.toggleAttribute('scrollable', scrollable);
    this.toggleAttribute('pinned-left', scrollable && !atStart);
    this.toggleAttribute('pinned-right', scrollable && !atEnd);
  }
}
