import CyrillicToTranslit from "cyrillic-to-translit-js";
import { getLocator } from "../../../features/locators/locator/utils";
import { ElementLibrary } from "./generationClassesMap";
import { camelCase, upperFirst } from "lodash";

export const getClassName = (title) => {
  let className = camelCase(title);

  const isCyrillic = (term) => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    return cyrillicPattern.test(term);
  };

  if (isCyrillic(className)) {
    // eslint-disable-next-line new-cap
    className = CyrillicToTranslit().transform(className, " ");
  }

  className = className.substring(className.search(/[a-zA-Za]/)); // removing numbers in the start of string
  className = upperFirst(className); // we generate Java class name, so we always need a capital first letter

  if (className.length > 56) className = className.slice(0, 55);
  if (className.length > 4 && className.slice(-4).toLowerCase() !== "page") className += "Page";
  return className;
};

export const pageObjectTemplate = (locators, title, libraries) => {
  const className = title;
  const locatorsCode = locators.map(
    (loc) => `    @UI("${getLocator(loc.locator)}")\n    public ${loc.type} ${loc.name};`
  );

  const pageCode = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
${
  libraries.includes(ElementLibrary.HTML5)
    ? `
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;`
    : ""
}${
    libraries.includes(ElementLibrary.MUI)
      ? `
import com.epam.jdi.light.material.elements.displaydata.*;
import com.epam.jdi.light.material.elements.displaydata.table.*;
import com.epam.jdi.light.material.elements.feedback.*;
import com.epam.jdi.light.material.elements.feedback.progress.*;
import com.epam.jdi.light.material.elements.inputs.*;
import com.epam.jdi.light.material.elements.inputs.transferlist.*;
import com.epam.jdi.light.material.elements.layout.*;
import com.epam.jdi.light.material.elements.navigation.*;
import com.epam.jdi.light.material.elements.navigation.steppers.*;
import com.epam.jdi.light.material.elements.surfaces.*;
import com.epam.jdi.light.material.elements.utils.*;`
      : ""
  }

public class ${className} extends WebPage {
${locatorsCode.join("\n\n")}
}
`;

  return { pageCode, title: className };
};
