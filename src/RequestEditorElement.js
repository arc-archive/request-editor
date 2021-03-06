/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { cache } from 'lit-html/directives/cache.js';
import '@advanced-rest-client/url-input-editor/url-input-editor.js';
import '@api-components/api-headers-editor/api-headers-editor.js';
import '@advanced-rest-client/http-method-selector/http-method-selector.js';
import '@advanced-rest-client/http-method-selector/http-method-selector-mini.js';
import '@api-components/api-body-editor/api-body-editor.js';
import '@advanced-rest-client/authorization-selector/authorization-selector.js';
import '@advanced-rest-client/authorization-method/authorization-method.js';
import '@advanced-rest-client/cc-authorization-method/cc-authorization-method.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import '@advanced-rest-client/request-actions-panel/request-actions-panel.js';
import { moreVert, clearAll, expandMore } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import styles from './styles.js';
import '../request-config.js';
/**
 * An element that renders the UI to create a HTTP request.
 */
export class RequestEditorElement extends EventsTargetMixin(LitElement) {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * An index of currently opened tab.
       * @default 0
       */
      selectedTab: { type: Number },
      // Current content type.
      contentType: { type: String },
      /**
       * It is set to true automatically when current request can have payload.
       */
      _isPayload: { type: Boolean },
      /**
       * Request headers.
       */
      headers: { type: String },
      /**
       * Body for the request. Note, it may have value even if `isPayload` is set to false.
       */
      payload: { type: String },
      /**
       * Current request URL
       */
      url: { type: String },
      /**
       * Current HTTP method
       */
      method: { type: String },
      /**
       * List of request actions to be performed when the response is received
       */
      responseActions: { type: Array },
      /**
       * List of request actions to be performed before request is send
       */
      requestActions: { type: Array },
      /**
       * If set it renders the view in the narrow layout.
       */
      narrow: { type: Boolean },
      /**
       * When set it will display the UI to indicate that the request is being
       * send.
       */
      loadingRequest: { type: Boolean },
      /**
       * True if the editor panel is opened
       */
      collapseOpened: { type: Boolean },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: { type: String },
      /**
       * Generated request ID when the request is sent. This value is reported
       * in send and abort events
       */
      requestId: { type: String },
      // Current authorization settings.
      auth: { type: Object },
      /**
       * Enabled authorization method
       */
      authType: { type: String },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Set to open URL detailed editor.
       */
      urlOpened: { type: Boolean },
      /**
       * Current state of the editor that can be later used to restore
       * the state. This does not count for request data. It only shows
       * state of the UI regions.
       */
      state: { type: Object, },
      /**
       * Request configuration options.
       * This object is passed with the `api-request` event.
       * @type {Object}
       */
      config: { type: Boolean },
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       */
      ignoreContentOnGet: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * A value to be passed to the OAuth 2 `authorizationUri` property in case
       * if current configuration has no value.
       * This is to be used as a default value.
       */
      oauth2AuthorizationUri: { type: String },
      /**
       * A value to be passed to the OAuth 2 `accessTokenUri` property in case
       * if current configuration has no value.
       * This is to be used as a default value.
       */
      oauth2AccessTokenUri: { type: String },
      /**
       * Enables "import" button in client certificate authorization panel
       */
      clientCertificateImport: { type: Boolean },
    }
  }

  /**
   * @return {Boolean} True if current request can have payload.
   */
  get isPayload() {
    return this._isPayload;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    const old = this._state;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._state = value;
    this._stateChanged(value);
  }

  /**
   * @return {any} Previously registered function or undefined.
   */
  get onchange() {
    return this._onChange;
  }

  /**
   * Registers listener for the `change` event
   * @param {any} value A function to be called when `change` event is
   * dispatched
   */
  set onchange(value) {
    if (this._onChange) {
      this.removeEventListener('change', this._onChange);
    }
    if (typeof value !== 'function') {
      this._onChange = null;
      return;
    }
    this._onChange = value;
    this.addEventListener('change', value);
  }

  get currentEditor() {
    switch (this.selectedTab) {
      case 0: return this.shadowRoot.querySelector('api-headers-editor');
      case 1: return this.shadowRoot.querySelector('api-body-editor');
      case 2: return this.authorizationSelector;
      case 3: return this.shadowRoot.querySelector('request-actions-panel');
      case 4: return this.shadowRoot.querySelector('request-config');
      case 5: return this.shadowRoot.querySelector('http-code-snippets');
      default: return null;
    }
  }

  get authorizationSelector() {
    return this.shadowRoot.querySelector('authorization-selector');
  }

  constructor() {
    super();
    this.selectedTab = 0;

    this._sendRequestInner = this._sendRequestInner.bind(this);
    this._responseHandler = this._responseHandler.bind(this);
    this._authRedirectChangedHandler = this._authRedirectChangedHandler.bind(this);
  }

  _attachListeners(node) {
    window.addEventListener('api-response', this._responseHandler);
    node.addEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    this.addEventListener('api-request', this._sendRequestInner);
    this.addEventListener('send-request', this._sendRequestInner);
  }

  _detachListeners(node) {
    window.removeEventListener('api-response', this._responseHandler);
    node.removeEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    this.removeEventListener('api-request', this._sendRequestInner);
    this.removeEventListener('send-request', this._sendRequestInner);
  }

  /**
   * Handler for the `api-response` custom event.
   * Clears the loading state.
   *
   * @param {CustomEvent} e
   */
  _responseHandler(e) {
    if (!e.detail || (e.detail.id !== this.requestId)) {
      return;
    }
    this.loadingRequest = false;
  }

  /**
   * Handler for the `oauth2-redirect-uri-changed` custom event. Changes
   * the `oauth2RedirectUri` property.
   * @param {CustomEvent} e
   */
  _authRedirectChangedHandler(e) {
    this.oauth2RedirectUri = e.detail.value;
  }

  /**
   * Handles an event dispatched by eny of the child elements.
   * It cancels the even and stops it's propagation and the sends the request
   *
   * @param {CustomEvent} e
   */
  _sendRequestInner(e) {
    const path = (e.path || e.composedPath());
    if (path[0] === this) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.send();
  }

  /**
   * Updates the editor state when `state` changes.
   * @param {Object} state Current state
   */
  async _stateChanged(state) {
    if (!state || this._cancelStateRestore) {
      return;
    }
    await this.updateComplete;
    if (state.collapseOpened !== undefined) {
      const value = Boolean(state.collapseOpened);
      if (value !== this.collapseOpened) {
        this.collapseOpened = value;
      }
    }
    if (state.selectedTab !== undefined) {
      const value = Number(state.selectedTab);
      if (value !== this.selectedTab) {
        if (!(!this.isPayload && value === 1)) {
          this.selectedTab = value;
        }
      }
    }
    if (state.urlOpened !== undefined) {
      const value = Boolean(state.urlOpened);
      if (value !== this.urlOpened) {
        this.urlOpened = value;
      }
    }
    setTimeout(() => this.notifyResize());
  }
  
  /**
   * Validates state of the URL.
   * @return {Boolean} True if the URL has a structure that looks like
   * an URL which means scheme + something
   */
  validateUrl() {
    const panel = this.shadowRoot.querySelector('url-input-editor');
    if (!panel) {
      return true;
    }
    return panel.validate();
  }

  /**
   * Dispatches the `api-request` custom event to send the request.
   *
   * @param {Object} opts Send options:
   * - ignoreValidation (Boolean) - Ignores headers validation
   */
  send(opts) {
    if (!this.validateUrl()) {
      return;
    }
    if (this.requiresAuthorization()) {
      this.authorizationSelector.authorize();
      this._awaitingOAuth2authorization = true;
      return;
    }
    opts = opts || {};
    const request = this.serializeRequest();
    if (!opts.ignoreValidation && this._validateContentHeaders(request)) {
      const node = this.shadowRoot.querySelector('#headersWarningDialog');
      node.opened = true;
      return;
    }
    this.requestId = this.shadowRoot.querySelector('#uuid').generate();
    request.id = this.requestId;
    this.loadingRequest = true;
    this._dispatch('api-request', request);
    this._sendGaEvent('Send request');
  }
  
  /**
   * Checks if current request requires calling `authorize()` on current
   * authorization method.
   *
   * @return {Boolean} This returns `true` only for valid OAuth 2 method that has
   * no access token.
   */
  requiresAuthorization() {
    if (this.authType !== 'oauth 2') {
      return false;
    }
    const { auth, authorizationSelector } = this;
    if (!auth || !authorizationSelector) {
      return false;
    }
    if (authorizationSelector.validate() && !auth.accessToken) {
      return true;
    }
    return false;
  }

  /**
   * Handler for the dialog confirmation button click.
   * Resends the request and skips validation.
   */
  _sendIgnoreValidation() {
    this.send({
      ignoreValidation: true
    });
  }

  /**
   * Sends the `abort-api-request` custom event to cancel the request.
   */
  abort() {
    this._dispatch('abort-api-request', {
      url: this.url,
      id: this.requestId
    });
    this._sendGaEvent('Abort request');
    this.loadingRequest = false;
    this._requestId = undefined;
  }

  /**
   * Clears the request properties and sends cancelable `request-clear-state`
   * custom event.
   */
  clearRequest() {
    this.url = '';
    this.headers = '';
    this.payload = '';
    this.method = 'GET';
    this.responseActions = undefined;
    this.requestActions = undefined;
    this.selectedTab = 0;
    this.auth = undefined;
    this.authType = undefined;
    this._dispatch('request-clear-state');
    this._sendGaEvent('Clear request');
    setTimeout(() => this._unselectRequestMenu());
  }

  /**
   * Deselects menu item if the URL editor is present.
   */
  _unselectRequestMenu() {
    const menu = this.shadowRoot.querySelector('#requestMenu');
    if (!menu) {
      return;
    }
    menu.selected = undefined;
  }

  /**
   * Calls `notifyResize()` on `paper-tabs` and on currently selected panel
   * if any is selected.
   */
  notifyResize() {
    const tabs = this.shadowRoot.querySelector('anypoint-tabs');
    if (tabs) {
      tabs.notifyResize();
    }
    const panel = this.currentEditor;
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
    this.refreshEditors();
  }

  /**
   * Returns headers value.
   * If `ignoreContentOnGet` flag is set and request is `get` then it clears
   * all `content-*` headers.
   * @param {String} method Current HTTP method name.
   * @return {String} HTTP headers string to use with request.
   */
  _getHeaders(method) {
    let headers = this.headers || '';
    if (this.ignoreContentOnGet && method.toLowerCase() === 'get') {
      const reg = /^content-\S+(\s+)?:.*\n?/gim;
      headers = headers.replace(reg, '');
    }
    return headers.trim();
  }

  /**
   * Serializes current request data into an object.
   *
   * @return {Object} Request data object with the following keys:
   * - url (can be empty)
   * - method (can be empty)
   * - headers (can be empty)
   * - payload (can be undefined)
   * - auth (can be undefined)
   * - actions (can be undefined)
   * - queryModel (Array)
   */
  serializeRequest() {
    const method = this.method || 'GET';
    const result = {
      url: this.url || '',
      method,
      headers: this._getHeaders(method),
      config: this.config
    };
    if (this.responseActions) {
      result.responseActions = Array.from(this.responseActions);
    }
    if (this.requestActions) {
      result.requestActions = Object.assign({}, this.requestActions);
    }
    if (['get', 'head'].indexOf(method.toLowerCase()) === -1) {
      result.payload = this.payload;
    }
    const { authType, auth } = this;
    if (authType && auth) {
      result.auth = auth;
      result.authType = authType;
    }
    return result;
  }

  /**
   * Toggles body panel.
   */
  toggle() {
    this.collapseOpened = !this.collapseOpened;
    this._computePanelState();
    this._sendGaEvent('Toggle parameters', String(this.collapseOpened));
  }

  /**
   * Dispatches bubbling and composed custom event.
   * By default the event is cancelable until `cancelable` property is set to false.
   * @param {String} type Event type
   * @param {?any} detail A detail to set
   * @param {?Boolean} cancelable When false the event is not cancelable.
   * @return {CustomEvent}
   */
  _dispatch(type, detail, cancelable) {
    if (typeof cancelable !== 'boolean') {
      cancelable = true;
    }
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }

  /**
   * Sends usage google analytics event
   * @param {String} action Action description
   * @param {String} label Event label
   * @return {CustomEvent}
   */
  _sendGaEvent(action, label) {
    return this._dispatch('send-analytics', {
      type: 'event',
      category: 'Request editor',
      action,
      label
    }, false);
  }

  /**
   * Called when a value on one of the editors change.
   * Dispatches non-bubbling `change` event.
   */
  notifyRequestChanged() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  notifyChanged(type, value) {
    this.dispatchEvent(new CustomEvent(`${type}-changed`, {
      detail: {
        value
      }
    }));
  }

  /**
   * Refreshes payload and headers editors
   * state (code mirror) if currently selected.
   */
  refreshEditors() {
    setTimeout(() => {
      const { selectedTab } = this;
      const isPayload = this.isPayload;
      let panel;
      if (isPayload && selectedTab === 1) {
        panel = this.shadowRoot.querySelector('api-body-editor');
      } else if (selectedTab === 0) {
        panel = this.shadowRoot.querySelector('api-headers-editor');
      }
      if (panel && panel.refresh) {
        panel.refresh();
      }
    });
  }

  /**
   * Validates headers for `Content-*` entries against current method.
   * @param {Object} request The request object
   * @return {Boolean} True if headers are invalid.
   */
  _validateContentHeaders(request) {
    const method = request.method || 'get';
    if (method.toLowerCase() !== 'get') {
      return false;
    }
    if ((request.headers || '').toLowerCase().indexOf('content-') === -1) {
      return false;
    }
    return true;
  }

  /**
   * Computes class for the toggle's button icon.
   * @return {String} CSS class name
   */
  get toggleIconClass() {
    const { collapseOpened } = this;
    let klass = 'toggle-icon';
    if (collapseOpened) {
      klass += ' opened';
    }
    return klass;
  }

  /**
   * Computes title attribute for panel toggle icon.
   * @return {String} Label value
   */
  get toggleLabel() {
    const { collapseOpened } = this;
    return collapseOpened ? 'Hide panel' : 'Show panel';
  }

  _computePanelState() {
    const { collapseOpened, selectedTab, urlOpened } = this;
    const data = {
      collapseOpened,
      selectedTab,
      urlOpened
    };
    this.state = data;
    this.dispatchEvent(new CustomEvent('state', {
      detail: {
        value: data
      }
    }))
  }

  async _isPayloadHandler(e) {
    const { value } = e.detail;
    await this.updateComplete;
    this._isPayload = value;
    if (!value && this.selectedTab === 1) {
      this.selectedTab = 0;
    }
    this.notifyResize();
  }

  _methodHandler(e) {
    const { value } = e.detail;
    this.method = value;
    this.notifyRequestChanged();
    this.notifyChanged('method', value);
  }

  _urlHandler(e) {
    const { value } = e.detail;
    this.url = value;
    this.notifyRequestChanged();
    this.notifyChanged('url', value);
  }

  _urlOpenedHandler(e) {
    const { value } = e.detail;
    this.urlOpened = value;
    this._computePanelState();
  }

  _requestMenuClosed() {
    setTimeout(() => this._unselectRequestMenu());
  }

  _tabHandler(e) {
    this.selectedTab = e.detail.value;
    this._computePanelState();
    this.refreshEditors();
  }

  _ctHandler(e) {
    const { value } = e.detail;
    this.contentType = value;
  }

  _headersHandler(e) {
    const { value } = e.detail;
    this.headers = value;
    this.notifyRequestChanged();
    this.notifyChanged('headers', value);
  }

  _bodyHandler(e) {
    const { value } = e.detail;
    this.payload = value;
    if (this._isPayload === false || ['GET', 'HEAD'].indexOf(this.method) !== -1) {
      return;
    }
    this.notifyRequestChanged();
    this.notifyChanged('payload', value);
  }

  _authChangeHandler(e) {
    const { selected } = e.target;
    if (selected === undefined) {
      return;
    }
    this.auth = e.target.serialize();
    this.authType = selected;
    this.notifyRequestChanged();
    this.notifyChanged('auth');
    if (this._awaitingOAuth2authorization) {
      this._awaitingOAuth2authorization = false;
      if (selected === 'oauth 2') {
        this.send();
      }
    }
  }

  _requestActionsChanged(e) {
    const { value } = e.detail;
    this.requestActions = value;
    this.notifyRequestChanged();
    this.notifyChanged('requestactions', value);
  }

  _responseActionsChanged(e) {
    const { value } = e.detail;
    this.responseActions = value;
    this.notifyRequestChanged();
    this.notifyChanged('responseactions', value);
  }

  _configHandler(e) {
    const { value } = e.detail;
    this.config = value;
    this.notifyRequestChanged();
    this.notifyChanged('config', value);
  }

  render() {
    return html`
      ${this._contentTemplate()}
      ${this._headersDialogTemplate()}
      <uuid-generator id="uuid"></uuid-generator>
    `;
  }

  _contentTemplate() {
    const { collapseOpened } = this;
    return html`
    ${this._urlTemplate()}
    ${this._paramsHeaderTemplate()}
    <anypoint-collapse .opened="${collapseOpened}">
      ${this._editorsTabsTemplate()}
      ${this._editorsTemplate()}
    </anypoint-collapse>
    `;
  }

  _urlTemplate() {
    const {
      compatibility,
      outlined,
      eventsTarget,
      narrow,
      readOnly,
      url,
      urlOpened
    } = this;
    return html`
    ${narrow ? this._methodSelectorTemplate() : ''}
    <div class="url-editor">
      ${!narrow ? this._methodSelectorMiniTemplate() : ''}
      <url-input-editor
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        ?readonly="${readOnly}"
        ?narrow="${narrow}"
        .eventsTarget="${eventsTarget}"
        .value="${url}"
        @value-changed="${this._urlHandler}"
        ?detailsOpened="${urlOpened}"
        @detailsopened="${this._urlOpenedHandler}"
      ></url-input-editor>
      <div class="main-action-buttons">
        ${this._actionButtonTemplate()}
      </div>
      ${this._requestContextMenuTemplate()}
    </div>
    `;
  }

  _methodSelectorTemplate() {
    const {
      compatibility,
      outlined,
      eventsTarget,
      method,
      readOnly
    } = this;
    return html`
    <http-method-selector
      .eventsTarget="${eventsTarget}"
      ?readonly="${readOnly}"
      @ispayload-changed="${this._isPayloadHandler}"
      .method="${method}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @method-changed="${this._methodHandler}"
    ></http-method-selector>`;
  }

  _methodSelectorMiniTemplate() {
    const {
      compatibility,
      outlined,
      eventsTarget,
      method,
      readOnly
    } = this;
    return html`
    <http-method-selector-mini
      .eventsTarget="${eventsTarget}"
      ?readonly="${readOnly}"
      @ispayload-changed="${this._isPayloadHandler}"
      .method="${method}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      @method-changed="${this._methodHandler}"
    ></http-method-selector-mini>`;
  }

  _actionButtonTemplate() {
    const {
      loadingRequest,
      compatibility
    } = this;
    return cache(loadingRequest ?
      html`
      <anypoint-button
        emphasis="high"
        ?compatibility="${compatibility}"
        class="action-button abort"
        @click="${this.abort}"
      >Abort</anypoint-button>` :
      html`
      <anypoint-button
        emphasis="high"
        ?compatibility="${compatibility}"
        class="action-button send"
        @click="${this.send}"
      >send</anypoint-button>`);
  }

  _requestContextMenuTemplate() {
    const {
      compatibility
    } = this;
    return html`
    <anypoint-menu-button
      class="request-menu"
      closeOnActivate
      horizontalalign="right"
      ?compatibility="${compatibility}"
      @dropdown-close="${this._requestMenuClosed}"
    >
      <anypoint-icon-button
        aria-label="Activate to open request's context menu"
        slot="dropdown-trigger"
        ?compatibility="${compatibility}">
        <span class="icon">${moreVert}</span>
      </anypoint-icon-button>
      <anypoint-listbox
        slot="dropdown-content"
        class="options-menu"
        id="requestMenu"
        ?compatibility="${compatibility}">
        <anypoint-icon-item
          class="menu-item"
          title="Clear the request editor"
          aria-label="Activate to clear the request editor"
          @click="${this.clearRequest}"
          tabindex="-1"
        >
          <span slot="item-icon" class="icon context-menu-icon">${clearAll}</span>
          Clear
        </anypoint-icon-item>
        <slot name="request-context-menu"></slot>
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  _paramsHeaderTemplate() {
    const {
      compatibility,
      toggleIconClass,
      toggleLabel
    } = this;
    return html`
    <header class="params-header">
      <h2 @click="${this.toggle}">Request parameters</h2>
      <anypoint-icon-button
        @click="${this.toggle}"
        class="${toggleIconClass}"
        title="${toggleLabel}"
        ?compatibility="${compatibility}"
        arial-label="Activate to toggle parameters visibility"
      >
        <span class="icon">${expandMore}</span>
      </anypoint-icon-button>
    </header>`;
  }

  _headersDialogTemplate() {
    const { compatibility } = this;
    return html`
    <anypoint-dialog id="headersWarningDialog" ?compatibility="${compatibility}">
      <h2>Headers are not valid</h2>
      <div>
        <p>The <b>GET</b> request should not contain <b>content-*</b> headers. It may
        cause the server to behave unexpectedly.</p>
        <p><b>Do you want to continue?</b></p>
      </div>
      <div class="buttons">
        <anypoint-button
          dialog-dismiss
          ?compatibility="${compatibility}"
        >Cancel request</anypoint-button>
        <anypoint-button
          dialog-confirm
          autofocus
          @click="${this._sendIgnoreValidation}"
          ?compatibility="${compatibility}"
        >Continue</anypoint-button>
      </div>
    </anypoint-dialog>`
  }

  _editorsTabsTemplate() {
    const {
      isPayload,
      compatibility,
      selectedTab,
      collapseOpened
    } = this;
    return html`
    <anypoint-tabs
      .selected="${selectedTab}"
      ?hidden="${!collapseOpened}"
      ?compatibility="${compatibility}"
      @selected-changed="${this._tabHandler}"
    >
      <anypoint-tab ?compatibility="${compatibility}">Headers</anypoint-tab>
      <anypoint-tab ?compatibility="${compatibility}" ?hidden="${!isPayload}">Body</anypoint-tab>
      <anypoint-tab ?compatibility="${compatibility}">Authorization</anypoint-tab>
      <anypoint-tab ?compatibility="${compatibility}">Actions</anypoint-tab>
      <anypoint-tab ?compatibility="${compatibility}">Config</anypoint-tab>
      <anypoint-tab ?compatibility="${compatibility}">Code</anypoint-tab>
    </anypoint-tabs>`;
  }

  _editorsTemplate() {
    const {
      selectedTab
    } = this;
    const headersVisible = selectedTab === 0;
    const bodyVisible = selectedTab === 1;
    const authVisible = selectedTab === 2;
    const actionsVisible = selectedTab === 3;
    const configVisible = selectedTab === 4;
    const codeVisible = selectedTab === 5;
    return html`
    <div class="panel">
    ${this._headerEditorTemplate(!headersVisible)}
    ${this._bodyEditorTemplate(!bodyVisible)}
    ${this._authEditorTemplate(!authVisible)}
    ${actionsVisible ? this._actionsEditorTemplate() : ''}
    ${configVisible ? this._configEditorTemplate() : ''}
    ${codeVisible ? this._codeTemplate() : ''}
    </div>
    `;
  }

  _headerEditorTemplate(hidden) {
    const {
      compatibility,
      outlined,
      eventsTarget,
      isPayload,
      contentType,
      headers,
      readOnly,
      narrow
    } = this;
    return html`
    <api-headers-editor
      ?hidden="${hidden}"
      ?legacy="${compatibility}"
      ?outlined="${outlined}"
      ?narrow="${narrow}"
      .eventsTarget="${eventsTarget}"
      ?ispayload="${isPayload}"
      @ispayload-changed="${this._isPayloadHandler}"
      .contentType="${contentType}"
      @content-type-changed="${this._ctHandler}"
      .value="${headers}"
      @value-changed="${this._headersHandler}"
      ?readonly="${readOnly}"
      allowcustom
      allowdisableparams
      allowhideoptional
      autovalidate
    ></api-headers-editor>`;
  }

  _bodyEditorTemplate(hidden) {
    const {
      compatibility,
      outlined,
      eventsTarget,
      contentType,
      payload,
      readOnly,
      narrow
    } = this;
    return html`
    <api-body-editor
      ?hidden="${hidden}"
      ?legacy="${compatibility}"
      ?outlined="${outlined}"
      ?narrow="${narrow}"
      .eventsTarget="${eventsTarget}"
      .contentType="${contentType}"
      @content-type-changed="${this._ctHandler}"
      .value="${payload}"
      @value-changed="${this._bodyHandler}"
      ?readonly="${readOnly}"
      openededitor="0"
      allowcustom
      allowdisableparams
      allowhideoptional
      lineNumbers
    ></api-body-editor>
    `;
  }

  _authEditorTemplate(hidden) {
    const {
      compatibility,
      outlined,
      auth,
      authType,
    } = this;
    return html`
    <authorization-selector
      ?hidden="${hidden}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .selected="${authType}"
      attrforselected="type"
      @change="${this._authChangeHandler}"
    >
      <div type="none" class="empty-auth">Authorization configuration is not set</div>
      ${this._basicAuthTemplate(authType, auth)}
      ${this._ntlmAuthTemplate(authType, auth)}
      ${this._oa1AuthTemplate(authType, auth)}
      ${this._oa2AuthTemplate(authType, auth)}
      ${this._ccAuthTemplate(authType, auth)}
    </authorization-selector>
    `;
  }

  _basicAuthTemplate(type, config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const { username, password } = (type === 'basic' ? config : {});
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="basic"
      .username="${username}"
      .password="${password}"
    ></authorization-method>`;
  }

  _ntlmAuthTemplate(type, config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const { username, password, domain } = (type === 'ntlm' ? config : {});
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="ntlm"
      .username="${username}"
      .password="${password}"
      .domain="${domain}"
    ></authorization-method>`;
  }
  // Note, digest authentication is not yet supported in ARC.
  // _digestAuthTemplate(type, config={}) {
  //   const {
  //     compatibility,
  //     outlined,
  //     url,
  //   } = this;
  //   const {
  //     username, password, realm, nonce, opaque, algorithm,
  //     qop, nc, cnonce,
  //   } = (type === 'digest' ? config : {});
  //   return html`<authorization-method
  //     ?compatibility="${compatibility}"
  //     ?outlined="${outlined}"
  //     type="digest"
  //     .username="${username}"
  //     .password="${password}"
  //     .realm="${realm}"
  //     .nonce="${nonce}"
  //     .opaque="${opaque}"
  //     .algorithm="${algorithm}"
  //     .requestUrl="${url}"
  //     .qop="${qop}"
  //     .cnonce="${cnonce}"
  //     .nc="${nc}"
  //   ></authorization-method>`;
  // }

  _oa1AuthTemplate(type, config={}) {
    const {
      compatibility,
      outlined,
    } = this;
    const {
      consumerKey, consumerSecret, token, tokenSecret, timestamp,
      nonce, realm, signatureMethod, authTokenMethod, authParamsLocation,
      redirectUri,
    } = (type === 'oauth 1' ? config : {});
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="oauth 1"
      .consumerKey="${consumerKey}"
      .consumerSecret="${consumerSecret}"
      .redirectUri="${redirectUri}"
      .token="${token}"
      .tokenSecret="${tokenSecret}"
      .timestamp="${timestamp}"
      .nonce="${nonce}"
      .realm="${realm}"
      .signatureMethod="${signatureMethod}"
      .authTokenMethod="${authTokenMethod}"
      .authParamsLocation="${authParamsLocation}"
      requesttokenuri="http://term.ie/oauth/example/request_token.php"
      accesstokenuri="http://term.ie/oauth/example/access_token.php"
    ></authorization-method>`;
  }

  _oa2AuthTemplate(type, config={}) {
    const {
      compatibility,
      outlined,
      oauth2RedirectUri,
      oauth2AuthorizationUri,
      oauth2AccessTokenUri,
    } = this;
    let {
      accessToken, tokenType, scopes, clientId, grantType, deliveryMethod,
      deliveryName, clientSecret, accessTokenUri, authorizationUri,
      username, password,
    } = (type === 'oauth 2' ? config : {});
    if (!authorizationUri) {
      authorizationUri = oauth2AuthorizationUri;
    }
    if (!accessTokenUri) {
      accessTokenUri = oauth2AccessTokenUri;
    }
    return html`<authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      type="oauth 2"
      .scopes="${scopes}"
      .accessToken="${accessToken}"
      .tokenType="${tokenType}"
      .clientId="${clientId}"
      .clientSecret="${clientSecret}"
      .grantType="${grantType}"
      .deliveryMethod="${deliveryMethod}"
      .deliveryName="${deliveryName}"
      .authorizationUri="${authorizationUri}"
      .accessTokenUri="${accessTokenUri}"
      .username="${username}"
      .password="${password}"
      .redirectUri="${oauth2RedirectUri}"
    ></authorization-method>`;
  }

  _ccAuthTemplate(type, config={}) {
    const {
      compatibility,
      outlined,
      clientCertificateImport,
    } = this;
    const { id } = (type === 'client certificate' ? config : {});
    return html`
    <cc-authorization-method
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .selected="${id}"
      type="client certificate"
      ?importButton="${clientCertificateImport}"
    >
    </cc-authorization-method>`;
  }

  _actionsEditorTemplate() {
    const {
      compatibility,
      outlined,
      responseActions,
      requestActions,
      readOnly
    } = this;
    return html`
    <request-actions-panel
      ?readonly="${readOnly}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .afterActions="${responseActions}"
      .beforeActions="${requestActions}"
      @beforeactions-changed="${this._requestActionsChanged}"
      @afteractions-changed="${this._responseActionsChanged}"
    ></request-actions-panel>`;
  }

  _configEditorTemplate() {
    const {
      compatibility,
      outlined,
      config,
      readOnly
    } = this;
    return html`
    <request-config
      ?readonly="${readOnly}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      .config="${config}"
      @change="${this._configHandler}"
    ></request-config>
    `;
  }

  _codeTemplate() {
    const {
      url,
      method,
      headers,
      payload
    } = this;
    return html`
    <http-code-snippets
      scrollable
      .url="${url}"
      .method="${method}"
      .headers="${headers}"
      .payload="${payload}"
    ></http-code-snippets>
    `;
  }
  /**
   * Fired when the user request to send current request.
   *
   * This event can be cancelled.
   *
   * @event api-request
   * @param {String} url The request URL. Can be empty string.
   * @param {String} method HTTP method name. Can be empty.
   * @param {String} headers HTTP headers string. Can be empty.
   * @param {String|File|FormData} payload Message body. Can be undefined.
   * @param {Object} auth Always undefined. For future use.
   * @param {String} id Generated UUID for the request.
   * @param {Array<Object>} responseActions - List of response actions
   * @param {Array<Object>} requestActions - List of request actions
   */
  /**
   * Fired when the user request to abort current request.
   *
   * This event can be cancelled.
   *
   * @event abort-api-request
   * @param {String} url The request URL. Can be empty string. Also uit may be
   * different URL that the one used to send the request if the user changed
   * it in between.
   * @param {String} id Generated UUID of the request with `api-request`
   * event.
   */
  /**
   * Event fired when any part of the request data change.
   *
   * @event change
   */
  /**
   * Fired when the state of the toggle XHR button change.
   * It is fired to inform request controlling element to switch to the XHR
   * extension.
   * `xhrExtension` must be set to display the toggle button.
   *
   * @event request-use-xhr-changed
   * @param {Boolean} value Current state of the toggle button
   */
  /**
   * Fired when the save action has been requested in the UI.
   * This event is cancelable.
   *
   * @event request-save-state
   */
  /**
   * Fired when clear request state option has been selected from the menu.
   *
   * @event request-clear-state
   */
}
