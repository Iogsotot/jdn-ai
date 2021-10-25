import { runContextMenu } from "../contentScripts/contextMenu/contextmenu";
import { highlightOnPage } from "../contentScripts/highlight";
import { highlightOrder } from "../contentScripts/highlightOrder";
import { urlListener } from "../contentScripts/urlListener";

class Connector {
  constructor() {
    this.tab = null;
    this.port = null;
    this.getTab();

    this.onerror = null;
  }

  handleError(error) {
    if (typeof this.onerror === "function") this.onerror(error);
    else throw error;
  }

  getTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (res) => {
      if (res && res[0]) this.tab = res[0];
      else this.handleError("Connector: active page id is not available.");
    });
  }

  sendMessage(action, payload, onResponse) {
    const callback = () => {
      chrome.tabs.sendMessage(
          this.tab.id,
          {
            message: action,
            param: payload,
          },
          onResponse
      );
    };

    if (!this.tab) {
      setTimeout(callback, 0);
    } else callback();
  }

  updateMessageListener(callback) {
    if (this.onmessage) chrome.runtime.onMessage.removeListener(this.onmessage);
    this.onmessage = callback;
    chrome.runtime.onMessage.addListener(this.onmessage);
  }

  onTabUpdate(callback) {
    const listener = (tabId, changeinfo) => {
      if (
        changeinfo &&
        changeinfo.status === "complete" &&
        this.tab.id === tabId
      ) {
        this.getTab();
        if (this.port) {
          this.port.disconnect();
          this.port = null;
        }
        if (typeof callback === "function") callback();
      }
    };

    if (!chrome.tabs.onUpdated.hasListener(listener)) {
      chrome.tabs.onUpdated.addListener(listener);
    };
  }

  createPort() {
    if (!this.port) {
      this.port = chrome.tabs.connect(this.tab.id, {
        name: `JDN_connect_${Date.now()}`,
      });
    }
    return { then: (cb) => cb(this.port) };
  }

  attachContentScript(script) {
    return this.scriptExists(script.name).then((result) => {
      return new Promise((resolve) => {
        if (result) return resolve(true);
        chrome.scripting.executeScript(
            {
              target: { tabId: this.tab.id },
              function: script
            },
            (invoked) => {
              resolve(invoked || true);
            }
        );
      });
    });
  }

  attachCSS(file) {
    chrome.scripting.insertCSS({
      target: { tabId: this.tab.id },
      files: [file],
    });
  }

  scriptExists(scriptName) {
    return new Promise((resolve) => {
      sendMessage.pingScript({ scriptName }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
        }
        if (response && response.message) {
          resolve(true);
        } else resolve(false);
      });
    });
  }

  attachStaticScripts() {
    this.attachContentScript(highlightOnPage).then(() => {
      this.createPort();
    });
    this.attachContentScript(runContextMenu);
    this.attachContentScript(highlightOrder);
    this.attachContentScript(urlListener);
  }
}

export const connector = new Connector();

// messages, are sent from plugun to content scripts
export const sendMessage = {
  toggle: (el) => connector.sendMessage("HIGHLIGHT_TOGGLED", el),
  toggleDeleted: (el) => connector.sendMessage("TOGGLE_DLETED", el),
  // restore: (el) => connector.sendMessage("RESTORE_ELEMENT", el),
  changeType: (el) => connector.sendMessage("ASSIGN_TYPE", el),
  changeElementName: (el) => connector.sendMessage("CHANGE_ELEMENT_NAME", el),
  elementData: (payload) => connector.sendMessage("ELEMENT_DATA", payload),
  setHighlight: (payload) => connector.sendMessage("SET_HIGHLIGHT", payload),
  killHighlight: (payload, onResponse) =>
    connector.sendMessage("KILL_HIGHLIGHT", null, onResponse),
  generateAttributes: (payload, onResponse) =>
    connector.sendMessage("GENERATE_ATTRIBUTES", payload, onResponse),
  pingScript: (payload, onResponse) =>
    connector.sendMessage("PING_SCRIPT", payload, onResponse),
  highlightUnreached: (payload) => connector.sendMessage("HIGHLIGHT_ERRORS", payload),
  changeXpathSettings: (payload) => connector.sendMessage("CHANGE_ELEMENT_SETTINGS", payload),
};

export default Connector;
