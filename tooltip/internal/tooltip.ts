/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative, html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

import {styles} from './tooltip-styles.cssresult.js';

/**
 * b01 fork 补齐：官方没有 tooltip 组件，这里按 M3 规范实现 plain tooltip。
 *
 * 用法：把锚点元素交给 `anchor`（元素引用或 id），组件在锚点 hover/focus 时自动显示，
 * 并跟随锚点位置（优先上方，空间不足时翻到下方）。
 *
 * @fires opened 提示显示后派发。
 * @fires closed 提示隐藏后派发。
 */
export class Tooltip extends LitElement {
  static override styles: CSSResultOrNative[] = [styles];

  /** 锚点元素：元素引用或 id 字符串（与 md-menu 的 anchor 同名，避免 HTML 保留属性名冲突）。 */
  @property() anchor: HTMLElement | string | null = null;

  /** 提示文案。 */
  @property() text = '';

  private anchorElement: HTMLElement | null = null;

  protected override render() {
    return html`<div class="surface" role="tooltip">${this.text}<slot></slot></div>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.bindAnchor();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindAnchor();
  }

  /** bindAnchor 绑定锚点的悬停/聚焦事件（id 形式在连接后再解析）。 */
  private bindAnchor(): void {
    this.unbindAnchor();
    const anchor = typeof this.anchor === 'string'
      ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.anchor)
      : this.anchor;
    if (!(anchor instanceof HTMLElement)) return;
    this.anchorElement = anchor;
    anchor.addEventListener('mouseenter', this.onEnter);
    anchor.addEventListener('mouseleave', this.onLeave);
    anchor.addEventListener('focus', this.onEnter);
    anchor.addEventListener('blur', this.onLeave);
  }

  /** unbindAnchor 解绑锚点事件。 */
  private unbindAnchor(): void {
    const anchor = this.anchorElement;
    if (!anchor) return;
    anchor.removeEventListener('mouseenter', this.onEnter);
    anchor.removeEventListener('mouseleave', this.onLeave);
    anchor.removeEventListener('focus', this.onEnter);
    anchor.removeEventListener('blur', this.onLeave);
    this.anchorElement = null;
  }

  private readonly onEnter = () => {
    this.show();
  };

  private readonly onLeave = () => {
    this.hide();
  };

  /** show 显示提示并定位到锚点上方（空间不足则翻到下方）。 */
  async show(): Promise<void> {
    const anchor = this.anchorElement;
    if (!anchor || !this.text) return;
    this.setAttribute('open', '');
    // 等一帧再测量：display 刚从 none 切过来，同帧量到的尺寸还是 0。
    await this.updateComplete;
    const rect = anchor.getBoundingClientRect();
    const own = this.getBoundingClientRect();
    const above = rect.top - own.height - 4;
    const top = above >= 4 ? above : rect.bottom + 4;
    const left = Math.min(Math.max(4, rect.left + rect.width / 2 - own.width / 2), window.innerWidth - own.width - 4);
    this.style.top = `${Math.round(top)}px`;
    this.style.left = `${Math.round(left)}px`;
    this.dispatchEvent(new Event('opened'));
  }

  /** hide 隐藏提示。 */
  hide(): void {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('closed'));
  }
}
