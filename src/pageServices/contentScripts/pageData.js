import { ScriptMsg } from '../scriptMsg.constants';

const hashAttribute = 'jdn-hash';
const DOMElementIndexAttribute = 'jdn-DOMI';

function findParentZIndex(element) {
  while (element && element !== document) {
    const zIndex = window.getComputedStyle(element).getPropertyValue('z-index');
    if (zIndex !== 'auto' && zIndex !== '') {
      return zIndex;
    }
    element = element.parentElement;
  }
  return 'auto';
}

const child2 = document.querySelector('child2');
const zIndex = findParentZIndex(child2);

export const pageData = () => {
  const getPageData = () => {
    chrome.runtime.sendMessage({ message: ScriptMsg.StartCollectData }).catch((error) => {
      if (error.message !== 'The message port closed before a response was received.') throw new Error(error.message);
    });

    function gen_uuid(e, DOMindex, elementZindex) {
      let hashValue = e.getAttribute(hashAttribute);
      if (!hashValue) {
        hashValue = `${
          Math.random().toString().substring(2, 12) +
          Date.now().toString().substring(5) +
          Math.random().toString().substring(2, 12)
        }`;
        const calculatedLayer = parseInt(DOMindex) + parseInt(isNaN(elementZindex) ? 0 : elementZindex);
        e.setAttribute(DOMElementIndexAttribute, calculatedLayer);
        e.setAttribute(hashAttribute, hashValue);
      }
      return e;
    }

    function assign_uuid() {
      [...document.querySelectorAll('*:not([id^="jdn-overlay"])')].forEach((el, i) => {
        const elementZindex = findParentZIndex(el);
        gen_uuid(el, i, elementZindex);
      });
    }

    function collect_attributes(el) {
      const items = {};
      for (let index = 0; index < el.attributes.length; ++index) {
        items[el.attributes[index].name] = el.attributes[index].value;
      }
      return items;
    }

    function getTreeDataset() {
      return [...document.querySelectorAll('*:not([id^="jdn-overlay"])')].map((el) => {
        const _x = pageXOffset + el.getBoundingClientRect().x;
        const _y = pageYOffset + el.getBoundingClientRect().y;
        const _width = el.getBoundingClientRect().width;
        const _height = el.getBoundingClientRect().height;
        const _displayed = (_x < 0) | (_y < 0) | (_width <= 1) | (_height <= 1);

        return {
          tag_name: el.tagName,
          element_id: el.getAttribute(hashAttribute),
          parent_id: el.parentElement == null ? null : el.parentElement.getAttribute(hashAttribute),
          x: _x,
          y: _y,
          width: _width,
          height: _height,
          displayed: !_displayed,
          onmouseover: el.onmouseover,
          onmouseenter: el.onmouseenter,
          attributes: collect_attributes(el),
          text: el.innerText,
        };
      });
    }

    assign_uuid();
    const res = getTreeDataset();
    /*
    IMPORTANT! stringify them right here for not to change files order.
    Otherwise 500 server error occurs
  */
    return [JSON.stringify(res), res.length];
  };

  chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
    switch (message) {
      case ScriptMsg.GetPageData:
        sendResponse(getPageData());
        break;
    }
  });
};
