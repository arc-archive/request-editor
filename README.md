[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/request-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/request-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/request-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/request-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/request-editor)

## &lt;request-editor&gt;

A HTTP request editor. It allows the user to provide values to build a HTTP request in an accessible UI.

## Usage

### Installation
```
npm install --save @advanced-rest-client/request-editor
```

### In a LitElement

```javascript
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/request-actions-panel/request-actions-panel.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <request-actions-panel
      ?compatibility="${this.compatibility}"
      .outlined="${this.outlined}"
      ?readOnly="${this.readOnly}"
      .url="${this.url}"
      @url-changed="${this._urlHandler}"
      .method="${this.method}"
      @method-changed="${this._methodHandler}"
      .payload="${this.payload}"
      @payload-changed="${this._payloadHandler}"
      .headers="${this.headers}"
      @headers-changed="${this._headersHandler}"
      .beforeActions="${this.requestActions}"
      @beforeactions-changed="${this._requestActionsChanged}"
      .afterActions="${this.responseActions}"
      @afteractions-changed="${this._responseActionsChanged}"
    ></request-actions-panel>
    `;
  }

  _requestActionsChanged(e) {
    this.requestActions = e.detail.value;
  }

  _responseActionsChanged(e) {
    this.responseActions = e.detail.value;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/request-editor
cd request-editor
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
