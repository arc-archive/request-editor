import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.url-editor {
  color: var(--request-editor-url-line-color);
  display: flex;
  flex-direction: row;
  align-items: center;
}

url-input-editor {
  flex: 1;
}

.main-action-buttons {
  margin-left: 16px;
}

h2 {
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
}

.params-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
  margin: 0 8px;
}

.params-header h2 {
  cursor: pointer;
}

http-method-selector {
  margin-bottom: 12px;
}

http-method-selector-mini {
  margin-right: 8px;
}

.toggle-icon {
  transform: rotateZ(0deg);
  transition: transform 0.3s linear;
}

.toggle-icon.opened {
  transform: rotateZ(-180deg);
}

[hidden] {
  display: none !important;
}
.inline-method-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.additional-info {
  color: var(--request-editor-headers-dialog-secondary-info-color, #777);
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

anypoint-tabs {
  border-bottom: 1px var(--request-editor-tabs-border, var(--primary-color)) solid;
}

.panel {
  background-color: var(--request-editor-panel-background-color, #fff);
  border: var(--request-editor-panel-border, none);
  padding-bottom: 12px;
}

.empty-auth {
  margin: 8px;
}
`;
