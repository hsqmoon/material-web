/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {customElement} from 'lit/decorators.js';

import {DataTable} from './internal/data-table.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-data-table': MdDataTable;
  }
}

/**
 * @summary A data table shows tabular data on a flat surface with a sticky
 * header band, row dividers and hover state layers.
 *
 * @description b01 fork 补齐：官方没有该组件，按 M3 规范实现。它是容器而非渲染器——
 * 消费方把原生 `<table>` 放进来即可，列定义与业务语义仍由消费方掌握。
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-data-table')
export class MdDataTable extends DataTable {}
