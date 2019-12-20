[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/request-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/request-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/request-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/request-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/request-editor)

## request-editor

A custom element that provides an UI to create a request object in Advanced REST Client.

The editor consists of several other editors and puts them together to create a single place of managing request data:

-   `http-method-selector` - allows to specify HTTP method
-   `url-input-editor` - allows to edit the URL
-   `api-headers-editor` - AMF powered headers editor
-   `api-body-editor` - AMF powered payload editor
-   `authorization-selector` - an UI to provide authorization settings
-   `request-actions-panel` - ARC's requests actions editor
-   `request-config` - request configuration editor
-   `http-code-snippets` - not an editor, code snippets for current request data

## Usage

### Installation
```
npm install --save @advanced-rest-client/request-editor
```

### In a LitElement

```javascript
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/request-editor/request-editor.js';

class SampleElement extends LitElement {
  render() {
    const { requestObject } = this;
    return html`
    <request-editor
      ?compatibility="${this.compatibility}"
      ?outlined="${this.outlined}"
      ?readOnly="${this.readOnly}"
      ?narrow="${this.narrow}"
      .oauth2RedirectUri="${this.oauth2RedirectUri}"
      ?ignorecontentonget="${this.ignoreContentOnGet}"
      .method="${requestObject.method}"
      .url="${requestObject.url}"
      .headers="${requestObject.headers}"
      .payload="${requestObject.payload}"
      .auth="${requestObject.auth}"
      .authType="${requestObject.authType}"
      .config="${requestObject.config}"
      .requestActions="${requestObject.requestActions}"
      .responseActions="${requestObject.responseActions}"
      @api-request="${this._requestHandler}"
      @method-changed="${this._requestChanegd}"
      @url-changed="${this._requestChanegd}"
      @headers-changed="${this._requestChanegd}"
      @payload-changed="${this._requestChanegd}"
      @requestactions-changed="${this._requestChanegd}"
      @responseactions-changed="${this._requestChanegd}"
      @auth-changed="${this._requestChanegd}"
      @config-changed="${this._requestChanegd}"
    ></request-editor>
    `;
  }

  _requestChanegd(e) {
    this.requestObject = e.target.serializeRequest();
    console.log(e.type.split('-')[0], 'property changed');
  }

  _requestHandler(e) {
    // perform request
  }
}
customElements.define('sample-element', SampleElement);
```

To configure request data use properties/attributes. The change of the value is notified via DOM event
which type is the lowercase property name and `-changed` suffix. For example the `url` change is notified
via `url-changed` event.

You can also use `serializeRequest()` method that puts request parameters into an object.

Note that the `auth-changed` event, unlike others, does not have `detail` object set on the
event with `value` property. Also, `auth-changed` event is fired once for `auth` and `authType` property change.

### Authorization data

Until version 3 the editor was processing authorization data and inserting authorization header if needed (basic and OAuth authorizations uses `Authorization` header). From version 4 the element just creates the `auth` object
that should be processed by the transport library.

### api-request and api-response events

When the user press the "Send" button the `api-request` event is dispatched with serialized request configuration on the detail object. The application must handle this event and make the request to the endpoint. Additionally the detail object contains the `id` property that identifies specific request dispatched from this instance of the editor. This `id` has to be reported back with the `api-response` event.

When the response is ready the application should dispatch `api-response` event with response data that are acceptable by the `response-view` component (in ARC) or other component. The detail object must include the `id` provided in the `api-request` event. This way the request panel knows that the response is received and can update state to hide loaders.

Note, the `api-request` event is not send when the URL is reported invalid.

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
