import { AnnotationType, LocatorType } from "../../../common/types/common";
import { ElementLibrary, ElementClass } from "../types/generationClasses.types";
import { ILocator, LocatorValue } from "../types/locator.types";
import { CALCULATING } from "./constants";

export const getLocator = (locatorValue: LocatorValue, locatorType: LocatorType = LocatorType.xPath) => {
  if (locatorType !== LocatorType.cssSelector) return locatorValue.xPath;
  return locatorValue.cssSelector || CALCULATING;
};

export const getLocatorPrefix = (annotationType?: AnnotationType, locatorType?: LocatorType): string => {
  if (annotationType === AnnotationType.FindBy) {
    return `${locatorType === LocatorType.cssSelector ? "css" : "xpath"} = `;
  }

  return "";
};

export const getLocatorString = (
  annotationType: AnnotationType | undefined,
  locatorType: LocatorType | undefined,
  locator: LocatorValue,
  type: ElementLibrary | ElementClass,
  name: string
): string =>
  `${annotationType || AnnotationType.UI}(${getLocatorPrefix(annotationType, locatorType)}"${
    locator.output
  }")\npublic ${type} ${name};`;

export const getLocatorWithJDIAnnotation = (locator: string): string => `${AnnotationType.UI}("${locator}")`;

export const getLocatorWithSelenium = (locator: string, option: string): string =>
  `${AnnotationType.FindBy}(${option} = "${locator}")`;

export const getLocatorTemplateWithVividus = (name: string, locatorType: string, locator: ILocator): string =>
  `variables.${name}.${locator.type}.${locator.name}=By.${locatorType}`;

export const getFullLocatorVividusString = (name: string, locatorType: string, locator: ILocator): string =>
  `${getLocatorTemplateWithVividus(name, locatorType, locator)}(${locator.locator.output})`;
