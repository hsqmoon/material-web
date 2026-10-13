/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {Snackbar} from './internal/snackbar.js';
import {styles} from './internal/snackbar-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-snackbar': MdSnackbar;
  }
}

/**
 * @summary A snackbar shows brief messages about app processes at the bottom of
 * the screen.
 *
 * @description b01 fork 补齐：官方没有该组件，按 M3 规范实现；位置与生命周期由消费方决定。
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-snackbar')
export class MdSnackbar extends Snackbar {
  static override styles: CSSResultOrNative[] = [styles];
}
