import React, { MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkDuplicates, evaluateCssSelector, evaluateXpath } from "../utils/utils";
import { selectLocatorsByPageObject } from "../selectors/locatorsByPO.selectors";
import { LocatorType } from "../../../common/types/common";
import { setActiveSingle, setScrollToLocator } from "../locators.slice";
import { JDNHash, ElementId } from "../types/locator.types";

interface LocatorMessageForDuplicateProps {
  locator: string;
  closeDialog: () => void;
  locatorType: LocatorType;
  elementId: ElementId;
  jdnHash: JDNHash;
}

export const LocatorMessageForDuplicate: React.FC<LocatorMessageForDuplicateProps> = ({
  locator,
  closeDialog,
  locatorType,
  elementId,
  jdnHash,
}) => {
  const dispatch = useDispatch();
  const locators = useSelector(selectLocatorsByPageObject);

  const handleOnMessageClick = async (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    closeDialog();

    let locatorValue;
    locatorType === LocatorType.cssSelector
      ? (locatorValue = await evaluateCssSelector(locator, elementId, jdnHash))
      : (locatorValue = await evaluateXpath(locator, elementId, jdnHash));

    const { element_id: _elementId, foundHash } = JSON.parse(locatorValue);
    const duplicates = checkDuplicates(foundHash, locators, _elementId);
    if (duplicates.length) {
      dispatch(setActiveSingle(duplicates[0]));
      dispatch(setScrollToLocator(duplicates[0].element_id));
    }
  };

  return (
    <span>
      Duplicate locator detected. Please, edit or{" "}
      <span className="jdn__locatorEdit-navigation" onClick={handleOnMessageClick}>
        refer to the original locator
      </span>{" "}
      for further actions.
    </span>
  );
};