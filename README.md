[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/request-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/request-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/request-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/request-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/request-editor)

## &lt;request-editor&gt;

Complete HTTP request editor.

Note: This is pre-release for final web components spec including ES modules.
This component hasn't been fully tested and contains issues with variables manager initialization.

```html
<request-editor></request-editor>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/request-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/request-editor/request-editor.js';
    </script>
  </head>
  <body>
    <request-editor></request-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/request-editor/request-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <request-editor></request-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/request-editor
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
