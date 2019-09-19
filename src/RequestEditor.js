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
import '@advanced-rest-client/authorization-panel/authorization-panel.js';
import '@advanced-rest-client/uuid-generator/uuid-generator.js';
import '@advanced-rest-client/request-actions-panel/request-actions-panel.js';
import { moreVert, clearAll, expandMore } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import styles from './styles.js';
import '../request-config.js';
/**
 * An element that renders the UI to create a HTTP request.
 *
 * It produces the following values (as element's properties):
 *
 * - url - the request URL
 * - method - HTTP method
 * - headers - HTTP headers string
 * - payload - Request body. It can be either String,
 * [File](https://developer.mozilla.org/en-US/docs/Web/API/File),
 * ([Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob)), or
 * [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData).
 * - requestActions - List of request actions as defined in
 * `request-actions-panel` element.
 * - responseActions - List of response actions as defined in
 * `request-actions-panel` element.
 * - headersModel - Model for headers value (not yet implemented)
 *
 * ## Variables
 *
 * Output of abt of this properties can contain a variables in format `${varName}`.
 * Use
 * [variables-evaluator](https://github.com/advanced-rest-client/variables-evaluator)
 * to evaluate variables to the final output.
 *
 * This element works with
 * [variables-manager](https://github.com/advanced-rest-client/variables-manager)
 * that stores variables in the local datastore. It should be placed anywhere
 * in the DOM. The elements uses browser's events system to communicate.
 *
 * Note, as of version 2.0 this component does not include editor for variables.
 * Variables are not part of the request and therefore are included into request
 * editor. The app should place `variables-editor` somewhere.
 *
 * ## Events retargeting
 *
 * The editors listens to varous events related to the request state. By default
 * all of the editors listens on a window object. To limit this, set `eventsTarget`
 * on this element to point an element that will be used as events target.
 * This way it is possible to enclose the request panel in a "tab".
 *
 * The `eventsTarget` property is propagated to the editors.
 *
 * Event fired by this or any of the editors will not stop on the `eventsTarget`
 * element and you are responsible to cancel them if nescesary.
 *
 * ## Accessing request data
 *
 * You can access request data by either accessing corresponding property of the
 * element, by listening for `property-changed` event or by listening for
 * `request-data-changed` custom event.
 *
 * Only the last one bubbles through the DOM.
 *
 * ### Example
 *
 * ```html
 * <request-editor
 *  url="{{requestUrl}}"
 *  on-headers-changed="_headersChangedEvent"></request-editor>
 * ```
 *
 * or
 *
 * ```javascript
 * document.body.addEventListener('request-data-changed', (e) => {
 *  console.log(e.detail);
 * });
 * ```
 *
 * ## Authorization panel
 *
 * Authorization panel renders methods to authorize the user.
 * Detailed documentation for authorization is at
 * https://github.com/advanced-rest-client/authorization-panel
 *
 * To make OAuth2 work properly set `oauth2RedirectUri` property to application
 * redirect URI. User should set this value in in provider's settings.
 *
 * ## Request and response actions
 *
 * Request actions allows to (re)set variables before the request is made.
 * Response actions allows to perform a user defined action when the response is ready.
 * More information can be found here:
 * https://github.com/advanced-rest-client/request-actions-panel
 *
 * ### Styling
 *
 * `<request-editor>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--request-editor` | Mixin applied to the element | `{}`
 * `--request-editor-url-editor` | Mixin applied to a line with the URL editor | `{}`
 * `--arc-font-subhead` | Theme mixin, applied to the section name title | `{}`
 * `--action-button` | Theme mixin, applied to the acction buttons | `{}`
 * `--request-editor-context-menu-icon-color` | Color of an icon in the context
 * menu | `--primary-color`
 * `--request-editor-context-menu-icon` | Mixin applied to an icon in the
 * context menu | `{}`
 * `--request-editor-main-action-buttons` | Mixin applied to the action buttons
 * next to the URL editor | `{}`
 * `--request-editor-url-input-editor` | Mixin applied to the URL editor | `{}`
 * `--request-editor-method-selector` | Mixin applied to the methos selector in
 * narrow view | `{}`
 * `--request-editor-method-selector-mini` | Mixin applied to the methos selector
 * in wide view | `{}`
 * `--request-editor-context-menu` | Mixin applied to the main action context
 *  menu dropdown | `{}`
 * `--request-editor-context-menu-dropdown` | Mixin applied to the main action
 * context menu dropdown container | `{}`
 * `--request-editor-main-action-button` | Mixin applied to the send / abort
 * buttons | `{}`
 * `--request-editor-tabs-container` | Mixin applied to the headers and body
 * editors container | `{}`
 * `--request-editor-tab-selected` | Mixin applied to selected tab | `{}`
 * `--request-editor-url-line-color` | Color of the URL section | ``
 * `--request-editor-context-menu-color` | Color of the context menu | ``
 * `--context-menu-item-color` | Color of the context menu item | ``
 * `--context-menu-item-background-color` | Background color of the context menu item | ``
 * `--context-menu-item-color-hover` | Color of the context menu item when hovered | ``
 * `--context-menu-item-background-color-hover` | Background color of the context menu item when hovered | ``
 *
 * To style edtors use variables defined in the following elements:
 * - [url-input-editor](https://github.com/advanced-rest-client/url-input-editor)
 * - [headers-editor](https://github.com/advanced-rest-client/headers-editor)
 * - [http-method-selector](https://github.com/advanced-rest-client/http-method-selector)
 * - [payload-editor](https://github.com/advanced-rest-client/payload-editor)
 * - [variables-editor](https://github.com/advanced-rest-client/variables-editor)
 *
 * Also anypoint elements: `anypoint-button`, `anypoint-tab`, and `anypoint-tabs`
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin EventsTargetMixin
 */
export class RequestEditor extends EventsTargetMixin(LitElement) {
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
      requestId: String,
      // Current authorization panel settings.
      authSettings: { type: Object },
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
       * the satte. This does not count for request data. It only shows
       * state of the UI regions.
       * @type {Object}
       */
      state: { type: Object, },
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       * @type {Boolean}
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

  constructor() {
    super();
    this.selectedTab = 0;

    this._sendRequestInner = this._sendRequestInner.bind(this);
    this._authSettingsChanged = this._authSettingsChanged.bind(this);
    this._responseHandler = this._responseHandler.bind(this);
    this._authRedirectChangedHandler = this._authRedirectChangedHandler.bind(this);
  }

  _attachListeners(node) {
    this.addEventListener('authorization-settings-changed', this._authSettingsChanged);
    window.addEventListener('api-response', this._responseHandler);
    node.addEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    this.addEventListener('api-request', this._sendRequestInner);
    this.addEventListener('send-request', this._sendRequestInner);
  }

  _detachListeners(node) {
    this.removeEventListener('authorization-settings-changed', this._authSettingsChanged);
    window.removeEventListener('api-response', this._responseHandler);
    node.removeEventListener('oauth2-redirect-uri-changed', this._authRedirectChangedHandler);
    this.removeEventListener('api-request', this._sendRequestInner);
    this.removeEventListener('send-request', this._sendRequestInner);
  }

  /**
   * Handler for the `authorization-settings-changed` dispatched by
   * authorization panel. Sets auth settings and executes the request if
   * any pending if valid.
   *
   * @param {CustomEvent} e
   */
  _authSettingsChanged(e) {
    this.authMethod = e.detail.type;
    this.authSettings = e.detail.settings;
    if (e.detail.valid && this.__requestAuthAwaiting) {
      this.__requestAuthAwaiting = false;
      this.execute();
    }
    // this._reValidate();
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
   * Updates the editor state when `stae` changes.
   * @param {Object} state Current state
   */
  _stateChanged(state) {
    if (!state || this._cancelStateRestore) {
      return;
    }
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
   * @param {Object} opts Send oiptions:
   * - ignoreValidation (Boolean) - Ignores headers validation
   */
  send(opts) {
    if (!this.validateUrl()) {
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
    this.shadowRoot.querySelector('authorization-panel').clear();
    this.selectedTab = 0;
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

  get currentEditor() {
    switch (this.selectedTab) {
      case 0: return this.shadowRoot.querySelector('api-headers-editor');
      case 1: return this.shadowRoot.querySelector('api-body-editor');
      case 2: return this.shadowRoot.querySelector('authorization-panel');
      case 3: return this.shadowRoot.querySelector('request-actions-panel');
      case 4: return this.shadowRoot.querySelector('request-config');
      case 5: return this.shadowRoot.querySelector('http-code-snippets');
      default: return null;
    }
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
      auth: this.authSettings,
      responseActions: this.responseActions,
      requestActions: this.requestActions
    };
    if (['get', 'head'].indexOf(method.toLowerCase()) === -1) {
      result.payload = this.payload;
    }
    if (this.authMethod && this.authSettings) {
      result.auth = this.authSettings;
      result.authType = this.authMethod;
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
   * Called each time if any of `method`, `url`, 'payload' or `headers` filed
   * change. Fires the `request-data-changed` custom event with current values
   * of the request.
   */
  notifyRequestChanged() {
    const request = this.serializeRequest();
    this._dispatch('request-data-changed', request);
  }

  notifyChanged(type, value) {
    this.dispatchEvent(new CustomEvent(`${type}-changed`, {
      detail: {
        value
      }
    }));
  }

  /**
   * Called when the selected tab changes. Refreshes payload and headers editor
   * state (code mirror) if currently selected.
   *
   * @param {Number} selectedTab
   */
  _refreshEditors(selectedTab) {
    setTimeout(() => {
      const isPayload = this.isPayload;
      let panel;
      if (isPayload && selectedTab === 2) {
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
   * Validates headers for `Content-*` entries agains current method.
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

  _isPayloadHandler(e) {
    const { value } = e.detail;
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
    this._refreshEditors();
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
    this.notifyRequestChanged();
    this.notifyChanged('payload', value);
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
    <div class="content">
      ${this._urlTemplate()}
      <section class="params-section">
        ${this._paramsHeaderTemplate()}
        <iron-collapse .opened="${collapseOpened}">
          ${this._editorsTabsTemplate()}
          ${this._editorsTemplate()}
        </iron-collapse>
      </section>
    </div>
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
        autovalidate
        required
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
      .method="${method}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readonly="${readOnly}"
      @method-changed="${this._methodHandler}"
      @ispayload-changed="${this._isPayloadHandler}"
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
      .method="${method}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?readonly="${readOnly}"
      @method-changed="${this._methodHandler}"
      @ispayload-changed="${this._isPayloadHandler}"
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
      oauth2RedirectUri,
      authSettings,
      method,
      payload,
      url,
      readOnly
    } = this;
    return html`
    <authorization-panel
      ?hidden="${hidden}"
      ?legacy="${compatibility}"
      ?outlined="${outlined}"
      .redirectUri="${oauth2RedirectUri}"
      .settings="${authSettings}"
      .httpMethod="${method}"
      .requestUrl="${url}"
      .requestBody="${payload}"
      ?readonly="${readOnly}"
    ></authorization-panel>
    `;
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
   * @event request-data-changed
   * @param {String} url The request URL. Can be empty string.
   * @param {String} method HTTP method name. Can be empty.
   * @param {String} headers HTTP headers string. Can be empty.
   * @param {String|File|FormData} payload Message body. Can be undefined.
   * @param {Object} auth Always undefined. For future use.
   * @param {Array<Object>} responseActions - List of response actions
   * @param {Array<Object>} requestActions - List of request actions
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
