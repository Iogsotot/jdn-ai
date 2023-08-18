import { saveAs } from "file-saver";
import { entries, isNumber, lowerFirst, size } from "lodash";
import JSZip from "jszip";
import { RootState } from "../../../app/store/store";
import { selectPageObjects } from "../selectors/pageObjects.selectors";
import { testFileTemplate } from "./testTemplate";
import { getPage } from "./pageObject";
import { PageObject } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { editPomContent } from "./templateFileContent";
import { selectConfirmedLocators } from "../../locators/selectors/locatorsFiltered.selectors";
import { FrameworkType } from "../../../common/types/common";

const PAGES_PROPERTIES_PATH = "src/main/resources/properties/suite/web_app/pages.properties";
const SITE_PROPERTIES_PATH = "src/main/resources/properties/suite/web_app/site.properties";
const MY_SITE_PATH = "src/main/java/site/MySite.java";
const EXAMPLE_STRING = "// ADD SITE PAGES WITH URLS";

const isVividusFramework = (framework: FrameworkType) => framework === FrameworkType.Vividus;

const generatePoFile = (newZip: JSZip, framework: FrameworkType, page: { pageCode: string; title: string }) => {
  const path = isVividusFramework(framework) ? PAGES_PROPERTIES_PATH : `src/main/java/site/pages/${page.title}.java`;

  newZip.file(path, page.pageCode, { binary: false });
};

const editTestPropertiesFile = (newZip: JSZip, po: PageObject) =>
  newZip
    .file("src/test/resources/test.properties")!
    .async("string")
    .then(function success(content) {
      const testDomain = po.origin;
      const newContent = content.replace("${domain}", `${testDomain}`);
      return newZip.file(`src/test/resources/test.properties`, newContent, { binary: true });
    });

const editMySiteFile = (newZip: JSZip, po: PageObject, instanceName: string) => {
  if (isVividusFramework(po.framework)) return;
  // const path = isVividusFramework(po.framework) ? PAGES_PROPERTIES_PATH : MY_SITE_PATH;
  newZip
    .file(MY_SITE_PATH)!
    .async("string")
    .then((content) => {
      if (content.includes(instanceName)) instanceName = `${instanceName}1`;
      const urlSearchParams = po.search;
      const testUrl = urlSearchParams.length ? po.pathname + urlSearchParams : po.pathname;
      const newContent = content.replace(
        EXAMPLE_STRING,
        `${EXAMPLE_STRING}\n    @Url("${testUrl}")\n    public static ${po.name} ${instanceName};
          `
      );
      return newZip.file(MY_SITE_PATH, newContent, { binary: true });
    });
};

const editTestsFile = (newZip: JSZip, po: PageObject, instanceName: string) =>
  newZip.file(`src/test/java/tests/${po.name}Tests.java`, testFileTemplate(instanceName, po.name));

export const editPomFile = (newZip: JSZip, po: PageObject) => {
  if (po.library === ElementLibrary.HTML5) return;

  return newZip
    .file("pom.xml")!
    .async("string")
    .then((content) => newZip.file("pom.xml", editPomContent(content, po), { binary: true }));
};

export const generateAndDownloadZip = async (state: RootState, template: Blob) => {
  const pageObjects = selectPageObjects(state);

  const zip = await JSZip.loadAsync(template, { createFolders: true });
  const rootFolder = entries(zip.files)[0][0];

  const newZip = new JSZip();

  // remove root folder by changing files path
  const filePromises: Array<Promise<JSZip.JSZipObject | void>> = [];
  (zip.folder(rootFolder) || []).forEach(async (relativePath, file) => {
    if (isNumber(file) || file.dir) return;

    filePromises.push(
      file.async("string").then((content) => {
        newZip.file(relativePath, content, { binary: true });
      })
    );
  });

  Promise.all(filePromises).then(async () => {
    const saveZip = async () => {
      const blob = await newZip.generateAsync({ type: "blob" });
      saveAs(blob, `${rootFolder.replace("/", "")}.zip`);
    };

    for (const po of pageObjects) {
      // create page object files
      const locators = selectConfirmedLocators(state, po.id);
      if (!size(locators)) continue;
      const page = await getPage(locators, po);

      const instanceName = lowerFirst(po.name);

      await generatePoFile(newZip, po.framework, page);

      if (!isVividusFramework(po.framework)) {
        await editTestPropertiesFile(newZip, po);
        await editMySiteFile(newZip, po, instanceName);
        await editTestsFile(newZip, po, instanceName);
        await editPomFile(newZip, po);
      } else {
        newZip.file(SITE_PROPERTIES_PATH, `variables.siteURL=${po.url}`, { binary: true });
      }
    }

    saveZip();
  });
};
