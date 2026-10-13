/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {EmptyState} from './internal/empty-state.js';
import {styles} from './internal/empty-state-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-empty-state': MdEmptyState;
  }
}

/**
 * @summary An empty state explains why a container has no content and what to
 * do next.
 *
 * @description b01 fork 补齐：官方没有该组件，按 M3 规范实现。
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-empty-state')
export class MdEmptyState extends EmptyState {
  static override styles: CSSResultOrNative[] = [styles];
}
