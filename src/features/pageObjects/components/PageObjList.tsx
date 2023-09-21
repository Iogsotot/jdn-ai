import Icon from "@ant-design/icons";
import { Collapse, Tooltip, Typography } from "antd";
import { isNil, size } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { CaretDown } from "@phosphor-icons/react";
import PageSvg from "../assets/page.svg";
import { selectPageObjects, selectLastFrameworkType } from "../selectors/pageObjects.selectors";
import { PageObjGenerationBar } from "./PageObjGenerationBar";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";
import { PageObjCopyButton } from "./PageObjCopyButton";
import { Locator } from "../../locators/Locator";
import { PageObjMenu } from "./PageObjMenu";
import { PageObjListHeader } from "./PageObjListHeader";
import { useNotifications } from "../../../common/components/notification/useNotifications";
import { RootState } from "../../../app/store/store";
import { ILocator } from "../../locators/types/locator.types";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { PageType } from "../../../app/types/mainSlice.types";
import { selectConfirmedLocators } from "../../locators/selectors/locatorsFiltered.selectors";
import { FrameworkType } from "../../../common/types/common";

interface Props {
  jdiTemplate?: Blob;
  vividusTemplate?: Blob;
}

const DEFAULT_ACTIVE_KEY = "0";

export const PageObjList: React.FC<Props> = ({ jdiTemplate, vividusTemplate }) => {
  const state = useSelector((state) => state);
  // due to antd types: onChange?: (key: string | string[]) => void;
  const currentPageObjectIndex = useSelector(
    (state: RootState): string | undefined => state.pageObject.present.currentPageObject?.toString()
  );
  const framework = useSelector(selectLastFrameworkType) || FrameworkType.JdiLight;
  const pageObjects = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState<string[] | undefined>([DEFAULT_ACTIVE_KEY]);

  const contentRef = useRef<HTMLDivElement>(null);
  useNotifications(contentRef?.current);

  const isExpanded = !!size(activePanel);

  useEffect(() => {
    if (currentPageObjectIndex) {
      setActivePanel([currentPageObjectIndex]);
    } else {
      setActivePanel([DEFAULT_ACTIVE_KEY]);
    }
  }, [currentPageObjectIndex]);

  const renderLocators = (elements: ILocator[], library: ElementLibrary) => {
    if (size(elements)) {
      return elements.map((element) => (
        <Locator {...{ element, library }} key={element.element_id} currentPage={PageType.PageObject} />
      ));
    } else {
      return "No locators selected";
    }
  };

  const renderContent = (
    pageObjId: PageObjectId,
    url: string,
    elements: ILocator[],
    library: ElementLibrary,
    isPageObjectNotEmpty: boolean
  ) => {
    if (isPageObjectNotEmpty) {
      return renderLocators(elements, library);
    } else {
      return <PageObjGenerationBar pageObj={pageObjId} {...{ library, url }} />;
    }
  };

  const toggleExpand = () => {
    if (size(activePanel)) {
      setActivePanel([]);
    } else {
      const keys = pageObjects.map(
        (po) => po.id.toString() // due to antd types: onChange?: (key: string | string[]) => void;
      );
      setActivePanel(keys);
    }
  };

  const template = framework === FrameworkType.Vividus ? vividusTemplate : jdiTemplate;

  return (
    <div>
      <PageObjListHeader
        {...{
          template,
          toggleExpand,
          isExpanded,
          setActivePanel,
        }}
      />
      <div ref={contentRef} className="jdn__itemsList-content jdn__pageObject-content">
        {size(pageObjects) ? (
          <React.Fragment>
            <Collapse
              defaultActiveKey={[DEFAULT_ACTIVE_KEY]}
              expandIcon={({ isActive }) => (
                <CaretDown
                  style={{
                    transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  size={14}
                  color="#878A9C"
                />
              )}
              expandIconPosition="start"
              {...(!isNil(activePanel) ? { activeKey: activePanel } : {})}
              onChange={(key) => setActivePanel([...key])}
            >
              {pageObjects.map((pageObject) => {
                const { id, locators, url, name, library } = pageObject;
                const elements = selectConfirmedLocators(state as RootState, id);
                const isPageObjectNotEmpty = !!size(locators);
                return (
                  <Collapse.Panel
                    key={id}
                    header={
                      <Tooltip
                        title={url}
                        placement="bottomLeft"
                        getPopupContainer={(triggerNode) => triggerNode}
                        align={{ offset: [-28, 0] }}
                      >
                        <Icon component={PageSvg} className="jdn__itemsList-status" />
                        <Typography.Text className="jdn__pageObject-content-text">{name}</Typography.Text>
                      </Tooltip>
                    }
                    extra={
                      <>
                        {isPageObjectNotEmpty && <PageObjCopyButton {...{ framework, elements }} />}
                        <PageObjMenu {...{ pageObject, elements }} />
                      </>
                    }
                  >
                    {renderContent(id, url, elements, library, isPageObjectNotEmpty)}
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </React.Fragment>
        ) : (
          <PageObjectPlaceholder {...{ setActivePanel }} />
        )}
        {/* <Notifications /> */}
      </div>
    </div>
  );
};
