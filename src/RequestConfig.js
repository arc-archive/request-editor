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
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import styles from './config-styles.js';
/**
 * A per-request configuration oprions.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class RequestConfig extends LitElement {
  static get styles() {
    return styles;
  }

  static get properties() {
    return {
      /**
       * Request configuration object
       */
      config: { type: Object },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material's outlined theme for inputs.
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.config = {};
  }

  _setDefaults() {
    this.config.timeout = 90;
    this.config.followRedirects = true;
    this.config.ignoreSessionCookies = false;
  }

  _inputHandler(e) {
    if (!this.config) {
      this.config = {};
    }
    const { name, value } = e.target;
    this.config[name] = value;
    this.notify();
  }

  _checkedHandler(e) {
    if (!this.config) {
      this.config = {};
    }
    const { name, checked } = e.target;
    this.config[name] = checked;
    this.notify();
    if (name === 'enabled') {
      if (Object.keys(this.config).length === 1) {
        this._setDefaults();
      }
      this.requestUpdate();
    }
  }

  notify() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        value: this.config
      }
    }));
  }

  render() {
    const {
      compatibility,
      outlined,
      readOnly
    } = this;
    const config = this.config || {};
    const ok = config.enabled || false;
    return html`
      ${this._headerTemplate(ok, compatibility, readOnly)}
      ${this._redirectsTemplate(ok, config, compatibility, readOnly)}
      ${this._timeoutTemplate(ok, config, compatibility, outlined, readOnly)}
      ${this._validateSslTemplate(ok, config, compatibility, readOnly)}
      ${this._nodeClientTemplate(ok, config, compatibility, readOnly)}
      ${this._defaultHeadersTemplate(ok, config, compatibility, readOnly)}
      ${this._disableCookiesTemplate(ok, config, compatibility, readOnly)}
    `;
  }

  _headerTemplate(configEnabled, compatibility, readOnly) {
    return html`
    <div class="header">
      Request configuration
    </div>
    <p>
      Per-request configuration overrides values in a workspace and then global
      configuration.
    </p>
    <p>
      <anypoint-switch
        name="enabled"
        .checked="${configEnabled}"
        @checked-changed="${this._checkedHandler}"
        ?compatibility="${compatibility}"
        ?readOnly="${readOnly}"
      >Request configuration enabled</anypoint-switch>
    </p>
    `;
  }

  _redirectsTemplate(enabled, config, compatibility, readOnly) {
    return html`
    <anypoint-switch
      name="followRedirects"
      .checked="${config.followRedirects}"
      @checked-changed="${this._checkedHandler}"
      ?compatibility="${compatibility}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
      tabindex="0"
    >Follow redirects</anypoint-switch>
    `;
  }

  _timeoutTemplate(enabled, config, compatibility, outlined, readOnly) {
    return html`
    <anypoint-input
      name="timeout"
      min="0"
      step="1"
      type="number"
      pattern="[0-9]*"
      invalidmessage="Enter time as a number"
      autovalidate
      .value="${config.timeout}"
      @value-changed="${this._inputHandler}"
      ?compatibility="${compatibility}"
      ?outlined="${outlined}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
    >
      <label slot="label">Request timeout</label>
      <div slot="suffix">seconds</div>
    </anypoint-input>
    `;
  }

  _validateSslTemplate(enabled, config, compatibility, readOnly) {
    return html`
    <p>
    <anypoint-switch
      name="validateCertificates"
      .checked="${config.validateCertificates}"
      @checked-changed="${this._checkedHandler}"
      ?compatibility="${compatibility}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
      tabindex="0"
    >Validate SSL certificates (experiment)</anypoint-switch>
    </p>
    `;
  }

  _nodeClientTemplate(enabled, config, compatibility, readOnly) {
    return html`
    <p>
    <anypoint-switch
      name="nativeTransport"
      .checked="${config.nativeTransport}"
      @checked-changed="${this._checkedHandler}"
      ?compatibility="${compatibility}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
      tabindex="0"
    >Node native request (experiment)</anypoint-switch>
    </p>
    `;
  }

  _defaultHeadersTemplate(enabled, config, compatibility, readOnly) {
    return html`
    <p>
    <anypoint-switch
      name="defaultHeaders"
      .checked="${config.defaultHeaders}"
      @checked-changed="${this._checkedHandler}"
      ?compatibility="${compatibility}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
      tabindex="0"
    >Add default headers (accept and user-agent)</anypoint-switch>
    </p>
    `;
  }

  _disableCookiesTemplate(enabled, config, compatibility, readOnly) {
    return html`
    <p>
    <anypoint-switch
      name="ignoreSessionCookies"
      .checked="${config.ignoreSessionCookies}"
      @checked-changed="${this._checkedHandler}"
      ?compatibility="${compatibility}"
      ?disabled="${!enabled}"
      ?readOnly="${readOnly}"
      tabindex="0"
      title="When checked it does not add cookies to this request atuomatically"
    >Disable auto cookies processing</anypoint-switch>
    </p>
    `;
  }
}
