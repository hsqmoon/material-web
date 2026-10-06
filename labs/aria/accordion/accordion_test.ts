/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import './md-aria-accordion.js';

import {html} from 'lit';
import {Environment} from '../../../testing/environment.js';
import {internals} from '../../behaviors/element-internals.js';

import {AriaAccordionElement} from './accordion.js';
import {AriaAccordionHarness} from './harness.js';

describe('md-aria-accordion', () => {
  const env = new Environment();

  async function setUpTest(
    template = html`
      <md-aria-accordion>
        <span slot="title">Title</span>
        <div slot="content">Content</div>
      </md-aria-accordion>
    `,
  ) {
    const root = env.render(template);
    await env.waitForStability();

    const accordions = Array.from(root.querySelectorAll('md-aria-accordion'));
    const harnesses = accordions.map(
      (accordion) => new AriaAccordionHarness(accordion),
    );
    const contents = accordions.map((accordion) =>
      accordion.querySelector<HTMLElement>('[slot="content"]'),
    );
    return {
      root,
      accordions,
      accordion: accordions[0],
      harnesses,
      harness: harnesses[0],
      contents,
      content: contents[0],
    };
  }

  async function settle(accordions: AriaAccordionElement[]) {
    await Promise.all(accordions.map((accordion) => accordion.updateComplete));
  }

  function openStates(accordions: AriaAccordionElement[]): boolean[] {
    return accordions.map((accordion) => accordion.open);
  }

  describe('ARIA', () => {
    it('has role "group"', async () => {
      const {accordion} = await setUpTest();

      expect(accordion[internals].role).toBe('group');
    });
  });

  describe('open', () => {
    it('is closed by default', async () => {
      const {accordion} = await setUpTest();

      expect(accordion.open).toBeFalse();
      expect(accordion.hasAttribute('open')).toBeFalse();
    });

    it('hides content when closed', async () => {
      const {content} = await setUpTest();

      expect(content!.checkVisibility()).toBeFalse();
    });

    it('shows content when open', async () => {
      const {content} = await setUpTest(html`
        <md-aria-accordion open>
          <span slot="title">Title</span>
          <div slot="content">Content</div>
        </md-aria-accordion>
      `);

      expect(content!.checkVisibility()).toBeTrue();
    });

    it('toggles content visibility when the property changes', async () => {
      const {accordion, content} = await setUpTest();

      accordion.open = true;
      await accordion.updateComplete;
      expect(content!.checkVisibility()).toBeTrue();

      accordion.open = false;
      await accordion.updateComplete;
      expect(content!.checkVisibility()).toBeFalse();
    });

    it('updates aria-expanded on the button', async () => {
      const {accordion, harness} = await setUpTest();
      const button = harness.getButton();

      expect(button.getAttribute('aria-expanded')).toBe('false');

      accordion.open = true;
      await accordion.updateComplete;
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('toggles when the button is clicked', async () => {
      const {accordion, harness, content} = await setUpTest();

      await harness.clickWithMouse();
      await accordion.updateComplete;
      expect(accordion.open).toBeTrue();
      expect(content!.checkVisibility()).toBeTrue();

      await harness.clickWithMouse();
      await accordion.updateComplete;
      expect(accordion.open).toBeFalse();
      expect(content!.checkVisibility()).toBeFalse();
    });

    it('toggles when the title is clicked', async () => {
      const {accordion} = await setUpTest();

      accordion.querySelector<HTMLElement>('[slot="title"]')!.click();
      await accordion.updateComplete;

      expect(accordion.open).toBeTrue();
    });

    it('does not toggle when the content is clicked', async () => {
      const {accordion, content} = await setUpTest(html`
        <md-aria-accordion open>
          <span slot="title">Title</span>
          <div slot="content">Content</div>
        </md-aria-accordion>
      `);

      content!.click();
      await accordion.updateComplete;

      expect(accordion.open).toBeTrue();
    });

    it('does not toggle when the click is canceled on the accordion', async () => {
      const {accordion, harness} = await setUpTest();
      accordion.addEventListener('click', (event) => {
        event.preventDefault();
      });

      await harness.clickWithMouse();
      await accordion.updateComplete;

      expect(accordion.open).toBeFalse();
      expect(accordion.hasAttribute('open')).toBeFalse();
    });

    it('does not toggle when the click is canceled by an ancestor', async () => {
      const {root, accordion, harness} = await setUpTest();
      root.addEventListener('click', (event) => {
        event.preventDefault();
      });

      await harness.clickWithMouse();
      await accordion.updateComplete;

      expect(accordion.open).toBeFalse();
      expect(accordion.hasAttribute('open')).toBeFalse();
    });

    it('toggles when an ancestor stops propagation of the click', async () => {
      const {root, accordion, harness} = await setUpTest();
      root.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      await harness.clickWithMouse();
      await accordion.updateComplete;

      expect(accordion.open).toBeTrue();
    });

    it('does not toggle an outer accordion when a nested accordion is clicked', async () => {
      const {accordions, harnesses} = await setUpTest(html`
        <md-aria-accordion open>
          <span slot="title">Outer</span>
          <md-aria-accordion slot="content">
            <span slot="title">Inner</span>
          </md-aria-accordion>
        </md-aria-accordion>
      `);
      const outerEvents: ToggleEvent[] = [];
      accordions[0].addEventListener('toggle', (event) => {
        outerEvents.push(event as ToggleEvent);
      });

      await harnesses[1].clickWithMouse();
      await settle(accordions);

      expect(openStates(accordions)).toEqual([true, true]);
      expect(outerEvents).toEqual([]);
    });

    it('toggles once the click has been seen by ancestor listeners', async () => {
      const {root, accordion, harness} = await setUpTest();
      const openDuringAncestorListener: boolean[] = [];
      root.addEventListener('click', () => {
        openDuringAncestorListener.push(accordion.open);
      });

      await harness.clickWithMouse();

      expect(openDuringAncestorListener).toEqual([false]);
      expect(accordion.open).toBeTrue();
    });

    describe('reflection', () => {
      it('reflects the property to the attribute', async () => {
        const {accordion} = await setUpTest();

        accordion.open = true;
        await accordion.updateComplete;
        expect(accordion.hasAttribute('open')).toBeTrue();

        accordion.open = false;
        await accordion.updateComplete;
        expect(accordion.hasAttribute('open')).toBeFalse();
      });

      it('updates the property from the attribute', async () => {
        const {accordion, content} = await setUpTest();

        accordion.setAttribute('open', '');
        expect(accordion.open).toBeTrue();
        await accordion.updateComplete;
        expect(content!.checkVisibility()).toBeTrue();

        accordion.removeAttribute('open');
        expect(accordion.open).toBeFalse();
        await accordion.updateComplete;
        expect(content!.checkVisibility()).toBeFalse();
      });

      it('reflects user toggles to the attribute', async () => {
        const {accordion, harness} = await setUpTest();

        await harness.clickWithMouse();
        await accordion.updateComplete;
        expect(accordion.hasAttribute('open')).toBeTrue();

        await harness.clickWithMouse();
        await accordion.updateComplete;
        expect(accordion.hasAttribute('open')).toBeFalse();
      });
    });
  });

  describe(':state(open)', () => {
    it('does not match when closed', async () => {
      const {accordion} = await setUpTest();

      expect(accordion.matches(':state(open)')).toBeFalse();
    });

    it('matches when initially open', async () => {
      const {accordion} = await setUpTest(html`
        <md-aria-accordion open></md-aria-accordion>
      `);

      expect(accordion.matches(':state(open)')).toBeTrue();
    });

    it('follows the open property', async () => {
      const {accordion} = await setUpTest();

      accordion.open = true;
      await accordion.updateComplete;
      expect(accordion.matches(':state(open)')).toBeTrue();

      accordion.open = false;
      await accordion.updateComplete;
      expect(accordion.matches(':state(open)')).toBeFalse();
    });

    it('follows user toggles', async () => {
      const {accordion, harness} = await setUpTest();

      await harness.clickWithMouse();
      await accordion.updateComplete;
      expect(accordion.matches(':state(open)')).toBeTrue();

      await harness.clickWithMouse();
      await accordion.updateComplete;
      expect(accordion.matches(':state(open)')).toBeFalse();
    });

    it('is removed when closed by another accordion in the group', async () => {
      const {accordions} = await setUpTest(html`
        <md-aria-accordion name="group" open></md-aria-accordion>
        <md-aria-accordion name="group"></md-aria-accordion>
      `);

      accordions[1].open = true;
      await settle(accordions);

      expect(accordions[0].matches(':state(open)')).toBeFalse();
      expect(accordions[1].matches(':state(open)')).toBeTrue();
    });
  });

  describe('name', () => {
    describe('ungrouped accordions', () => {
      it('accordions without a name may all be open', async () => {
        const {accordions} = await setUpTest(html`
          <md-aria-accordion></md-aria-accordion>
          <md-aria-accordion></md-aria-accordion>
          <md-aria-accordion></md-aria-accordion>
        `);

        for (const accordion of accordions) {
          accordion.open = true;
        }
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, true, true]);
      });

      it('accordions with an empty name may all be open', async () => {
        const {accordions} = await setUpTest(html`
          <md-aria-accordion name=""></md-aria-accordion>
          <md-aria-accordion name=""></md-aria-accordion>
          <md-aria-accordion name=""></md-aria-accordion>
        `);

        for (const accordion of accordions) {
          accordion.open = true;
        }
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, true, true]);
      });

      it('accordions without a name are unaffected by user toggles of others', async () => {
        const {accordions, harnesses} = await setUpTest(html`
          <md-aria-accordion open></md-aria-accordion>
          <md-aria-accordion name=""></md-aria-accordion>
          <md-aria-accordion></md-aria-accordion>
        `);

        await harnesses[1].clickWithMouse();
        await harnesses[2].clickWithMouse();
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, true, true]);
      });

      it('accordions without a name are unaffected by a named group', async () => {
        const {accordions} = await setUpTest(html`
          <md-aria-accordion open></md-aria-accordion>
          <md-aria-accordion name="" open></md-aria-accordion>
          <md-aria-accordion name="group"></md-aria-accordion>
        `);

        accordions[2].open = true;
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, true, true]);
      });

      it('treats a missing name the same as an empty name', async () => {
        const {accordions} = await setUpTest(html`
          <md-aria-accordion></md-aria-accordion>
          <md-aria-accordion name=""></md-aria-accordion>
        `);

        accordions[0].open = true;
        accordions[1].open = true;
        await settle(accordions);
        expect(openStates(accordions)).toEqual([true, true]);

        // Changing a name from missing to empty, or empty to missing, does not
        // cause either to close.
        accordions[0].setAttribute('name', '');
        accordions[1].removeAttribute('name');
        await settle(accordions);
        expect(openStates(accordions)).toEqual([true, true]);
      });

      it('does not close an open accordion when its name is set to empty while another unnamed accordion is open', async () => {
        const {accordions} = await setUpTest(html`
          <md-aria-accordion open></md-aria-accordion>
          <md-aria-accordion open></md-aria-accordion>
        `);

        accordions[1].setAttribute('name', '');
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, true]);
      });
    });

    describe('exclusivity', () => {
      function renderGroup() {
        return setUpTest(html`
          <md-aria-accordion name="group">
            <div slot="content">Content 1</div>
          </md-aria-accordion>
          <md-aria-accordion name="group">
            <div slot="content">Content 2</div>
          </md-aria-accordion>
          <md-aria-accordion name="group">
            <div slot="content">Content 3</div>
          </md-aria-accordion>
          <md-aria-accordion name="other">
            <div slot="content">Content 4</div>
          </md-aria-accordion>
        `);
      }

      it('closes others in the group when opened programmatically', async () => {
        const {accordions} = await renderGroup();

        accordions[0].open = true;
        await settle(accordions);
        expect(openStates(accordions)).toEqual([true, false, false, false]);

        accordions[1].open = true;
        await settle(accordions);
        expect(openStates(accordions)).toEqual([false, true, false, false]);

        accordions[2].open = true;
        await settle(accordions);
        expect(openStates(accordions)).toEqual([false, false, true, false]);
      });

      it('closes others in the group when opened via the attribute', async () => {
        const {accordions} = await renderGroup();

        accordions[0].setAttribute('open', '');
        await settle(accordions);
        accordions[1].setAttribute('open', '');
        await settle(accordions);

        expect(openStates(accordions)).toEqual([false, true, false, false]);
        expect(accordions[0].hasAttribute('open')).toBeFalse();
        expect(accordions[1].hasAttribute('open')).toBeTrue();
      });

      it('updates attributes and visibility of accordions closed by the group', async () => {
        const {accordions, harnesses, contents} = await renderGroup();

        accordions[0].open = true;
        await settle(accordions);
        accordions[1].open = true;
        await settle(accordions);

        expect(accordions[0].hasAttribute('open')).toBeFalse();
        expect(contents[0]!.checkVisibility()).toBeFalse();
        expect(contents[1]!.checkVisibility()).toBeTrue();
        expect(harnesses[0].getButton().getAttribute('aria-expanded')).toBe(
          'false',
        );
      });

      it('closes others in the group when opened by the user', async () => {
        const {accordions, harnesses} = await renderGroup();

        await harnesses[0].clickWithMouse();
        await settle(accordions);
        expect(openStates(accordions)).toEqual([true, false, false, false]);

        await harnesses[1].clickWithMouse();
        await settle(accordions);
        expect(openStates(accordions)).toEqual([false, true, false, false]);

        await harnesses[2].clickWithMouse();
        await settle(accordions);
        expect(openStates(accordions)).toEqual([false, false, true, false]);
      });

      it('allows the user to close the open accordion in a group', async () => {
        const {accordions, harnesses} = await renderGroup();

        await harnesses[0].clickWithMouse();
        await settle(accordions);
        await harnesses[0].clickWithMouse();
        await settle(accordions);

        expect(openStates(accordions)).toEqual([false, false, false, false]);
      });

      it('does not affect accordions in a different group', async () => {
        const {accordions, harnesses} = await renderGroup();

        accordions[3].open = true;
        await settle(accordions);
        accordions[0].open = true;
        await settle(accordions);
        await harnesses[1].clickWithMouse();
        await settle(accordions);

        expect(openStates(accordions)).toEqual([false, true, false, true]);
      });

      it('closes an inserted open accordion if the group already has an open accordion', async () => {
        const {root, accordions} = await renderGroup();

        accordions[0].open = true;
        await settle(accordions);

        const inserted = document.createElement('md-aria-accordion');
        inserted.setAttribute('name', 'group');
        inserted.setAttribute('open', '');
        root.appendChild(inserted);
        const all = [...accordions, inserted];
        await settle(all);

        expect(openStates(all)).toEqual([true, false, false, false, false]);
        expect(inserted.hasAttribute('open')).toBeFalse();
        expect(inserted.matches(':state(open)')).toBeFalse();
      });

      it('keeps an inserted open accordion open if no other accordion in the group is open', async () => {
        const {root, accordions} = await renderGroup();

        const inserted = document.createElement('md-aria-accordion');
        inserted.setAttribute('name', 'group');
        inserted.setAttribute('open', '');
        root.appendChild(inserted);
        const all = [...accordions, inserted];
        await settle(all);

        expect(openStates(all)).toEqual([false, false, false, false, true]);
      });

      it('closes an open accordion when its name changes to that of a group with an open accordion', async () => {
        const {accordions} = await renderGroup();

        accordions[0].open = true;
        accordions[3].open = true;
        await settle(accordions);

        accordions[3].setAttribute('name', 'group');
        await settle(accordions);

        expect(openStates(accordions)).toEqual([true, false, false, false]);
      });
    });
  });

  describe('toggle event', () => {
    const userActivations: Array<{
      name: string;
      activate: (harness: AriaAccordionHarness) => Promise<void>;
    }> = [
      {name: 'click', activate: (harness) => harness.clickWithMouse()},
      {name: 'Enter key', activate: (harness) => harness.pressEnter()},
      {name: 'Space key', activate: (harness) => harness.pressSpace()},
    ];

    for (const {name, activate} of userActivations) {
      describe(`via ${name}`, () => {
        it('is dispatched with oldState "closed" and newState "open" when opened', async () => {
          const {accordion, harness} = await setUpTest();
          const events: ToggleEvent[] = [];
          accordion.addEventListener('toggle', (event) => {
            events.push(event as ToggleEvent);
          });

          await activate(harness);
          await accordion.updateComplete;

          expect(accordion.open).toBeTrue();
          expect(events.length).toBe(1);
          expect(events[0]).toBeInstanceOf(ToggleEvent);
          expect(events).toEqual([
            jasmine.objectContaining({oldState: 'closed', newState: 'open'}),
          ]);
        });

        it('is dispatched with oldState "open" and newState "closed" when closed', async () => {
          const {accordion, harness} = await setUpTest(html`
            <md-aria-accordion open></md-aria-accordion>
          `);
          const events: ToggleEvent[] = [];
          accordion.addEventListener('toggle', (event) => {
            events.push(event as ToggleEvent);
          });

          await activate(harness);
          await accordion.updateComplete;

          expect(accordion.open).toBeFalse();
          expect(events.length).toBe(1);
          expect(events[0]).toBeInstanceOf(ToggleEvent);
          expect(events).toEqual([
            jasmine.objectContaining({oldState: 'open', newState: 'closed'}),
          ]);
        });
      });
    }

    it('is dispatched once per user toggle with alternating states', async () => {
      const {accordion, harness} = await setUpTest();
      const events: ToggleEvent[] = [];
      accordion.addEventListener('toggle', (event) => {
        events.push(event as ToggleEvent);
      });

      await harness.clickWithMouse();
      await harness.pressEnter();
      await harness.pressSpace();
      await accordion.updateComplete;

      expect(events).toEqual([
        jasmine.objectContaining({oldState: 'closed', newState: 'open'}),
        jasmine.objectContaining({oldState: 'open', newState: 'closed'}),
        jasmine.objectContaining({oldState: 'closed', newState: 'open'}),
      ]);
    });

    it('is dispatched after the open property has been updated', async () => {
      const {accordion, harness} = await setUpTest();
      const openDuringEvent: boolean[] = [];
      accordion.addEventListener('toggle', () => {
        openDuringEvent.push(accordion.open);
      });

      await harness.clickWithMouse();
      await harness.clickWithMouse();

      expect(openDuringEvent).toEqual([true, false]);
    });

    it('is not dispatched when the click is canceled', async () => {
      const {root, accordion, harness} = await setUpTest();
      const events: ToggleEvent[] = [];
      accordion.addEventListener('toggle', (event) => {
        events.push(event as ToggleEvent);
      });
      root.addEventListener('click', (event) => {
        event.preventDefault();
      });

      await harness.clickWithMouse();
      await harness.pressEnter();
      await harness.pressSpace();
      await accordion.updateComplete;

      expect(events).toEqual([]);
      expect(accordion.open).toBeFalse();
    });

    it('is not dispatched when the open property is set', async () => {
      const {accordion} = await setUpTest();
      const events: ToggleEvent[] = [];
      accordion.addEventListener('toggle', (event) => {
        events.push(event as ToggleEvent);
      });

      accordion.open = true;
      await accordion.updateComplete;
      accordion.open = false;
      await accordion.updateComplete;

      expect(events).toEqual([]);
    });

    it('is not dispatched when the open attribute is changed', async () => {
      const {accordion} = await setUpTest();
      const events: ToggleEvent[] = [];
      accordion.addEventListener('toggle', (event) => {
        events.push(event as ToggleEvent);
      });

      accordion.setAttribute('open', '');
      await accordion.updateComplete;
      accordion.removeAttribute('open');
      await accordion.updateComplete;

      expect(events).toEqual([]);
    });

    it('is not dispatched on an accordion closed programmatically by its group', async () => {
      const {accordions} = await setUpTest(html`
        <md-aria-accordion name="group" open></md-aria-accordion>
        <md-aria-accordion name="group"></md-aria-accordion>
      `);
      const firstEvents: ToggleEvent[] = [];
      accordions[0].addEventListener('toggle', (event) => {
        firstEvents.push(event as ToggleEvent);
      });
      const secondEvents: ToggleEvent[] = [];
      accordions[1].addEventListener('toggle', (event) => {
        secondEvents.push(event as ToggleEvent);
      });

      accordions[1].open = true;
      await settle(accordions);

      expect(openStates(accordions)).toEqual([false, true]);
      expect(firstEvents).toEqual([]);
      expect(secondEvents).toEqual([]);
    });

    it('is only dispatched on the accordion the user toggled when it closes another in its group', async () => {
      const {accordions, harnesses} = await setUpTest(html`
        <md-aria-accordion name="group" open></md-aria-accordion>
        <md-aria-accordion name="group"></md-aria-accordion>
      `);
      const firstEvents: ToggleEvent[] = [];
      accordions[0].addEventListener('toggle', (event) => {
        firstEvents.push(event as ToggleEvent);
      });
      const secondEvents: ToggleEvent[] = [];
      accordions[1].addEventListener('toggle', (event) => {
        secondEvents.push(event as ToggleEvent);
      });

      await harnesses[1].clickWithMouse();
      await settle(accordions);

      expect(openStates(accordions)).toEqual([false, true]);
      expect(firstEvents).toEqual([]);
      expect(secondEvents).toEqual([
        jasmine.objectContaining({oldState: 'closed', newState: 'open'}),
      ]);
    });

    it('is not dispatched when an inserted accordion is closed by its group', async () => {
      const {root, accordions} = await setUpTest(html`
        <md-aria-accordion name="group" open></md-aria-accordion>
      `);
      const existingEvents: ToggleEvent[] = [];
      accordions[0].addEventListener('toggle', (event) => {
        existingEvents.push(event as ToggleEvent);
      });

      const inserted = document.createElement('md-aria-accordion');
      inserted.setAttribute('name', 'group');
      inserted.setAttribute('open', '');
      const insertedEvents: ToggleEvent[] = [];
      inserted.addEventListener('toggle', (event) => {
        insertedEvents.push(event as ToggleEvent);
      });
      root.appendChild(inserted);
      await settle([...accordions, inserted]);

      expect(inserted.open).toBeFalse();
      expect(existingEvents).toEqual([]);
      expect(insertedEvents).toEqual([]);
    });
  });

  describe('headingLevel', () => {
    it('does not wrap the button in a heading by default', async () => {
      const {harness} = await setUpTest();

      expect(harness.getHeading()).toBeNull();
    });

    it('does not set region semantics on the content by default', async () => {
      const {harness} = await setUpTest();
      const slot = harness.getContentSlot();

      expect(slot.hasAttribute('role')).toBeFalse();
      expect(slot.hasAttribute('aria-labelledby')).toBeFalse();
    });

    for (const level of [1, 2, 3, 4, 5, 6]) {
      describe(`set to ${level}`, () => {
        async function setUpHeadingTest() {
          return setUpTest(html`
            <md-aria-accordion .headingLevel=${level}>
              <span slot="title">Title</span>
              <div slot="content">Content</div>
            </md-aria-accordion>
          `);
        }

        it(`wraps the button in an <h${level}>`, async () => {
          const {harness} = await setUpHeadingTest();
          const headings = harness.getAllHeadings();

          expect(headings.length).toBe(1);
          expect(headings[0].localName).toBe(`h${level}`);
          expect(harness.getButton().parentElement).toBe(headings[0]);
        });

        it('gives the content role="region" labelled by the button', async () => {
          const {harness} = await setUpHeadingTest();

          expect(harness.getContentSlot().getAttribute('role')).toBe('region');
          expect(harness.getContentLabelElements()).toEqual([
            harness.getButton(),
          ]);
        });
      });
    }

    it('updates the heading when headingLevel changes', async () => {
      const {accordion, harness} = await setUpTest();

      accordion.headingLevel = 2;
      await accordion.updateComplete;
      expect(harness.getHeading()?.localName).toBe('h2');
      expect(harness.getButton().parentElement).toBe(harness.getHeading());
      expect(harness.getContentSlot().getAttribute('role')).toBe('region');

      accordion.headingLevel = 4;
      await accordion.updateComplete;
      expect(harness.getHeading()?.localName).toBe('h4');
      expect(harness.getButton().parentElement).toBe(harness.getHeading());

      accordion.headingLevel = undefined;
      await accordion.updateComplete;
      expect(harness.getHeading()).toBeNull();
      expect(harness.getContentSlot().hasAttribute('role')).toBeFalse();
      expect(
        harness.getContentSlot().hasAttribute('aria-labelledby'),
      ).toBeFalse();
    });

    it('wraps the button in a heading when set via the attribute', async () => {
      const {harness} = await setUpTest(html`
        <md-aria-accordion headinglevel="3"></md-aria-accordion>
      `);

      expect(harness.getHeading()?.localName).toBe('h3');
      expect(harness.getContentSlot().getAttribute('role')).toBe('region');
    });
  });
});
