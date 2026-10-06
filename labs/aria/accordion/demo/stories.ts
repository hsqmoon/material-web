/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/web/labs/aria/accordion/md-aria-accordion.js';

import {MaterialStoryInit} from './material-collection.js';
import {css, html} from 'lit';

export interface StoryKnobs {}

const accordion: MaterialStoryInit<StoryKnobs> = {
  name: 'ARIA Accordion',
  styles: css``,
  render(knobs) {
    return html`
      <md-aria-accordion>
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
    `;
  },
};

const accordionNameEmpty: MaterialStoryInit<StoryKnobs> = {
  name: 'Empty name is non-exclusive',
  styles: css``,
  render(knobs) {
    return html`
      <md-aria-accordion name="">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
    `;
  },
};

const accordionNameExclusive: MaterialStoryInit<StoryKnobs> = {
  name: 'Exclusivity',
  styles: css``,
  render(knobs) {
    return html`
      <md-aria-accordion name="group1">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="group1">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="group1">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <hr />
      <md-aria-accordion name="group2">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="group2">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
      <md-aria-accordion name="group2">
        <div slot="title">Expandable content</div>
        <div slot="content">
          This is the expandable content.<br />
          This content is only visible and accessable when
        </div>
      </md-aria-accordion>
    `;
  },
};

const accordionWithHeadings: MaterialStoryInit<StoryKnobs> = {
  name: 'Headings',
  styles: css`
    #root {
      min-width: 20em;
    }

    md-aria-accordion::part(button):hover {
      background: lightgray;
    }

    [slot=content] {
      border-left: 2px solid lightgray;
      padding-left: 1em;
    }
  `,
  render(knobs) {
    return html`
      <md-aria-accordion id="root" .headingLevel=${4}>
        <div slot="title">Root</div>
        <div slot="content">
          <md-aria-accordion .headingLevel=${5}>
            <div slot="title">Item 1</div>
            <div slot="content">
              <md-aria-accordion .headingLevel=${6}>
                <div slot="title">Item 1-1</div>
                <div slot="content"> Item 1-1 content </div>
              </md-aria-accordion>
              <md-aria-accordion .headingLevel=${6}>
                <div slot="title">Item 1-2</div>
                <div slot="content"> Item 1-2 content </div>
              </md-aria-accordion>
              <md-aria-accordion .headingLevel=${6}>
                <div slot="title">Item 1-3</div>
                <div slot="content"> Item 1-3 content </div>
              </md-aria-accordion>
            </div>
          </md-aria-accordion>
          <md-aria-accordion .headingLevel=${5}>
            <div slot="title">Item 2</div>
            <div slot="content"> Item 2 content </div>
          </md-aria-accordion>
          <md-aria-accordion .headingLevel=${5}>
            <div slot="title">Item 3</div>
            <div slot="content"> Item 3 content </div>
          </md-aria-accordion>
        </div>
      </md-aria-accordion>
    `;
  },
};

export const stories = [
  accordion,
  accordionNameEmpty,
  accordionNameExclusive,
  accordionWithHeadings,
];
