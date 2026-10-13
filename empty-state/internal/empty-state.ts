/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative, html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

import {styles} from './empty-state-styles.cssresult.js';

/**
 * b01 fork 补齐：官方没有空态组件，这里按 M3 规范实现。
 *
 * 结构：可选图标（icon 插槽或 image 属性）、标题、说明、可选动作（actions 插槽）。
 * 空态文案与动作由消费方决定，组件只负责排版与语义。
 */
export class EmptyState extends LitElement {
  static override styles: CSSResultOrNative[] = [styles];

  /** 标题（一句话说明"这里为什么是空的"）。 */
  @property() headline = '';

  /** 说明（补充如何产生数据或下一步做什么）。 */
  @property() supportingText = '';

  /** 图标资源地址；留空时只渲染 icon 插槽内容。 */
  @property() image = '';

  protected override render() {
    return html`<div class="surface" role="status">
      <slot name="icon">${this.image ? html`<img class="icon" src=${this.image} alt="" />` : ''}</slot>
      ${this.headline ? html`<p class="headline">${this.headline}</p>` : ''}
      ${this.supportingText ? html`<p class="supporting-text">${this.supportingText}</p>` : ''}
      <div class="actions"><slot></slot></div>
    </div>`;
  }
}
