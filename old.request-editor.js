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
 * Also paper elements: `paper-button`, `paper-tab`, and `paper-tabs`
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @appliesMixin EventsTargetMixin
 */
class RequestEditor {
  static get template() {
    return `
    <style>
    :host {
      display: block;
      @apply --request-editor;
    }

    .url-editor {
      color: var(--request-editor-url-line-color);
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --request-editor-url-editor;
    }

    url-input-editor {
      @apply --layout-flex;
      @apply --request-editor-url-input-editor;
    }

    .main-action-buttons {
      margin-left: 16px;
      @apply --request-editor-main-action-buttons;
    }

    h2 {
      @apply --arc-font-subhead;
    }

    .params-header {
      @apply --layout-horizontal;
      @apply --layout-center;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .params-header h2 {
      cursor: pointer;
    }

    .action-button {
      @apply --action-button;
      @apply --request-editor-main-action-button;
    }

    http-method-selector {
      margin-bottom: 12px;
      @apply --request-editor-method-selector;
    }

    http-method-selector-mini {
      margin-right: 8px;
      @apply --request-editor-method-selector-mini;
    }

    .toggle-icon {
      color: var(--content-action-button-color, rgba(0, 0, 0, 0.74));
      transform: rotateZ(0deg);
      transition: transform 0.3s linear, color 0.25s linear;
    }

    .toggle-icon.opened {
      transform: rotateZ(-180deg);
    }

    .toggle-icon:hover {
      color: var(--content-action-button-color-hover, var(--accent-color, rgba(0, 0, 0, 0.74)));
    }

    [hidden] {
      display: none !important;
    }

    .request-menu {
      color: var(--request-editor-context-menu-color);
      @apply --request-editor-context-menu;
    }

    .menu-item {
      @apply --paper-item;
      color: var(--context-menu-item-color);
      background-color: var(--context-menu-item-background-color);
    }

    .menu-item:hover {
      @apply --paper-item-hover;
      color: var(--context-menu-item-color-hover);
      background-color: var(--context-menu-item-background-color-hover);
    }

    .context-menu-icon {
      color: var(--request-editor-context-menu-icon-color, var(--primary-color));
      @apply --request-editor-context-menu-icon;
    }

    .options-menu {
      @apply --request-editor-context-menu-dropdown;
    }

    .editors-container {
      @apply --request-editor-tabs-container;
    }

    paper-tab.iron-selected {
      @apply --request-editor-tab-selected;
    }

    .inline-method-selector {
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --layout-wrap;
    }

    .additional-info {
      color: var(--request-editor-headers-dialog-secondary-info-color, #777);
    }
    </style>
    <div class="content">
      <template is="dom-if" if="[[!noUrlEditor]]" restamp="">
        <template is="dom-if" if="[[narrow]]" restamp="">
          <http-method-selector
            events-target="[[eventsTarget]]"
            method="{{method}}"
            is-payload="{{isPayload}}"
            readonly="[[readonly]]"></http-method-selector>
        </template>
        <div class="url-editor">
          <template is="dom-if" if="[[!narrow]]" restamp="">
            <http-method-selector-mini
              events-target="[[eventsTarget]]"
              method="{{method}}"
              is-payload="{{isPayload}}"
              readonly="[[readonly]]"></http-method-selector-mini>
          </template>
          <url-input-editor
            events-target="[[eventsTarget]]"
            auto-validate=""
            required=""
            value="{{url}}"
            invalid="{{urlInvalid}}"
            readonly="[[readonly]]"
            details-opened="{{urlOpened}}"
            narrow="[[narrow]]"></url-input-editor>
          <div class="main-action-buttons">
            <paper-button
              raised=""
              class="action-button send"
              hidden="[[loadingRequest]]"
              on-click="send">send</paper-button>
            <paper-button
              raised=""
              class="action-button abort"
              hidden="[[!loadingRequest]]"
              on-click="abort">abort</paper-button>
          </div>
          <paper-menu-button
            horizontal-align="right"
            class="request-menu"
            close-on-activate=""
            on-paper-dropdown-close="_requestMenuClosed">
            <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
            <paper-listbox slot="dropdown-content" class="options-menu" id="requestMenu">
              <paper-icon-item on-click="clearRequest" class="menu-item">
                <iron-icon
                  icon="arc:clear-all"
                  class="context-menu-icon"
                  slot="item-icon"
                  title="Clear request data"></iron-icon>
                Clear
              </paper-icon-item>
              <slot name="request-context-menu"></slot>
            </paper-listbox>
          </paper-menu-button>
        </div>
      </template>
      <template is="dom-if" if="[[noUrlEditor]]" restamp="">
        <div class="inline-method-selector">
          <http-method-selector
            events-target="[[eventsTarget]]"
            method="{{method}}"
            is-payload="{{isPayload}}"
            readonly="[[readonly]]"></http-method-selector>
          <paper-menu-button
            horizontal-align="right"
            class="request-menu"
            close-on-activate=""
            on-paper-dropdown-close="_requestMenuClosed">
            <paper-icon-button icon="arc:more-vert" slot="dropdown-trigger"></paper-icon-button>
            <paper-listbox slot="dropdown-content" class="options-menu" id="requestMenu">
              <paper-icon-item on-click="clearRequest" class="menu-item">
                <iron-icon
                  icon="arc:clear-all"
                  class="context-menu-icon"
                  slot="item-icon"
                  title="Clear request data"></iron-icon>
                Clear
              </paper-icon-item>
              <slot name="request-context-menu"></slot>
            </paper-listbox>
          </paper-menu-button>
        </div>
      </template>
      <section class="params-section">
        <header class="params-header">
          <h2 on-click="toggle">Parameters</h2>
          <paper-icon-button
            on-click="toggle"
            icon="arc:expand-more"
            class="[[_computeToggleIconClass(collapseOpened)]]"
            title="[[_computeToggleLabel(collapseOpened)]]"></paper-icon-button>
        </header>
        <iron-collapse opened="[[collapseOpened]]">
          <paper-tabs selected="{{selectedTab}}" hidden="[[!collapseOpened]]">
            <paper-tab>Headers</paper-tab>
            <paper-tab hidden="[[!isPayload]]">Body</paper-tab>
            <paper-tab>Authorization</paper-tab>
            <paper-tab>Actions</paper-tab>
          </paper-tabs>
          <iron-pages selected="[[selectedTab]]" selected-attribute="opened" class="editors-container">
            <api-headers-editor
              events-target="[[eventsTarget]]"
              is-payload="{{isPayload}}"
              content-type="{{contentType}}"
              value="{{headers}}"
              on-headers-changed="_headersChanged"
              readonly="[[readonly]]"
              allow-custom
              allow-disable-params
              allow-hide-optional></api-headers-editor>
            <api-body-editor
              events-target="[[eventsTarget]]"
              content-type="[[contentType]]"
              value="{{payload}}"
              readonly="[[readonly]]"
              opened-editor="0"
              allow-custom
              allow-disable-params
              allow-hide-optional></api-body-editor>
            <authorization-panel
              redirect-uri="[[oauth2RedirectUri]]"
              settings="{{authSettings}}"
              http-method="[[method]]"
              request-url="[[url]]"
              request-body="[[payload]]"
              readonly="[[readonly]]"></authorization-panel>
            <request-actions-panel
              after-actions="{{responseActions}}"
              before-actions="{{requestActions}}"
              readonly="[[readonly]]"></request-actions-panel>
          </iron-pages>
        </iron-collapse>
      </section>
    </div>
    <uuid-generator id="uuid"></uuid-generator>
    <paper-dialog id="headersWarningDialog">
      <h2>Headers are not valid</h2>
      <div>
        <p>The <b>GET</b> request should not contain <b>content-*</b> headers. It may
        cause the server to behave unexpectedly.</p>
        <p><b>Do you want to continue?</b></p>
      </div>
      <div class="buttons">
        <paper-button dialog-dismiss>Cancel request</paper-button>
        <paper-button dialog-confirm autofocus on-click="_sendIgnoreValidation">Continue</paper-button>
      </div>
    </paper-dialog>`;
  }

  static get properties() {
    return {
      // Selected request tab.
      selectedTab: {
        type: Number,
        value: 0,
        observer: '_refreshEditors'
      },
      // Current content type.
      contentType: {
        type: String,
        notify: true
      },
      // Computed value if the method can carry a payload
      isPayload: {
        type: Boolean,
        notify: true,
        observer: '_isPayloadChanged'
      },
      // Headers for the request.
      headers: {
        type: String,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      // Body for the request
      payload: {
        type: String,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      // Current URL
      url: {
        type: String,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      // Current HTTP method
      method: {
        type: String,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      /**
       * List of request actions to be performed when the response is received
       */
      responseActions: {
        type: Array,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      /**
       * List of request actions to be performed before request is send
       */
      requestActions: {
        type: Array,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      /**
       * If set it renders the view in the narrow layout.
       */
      narrow: { type: Boolean, value: false },
      /**
       * Computed value when the URL change.
       * If not valid form submission won't be possible.
       */
      urlInvalid: {
        type: Boolean,
        notify: true
      },
      /**
       * Removes the URL editor from the DOM.
       * It will also cause that the `url` property will be empty and
       * on events fired by this element.
       */
      noUrlEditor: {
        type: Boolean,
        value: false,
        observer: '_noUrlEditorChanged'
      },
      /**
       * When set it will display the UI to indicate that the request is being
       * send.
       */
      loadingRequest: {
        type: Boolean,
        value: false
      },
      // True if the editor panel is opened
      collapseOpened: {
        type: Boolean,
        value: true
      },
      /**
       * Redirect URL for the OAuth2 authorization.
       * If can be also set by dispatching `oauth2-redirect-url-changed`
       * with `value` property on the `detail` object.
       */
      oauth2RedirectUri: String,
      /**
       * Generated request ID when the request is sent. This value is reported
       * in send and abort events
       */
      requestId: String,
      // Current authorization panel settings.
      authSettings: {
        type: Object,
        notify: true,
        observer: 'notifyRequestChanged'
      },
      /**
       * When set the editor is in read only mode.
       */
      readonly: Boolean,
      /**
       * Set to open URL detailed editor.
       */
      urlOpened: Boolean,
      /**
       * Current state of the editor that can be later used to restore
       * the satte. This does not count for request data. It only shows
       * state of the UI regions.
       * @type {Object}
       */
      state: {
        type: Object,
        notify: true,
        observer: '_stateChanged'
      },
      /**
       * When set it will ignore all `content-*` headers when the request method
       * is either `GET` or `HEAD`.
       * When not set or `false` it renders warning dialog.
       * @type {Boolean}
       */
      ignoreContentOnGet: Boolean
    };
  }

  static get observers() {
    return [
      '_computePanelState(collapseOpened, selectedTab, urlOpened)'
    ];
  }

  constructor() {
    this._sendRequestInner = this._sendRequestInner.bind(this);
    this._authRedirectChanged = this._authRedirectChanged.bind(this);
  }

  _attachListeners(node) {
    this.addEventListener('api-request', this._sendRequestInner);
    this.addEventListener('send-request', this._sendRequestInner);
    node.addEventListener('oauth2-redirect-uri-changed', this._authRedirectChanged);
  }

  _detachListeners(node) {
    this.removeEventListener('api-request', this._sendRequestInner);
    this.removeEventListener('send-request', this._sendRequestInner);
    node.removeEventListener('oauth2-redirect-uri-changed', this._authRedirectChanged);
  }

  /**
   * Toggles body panel.
   */
  toggle() {
    this.collapseOpened = !this.collapseOpened;
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
    const input = this.shadowRoot.querySelector('url-input-editor');
    const queryModel = input ? input.queryParameters : [];
    const method = this.method || 'GET';
    const result = {
      url: this.url || '',
      method,
      headers: this._getHeaders(method),
      payload: this.payload,
      auth: this.authSettings,
      responseActions: this.responseActions,
      requestActions: this.requestActions,
      queryModel
    };
    return result;
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
   * Computes class for the toggle's button icon.
   * @param {Boolean} opened Collapse opened state
   * @return {String} CSS class name
   */
  _computeToggleIconClass(opened) {
    let klass = 'toggle-icon';
    if (opened) {
      klass += ' opened';
    }
    return klass;
  }
  /**
   * Computes title attribute for panel toggle icon.
   * @param {Boolean} opened Collapse opened state
   * @return {String} Label value
   */
  _computeToggleLabel(opened) {
    return opened ? 'Hide panel' : 'Show panel';
  }
  /**
   * Handles change to `isPayload` property. Restores payload editor tab
   * if needed.
   *
   * @param {Boolean} isPayload
   */
  _isPayloadChanged(isPayload) {
    if (!isPayload && this.selectedTab === 1) {
      this.selectedTab = 0;
    }
    this.notifyResize();
  }
  /**
   * Calls `notifyResize()` on `paper-tabs` and on currently selected panel
   * if any is selected.
   */
  notifyResize() {
    const tabs = this.shadowRoot.querySelector('paper-tabs');
    if (tabs) {
      tabs.notifyResize();
    }
    const panel = this.shadowRoot.querySelector('.editors-container').selectedItem;
    if (panel && panel.notifyResize) {
      panel.notifyResize();
    }
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
   * Handles an event dispatched by eny of the child elements.
   * It cancels the even and stops it's propagation and the sends the request
   *
   * @param {CustomEvent} e
   */
  _sendRequestInner(e) {
    if (e.composedPath()[0] === this) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.send();
  }
  /**
   * Dispatches the `api-request` custom event to send the request.
   *
   * @param {Object} opts Send oiptions:
   * - ignoreValidation (Boolean) - Ignores headers validation
   */
  send(opts) {
    opts = opts || {};
    const request = this.serializeRequest();
    if (!opts.ignoreValidation && this._validateContentHeaders(request)) {
      this.$.headersWarningDialog.opened = true;
      return;
    }
    this.requestId = this.$.uuid.generate();
    request.id = this.requestId;
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
  }
  /**
   * Clears the URL value if the URL editor is removed.
   *
   * @param {Boolean} value
   */
  _noUrlEditorChanged(value) {
    if (value) {
      this.set('url', undefined);
    }
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
   * Clears the request properties and sends cancelable `request-clear-state`
   * custom event.
   */
  clearRequest() {
    this.set('url', '');
    this.set('headers', '');
    this.set('payload', '');
    this.set('method', 'GET');
    this.set('responseActions', undefined);
    this.set('requestActions', undefined);
    this.shadowRoot.querySelector('authorization-panel').clear();
    this.selectedTab = 0;
    this._dispatch('request-clear-state');
    this._sendGaEvent('Clear request');
    setTimeout(() => this._unselectRequestMenu());
  }

  _authRedirectChanged(e) {
    this.oauth2RedirectUri = e.detail.value;
  }
  /**
   * Computes and sets `state` property.
   * It is called automatically if any of the arguments change.
   * @param {Boolean} collapseOpened
   * @param {Number} selectedTab
   * @param {Boolean} urlOpened
   */
  _computePanelState(collapseOpened, selectedTab, urlOpened) {
    const data = {
      collapseOpened,
      selectedTab,
      urlOpened
    };
    this._cancelStateRestore = true;
    this.state = data;
    this._cancelStateRestore = false;
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
    setTimeout(this, () => this.notifyResize());
  }

  _requestMenuClosed() {
    setTimeout(this, () => this._unselectRequestMenu());
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
window.customElements.define('request-editor', RequestEditor);
