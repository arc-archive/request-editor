import {RequestEditorElement} from './src/RequestEditorElement.js';

declare global {
  interface HTMLElementTagNameMap {
    "request-editor": RequestEditorElement;
  }
}