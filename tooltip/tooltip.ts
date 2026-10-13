/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Tooltip} from './internal/tooltip.js';
import {styles} from './internal/tooltip-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-tooltip': MdTooltip;
  }
}

/**
 * @summary A tooltip labels an interactive element or explains an icon-only
 * control.
 *
 * @description b01 fork 补齐：官方没有该组件，按 M3 规范实现 plain tooltip（单行文本 + 反色表面）。
 * 用法：`<md-tooltip anchor="trigger-id" text="说明"></md-tooltip>`。
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-tooltip')
export class MdTooltip extends Tooltip {
  static override styles: CSSResultOrNative[] = [styles];
}
