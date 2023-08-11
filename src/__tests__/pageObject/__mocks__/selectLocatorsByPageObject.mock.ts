import { LocatorType } from "../../../common/types/common";
import { ElementLibrary } from "../../../features/locators/types/generationClasses.types";
import { PageObject } from "../../../features/pageObjects/types/pageObjectSlice.types";

export const pageObject0: PageObject = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: ElementLibrary.MUI,
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
  locatorType: LocatorType.xPath,
};

export const pageObjectXpath = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: "MUI",
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locatorType: LocatorType.xPath,
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
};

export const pageObjectCssSelector = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: "MUI",
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locatorType: LocatorType.cssSelector,
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
};

export const getRootState = (_pageObject: PageObject) => ({
  pageObject: {
    past: [],
    future: [],
    present: {
      currentPageObject: 0,
      entities: { 0: _pageObject },
      ids: [0],
    },
  },
  locators: {
    past: [],
    future: [],
    present: {
      entities: {
        "7524916072510597399809892823_0": {
          element_id: "7524916072510597399809892823_0",
          predicted_label: "dialog",
          jdnHash: "7524916072510597399809892823",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText: "EPAM framework Wishes…",
          elemAriaLabel: null,
          locator: {
            cssSelector: ".main-content",
            output: ".main-content",
            xPathStatus: "SUCCESS",
            cssSelectorStatus: "SUCCESS",
            xPath: "//*[@class='main-content']",
          },
          locatorType: LocatorType.cssSelector,
          name: "dialog",
          type: "Dialog",
          parent_id: "",
          children: [],
          active: false,
        },
        "2075611903510597386448924232_0": {
          element_id: "2075611903510597386448924232_0",
          predicted_label: "list",
          jdnHash: "2075611903510597386448924232",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText: "Home",
          elemAriaLabel: null,
          locator: {
            cssSelector: ".uui-navigation.nav.navbar-nav.m-l8.any",
            output: "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
            xPathStatus: "SUCCESS",
            cssSelectorStatus: "PENDING",
            xPath: "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
          },
          name: "homeContactFormServiceSupportDatesSearchComplexTableSimpleTa",
          type: "List",
          parent_id: "",
          children: ["3365961729510597382209820079_0", "5642356970510597386143211636_0"],
          active: true,
          message: "The locator was not found on the page.",
          isCustomName: false,
          isCustomLocator: true,
          generate: true,
        },
        "4138940493550098806301857686_0": {
          element_id: "4138940493550098806301857686_0",
          predicted_label: "menu",
          jdnHash: "4138940493550098806301857686",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText: "HTML 5",
          elemAriaLabel: null,
          locator: {
            cssSelector: '[index="5"] > ul',
            xPathStatus: "SUCCESS",
            cssSelectorStatus: "FAILURE",
            xPath: "//*[@index='5']/ul",
            output: "//*[@index='5']/ul",
          },
          locatorType: LocatorType.xPath,
          name: "html5MobileAndHtml5BootstrapBootstrapFormBootstrapFormsReact",
          type: "Menu",
          parent_id: "",
          children: [],
          generate: true,
        },
      },
      ids: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
    },
  },
});

export const selectMockedLocators = (pageObject: PageObject) => [
  {
    element_id: "7524916072510597399809892823_0",
    predicted_label: "dialog",
    jdnHash: "7524916072510597399809892823",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText: "EPAM framework Wishes…",
    elemAriaLabel: null,
    locator: {
      taskStatus: "SUCCESS",
      cssSelectorStatus: "SUCCESS",
      xPathStatus: "SUCCESS",
      xPath: "//*[@class='main-content']",
      output: ".main-content",
      cssSelector: ".main-content",
    },
    locatorType: LocatorType.cssSelector,
    name: "dialog",
    type: "Dialog",
    parent_id: "",
    children: [],
    active: false,
  },
  {
    element_id: "2075611903510597386448924232_0",
    predicted_label: "list",
    jdnHash: "2075611903510597386448924232",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText: "Home",
    elemAriaLabel: null,
    ...(pageObject.locatorType === LocatorType.cssSelector ? { locatorType: LocatorType.cssSelector } : null),
    locator: {
      taskStatus: "PENDING",
      xPathStatus: "SUCCESS",
      cssSelectorStatus: "PENDING",
      xPath: "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
      cssSelector: ".uui-navigation.nav.navbar-nav.m-l8.any",
      output:
        pageObject.locatorType === LocatorType.cssSelector
          ? ".uui-navigation.nav.navbar-nav.m-l8.any"
          : "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
    },
    name: "homeContactFormServiceSupportDatesSearchComplexTableSimpleTa",
    type: "List",
    parent_id: "",
    children: ["3365961729510597382209820079_0", "5642356970510597386143211636_0"],
    active: true,
    message: "The locator was not found on the page.",
    isCustomName: false,
    isCustomLocator: true,
    generate: true,
  },
  {
    element_id: "4138940493550098806301857686_0",
    predicted_label: "menu",
    jdnHash: "4138940493550098806301857686",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText: "HTML 5",
    elemAriaLabel: null,
    locator: {
      taskStatus: "FAILURE",
      xPathStatus: "SUCCESS",
      cssSelectorStatus: "FAILURE",
      xPath: "//*[@index='5']/ul",
      output: "//*[@index='5']/ul",
      cssSelector: '[index="5"] > ul',
    },
    locatorType: LocatorType.xPath,
    name: "html5MobileAndHtml5BootstrapBootstrapFormBootstrapFormsReact",
    type: "Menu",
    parent_id: "",
    children: [],
    generate: true,
  },
];
