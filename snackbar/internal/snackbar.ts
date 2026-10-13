/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative, html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

import '../../iconbutton/icon-button.js';
import {styles} from './snackbar-styles.cssresult.js';

/**
 * b01 fork 补齐：官方至今没有 snackbar 组件，这里按 M3 规范实现。
 *
 * 职责边界：只负责"一条短时提示"的外观与无障碍语义，不负责摆放位置与自动消失
 * （消费方决定停靠位置与生命周期，避免把产品策略写进基座）。
 *
 * @fires closed 关闭按钮被按下时派发（消费方据此收起提示）。
 */
export class Snackbar extends LitElement {
  static override styles: CSSResultOrNative[] = [styles];

  /** 是否可见：由消费方按业务节奏开关。 */
  @property({type: Boolean, reflect: true}) open = false;

  /** 提示文案（也可用默认插槽传入富内容）。 */
  @property() label = '';

  /** 错误级别：影响无障碍角色（错误用 alert 立刻播报，普通反馈用 status）。 */
  @property({type: Boolean, reflect: true}) error = false;

  /** 是否显示关闭按钮。 */
  @property({type: Boolean, attribute: 'with-close'}) withClose = true;

  protected override render() {
    return html`<div class="surface" role=${this.error ? 'alert' : 'status'}>
      <span class="label"><slot>${this.label}</slot></span>
      <span class="action"><slot name="action"></slot></span>
      ${this.withClose ? html`<md-icon-button class="action" aria-label="关闭提示"
        @click=${() => this.dispatchEvent(new Event('closed'))}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </md-icon-button>` : ''}
    </div>`;
  }
}
