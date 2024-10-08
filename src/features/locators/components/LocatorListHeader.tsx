import React, { useEffect, useRef, useState } from 'react';
import { size } from 'lodash';
import { Button, Checkbox, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Chip } from '../../../common/components/Chip';
import { CaretDown, DotsThree } from '@phosphor-icons/react';
import { PlusOutlined } from '@ant-design/icons';
import {
  elementGroupUnsetActive,
  expandCustom,
  setElementGroupGeneration,
  setExpandedKeys,
  toggleAllLocatorsIsChecked,
} from '../locators.slice';
import { newLocatorStub } from '../utils/constants';
import { LocatorsSearch } from './LocatorsSearch';
import { LocatorEditDialog } from './LocatorEditDialog';
import { OnboardingTooltip } from '../../onboarding/components/OnboardingTooltip';
import { LocatorMenu } from './LocatorMenu';
import { ExpandState } from './LocatorsTree';
import {
  selectActiveLocators,
  selectActualActiveByPageObject,
  selectCheckedLocatorsByPageObject,
  selectFilteredLocators,
  selectGenerateByPageObject,
} from '../selectors/locatorsFiltered.selectors';

import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { OnboardingStep } from '../../onboarding/constants';
import { selectIsOnboardingOpen } from '../../onboarding/store/onboarding.selectors';
import { useOnboarding } from '../../onboarding/useOnboarding';

import { selectIsCreatingFormOpen } from '../selectors/customLocator.selectors';
import { setIsCreatingFormOpen } from '../customLocator.slice';
import classNames from 'classnames';
import '../../../common/styles/headerCollapse.less';
import { selectExpandedKeys } from '../selectors/locators.selectors';

interface ViewProps {
  expandAll: string[];
  setExpandAll: (val: ExpandState) => void;
  searchString: string;
}

interface LocatorListHeaderProps {
  render: (viewProps: ViewProps) => React.ReactNode;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
}

const emptyLength = 0;

export const LocatorListHeader = ({
  render,
  isEditModalOpen,
  setIsEditModalOpen,
}: LocatorListHeaderProps): JSX.Element => {
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState('');

  const expandAll = useSelector(selectExpandedKeys);
  const locators = useSelector(selectFilteredLocators);
  const generatedLocators = useSelector(selectGenerateByPageObject);
  const checkedLocators = useSelector(selectCheckedLocatorsByPageObject);
  const active = useSelector(selectActiveLocators);
  const actualSelected = useSelector(selectActualActiveByPageObject);

  const isOnboardingOpen = useSelector(selectIsOnboardingOpen);
  const isCreatingForm = useSelector(selectIsCreatingFormOpen);

  const [isAllLocatorsSelected, setIsAllLocatorsSelected] = useState<boolean>(false);

  useEffect(() => {
    if (
      checkedLocators.length > emptyLength &&
      checkedLocators.length === locators.length &&
      generatedLocators.length === locators.length
    ) {
      setIsAllLocatorsSelected(true);
    } else {
      setIsAllLocatorsSelected(false);
    }
  }, [checkedLocators.length]);

  const partiallySelected =
    checkedLocators.length > emptyLength &&
    checkedLocators.length < locators.length &&
    generatedLocators.length < locators.length; // ToDo isGenerated refactoring

  const handleOnChange = () => {
    dispatch(toggleAllLocatorsIsChecked({ locators, isChecked: !isAllLocatorsSelected }));
    setIsAllLocatorsSelected((prev) => !prev);
    // eslint-disable-next-line max-len
    dispatch(setElementGroupGeneration({ locators, isGenerated: !isAllLocatorsSelected })); // ToDo isGenerated refactoring
  };

  const customLocatorRef = useRef<HTMLButtonElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();
  const { handleOnChangeStep } = useOnboarding();

  const addCustomLocatorHandler = () => {
    dispatch(setIsCreatingFormOpen(true));
    setIsEditModalOpen(true);
    if (isOnboardingOpen) handleOnChangeStep(OnboardingStep.EditLocator);
  };

  useEffect(() => {
    if (customLocatorRef.current) {
      updateStepRefs(OnboardingStep.CustomLocator, customLocatorRef, addCustomLocatorHandler);
    }
  }, []);

  const isLocatorHasSubLocators = locators.some(
    (locator) => Array.isArray(locator.children) && locator.children.length > 0,
  );
  const isHeaderCollapseDisabled = !locators.length || !isLocatorHasSubLocators;

  const isHeaderCollapseExpanded = isHeaderCollapseDisabled ? false : expandAll.length > 0;
  const headerCollapseClassName = classNames(
    'jdn__items-list_header-collapse',
    { disabled: isHeaderCollapseDisabled },
    { expanded: isHeaderCollapseExpanded },
  );

  const handleExpandAll = () => {
    if (isHeaderCollapseDisabled) return;

    const isCurrentlyExpanded = expandAll.length > 0;
    const newExpandState = isCurrentlyExpanded ? ExpandState.Collapsed : ExpandState.Expanded;

    if (newExpandState === ExpandState.Expanded) {
      dispatch(setExpandedKeys(locators.map((loc) => loc.elementId)));
    } else {
      dispatch(setExpandedKeys([]));
    }

    dispatch(expandCustom());
  };

  return (
    <>
      <div className="jdn__locator-page_header-locator-control-group">
        <LocatorsSearch value={searchString} onChange={setSearchString} />
        <OnboardingTooltip>
          <Button
            className="jdn__locator-page_locator-add-btn"
            disabled={isOnboardingOpen && !!size(locators)}
            ref={customLocatorRef}
            icon={<PlusOutlined size={14} />}
            size="small"
            onClick={addCustomLocatorHandler}
          >
            Custom locator
          </Button>
        </OnboardingTooltip>
      </div>

      <Row className="jdn__items-list_header">
        <span className="jdn__items-list_header-title">
          <CaretDown className={headerCollapseClassName} size={14} onClick={handleExpandAll} />
          <Checkbox
            checked={isAllLocatorsSelected}
            indeterminate={partiallySelected}
            onClick={handleOnChange}
            disabled={!locators.length}
          />
          <Chip
            hidden={!size(active)}
            primaryLabel={size(active).toString()}
            secondaryLabel={'selected'}
            onDelete={() => dispatch(elementGroupUnsetActive(active))}
          />
        </span>
        {size(active) ? (
          <LocatorMenu {...{ trigger: ['click'], setIsEditModalOpen }}>
            <Button
              className="jdn__items-list_button jdn__items-list_button-menu"
              icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
            />
          </LocatorMenu>
        ) : null}
      </Row>
      {render({ expandAll, setExpandAll: handleExpandAll, searchString })}
      {isEditModalOpen ? (
        <LocatorEditDialog
          isCreatingForm
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setIsEditModalOpen}
          {...(isCreatingForm ? newLocatorStub : actualSelected[0])}
        />
      ) : null}
    </>
  );
};
