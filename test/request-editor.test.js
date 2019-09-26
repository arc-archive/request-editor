import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '../request-editor.js';

describe('<request-editor>', function() {
  async function basicFixture() {
    return await fixture(html`
      <request-editor></request-editor>
    `);
  }

  async function postRequestFixture() {
    return await fixture(html`
      <request-editor method="POST" url="https://domain.com"></request-editor>
    `);
  }

  async function getRequestFixture() {
    return await fixture(html`
      <request-editor method="GET" url="https://domain.com"></request-editor>
    `);
  }

  describe('_dispatch()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });
    const eName = 'test-event';
    const eDetail = 'test-detail';
    it('Dispatches an event', () => {
      const spy = sinon.spy();
      element.addEventListener(eName, spy);
      element._dispatch(eName);
      assert.isTrue(spy.called);
    });
    it('Returns the event', () => {
      const e = element._dispatch(eName);
      assert.typeOf(e, 'customevent');
    });
    it('Event is cancelable by default', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.cancelable);
    });
    it('Event is composed', () => {
      const e = element._dispatch(eName);
      if (typeof e.composed !== 'undefined') {
        assert.isTrue(e.composed);
      }
    });
    it('Event bubbles', () => {
      const e = element._dispatch(eName);
      assert.isTrue(e.bubbles);
    });
    it('Event is not cancelable when set', () => {
      const e = element._dispatch(eName, eDetail, false);
      assert.isFalse(e.cancelable);
    });
    it('Event has detail', () => {
      const e = element._dispatch(eName, eDetail);
      assert.equal(e.detail, eDetail);
    });
  });

  describe('_sendGaEvent()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });
    const action = 'test-action';
    it('Calls _dispatch()', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._sendGaEvent(action);
      assert.isTrue(spy.called);
    });
    it('Returns the event', () => {
      const e = element._sendGaEvent(action);
      assert.typeOf(e, 'customevent');
      assert.equal(e.type, 'send-analytics');
    });
    it('Event is not cancelable', () => {
      const e = element._sendGaEvent(action);
      assert.isFalse(e.cancelable);
    });
    it('Detail has action', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.action, action);
    });
    it('Detail has category', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.category, 'Request editor');
    });
    it('Detail has type', () => {
      const e = element._sendGaEvent(action);
      assert.equal(e.detail.type, 'event');
    });
  });

  describe('toggle()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('opens the parameters editor', function() {
      element.toggle();
      assert.isTrue(element.collapseOpened);
    });

    it('closes back the parameters editor', async () => {
      element.toggle();
      await nextFrame();
      element.toggle();
      assert.isFalse(element.collapseOpened);
    });

    it('opens the parameters editor on the header click', function() {
      const node = element.shadowRoot.querySelector('h2');
      MockInteractions.tap(node);
      assert.isTrue(element.collapseOpened);
    });

    it('Dispatches GA event', () => {
      const spy = sinon.spy(element, '_sendGaEvent');
      element.toggle();
      assert.isTrue(spy.called, '_sendGaEvent was called');
      assert.equal(spy.args[0][0], 'Toggle parameters');
      assert.typeOf(spy.args[0][1], 'string');
    });
  });

  describe('notifyRequestChanged()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.url = 'test-url';
      element.method = 'test-method';
      element.headers = 'test-headers';
      await nextFrame();
    });

    it('Calls serializeRequest()', () => {
      const spy = sinon.spy(element, 'serializeRequest');
      element.notifyRequestChanged();
      assert.isTrue(spy.called);
    });

    it('Calls _dispatch()', () => {
      const spy = sinon.spy(element, '_dispatch');
      element.notifyRequestChanged();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'request-data-changed');
      assert.typeOf(spy.args[0][1], 'object');
      assert.isUndefined(spy.args[0][2]);
    });
  });

  describe('_getHeaders()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns all headers', () => {
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      const result = element._getHeaders('GET');
      assert.equal(result, 'content-type: my/app\naccept: all\ncontent-length: 80');
    });

    it('Returns all headers for post', () => {
      element.ignoreContentOnGet = true;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      const result = element._getHeaders('POST');
      assert.equal(result, 'content-type: my/app\naccept: all\ncontent-length: 80');
    });

    it('Filters headers for GET', () => {
      element.ignoreContentOnGet = true;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      const result = element._getHeaders('GET');
      assert.equal(result, 'accept: all');
    });
  });

  describe('serializeRequest()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns an object', () => {
      const result = element.serializeRequest();
      assert.typeOf(result, 'object');
    });

    it('Sets empty url if missing', () => {
      const result = element.serializeRequest();
      assert.equal(result.url, '');
    });

    it('Sets editor url', () => {
      element.url = 'test-url';
      const result = element.serializeRequest();
      assert.equal(result.url, element.url);
    });

    it('Sets default method if missing', () => {
      element.method = '';
      const result = element.serializeRequest();
      assert.equal(result.method, 'GET');
    });

    it('Sets editor method', () => {
      element.method = 'test-method';
      const result = element.serializeRequest();
      assert.equal(result.method, element.method);
    });

    it('Sets default headers if missing', () => {
      element.headers = undefined;
      const result = element.serializeRequest();
      assert.equal(result.headers, '');
    });

    it('Sets editor headers', () => {
      element.headers = 'test-header';
      const result = element.serializeRequest();
      assert.equal(result.headers, element.headers);
    });

    it('Sets editor payload', () => {
      element.method = 'POST';
      element.payload = 'test-payload';
      const result = element.serializeRequest();
      assert.equal(result.payload, element.payload);
    });

    it('Calls _getHeaders() and sets headers property', () => {
      element.ignoreContentOnGet = true;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      const result = element.serializeRequest();
      assert.equal(result.headers, 'accept: all');
    });

    it('Sets auth', async () => {
      const panel = element.shadowRoot.querySelector('authorization-panel');
      panel.selected = 1;
      await aTimeout();
      const authPanel = panel.shadowRoot.querySelector('auth-method-basic');
      authPanel.username = 'test-username';
      authPanel.password = 'test-password';
      await aTimeout();
      const result = element.serializeRequest();
      assert.typeOf(result.auth, 'object');
      assert.equal(result.authType, 'Basic Authentication');
      assert.equal(result.auth.username, authPanel.username);
      assert.equal(result.auth.password, authPanel.password);
    });

    it('Sets responseActions', () => {
      element.responseActions = [{
        'source': 'request.body',
        'action': 'assign-variable',
        'enabled': true
      }];
      const result = element.serializeRequest();
      assert.deepEqual(result.responseActions, element.responseActions);
    });

    it('Sets requestActions', () => {
      element.requestActions = [{
        variables: [{
          enabled: true,
          value: 'test-value',
          variable: 'test-var'
        }]
      }];
      const result = element.serializeRequest();
      assert.deepEqual(result.requestActions, element.requestActions);
    });

    it('Sets config', () => {
      element.config = {
        timeout: 50
      };
      const result = element.serializeRequest();
      assert.deepEqual(result.config, element.config);
    });
  });

  describe('_sendRequestInner()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls send()', function() {
      const spy = sinon.spy(element, 'send');
      const obj = {
        preventDefault: function() {},
        stopPropagation: function() {},
        composedPath: () => []
      };
      element._sendRequestInner(obj);
      assert.isTrue(spy.called);
    });

    it('Do not calls send() when it is the source', function() {
      const spy = sinon.spy(element, 'send');
      element._sendRequestInner({
        composedPath: () => [element],
        preventDefault: function() {},
        stopPropagation: function() {},
        target: element
      });
      assert.isFalse(spy.called);
    });
  });

  describe('panels rendering', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      'api-headers-editor',
      'api-body-editor',
      'authorization-panel',
      'request-actions-panel',
      'request-config',
      'http-code-snippets'
    ].forEach((name, index) => {
      it(`renders ${name} panel`, async () => {
        element.method = 'POST';
        element.selectedTab = index;
        await nextFrame();
        const node = element.shadowRoot.querySelector(name);
        assert.ok(node, 'panel is in the DOM');
        assert.isFalse(node.hasAttribute('hidden'), 'panel is not hidden');
      });

      it(`returns ${name} in "currentEditor" getter`, async () => {
        element.method = 'POST';
        element.selectedTab = index;
        await nextFrame();
        assert.equal(element.currentEditor.localName, name);
      });
    });
  });

  describe('Content-type value', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('updates content type when headers value change', async () => {
      element.currentEditor.value = 'Content-type: x-test';
      await nextFrame();
      assert.equal(element.contentType, 'x-test');
    });
  });

  describe('api-response event', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.loadingRequest = true;
      element.requestId = 'test-id'
    });

    function fire(id) {
      const detail = id ? { id } : undefined
      const e = new CustomEvent('api-response', {
        bubbles: true,
        detail
      });
      document.body.dispatchEvent(e);
    }

    it('clears loadingRequest', () => {
      fire('test-id');
      assert.isFalse(element.loadingRequest);
    });

    it('ignores other requests', () => {
      fire('other');
      assert.isTrue(element.loadingRequest);
    });

    it('handles no-detail situation', () => {
      fire();
      assert.isTrue(element.loadingRequest);
    });
  });

  describe('oauth2-redirect-uri-changed event', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function fire() {
      const e = new CustomEvent('oauth2-redirect-uri-changed', {
        bubbles: true,
        detail: {
          value: 'test-uri'
        }
      });
      document.body.dispatchEvent(e);
    }

    it('sets oauth2RedirectUri', () => {
      fire();
      assert.equal(element.oauth2RedirectUri, 'test-uri');
    });
  });

  describe('Components configuration', () => {
    describe('api-headers-editor', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        element.method = 'POST';
        await nextFrame();
      });

      [
        ['allowCustom', true],
        ['allowDisableParams', true],
        ['allowHideOptional', true]
      ].forEach((item) => {
        it(`Has ${item[0]} set`, () => {
          const panel = element.shadowRoot.querySelector('api-headers-editor');
          assert.equal(panel[item[0]], item[1]);
        });
      });
    });
    describe('api-body-editor', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
        element.method = 'POST';
        await nextFrame();
      });

      [
        ['selected', 0],
        ['allowCustom', true],
        ['allowDisableParams', true],
        ['allowHideOptional', true]
      ].forEach((item) => {
        it(`Has ${item[0]} set`, () => {
          const panel = element.shadowRoot.querySelector('api-body-editor');
          assert.equal(panel[item[0]], item[1]);
        });
      });
    });
  });

  describe('_validateContentHeaders()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns false for non GET request', () => {
      const result = element._validateContentHeaders({
        method: 'POST'
      });
      assert.isFalse(result);
    });

    it('Returns false for non GET request', () => {
      const result = element._validateContentHeaders({
        method: 'POST'
      });
      assert.isFalse(result);
    });

    it('Returns false when no headers', () => {
      const result = element._validateContentHeaders({
        method: 'GET'
      });
      assert.isFalse(result);
    });

    it('Returns true when content-length header found', () => {
      const result = element._validateContentHeaders({
        method: 'GET',
        headers: 'accept: xxx\ncontent-length: 10'
      });
      assert.isTrue(result);
    });

    it('Uses default method', () => {
      const result = element._validateContentHeaders({
        headers: 'content-length: 10\naccept: xxx\n'
      });
      assert.isTrue(result);
    });
  });

  describe('api-request event', function() {
    let element;
    const HEADERS = 'content-type: test';
    const URL = 'https://mulesoft.com';
    const METHOD = 'PUT';
    const PAYLOAD = 'test-payload';
    const POSTACTIONS = [{
      'source': 'request.body',
      'action': 'assign-variable',
      'enabled': true
    }];
    const PREACTIONS = {
      variables: [{
        enabled: true,
        value: 'test-value',
        variable: 'test-var'
      }]
    };

    const CONFIG = {
      timeout: 50
    };

    beforeEach(async () => {
      element = await basicFixture();
      element.headers = HEADERS;
      element.method = METHOD;
      element.url = URL;
      element.payload = PAYLOAD;
      element.requestActions = PREACTIONS;
      element.responseActions = POSTACTIONS;
      element.config = CONFIG;
      await nextFrame();
    });

    it('Fires when send button pressed', function() {
      const spy = sinon.spy();
      element.addEventListener('api-request', spy);
      const button = element.shadowRoot.querySelector('.action-button.send');
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('Event contains the request data', function(done) {
      element.addEventListener('api-request', function(e) {
        assert.equal(e.detail.url, URL, 'URL is set');
        assert.equal(e.detail.method, METHOD, 'Method is set');
        assert.equal(e.detail.headers, HEADERS, 'Headers are set');
        assert.equal(e.detail.payload, PAYLOAD, 'Payload is set');
        assert.isTrue(e.detail.requestActions === PREACTIONS, 'Request actions are set');
        assert.isTrue(e.detail.responseActions === POSTACTIONS, 'Response actions are set');
        assert.deepEqual(e.detail.config, CONFIG, 'Config is set');
        assert.typeOf(e.detail.id, 'string', 'id is set');
        done();
      });
      element.send();
    });
  });

  describe('Authorization settings', function() {
    let element;
    const HEADERS = '';
    const URL = 'https://mulesoft.com';
    const METHOD = 'GET';
    let panel;
    let authPanel;
    async function setupElement() {
      element = await basicFixture();
      element.headers = HEADERS;
      element.method = METHOD;
      element.url = URL;
      element.selectedTab = 2;
      await nextFrame();
      panel = element.shadowRoot.querySelector('authorization-panel');
      return element;
    }

    describe('Basic auth', function() {
      let element;
      before(async () => {
        element = await setupElement();
        panel.selected = 1;
        await nextFrame();
        authPanel = panel.shadowRoot.querySelector('auth-method-basic');
        authPanel.username = 'test';
        authPanel.password = 'test';
        await aTimeout();
      });

      it('Sets authSettings property', function() {
        assert.typeOf(element.authSettings, 'object');
      });

      it('Has headers data', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          assert.equal(e.detail.headers, 'Authorization: Basic dGVzdDp0ZXN0');
          done();
        });
        element.send();
      });

      it('Accepts settings', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          const settings = e.detail.auth;
          assert.typeOf(settings, 'object');
          assert.equal(e.detail.authType, 'Basic Authentication');
          assert.equal(settings.password, 'test');
          assert.equal(settings.username, 'test');
          assert.equal(settings.hash, 'dGVzdDp0ZXN0');
          done();
        });
        element.send();
      });
    });

    describe('NTLM auth', function() {
      let element;
      before(async () => {
        element = await setupElement();
        panel.selected = 2;
        await nextFrame();
        authPanel = panel.shadowRoot.querySelector('auth-method-ntlm');
        authPanel.username = 'test';
        authPanel.password = 'test';
        authPanel.domain = 'mulesoft.com';
        await aTimeout(100);
      });

      it('Headers are not altered', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          assert.equal(e.detail.headers, HEADERS);
          done();
        });
        element.send();
      });

      it('Accepts settings', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          const settings = e.detail.auth;
          assert.typeOf(settings, 'object');
          assert.equal(e.detail.authType, 'ntlm');
          assert.equal(settings.password, 'test');
          assert.equal(settings.username, 'test');
          assert.equal(settings.domain, 'mulesoft.com');
          done();
        });
        element.send();
      });
    });

    describe('OAuth2 auth', function() {
      let element;
      before(async () => {
        sessionStorage.removeItem('auth.methods.latest.auth_token');
        sessionStorage.removeItem('auth.methods.latest.auth_uri');
        sessionStorage.removeItem('auth.methods.latest.client_id');
        sessionStorage.removeItem('auth.methods.latest.tokenType');
        element = await setupElement();
        panel.selected = 4;
        await nextFrame();
        authPanel = panel.shadowRoot.querySelector('auth-method-oauth2');
        authPanel.grantType = 'implicit';
        authPanel.clientId = 'test-clinet';
        authPanel.authorizationUri = 'https://domain.com';
        await aTimeout();
      });

      it('Headers are not altered', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          assert.equal(e.detail.headers, HEADERS);
          done();
        });
        element.send();
      });

      it('Accepts settings', function(done) {
        element.addEventListener('api-request', function clb(e) {
          element.removeEventListener('api-request', clb);
          const settings = e.detail.auth;
          assert.typeOf(settings, 'object');
          assert.equal(e.detail.authType, 'OAuth 2.0');
          assert.equal(settings.type, 'implicit');
          assert.equal(settings.clientId, 'test-clinet');
          assert.equal(settings.authorizationUri, 'https://domain.com');
          done();
        });
        element.send();
      });
    });
  });

  describe('Content headers setup', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.method = 'GET';
      element.url = 'https://api.domain.com';
      await nextFrame();
    });

    it('Headers are automatically filtered', function(done) {
      element.addEventListener('api-request', function clb(e) {
        element.removeEventListener('api-request', clb);
        assert.equal(e.detail.headers, 'accept: all');
        done();
      });
      element.ignoreContentOnGet = true;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      element.send();
    });

    it('Headers are not filtered for POST', function(done) {
      element.addEventListener('api-request', function clb(e) {
        element.removeEventListener('api-request', clb);
        assert.equal(e.detail.headers, 'content-type: my/app\naccept: all\ncontent-length: 80');
        done();
      });
      element.method = 'POST';
      element.ignoreContentOnGet = true;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      element.send();
    });

    it('Renders warning dialog is opened', function() {
      element.ignoreContentOnGet = false;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      element.send();
      const node = element.shadowRoot.querySelector('#headersWarningDialog');
      assert.isTrue(node.opened);
    });

    it('Dialog confirmation sends the requests', function(done) {
      element.addEventListener('api-request', function clb(e) {
        element.removeEventListener('api-request', clb);
        assert.equal(e.detail.headers, 'content-type: my/app\naccept: all\ncontent-length: 80');
        done();
      });
      element.ignoreContentOnGet = false;
      element.headers = 'content-type: my/app\naccept: all\ncontent-length: 80';
      element.send();
      setTimeout(() => {
        const node = element.shadowRoot.querySelector('anypoint-button[dialog-confirm]');
        node.click();
      });
    });
  });

  describe('Panel state', () => {
    describe('State computation', function() {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Computes state for collapse', function() {
        element.toggle();
        const state = element.state;
        assert.typeOf(state, 'object', 'State is an object');
        assert.isTrue(state.collapseOpened, 'collapseOpened is set');
        assert.equal(state.selectedTab, 0, 'selectedTab is 0');
        assert.isUndefined(state.urlOpened, 'urlOpened is undefined');
      });

      it('Computes state for tab', function() {
        const node = element.shadowRoot.querySelectorAll('anypoint-tab')[2];
        MockInteractions.tap(node);
        const state = element.state;
        assert.typeOf(state, 'object', 'State is an object');
        assert.isUndefined(state.collapseOpened, 'collapseOpened is not set');
        assert.equal(state.selectedTab, 2, 'selectedTab is 2');
        assert.isUndefined(state.urlOpened, 'urlOpened is undefined');
      });

      it('Computes state for urlOpened', function() {
        const editor = element.shadowRoot.querySelector('url-input-editor');
        const button = editor.shadowRoot.querySelector('.toggle-button');
        MockInteractions.tap(button);
        const state = element.state;
        assert.typeOf(state, 'object', 'State is an object');
        assert.isUndefined(state.collapseOpened, 'collapseOpened is not set');
        assert.equal(state.selectedTab, 0, 'selectedTab is 0');
        assert.isTrue(state.urlOpened, 'urlOpened is true');
      });
    });

    describe('State restoration', function() {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Restores collapse state', async function() {
        element.state = { collapseOpened: false };
        await nextFrame();
        assert.isFalse(element.collapseOpened);
      });

      it('Restores selected tab state', async function() {
        element.state = { selectedTab: 2 };
        await nextFrame();
        assert.equal(element.selectedTab, 2);
      });

      it('Does not restores tab if it is body and no payload', async function() {
        element.method = 'GET';
        element.state = { selectedTab: 1 };
        await nextFrame();
        assert.equal(element.selectedTab, 0);
      });

      it('Restores url opened state', async function() {
        element.state = { urlOpened: true };
        await nextFrame();
        assert.isTrue(element.urlOpened);
      });
    });
  });

  describe('request-data-changed event', function() {
    let element;
    const HEADERS = 'content-type: test';
    const URL = 'https://mulesoft.com?param=value';
    const METHOD = 'HEAD';
    const PAYLOAD = 'test-payload';
    const POSTACTIONS = [{
      'source': 'request.body',
      'action': 'assign-variable',
      'enabled': true
    }];
    const PREACTIONS = {
      variables: [{
        enabled: true,
        value: 'test-value',
        variable: 'test-var'
      }]
    };

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Fires event when method changes', function(done) {
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.equal(e.detail.method, METHOD);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.method = METHOD;
    });

    it('Fires event when URL changes', function(done) {
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.equal(e.detail.url, URL);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.url = URL;
    });

    it('Fires event when headers changes', function(done) {
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.equal(e.detail.headers, HEADERS);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.headers = HEADERS;
    });

    it('Fires event when payload changes', function(done) {
      element.method = 'POST';
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.equal(e.detail.payload, PAYLOAD);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.payload = PAYLOAD;
    });

    it('Fires event when request pre-actions list changes', function(done) {
      element.method = 'POST';
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.isTrue(e.detail.requestActions === PREACTIONS);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.requestActions = PREACTIONS;
    });

    it('Fires event when request post-actions list changes', function(done) {
      element.method = 'POST';
      const callback = function(e) {
        element.removeEventListener('request-data-changed', callback);
        assert.isTrue(e.detail.responseActions === POSTACTIONS);
        done();
      };
      element.addEventListener('request-data-changed', callback);
      element.responseActions = POSTACTIONS;
    });

    it('Fires event when payload as FormData changes', async () => {
      element.method = 'POST';
      const spy = sinon.spy();
      element.addEventListener('request-data-changed', spy);
      element.payload = new FormData();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('fires event when payload as Blob changes', async () => {
      element.method = 'POST';
      const spy = sinon.spy();
      element.addEventListener('request-data-changed', spy);
      element.payload = new Blob(['']);
      await aTimeout();
      assert.isTrue(spy.called);
    });
  });

  describe('context menu', function() {
    let element;
    let authPanel;
    beforeEach(async () => {
      element = await basicFixture();
      const panel = element.shadowRoot.querySelector('authorization-panel');
      panel.selected = 1;
      await nextFrame();
      authPanel = panel.shadowRoot.querySelector('auth-method-basic');
    });

    it('Fires request-clear-state custom event', function() {
      const spy = sinon.spy();
      element.addEventListener('request-clear-state', spy);
      element.clearRequest();
      assert.isTrue(spy.calledOnce);
    });

    it('clearRequest clears the state', async () => {
      element.url = 'http://test.com';
      element.method = 'PUT';
      element.selectedTab = 1;
      element.headers = 'test';
      element.payload = 'test';
      element.requestActions = [{
        variables: [{
          enabled: true,
          value: 'test-value',
          variable: 'test-var'
        }]
      }];
      element.responseActions = [{
        'source': 'request.body',
        'action': 'assign-variable',
        'enabled': true
      }];

      authPanel.username = 'test';
      authPanel.password = 'test';
      await aTimeout();
      // 1 is for panel initialization and 2 is for change debouncer
      await aTimeout();
      element.clearRequest();

      assert.equal(element.method, 'GET', 'method is re-set');
      assert.equal(element.url, '', 'URL is cleared');
      assert.equal(element.selectedTab, 0, 'selected tab is re-set');
      assert.equal(element.headers, '', 'headers are cleared');
      assert.equal(element.payload, '', 'payload is cleared');
      assert.isUndefined(element.requestActions);
      assert.isUndefined(element.responseActions);
      assert.isUndefined(element.authSettings);
    });
  });

  describe('abort-api-request event', function() {
    let element;
    const HEADERS = 'content-type: test';
    const URL = 'https://mulesoft.com';
    const METHOD = 'PUT';
    const PAYLOAD = 'test-payload';
    const ID = 'test-id';
    beforeEach(async () => {
      element = await basicFixture();
      element.headers = HEADERS;
      element.method = METHOD;
      element.url = URL;
      element.payload = PAYLOAD;
      element.requestId = ID;
      element.loadingRequest = true;
      await nextFrame();
    });

    it('Fires when abort button pressed', function() {
      const spy = sinon.spy();
      element.addEventListener('abort-api-request', spy);
      const button = element.shadowRoot.querySelector('.action-button.abort');
      button.click();
      assert.isTrue(spy.calledOnce);
    });

    it('Event contains the URL and the ID', function(done) {
      element.addEventListener('abort-api-request', function clb(e) {
        element.removeEventListener('abort-api-request', clb);
        assert.equal(e.detail.url, URL, 'URL is set');
        assert.equal(e.detail.id, ID, 'id is set');
        done();
      });
      element.abort();
    });
  });

  describe('Request with payload', () => {
    let element;
    beforeEach(async () => {
      element = await postRequestFixture();
    });

    it('has isPayload value', () => {
      assert.isTrue(element.isPayload);
    });

    it('renders payload tab', () => {
      const nodes = element.shadowRoot.querySelectorAll('.params-section anypoint-tab');
      assert.isFalse(nodes[1].hasAttribute('hidden'));
    });
  });

  describe('Request without payload', () => {
    let element;
    beforeEach(async () => {
      element = await getRequestFixture();
    });

    it('has no isPayload value', () => {
      assert.notOk(element.isPayload);
    });

    it('renders payload tab hidden', () => {
      const nodes = element.shadowRoot.querySelectorAll('.params-section anypoint-tab');
      assert.isTrue(nodes[1].hasAttribute('hidden'));
    });
  });

  describe('a11y', () => {
    // the a11y tests were performed for each individual element.
    // This component does not have any specific ARIA attributes.
    // Becuase axe tests WC deeply this test tests all the components.
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });
  });
});
