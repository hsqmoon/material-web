/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative, html, LitElement, nothing} from 'lit';
import {property} from 'lit/decorators.js';

import '../../button/outlined-button.js';
import '../../iconbutton/icon-button.js';
import '../../select/outlined-select.js';
import '../../select/select-option.js';
import '../../textfield/outlined-text-field.js';
import {styles} from './pager-styles.cssresult.js';

/** PageSlot 页码位：value 为该位对应的页码，省略号位表示中间被折叠。 */
interface PageSlot {
  value?: number;
  ellipsis?: boolean;
}

/**
 * b01 fork 补齐：官方没有分页器组件，这里按 M3 规范实现。
 *
 * 结构：总数 + 每页条数 + 固定宽度页码位（当前页居中，端点常驻）+ 跳页 + 可选刷新。
 * 页码位数量固定，避免翻页时按钮左右跳动；端点与相邻页之间用省略号表示折叠。
 *
 * @fires page-change 请求翻页（detail: {page}）。
 * @fires size-mode-change 请求切换每页条数（detail: {sizeMode}，'auto' 表示按视口自适应）。
 * @fires refresh 请求刷新数据。
 */
export class Pager extends LitElement {
  static override styles: CSSResultOrNative[] = [styles];

  /** 当前页码（从 1 开始）。 */
  @property({type: Number}) page = 1;

  /** 每页条数。 */
  @property({type: Number, attribute: 'page-size'}) pageSize = 20;

  /** 总条数。 */
  @property({type: Number}) total = 0;

  /** 每页条数模式：'auto' 或具体条数。 */
  @property({attribute: 'size-mode'}) sizeMode: string | number = 'auto';

  /** 是否正在读取下一页（翻页期间禁用按钮）。 */
  @property({type: Boolean, attribute: 'loading-more'}) loadingMore = false;

  /** 是否显示刷新按钮。 */
  @property({type: Boolean}) refreshable = false;

  /** 是否有更新待刷新（刷新按钮转为强调态）。 */
  @property({type: Boolean}) pending = false;

  /** 是否正在刷新。 */
  @property({type: Boolean}) refreshing = false;

  private jumpValue = '1';

  protected override willUpdate(): void {
    if (!this.querySelector('.jump-field')) this.jumpValue = String(this.page);
    else if (document.activeElement !== this.jumpField) this.jumpValue = String(this.page);
  }

  /** jumpField 跳页输入框（避免翻页时覆盖用户正在输入的内容）。 */
  private get jumpField(): Element | null {
    return this.renderRoot.querySelector('.jump-field');
  }

  /** pageCount 总页数（至少 1 页）。 */
  private get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize)));
  }

  /**
   * pageSlots 固定数量的页码位：当前页居中，端点常驻，其余折叠为省略号。
   *
   * 数量固定（含空占位）是为了翻页时按钮不左右跳动；窄屏收起最外侧的位由样式按宿主
   * 宽度用容器查询完成（见 _pager.scss），因此这里始终按满档计算。
   */
  private get pageSlots(): PageSlot[] {
    const count = this.pageCount;
    const neighbors: PageSlot[] = [-2, -1, 0, 1, 2].map(offset => {
      const value = this.page + offset;
      return value >= 1 && value <= count ? {value} : {};
    });
    return [
      this.page - 2 > 1 ? {value: 1} : {},
      {ellipsis: this.page - 2 > 2},
      ...neighbors,
      {ellipsis: this.page + 2 < count - 1},
      this.page + 2 < count ? {value: count} : {},
    ];
  }

  /** goTo 请求翻页（越界时钳制到有效范围）。 */
  private goTo(target: number): void {
    const next = Math.min(this.pageCount, Math.max(1, Math.trunc(target)));
    if (next === this.page) return;
    this.dispatchEvent(new CustomEvent('page-change', {detail: {page: next}}));
  }

  /** jump 处理跳页输入。 */
  private jump(): void {
    const value = Number(this.jumpValue);
    this.goTo(Number.isFinite(value) ? value : this.page);
    this.jumpValue = String(this.page);
  }

  /** changeSize 切换每页条数。 */
  private changeSize(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.dispatchEvent(new CustomEvent('size-mode-change', {
      detail: {sizeMode: value === 'auto' ? 'auto' : Number(value)},
    }));
  }

  protected override render() {
    if (!this.total && !this.refreshable) return html``;
    const count = this.pageCount;
    return html`<div class="pager" role="navigation" aria-label="表格分页">
      <span class="total">共 ${this.total} 条</span>
      <div class="controls">
        <md-outlined-select class="size" aria-label="每页条数" .value=${String(this.sizeMode)} @change=${this.changeSize}>
          <md-select-option value="auto"><div slot="headline">自动（${this.pageSize} 条）</div></md-select-option>
          <md-select-option value="10"><div slot="headline">10 条/页</div></md-select-option>
          <md-select-option value="20"><div slot="headline">20 条/页</div></md-select-option>
          <md-select-option value="50"><div slot="headline">50 条/页</div></md-select-option>
          <md-select-option value="100"><div slot="headline">100 条/页</div></md-select-option>
        </md-outlined-select>
        <nav class="numbers" aria-label="页码">
          <md-outlined-button class="arrow" aria-label="上一页" title="上一页" ?disabled=${this.page <= 1 || this.loadingMore}
            @click=${() => this.goTo(this.page - 1)}>‹</md-outlined-button>
          ${this.pageSlots.map((slot, index) => html`<span class="slot" data-slot=${index}
            ?data-empty=${slot.value === undefined && !slot.ellipsis}>
            ${slot.value !== undefined
              ? html`<button class="page-number" aria-label="第 ${slot.value} 页"
                  aria-current=${slot.value === this.page ? 'page' : nothing} ?disabled=${this.loadingMore}
                  @click=${() => this.goTo(slot.value!)}>${slot.value}</button>`
              : html`<span class="ellipsis" aria-hidden="true">${slot.ellipsis ? '…' : ''}</span>`}
          </span>`)}
          <md-outlined-button class="arrow" aria-label="下一页" title=${this.loadingMore ? '正在读取下一页' : '下一页'}
            ?disabled=${this.loadingMore || this.page >= count} @click=${() => this.goTo(this.page + 1)}>›</md-outlined-button>
        </nav>
        <div class="jump">
          <span>前往</span>
          <md-outlined-text-field class="jump-field" type="number" min="1" max=${String(count)} aria-label="跳转页码"
            .value=${this.jumpValue} @input=${(event: Event) => { this.jumpValue = (event.target as HTMLInputElement).value; }}
            @keyup=${(event: KeyboardEvent) => { if (event.key === 'Enter') this.jump(); }}></md-outlined-text-field>
          <span>页</span>
          <md-outlined-button class="arrow" aria-label="跳转" @click=${() => this.jump()}>跳转</md-outlined-button>
        </div>
        ${this.refreshable ? html`<md-outlined-button class="refresh"
          aria-label=${this.pending ? '有更新，点击刷新列表' : '刷新列表'} ?disabled=${this.refreshing}
          @click=${() => this.dispatchEvent(new Event('refresh'))}>
          ${this.refreshing ? '刷新中…' : this.pending ? '有更新 · 刷新' : '刷新'}</md-outlined-button>` : ''}
      </div>
    </div>`;
  }
}
