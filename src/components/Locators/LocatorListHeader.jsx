import React, { useMemo } from "react";
import { filter, size, some } from "lodash";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import Icon from "@ant-design/icons";
import { ArrowFatUp, ArrowFatDown, Trash } from "phosphor-react";

import { Chip } from "./Chip";

import PauseSVG from "../../assets/pause.svg";
import PlaySvg from "../../assets/play.svg";
import RestoreSvg from "../../assets/restore.svg";

import { toggleDeleted, toggleDeletedGroup, toggleElementGroupGeneration } from "../../store/slices/locatorsSlice";
import { stopGenerationGroup } from "../../store/thunks/stopGenerationGroup";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import { locatorTaskStatus, LOCATOR_CALCULATION_PRIORITY } from "../../utils/constants";

export const LocatorListHeader = ({ generatedSelected, waitingSelected, deletedSelected }) => {
  const dispatch = useDispatch();

  const selected = [...generatedSelected, ...waitingSelected, ...deletedSelected];
  const activeSelected = [...generatedSelected, ...waitingSelected];
  const stoppedSelected = filter(waitingSelected, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED);
  const inProgressSelected = filter(waitingSelected, (el) => el.locator.taskStatus !== locatorTaskStatus.REVOKED);

  const noPrioritySelected = useMemo(() => some(inProgressSelected, (_locator) => !_locator.priority), [
    inProgressSelected,
  ]);

  const increasedPrioritySelected = useMemo(
      () => some(inProgressSelected, { priority: LOCATOR_CALCULATION_PRIORITY.INCREASED }),
      [inProgressSelected]
  );

  const decreasedPrioritySelected = useMemo(
      () => some(inProgressSelected, { priority: LOCATOR_CALCULATION_PRIORITY.DECREASED }),
      [inProgressSelected]
  );

  const handleDelete = () => {
    activeSelected.length > 1 ?
      dispatch(toggleDeletedGroup(activeSelected, true)) :
      dispatch(toggleDeleted(activeSelected[0].element_id, true));
  };

  return (
    <div className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title">Locators list</span>
      <Chip
        hidden={!size(selected)}
        primaryLabel={size(selected)}
        secondaryLabel={"selected"}
        onDelete={() => dispatch(toggleElementGroupGeneration(selected))}
      />
      <div className="jdn__locatorsList-header-buttons">
        <Button
          hidden={!size(deletedSelected)}
          className="jdn__buttons"
          onClick={() => dispatch(toggleDeletedGroup(deletedSelected))}
        >
          <Icon component={RestoreSvg} />
          Restore
        </Button>
        <Button hidden={!size(stoppedSelected)} onClick={() => dispatch(rerunGeneration(stoppedSelected))}>
          <Icon component={PlaySvg} />
        </Button>
        {size(inProgressSelected) ? (
          <React.Fragment>
            <Button danger onClick={() => dispatch(stopGenerationGroup(inProgressSelected))}>
              <Icon component={PauseSVG} />
            </Button>
            {decreasedPrioritySelected || noPrioritySelected ? (
              <Button
                onClick={() =>
                  dispatch(setCalculationPriority({ element_id, priority: LOCATOR_CALCULATION_PRIORITY.INCREASED }))
                }
              >
                <ArrowFatUp color="#1582D8" size={18} />
              </Button>
            ) : null}
            {increasedPrioritySelected || noPrioritySelected ? (
              <Button
                onClick={() =>
                  dispatch(setCalculationPriority({ element_id, priority: LOCATOR_CALCULATION_PRIORITY.DECREASED }))
                }
              >
                <ArrowFatDown color="#1582D8" size={18} />
              </Button>
            ) : null}
          </React.Fragment>
        ) : null}
        <Button hidden={!size(activeSelected)} danger onClick={handleDelete}>
          <Trash color="#D82C15" size={18} />
        </Button>
      </div>
    </div>
  );
};
