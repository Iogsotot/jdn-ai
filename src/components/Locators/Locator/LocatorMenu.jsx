import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Dropdown, Menu, Typography } from "antd";
import Icon from "@ant-design/icons";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";

import { toggleDeleted } from "../../../store/slices/locatorsSlice";

import { locatorTaskStatus } from "../../../utils/constants";
import { rerunGeneration } from "../../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../../store/thunks/stopGeneration";
import { getTypesMenuOptions } from "../../../utils/generationClassesMap";
import { isProgressStatus } from "../../../services/locatorGenerationController";

import PauseSvg from "../../../assets/pause.svg";
import PencilSvg from "../../../assets/pencil.svg";
import PlaySvg from "../../../assets/play.svg";
import RestoreSvg from "../../../assets/restore.svg";
import TrashBinSvg from "../../../assets/delete_14.svg";
import EllipsisSvg from "../../../assets/ellipsis.svg";

export const LocatorMenu = ({ element, library }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const dispatch = useDispatch();

  const { element_id, locator, deleted } = element;

  const isLocatorInProgress = isProgressStatus(locator.taskStatus);

  const handleEditClick = () => {
    chrome.storage.sync.set({
      OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types: getTypesMenuOptions(library) },
    });
  };

  const renderMenu = () => {
    if (deleted) {
      return (
        <Menu>
          <Menu.Item key="5" icon={<RestoreSvg />} onClick={() => dispatch(toggleDeleted(element_id))}>
            Restore
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="0" icon={<PencilSvg />} onClick={handleEditClick}>
            Edit
          </Menu.Item>
          {isLocatorInProgress ? (
            <React.Fragment>
              <Menu.Item key="1" icon={<PauseSvg />} onClick={() => dispatch(stopGeneration(element_id))}>
                Stop generation
              </Menu.Item>
              <Menu.Item
                key="4"
                icon={<ArrowFatUp color="#fff" size={14} />}
                onClick={() => console.log("up priority")}
              >
                Up Priority
              </Menu.Item>
              <Menu.Item
                key="5"
                icon={<ArrowFatDown color="#fff" size={14} />}
                onClick={() => console.log("down priority")}
              >
                Down Priority
              </Menu.Item>
            </React.Fragment>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.REVOKED ? (
            <Menu.Item key="2" icon={<PlaySvg />} onClick={() => dispatch(rerunGeneration([element]))}>
              Rerun
            </Menu.Item>
          ) : null}
          <Menu.Item key="3" icon={<TrashBinSvg />} onClick={() => dispatch(toggleDeleted(element_id))}>
            <Typography.Text type="danger">Delete</Typography.Text>
          </Menu.Item>
        </Menu>
      );
    }
  };

  return (
    <a onClick={() => setMenuVisible(true)} onMouseLeave={() => setMenuVisible(false)}>
      <Dropdown overlay={renderMenu()} visible={menuVisible}>
        <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
      </Dropdown>
    </a>
  );
};
