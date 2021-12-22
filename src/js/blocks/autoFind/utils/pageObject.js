import { getJDILabel } from "./generationClassesMap";
import { connector } from "./connector";
import { pageObjectTemplate } from "./pageObjectTemplate";
import { replace } from "lodash";

export const getLocator = ({fullXpath, robulaXpath, customXpath}) => {
  return customXpath || robulaXpath || fullXpath || '';
};

export const createLocatorNames = (elements) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames = [];

  const getElementName = (element) => {
    const jdiLabel = getJDILabel(element.predicted_label).toLowerCase();
    return element.tagName === 'a' || jdiLabel === element.tagName.toLowerCase() ?
      jdiLabel :
      jdiLabel + element.tagName[0].toUpperCase() + element.tagName.slice(1);
  };

  return f.map((e, i) => {
    let elementName = getElementName(e);
    let elementTagId = replace(e.predictedAttrId, new RegExp(" ", "g"), "");

    const startsWithNumber = new RegExp('^[0-9].+$');
    elementTagId = elementTagId.match(startsWithNumber) ? `name${elementTagId}` : elementTagId;

    if (uniqueNames.indexOf(elementName) >= 0) elementName += i;
    if (elementTagId && uniqueNames.indexOf(elementTagId) >= 0) elementTagId += i;
    uniqueNames.push(elementTagId, elementName);

    const name = e.isCustomName ?
      e.name :
      elementTagId || elementName;

    const type = getJDILabel(e.predicted_label);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const getPage = async (locators) => {
  const location = await connector.attachContentScript(() => {
    const {hostname, pathname, origin, host} = document.location;
    return {hostname, pathname, origin, host};
  });

  const title = await connector.attachContentScript(() => {
    return document.title;
  });

  const pageObject = pageObjectTemplate(locators, location[0].result, title[0].result);
  return pageObject;
};

export const generatePageObject = async (elements) => {
  const page = await getPage(elements);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};
