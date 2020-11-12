import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/variables-evaluator/variables-evaluator.js';
import '@advanced-rest-client/variables-manager/variables-manager.js';
import '@advanced-rest-client/variables-editor/variables-editor.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/arc-models/url-history-model.js';
import '@advanced-rest-client/arc-models/variables-model.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '@advanced-rest-client/client-certificates-panel/certificate-import.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog-scrollable.js';
import '../request-editor.js';

const REQUEST_STORE_KEY = 'demo.request';

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'readOnly',
      'narrow',
      'ignoreContentOnGet',
      'clientCertificateImport',
      'importOpened',
    ]);
    this._componentName = 'request-editor';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._narrowHandler = this._narrowHandler.bind(this);
    this.generateCertData = this.generateCertData.bind(this);
    this.deleteCertData = this.deleteCertData.bind(this);
    this._clearHandler = this._clearHandler.bind(this);
    this._certImportHandler = this._certImportHandler.bind(this);
    this._closeImportHandler = this._closeImportHandler.bind(this);

    this.oauth2RedirectUri = 'http://auth.advancedrestclient.com/arc.html';
    this.oauth2AuthorizationUri = `${location.protocol}//${location.host}${location.pathname}oauth-authorize.html`;

    this._restoreRequest();

    window.addEventListener('client-certificate-import', this._certImportHandler);
  }

  _restoreRequest() {
    let data = localStorage[REQUEST_STORE_KEY];
    if (data) {
      data = JSON.parse(data);
    } else {
      data = {
        url: location.href,
        method: 'GET'
      };
    }
    this.requestData = data;
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _narrowHandler(e) {
    this.narrow = e.detail.value;
  }

  async generateCertData() {
    await DataGenerator.insertCertificatesData();
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteCertData() {
    const e = new CustomEvent('destroy-model', {
      detail: {
        models: ['client-certificates']
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _requestHandler(e) {
    e.preventDefault();
    const { id } = e.detail;
    console.log('Send action', e.detail);
    setTimeout(() => {
      document.body.dispatchEvent(new CustomEvent('api-response', {
        bubbles: true,
        detail: {
          id
        }
      }));
    }, 1000);
  }

  _requestChanegd(e) {
    const name = e.type.split('-')[0];
    console.log(name, e.detail.value);
    const request = e.target.serializeRequest();
    this.requestData = request;
    localStorage[REQUEST_STORE_KEY] = JSON.stringify(request);
  }

  _clearHandler() {
    localStorage.removeItem(REQUEST_STORE_KEY);
  }

  _certImportHandler() {
    this.importOpened = true;
  }

  _closeImportHandler() {
    this.importOpened = false;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      readOnly,
      narrow,
      oauth2RedirectUri,
      oauth2AuthorizationUri,
      ignoreContentOnGet,
      requestData,
      clientCertificateImport,
    } = this;
    const { url, method, headers, payload, auth, authType, config, requestActions, responseActions } = requestData;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the REST APIs menu element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <request-editor
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?readOnly="${readOnly}"
            ?narrow="${narrow}"
            .oauth2RedirectUri="${oauth2RedirectUri}"
            ?ignorecontentonget="${ignoreContentOnGet}"
            ?clientCertificateImport="${clientCertificateImport}"
            collapseOpened
            slot="content"
            .method="${method}"
            .url="${url}"
            .headers="${headers}"
            .payload="${payload}"
            .auth="${auth}"
            .authType="${authType}"
            .config="${config}"
            .requestActions="${requestActions}"
            .responseActions="${responseActions}"
            .oauth2AuthorizationUri="${oauth2AuthorizationUri}"
            @api-request="${this._requestHandler}"
            @method-changed="${this._requestChanegd}"
            @url-changed="${this._requestChanegd}"
            @headers-changed="${this._requestChanegd}"
            @payload-changed="${this._requestChanegd}"
            @requestactions-changed="${this._requestChanegd}"
            @responseactions-changed="${this._requestChanegd}"
            @auth-changed="${this._requestChanegd}"
            @config-changed="${this._requestChanegd}"
            @request-clear-state="${this._clearHandler}"
          ></request-editor>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="readOnly"
            @change="${this._toggleMainOption}"
          >
            Read only
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="ignoreContentOnGet"
            @change="${this._toggleMainOption}"
          >
            Ignore content-* headers on GET
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="clientCertificateImport"
            @change="${this._toggleMainOption}"
          >
            Client certificate import
          </anypoint-checkbox>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateCertData}">Generate certificates</anypoint-button>
          <anypoint-button @click="${this.deleteCertData}">Clear certificates</anypoint-button>
        </div>
      </section>

      ${this._importDialog()}
    `;
  }

  _importDialog() {
    const { importOpened } = this;
    return html`
    <anypoint-dialog ?opened="${importOpened}">
      <h2>Import a certificate</h2>
      <anypoint-dialog-scrollable>
        <certificate-import @close="${this._closeImportHandler}"></certificate-import>
      </anypoint-dialog-scrollable>
    </anypoint-dialog>
    `;
  }

  contentTemplate() {
    return html`
      <variables-model></variables-model>
      <variables-evaluator></variables-evaluator>
      <variables-manager></variables-manager>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <url-history-model></url-history-model>
      <client-certificate-model></client-certificate-model>
      <iron-media-query
        query="(max-width: 768px)"
        @query-matches-changed="${this._narrowHandler}"></iron-media-query>

      <h2>HTTP request editor</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
