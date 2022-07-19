import { Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectDeletedByPageObj,
  selectGeneratedByPageObj,
  selectPageObjLocatorsByProbability,
  selectWaitingByPageObj,
} from "../../../store/selectors/pageObjectSelectors";
import { locatorsGenerationStatus } from "../../../utils/constants";

let timer;

export const LocatorsProgress = ({ currentPageObject }) => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state) => state.locators.generationStatus);

  const byProbability = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const generated = useSelector((_state) => selectGeneratedByPageObj(_state, currentPageObject));
  const waiting = useSelector((_state) => selectWaitingByPageObj(_state, currentPageObject));
  const deleted = useSelector((_state) => selectDeletedByPageObj(_state, currentPageObject));

  const calculationReady = size(generated);
  const toBeCalculated = size(byProbability) - size(deleted);

  const hideProgressInformation = () => setIsProgressActive(false);

  const readinessPercentage = useMemo(() => {
    const calculationReady = size(generated);
    const toBeCalculated = size(byProbability) - size(deleted);
    if (!toBeCalculated && !calculationReady) {
      return 0;
    }
    const result = calculationReady / toBeCalculated;
    return result.toFixed(2) * 100;
  }, [byProbability, generated]);

  useEffect(() => {
    if (size(waiting) && size(generated) === 0) setIsProgressActive(true);
    if (calculationReady > 0 && toBeCalculated > 0 && calculationReady === toBeCalculated) {
      timer = setTimeout(hideProgressInformation, 10000);
    }
    return () => clearTimeout(timer);
  }, [byProbability, generated, waiting, deleted]);

  return (
    <div className="jdn__locatorsList-progress" style={{ display: isProgressActive ? "flex" : "none" }}>
      <Progress
        percent={readinessPercentage}
        status="active"
        showInfo={false}
        strokeColor="#1582D8"
        trailColor="black"
        strokeLinecap="square"
        strokeWidth={5}
      />
      <p className="jdn__locatorsList-progress-text">
        {size(waiting) ?
          `${locatorsGenerationStatus.started} (${calculationReady}/${toBeCalculated})` :
          generationStatus}
      </p>
    </div>
  );
};
