import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import * as sinon from 'sinon';
import '../request-config.js';

describe('<request-config>', function() {
  async function basicFixture(config) {
    return await fixture(html`
      <request-config .config="${config}"></request-config>
    `);
  }

  describe('no configuration', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('disables inputs', () => {
      const switches = element.shadowRoot.querySelectorAll('anypoint-switch');
      for (let i = 0; i < switches.length; i++) {
        const node = switches[i];
        if (node.name === 'enabled') {
          continue;
        }
        assert.isTrue(node.disabled, `${node.name} is disabled`);
      }
      const inputs = element.shadowRoot.querySelectorAll('anypoint-input');
      for (let i = 0; i < inputs.length; i++) {
        const node = inputs[i];
        assert.isTrue(node.disabled, `${node.name} is disabled`);
      }
    });

    it('enable button is not disabled', () => {
      const button = element.shadowRoot.querySelector('[name="enabled"]');
      assert.notEqual(button.disabled, true);
    });

    it('enables inputs when enabled clicked', async () => {
      const button = element.shadowRoot.querySelector('[name="enabled"]');
      MockInteractions.tap(button);
      await nextFrame();
      assert.isTrue(element.config.enabled, 'sets config.enabled');
      const switches = element.shadowRoot.querySelectorAll('anypoint-switch');
      for (let i = 0; i < switches.length; i++) {
        const node = switches[i];
        if (node.name === 'enabled') {
          continue;
        }
        assert.isFalse(node.disabled, `${node.name} is enabled`);
      }
      const inputs = element.shadowRoot.querySelectorAll('anypoint-input');
      for (let i = 0; i < inputs.length; i++) {
        const node = inputs[i];
        assert.isFalse(node.disabled, `${node.name} is enabled`);
      }
    });

    it('sets default config', () => {
      const button = element.shadowRoot.querySelector('[name="enabled"]');
      MockInteractions.tap(button);
      assert.deepEqual(element.config, {
        enabled: true,
        timeout: 90,
        followRedirects: true
      });
    });
  });

  describe('with model', () => {
    let element;
    let model;
    beforeEach(async () => {
      model = {
        enabled: true,
        timeout: 50,
        followRedirects: true,
        validateCertificates: true,
        nativeTransport: true,
        defaultHeaders: true
      };
      element = await basicFixture(model);
    });
    // switches
    [
      'enabled', 'followRedirects', 'validateCertificates', 'nativeTransport',
      'defaultHeaders'
    ]
    .forEach((prop) => {
      it(`checks ${prop} input`, () => {
        assert.isTrue(element.config[prop]);
      });

      it(`toggles ${prop} input`, () => {
        const button = element.shadowRoot.querySelector(`[name="${prop}"]`);
        MockInteractions.tap(button);
        assert.isFalse(element.config[prop]);
      });

      it(`notifies value change for ${prop}`, () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const button = element.shadowRoot.querySelector(`[name="${prop}"]`);
        MockInteractions.tap(button);
        assert.isTrue(spy.called);
      });
    });
    // text inputs
    [
      ['timeout', 50, 100]
    ]
    .forEach(([prop, value, change]) => {
      it(`sets ${prop} value`, () => {
        const input = element.shadowRoot.querySelector(`[name="${prop}"]`);
        assert.equal(input.value, value);
      });

      it(`changes ${prop} on input`, () => {
        const input = element.shadowRoot.querySelector(`[name="${prop}"]`);
        input.value = change;
        assert.equal(element.config[prop], change);
      });

      it(`notifies value change for ${prop}`, () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);
        const input = element.shadowRoot.querySelector(`[name="${prop}"]`);
        input.value = change;
        assert.isTrue(spy.called);
      });
    });
  });

  describe('a11y', () => {
    it('is accessible when not enabled', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('is accessible when enabled', async () => {
      const model = {
        enabled: true,
        timeout: 50,
        followRedirects: true,
        validateCertificates: true,
        nativeTransport: true,
        defaultHeaders: true
      };
      const element = await basicFixture(model);
      await assert.isAccessible(element);
    });
  });
});
