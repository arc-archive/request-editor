import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import * as sinon from 'sinon';
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
      await nextFrame();
    });

    it('dispatches change event', () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.notifyRequestChanged();
      assert.isTrue(spy.called, 'Event is dispatched');
      assert.isFalse(spy.args[0][0].bubbles, 'Event does not bubble');
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
      const panel = element.shadowRoot.querySelector('authorization-selector');
      panel.selected = 'basic';
      await aTimeout();
      const authPanel = element.shadowRoot.querySelector('authorization-method[type="basic"]');
      authPanel.username = 'test-username';
      authPanel.password = 'test-password';
      authPanel.dispatchEvent(new CustomEvent('change'));
      await nextFrame();
      const result = element.serializeRequest();
      assert.typeOf(result.auth, 'object');
      assert.equal(result.authType, 'basic');
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
      element.requestActions = {
        variables: [{
          enabled: true,
          value: 'test-value',
          variable: 'test-var'
        }]
      };
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
      'authorization-selector',
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
        assert.deepEqual(e.detail.requestActions, PREACTIONS, 'Request actions are set');
        assert.deepEqual(e.detail.responseActions, POSTACTIONS, 'Response actions are set');
        assert.deepEqual(e.detail.config, CONFIG, 'Config is set');
        assert.typeOf(e.detail.id, 'string', 'id is set');
        done();
      });
      element.send();
    });
  });

  describe('Authorization settings', function() {
    const HEADERS = '';
    const URL = 'https://mulesoft.com';
    const METHOD = 'GET';

    async function authFixture(type, config) {
      return await fixture(html`<request-editor
      .headers="${HEADERS}"
      .method="${METHOD}"
      .url="${URL}"
      selectedTab="2"
      .authType="${type}"
      .auth="${config}"
      ></request-editor>`);
    }

    describe('Basic auth', function() {
      it('Sets auth property', async () => {
        const element = await authFixture('basic');
        const authPanel = element.shadowRoot.querySelector('authorization-method[type="basic"]');
        authPanel.username = 'test';
        authPanel.password = 'test';
        authPanel.dispatchEvent(new CustomEvent('change'));
        assert.deepEqual(element.auth, {
          username: 'test',
          password: 'test',
        });
      });

      it('restores configuration on the method editor', async () => {
        const element = await authFixture('basic', {
          username: 'restored-uname',
          password: 'restored-pwd',
        });
        const method = element.shadowRoot.querySelector('authorization-method[type="basic"]');
        assert.equal(method.username, 'restored-uname', 'username is restored');
        assert.equal(method.password, 'restored-pwd', 'password is restored');
      });

      it('api-request has auth settings', async () => {
        const element = await authFixture('basic', {
          username: 'uname',
          password: 'pwd',
        });
        const spy = sinon.spy();
        element.addEventListener('api-request', spy);
        element.send();

        const { auth, authType } = spy.args[0][0].detail;
        assert.equal(authType, 'basic');
        assert.equal(auth.username, 'uname');
        assert.equal(auth.password, 'pwd');
      });
    });

    describe('NTLM auth', function() {
      it('sets auth property', async () => {
        const element = await authFixture('ntlm');
        const authPanel = element.shadowRoot.querySelector('authorization-method[type="ntlm"]');
        authPanel.username = 'ntlm-uname';
        authPanel.password = 'ntlm-pwd';
        authPanel.domain = 'mulesoft.com';
        authPanel.dispatchEvent(new CustomEvent('change'));
        assert.deepEqual(element.auth, {
          username: 'ntlm-uname',
          password: 'ntlm-pwd',
          domain: 'mulesoft.com',
        });
      });

      it('restores configuration on the method editor', async () => {
        const element = await authFixture('ntlm', {
          username: 'restored-uname',
          password: 'restored-pwd',
          domain: 'mulesoft.com'
        });
        const method = element.shadowRoot.querySelector('authorization-method[type="ntlm"]');
        assert.equal(method.username, 'restored-uname', 'username is restored');
        assert.equal(method.password, 'restored-pwd', 'password is restored');
        assert.equal(method.domain, 'mulesoft.com', 'domain is restored');
      });

      it('api-request has auth settings', async () => {
        const element = await authFixture('ntlm', {
          username: 'uname',
          password: 'pwd',
          domain: 'mulesoft.com',
        });
        const spy = sinon.spy();
        element.addEventListener('api-request', spy);
        element.send();

        const { auth, authType } = spy.args[0][0].detail;
        assert.equal(authType, 'ntlm');
        assert.equal(auth.username, 'uname');
        assert.equal(auth.password, 'pwd');
        assert.equal(auth.domain, 'mulesoft.com', 'domain is restored');
      });
    });

    describe('OAuth2 auth', function() {
      let config;
      beforeEach(() => {
        config = {
          grantType: 'implicit',
          clientId: 'test-client',
          authorizationUri: 'https://domain.com',
          scopes: ['a', 'b'],
        };
      });

      it('sets auth property', async () => {
        const element = await authFixture('oauth 2');
        const authPanel = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
        Object.keys(config).forEach((key) => {
          authPanel[key] = config[key];
        });
        authPanel.redirectUri = 'https://rdr.com';
        authPanel.dispatchEvent(new CustomEvent('change'));

        assert.deepEqual(element.auth, {
          accessToken: '',
          authorizationUri: config.authorizationUri,
          clientId: config.clientId,
          deliveryMethod: 'header',
          deliveryName: 'authorization',
          grantType: config.grantType,
          type: config.grantType,
          redirectUri: authPanel.redirectUri,
          scopes: ['a', 'b'],
          tokenType: 'Bearer',
        });
      });

      it('restores configuration on the method editor', async () => {
        const element = await authFixture('oauth 2', config);
        const method = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
        Object.keys(config).forEach((key) => {
          assert.equal(method[key], config[key], `${key} is restored`);
        });
      });

      it('api-request has auth settings', async () => {
        config.accessToken = 'test-token';
        const element = await authFixture('oauth 2', config);
        element.oauth2RedirectUri = 'https://rdr.com';
        const spy = sinon.spy();
        element.addEventListener('api-request', spy);
        element.send();

        const { auth, authType } = spy.args[0][0].detail;
        assert.equal(authType, 'oauth 2');
        assert.deepEqual(auth, {
          authorizationUri: config.authorizationUri,
          clientId: config.clientId,
          grantType: config.grantType,
          scopes: ['a', 'b'],
          accessToken: config.accessToken,
        });
      });
    });

    describe('Authorization state notification', function() {
      let element;
      beforeEach(async () => {
        element = await authFixture('basic');
      });

      it('Dispatches change when auth settings change', async () => {
        const spy = sinon.spy();
        element.addEventListener('change', spy);

        const authPanel = element.shadowRoot.querySelector('authorization-method[type="basic"]');
        authPanel.username = 'test-username';
        authPanel.password = 'test-password';
        authPanel.dispatchEvent(new CustomEvent('change'));

        assert.isTrue(spy.called);
      });

      it('Dispatches auth-changed when auth settings change', async () => {
        const spy = sinon.spy();
        element.addEventListener('auth-changed', spy);

        const authPanel = element.shadowRoot.querySelector('authorization-method[type="basic"]');
        authPanel.username = 'test-username';
        authPanel.password = 'test-password';
        authPanel.dispatchEvent(new CustomEvent('change'));

        assert.isTrue(spy.called);
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

  describe('change event', function() {
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

    it('dispatches event when method changes', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.method = METHOD;
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when URL changes', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.url = URL;
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when headers changes', async () => {
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.headers = HEADERS;
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when payload changes', async () => {
      element.method = 'POST';
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.payload = PAYLOAD;
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when request pre-actions list changes', async () => {
      element.selectedTab = 3;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.requestActions = PREACTIONS;
      // the `request-actions-panel` does not notify when actions are set.
      // Only when something in the UI change.
      const panel = element.shadowRoot.querySelector('request-actions-panel');
      panel._notifyRequests();
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when request post-actions list changes', async () => {
      element.selectedTab = 3;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.responseActions = POSTACTIONS;
      // the `request-actions-panel` does not notify when actions are set.
      // Only when something in the UI change.
      const panel = element.shadowRoot.querySelector('request-actions-panel');
      panel._notifyResponses();
      await nextFrame();
      assert.isTrue(spy.called);
    });

    it('dispatches event when payload as FormData changes', async () => {
      element.method = 'POST';
      const spy = sinon.spy();
      element.addEventListener('change', spy);
      element.payload = new FormData();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('dispatches event when payload as Blob changes', async () => {
      element.method = 'POST';
      const spy = sinon.spy();
      element.addEventListener('change', spy);
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
      const panel = element.shadowRoot.querySelector('authorization-selector');
      panel.selected = 'basic';
      await nextFrame();
      authPanel = element.shadowRoot.querySelector('authorization-method[type="basic"]');
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
      assert.isUndefined(element.auth);
      assert.isUndefined(element.authType);
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
      const nodes = element.shadowRoot.querySelectorAll('iron-collapse anypoint-tab');
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
      const nodes = element.shadowRoot.querySelectorAll('iron-collapse anypoint-tab');
      assert.isTrue(nodes[1].hasAttribute('hidden'));
    });
  });

  describe('refreshEditors()', () => {
    let element;
    beforeEach(async () => {
      element = await postRequestFixture();
    });

    it('calls refreshEditors() when tab changes', () => {
      const spy = sinon.spy(element, 'refreshEditors');
      const nodes = element.shadowRoot.querySelectorAll('iron-collapse anypoint-tab');
      MockInteractions.tap(nodes[1]);
      assert.isTrue(spy.called);
    });

    it('calls refreshEditors() from notifyResize()', () => {
      const spy = sinon.spy(element, 'refreshEditors');
      element.notifyResize();
      assert.isTrue(spy.called);
    });

    it('calls refresh() on headers editor', async () => {
      element.selectedTab = 0;
      await nextFrame();
      const editor = element.shadowRoot.querySelector('api-headers-editor');
      const spy = sinon.spy(editor, 'refresh');
      element.refreshEditors();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('calls refresh() on payload editor', async () => {
      element.selectedTab = 1;
      await nextFrame();
      const editor = element.shadowRoot.querySelector('api-body-editor');
      const spy = sinon.spy(editor, 'refresh');
      element.refreshEditors();
      await aTimeout();
      assert.isTrue(spy.called);
    });
  });

  describe('requiresAuthorization()', () => {
    async function authFixture(type, config) {
      return await fixture(html`<request-editor
      headers="accept: */*"
      method="GET"
      url="https://api-domain.com"
      selectedTab="2"
      .authType="${type}"
      .auth="${config}"
      ></request-editor>`);
    }

    it('returns false when no authorization', async () => {
      const element = await basicFixture();
      const result = element.requiresAuthorization();
      assert.isFalse(result);
    });

    it('returns false when no authorization config', async () => {
      const element = await authFixture('oauth 2');
      const result = element.requiresAuthorization();
      assert.isFalse(result);
    });

    it('returns false when authorization is not oauth 2', async () => {
      const element = await authFixture('basic');
      const result = element.requiresAuthorization();
      assert.isFalse(result);
    });

    it('returns false when authorization is not valid', async () => {
      const element = await authFixture('oauth 2', {
        grantType: 'implicit',
        clientId: 'test',
      });
      const authPanel = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
      authPanel.dispatchEvent(new CustomEvent('change'));
      const result = element.requiresAuthorization();
      assert.isFalse(result);
    });

    it('returns true when authorization is valid without accessToken', async () => {
      const element = await authFixture('oauth 2', {
        grantType: 'implicit',
        clientId: 'test',
        authorizationUri: 'https://api.domain.com'
      });
      const authPanel = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
      authPanel.dispatchEvent(new CustomEvent('change'));
      const result = element.requiresAuthorization();
      assert.isTrue(result);
    });

    it('returns false when authorization is valid with accessToken', async () => {
      const element = await authFixture('oauth 2', {
        grantType: 'implicit',
        clientId: 'test',
        authorizationUri: 'https://api.domain.com',
        accessToken: 'test'
      });
      const authPanel = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
      authPanel.dispatchEvent(new CustomEvent('change'));
      const result = element.requiresAuthorization();
      assert.isFalse(result);
    });
  });

  describe('Sending request with OAuth 2 authorization', () => {
    async function authFixture(type, config) {
      return await fixture(html`<request-editor
      headers="accept: */*"
      method="GET"
      url="https://api-domain.com"
      selectedTab="2"
      .authType="${type}"
      .auth="${config}"
      ></request-editor>`);
    }

    function sendTokenResponse(state) {
      const e = new CustomEvent('oauth2-token-response', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          accessToken: 'token-value',
          tokenType: 'bearer',
          state
        }
      });
      document.body.dispatchEvent(e);
    }

    let element;
    beforeEach(async () => {
      element = await authFixture('oauth 2', {
        grantType: 'implicit',
        clientId: 'test',
        authorizationUri: 'https://api.domain.com'
      });
      const authPanel = element.shadowRoot.querySelector('authorization-method[type="oauth 2"]');
      authPanel.dispatchEvent(new CustomEvent('change'));
    });

    it('requests for token when oauth 2 is ready but without token', async () => {
      const spy = sinon.spy();
      element.addEventListener('oauth2-token-requested', spy);
      element.send();
      assert.isTrue(spy.called);
    });

    it('does not send request when requesting token', async () => {
      const spy = sinon.spy();
      element.addEventListener('api-request', spy);
      element.send();
      assert.isFalse(spy.called);
    });

    it('sends request when token is ready', async () => {
      const tokenSpy = sinon.spy();
      element.addEventListener('oauth2-token-requested', tokenSpy);
      element.send();
      const spy = sinon.spy();
      element.addEventListener('api-request', spy);
      sendTokenResponse(tokenSpy.args[0][0].detail.state);
      assert.isTrue(spy.called);
    });
  });

  describe('onchange', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      element.notifyRequestChanged();
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisters old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      element.notifyRequestChanged();
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    // the a11y tests were performed for each individual element.
    // This component does not have any specific ARIA attributes.
    // Becuase axe tests WC deeply this test tests all the components.
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        // Safari throws this error for some reason
        // TODO (pawel): figure out what is happening
        ignoredRules: ['aria-hidden-focus'],
      });
    });
  });
});
