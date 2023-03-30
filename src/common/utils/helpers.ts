import { cloneDeep } from "lodash";
import { Locator, LocatorValue } from "../../features/locators/types/locator.types";
import { ElementLibrary, ElementClass } from "../../features/locators/types/generationClasses.types";
import { VALIDATION_ERROR_TYPE } from "../constants/constants";

export const floatToPercent = (value: number) => {
  // wse need to show percents, but multiply float * 100 provides an unexpected result and leads to bugs
  return Math.trunc(value * 100);
};

export const copyToClipboard = (text: string) => {
  const transformedText = text.replace(/'/g, "\\'").replace(/\n/g, "\\n");
  chrome.devtools.inspectedWindow.eval(`copy('${transformedText}')`);
};

export const getLocatorString = (locator: LocatorValue, type: ElementLibrary | ElementClass, name: string): string =>
  `@UI("${locator.output}")\npublic ${type} ${name};`;

export const isErrorValidationType = (type: string) => VALIDATION_ERROR_TYPE.hasOwnProperty(type);

export const isMacPlatform = (param: Window) => param.navigator?.userAgent.indexOf("Mac") != -1;
