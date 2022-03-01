import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Collapse } from "antd";
import { size } from "lodash";

import { PageObjListHeader } from "./PageObjListHeader";

import CaretDownSvg from "../../assets/caret-down.svg";
import PageSvg from "../../assets/page.svg";
import { selectConfirmedLocators, selectPageObjects } from "../../store/selectors/pageObjectSelectors";
import { Locator } from "../Locators/Locator";
import { GenerationButtons } from "./GenerationButtons";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";

export const PageObjList = () => {
  const state = useSelector((state) => state);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const [activePanel, setActivePanel] = useState([]);

  useEffect(() => {
    setActivePanel([currentPageObject]);
  }, [currentPageObject]);

  const renderLocators = (elements) => {
    if (size(elements)) {
      return elements.map((element) => (
        <Locator key={element.element_id} {...{ element, xpathConfig }} noScrolling={true} />
      ));
    } else {
      return "No locators selected";
    }
  };

  const renderPageObjSettings = (pageObjId, url) => {
    return (
      <div className="jdn__pageObject__settings">
        <div className="jdn__pageObject__settings-url">{url}</div>
        <GenerationButtons pageObj={pageObjId} />
      </div>
    );
  };

  const renderContent = (pageObjId, url) => {
    const elements = selectConfirmedLocators(state, pageObjId);
    if (size(elements)) {
      return renderLocators(elements);
    } else {
      return renderPageObjSettings(pageObjId, url);
    }
  };

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader />
      <div className="jdn__locatorsList-content jdn__pageObj-content">
        {size(pageObjects) ? (
          <Collapse
            expandIcon={({ isActive }) => (
              <Icon component={CaretDownSvg} rotate={isActive ? 180 : 270} fill="#808080" />
            )}
            activeKey={activePanel}
            onChange={setActivePanel}
          >
            {pageObjects.map(({ id, name, url, locators }) => (
              <Collapse.Panel
                key={id}
                header={
                  <React.Fragment>
                    <Icon component={PageSvg} className="jdn__locatorsList-status" />
                    {name}
                  </React.Fragment>
                }
              >
                {renderContent(id, url)}
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : (
          <PageObjectPlaceholder />
        )}
      </div>
    </div>
  );
};