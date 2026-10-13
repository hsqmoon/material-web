/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Pager} from './internal/pager.js';
import {styles} from './internal/pager-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-pager': MdPager;
  }
}

/**
 * @summary A pager navigates numbered pages of a data table.
 *
 * @description b01 fork 补齐：官方没有该组件，按 M3 规范实现。
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-pager')
export class MdPager extends Pager {
  static override styles: CSSResultOrNative[] = [styles];
}
