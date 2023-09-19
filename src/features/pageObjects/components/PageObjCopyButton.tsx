import React, { FC, MouseEvent, useState } from "react";

import { Button, Tooltip } from "antd";
import { CopySimple } from "@phosphor-icons/react";
import { ILocator } from "../../locators/types/locator.types";
import { CopyTitle, FrameworkType } from "../../../common/types/common";
import { getLocatorString, getFullLocatorVividusString } from "../../locators/utils/locatorOutput";
import { copyLocatorsToClipboard } from "../../locators/utils/copyLocatorToClipboard";
import _ from "lodash";

interface Props {
  framework: FrameworkType;
  elements: ILocator[];
}

export const PageObjCopyButton: FC<Props> = ({ framework, elements }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const isVividusFramework = framework === FrameworkType.Vividus;

  const getPageObjectForCopying = (locators: ILocator[]) => {
    return locators.map((element) => {
      const { annotationType, locatorType, locator, type, name } = element;

      return isVividusFramework
        ? getFullLocatorVividusString(name, _.camelCase(locatorType), element)
        : getLocatorString(annotationType, locatorType, locator, type, name);
    });
  };

  const handleCopy = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    const pageObject = getPageObjectForCopying(elements);
    copyLocatorsToClipboard(pageObject);

    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle}>
      <Button
        className="jdn__itemsList-button jdn__pageObject_button-copy"
        icon={<CopySimple size={18} color="currentColor" />}
        onMouseEnter={handleMouseEnter}
        onClick={(e) => handleCopy(e)}
      />
    </Tooltip>
  );
};
