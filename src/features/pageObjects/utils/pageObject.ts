import { saveAs } from 'file-saver';
import { chain, isEmpty, size, subtract, toLower, toString, truncate, upperFirst } from 'lodash';
import connector from '../../../pageServices/connector';
import { ElementId, ILocator } from '../../locators/types/locator.types';
import { PageObject } from '../types/pageObjectSlice.types';
import { ElementLabel, ElementLibrary } from '../../locators/types/generationClasses.types';
import javaReservedWords from './javaReservedWords.json';
import {
  getPageObjectTemplateForJdi,
  getPageObjectTemplateForVividus,
  getPageObjectTemplateForVividusTable,
} from './pageObjectTemplate';
import { pageObjectTemplatePerfTest } from './pageObjectTemplatePerfTest';
import { getJDILabel } from '../../locators/utils/locatorTypesUtils';
import { MAX_LOCATOR_NAME_LENGTH } from './constants';
import { FrameworkType } from '../../../common/types/common';

export const isStringMatchesReservedWord = (string: string) => javaReservedWords.includes(string);
// ToDo: uncomment with validation rework, see issue #1176:
// export const isStringMatchesReservedWordPerfTest = (string: string) => perfReservedWords.includes(string);

export const isNameUnique = (elements: ILocator[], elementId: ElementId, newName: string) =>
  !elements.find((elem) => elem.name === newName && elem.elementId !== elementId);

export const isPONameUnique = (elements: PageObject[], newName: string) =>
  !elements.find((elem) => toLower(elem.name) === toLower(newName));

export const createElementName = (
  element: ILocator,
  library: ElementLibrary,
  uniqueNames: Array<string>,
  newType?: string,
) => {
  const { elemName, elemId, elemText, predicted_label, elemAriaLabel } = element;

  const concat = (origin: string) => (append: string) => {
    const _origin = origin;
    if (_origin)
      return truncate(_origin, { length: subtract(60, size(append)), omission: '' }).concat(upperFirst(append));
    else return append;
  };

  const isUnique = (_name: string) => uniqueNames.indexOf(_name) === -1;

  const uniqueIndex = (name: string) => {
    let index = 1;

    while (!isUnique(concat(name)(String(index)))) {
      index++;
    }

    return index;
  };

  const returnLatinCodePoints = (string: string) => string.replace(/[^\u0000-\u00ff]/gu, '');

  const normalizeString = (string: string) =>
    chain(string).trim().camelCase().truncate({ length: MAX_LOCATOR_NAME_LENGTH, omission: '' }).value();

  const getName = () => (elemName ? normalizeString(elemName) : '');
  const getText = () => (elemText ? normalizeString(returnLatinCodePoints(elemText)) : '');
  const getAriaLabel = () => (elemAriaLabel ? normalizeString(returnLatinCodePoints(elemAriaLabel)) : '');
  const getId = () => (elemId ? normalizeString(elemId) : '');
  const getClass = () => (newType || getJDILabel(predicted_label as keyof ElementLabel, library)).toLowerCase();
  const getIndex = (string: string) => toString(uniqueIndex(string));

  const pickingTerms = [getName, getText, getAriaLabel];
  const concatenatingTerms = [getId, getClass, getIndex];

  const startsWithNumber = new RegExp('^[0-9].*$');
  const checkNumberFirst = (string: string) => (string.match(startsWithNumber) ? `name${string}` : string);

  let _resultName = '';

  const pickValue = () => {
    let _baseName = '';
    let _result = '';

    let indexP = 0;
    do {
      const newTerm = pickingTerms[indexP]();
      if (!size(_baseName)) _baseName = newTerm;
      _result = newTerm;
      indexP++;
    } while (indexP !== pickingTerms.length && (!isUnique(_result) || isEmpty(_result)));

    if (!isUnique(_result) || isEmpty(_result)) {
      _result = _baseName;
    }

    return checkNumberFirst(_result);
  };

  _resultName = pickValue();

  let indexC = 0;
  while (!isUnique(_resultName) || isEmpty(_resultName)) {
    const _index = indexC < concatenatingTerms.length ? indexC : concatenatingTerms.length - 1;
    const newTerm = concatenatingTerms[_index](_resultName);
    _resultName = checkNumberFirst(concat(_resultName)(newTerm));
    indexC++;
  }

  return _resultName;
};

export const createLocatorNames = (elements: ILocator[], library: ElementLibrary) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames: Array<string> = [];

  return f.map((e) => {
    const name = createElementName(e, library, uniqueNames);
    uniqueNames.push(name);

    const type = getJDILabel(e.predicted_label as keyof ElementLabel, library);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const getPageAttributes = async () => {
  const result = await connector.attachContentScript(() => {
    const { title, URL } = document;
    return { title, url: URL };
  });

  return result;
};

export const getPage = (
  locators: ILocator[],
  pageObject: PageObject,
  isTableView: boolean,
): { pageCode: string; title: string } => {
  const getPageObjectForVividus = () => {
    return isTableView
      ? getPageObjectTemplateForVividusTable(locators, pageObject)
      : getPageObjectTemplateForVividus(locators, pageObject);
  };

  return pageObject.framework === FrameworkType.Vividus
    ? getPageObjectForVividus()
    : getPageObjectTemplateForJdi(locators, pageObject);
};

export const getPagePerfTest = (locators: ILocator[], pageObject: PageObject): { pageCode: string; name: string } => {
  return pageObjectTemplatePerfTest(locators, pageObject);
};

export const generatePageObject = async (
  elements: ILocator[],
  pageObject: PageObject,
  isTableView: boolean,
): Promise<void> => {
  const page = getPage(elements, pageObject, isTableView);

  const blob = new Blob([page.pageCode], {
    type: 'text/plain;charset=utf-8',
  });
  saveAs(blob, `${page.title}.java`);
};

export const generatePageObjectPerfTest = async (elements: ILocator[], pageObject: PageObject): Promise<void> => {
  const page = getPagePerfTest(elements, pageObject);
  const blob = new Blob([page.pageCode], {
    type: 'text/plain;charset=utf-8',
  });
  saveAs(blob, `${page.name}.js`);
};

export const getUniquePageObjectName = (className: string, names: string[], pageObjects: any) => {
  let name = className;

  for (let index = 0; !isPONameUnique(pageObjects, name); index++) {
    const repeats = size(names.filter((_name) => toLower(_name).includes(toLower(className))));
    name = `${className}${repeats + index}`;
  }

  return name;
};
