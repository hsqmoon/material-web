/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Harness} from '../../../testing/harness.js';

import {AriaAccordionElement} from './accordion.js';

/**
 * Test harness for `md-aria-accordion` elements.
 */
export class AriaAccordionHarness extends Harness<AriaAccordionElement> {
  protected override async getInteractiveElement() {
    await this.element.updateComplete;
    return this.getButton();
  }

  /**
   * Simulates the user activating the accordion's button with the Enter key.
   * Like a native button, this dispatches a single `click` on keydown.
   */
  async pressEnter() {
    const button = await this.getInteractiveElement();
    await this.focusWithKeyboard();
    this.simulateKeydown(button, 'Enter');
    this.simulateClick(button);
    this.simulateKeyup(button, 'Enter');
  }

  /**
   * Simulates the user activating the accordion's button with the Space key.
   * Like a native button, this dispatches a single `click` on keyup.
   */
  async pressSpace() {
    const button = await this.getInteractiveElement();
    await this.focusWithKeyboard();
    this.simulateKeydown(button, ' ');
    this.simulateKeyup(button, ' ');
    this.simulateClick(button);
  }

  /**
   * Returns the button that toggles the accordion.
   */
  getButton(): HTMLButtonElement {
    return this.element.renderRoot.querySelector('button')!;
  }

  /**
   * Returns the slot that contains the accordion's content.
   */
  getContentSlot(): HTMLSlotElement {
    return this.element.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name="content"]',
    )!;
  }

  /**
   * Returns the heading element wrapping the button, or `null` if the button
   * is not wrapped in a heading.
   */
  getHeading(): HTMLHeadingElement | null {
    return this.element.renderRoot.querySelector<HTMLHeadingElement>(
      'h1,h2,h3,h4,h5,h6',
    );
  }

  /**
   * Returns all heading elements in the accordion's shadow root.
   */
  getAllHeadings(): HTMLHeadingElement[] {
    return Array.from(
      this.element.renderRoot.querySelectorAll<HTMLHeadingElement>(
        'h1,h2,h3,h4,h5,h6',
      ),
    );
  }

  /**
   * Returns the elements referenced by the content slot's `aria-labelledby`
   * attribute, resolved within the accordion's shadow root. Unresolvable IDs
   * are omitted.
   */
  getContentLabelElements(): Element[] {
    const ids = this.getContentSlot().getAttribute('aria-labelledby') ?? '';
    const root = this.element.renderRoot;
    return ids
      .split(/\s+/)
      .filter((id) => id)
      .map((id) => root.querySelector(`#${CSS.escape(id)}`))
      .filter((element): element is Element => element !== null);
  }
}
