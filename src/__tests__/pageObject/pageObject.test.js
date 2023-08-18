import {
  locators,
  pageObjectMUI,
  pageObjectHTML,
  pageObjectVuetify,
  pageObjectHTMLWithFindBy,
  getLocatorsByAnnotationType,
} from "../__mocks__/pageObjectMocks/pageObject.mock";
import { elementsWithoutNames } from "../__mocks__/pageObjectMocks/elementsWithoutNames";
import { elementsWithNames } from "../__mocks__/pageObjectMocks/elementsWithNames";
import { pageObjectsNames } from "../__mocks__/pageObjectMocks/pageObjectNames";
import { ElementLibrary } from "../../features/locators/types/generationClasses.types";
import { pageObjectTemplate } from "../../features/pageObjects/utils/pageObjectTemplate";
import { createLocatorNames } from "../../features/pageObjects/utils/pageObject";
import { getClassName } from "../../features/pageObjects/utils/pageObjectTemplate";
import { AnnotationType } from "../../common/types/common";

const templateTestData = [
  {
    pageObject: {
      framework: "JDI Light",
      library: "HTML",
      name: "HomePage",
    },
    output: pageObjectHTML,
  },
  {
    pageObject: {
      framework: "JDI Light",
      library: "MUI",
      name: "HomePage",
    },
    output: pageObjectMUI,
  },
  {
    pageObject: {
      framework: "JDI Light",
      library: "Vuetify",
      name: "HomePage",
    },
    output: pageObjectVuetify,
  },
];

const templateTestDataWithFindBy = {
  pageObject: {
    framework: "JDI Light",
    library: "HTML",
    name: "HomePage",
  },
  output: pageObjectHTMLWithFindBy,
};

describe("page object code generation", () => {
  templateTestData.forEach(({ pageObject, output }) => {
    test(`page object generated with ${pageObject.library}`, () => {
      const page = pageObjectTemplate(locators, pageObject);
      expect(page.pageCode).toBe(output);
      expect(page.title).toBe("HomePage");
    });
  });

  test("generate page object name", () => {
    pageObjectsNames.forEach((poName) => {
      expect(getClassName(poName.input)).toBe(poName.output);
    });
  });

  describe("pageObjectTemplate should return pageObjectHTML with FindBy import", () => {
    const locators = getLocatorsByAnnotationType(AnnotationType.FindBy);
    test(`when page object generated with ${templateTestDataWithFindBy.pageObject.library} and locators has Annotation Type === 'FindBy'`, () => {
      const page = pageObjectTemplate(locators, templateTestDataWithFindBy.pageObject);
      expect(page.pageCode).toBe(templateTestDataWithFindBy.output);
      expect(page.title).toBe("HomePage");
    });
  });
});

describe("create locators names", () => {
  test("create unique names, create name by Id,  if exists; transform ID to name correctly", () => {
    expect(createLocatorNames(elementsWithoutNames, ElementLibrary.MUI)).toStrictEqual(elementsWithNames);
  });
});
