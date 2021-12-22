import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./slider.less";
import "./../autoFind.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { GenerationButtons } from "../GenerationButtons";
import { PerceptionTreshold } from "../PerceptionTreshold";
import { ControlBar } from "../ControlBar";
import { LocatorsList } from "../locatorsList/LocatorsList";

import { createListeners } from "../../utils/scriptListener";
import { connector } from "../../utils/connector";
import { removeOverlay } from "../../utils/pageDataHandlers";
import { clearAll } from "../../redux/predictionSlice";
import { locatorGenerationController } from "../../utils/locatorGenerationController";
import { xpathGenerationStatus } from "../../utils/constants";

const AutoFind = () => {
  const xpathStatus = useSelector((state) => state.main.xpathStatus);

  const dispatch = useDispatch();
  createListeners( // in the future, move it to connector
      dispatch,
      useSelector((state) => state)
  );

  // add document listeners
  useEffect(() => {
    connector.attachStaticScripts();
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          <GenerationButtons />
          {xpathStatus === xpathGenerationStatus.started ? (
            <React.Fragment>
              <LocatorsList />
              <PerceptionTreshold />
            </React.Fragment>
          ) : null}
          {/* <XPathSettings />*/}
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
