import { Locator } from "../../features/locators/types/locator.types";

export const assignDataLabels = () => {
  const assignDataLabel = (hashes: Array<Locator>) => {
    hashes.forEach(({ jdnHash, predicted_label }) => {
      const element = document.querySelector(`[jdn-hash='${jdnHash}']`);
      element?.setAttribute("data-label", predicted_label);
    });
  };

  const messageHandler = ({ message, param }: { message: any; param: any }) => {
    switch (message) {
      case "ASSIGN_DATA_LABEL":
        assignDataLabel(param);
        break;
      default:
        break;
    }
  };

  chrome.runtime.onConnect.addListener(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
  });
};
