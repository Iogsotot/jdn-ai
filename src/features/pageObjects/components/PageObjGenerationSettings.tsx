import React, { useEffect, useRef } from 'react';
import { Col, Row, Select, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPageObject, selectPageObjects } from '../selectors/pageObjects.selectors';
import { AppDispatch } from '../../../app/store/store';
import { changeElementLibrary, setLocatorType, setAnnotationType, changeFrameworkType } from '../pageObject.slice';
import { PageObjectId } from '../types/pageObjectSlice.types';
import { ElementLibrary, libraryNames } from '../../locators/types/generationClasses.types';
import { LocatorType, FrameworkType, AnnotationType } from '../../../common/types/common';
import { LocalStorageKey, setLocalStorage } from '../../../common/utils/localStorage';
import { Footnote } from '../../../common/components/footnote/Footnote';
import { IN_DEVELOPMENT_TITLE } from '../../../common/constants/constants';

import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { OnboardingStep } from '../../onboarding/constants';

import { selectIsPageObjectsListUIEnabled } from '../selectors/pageObjectsListUI.selectors';

interface Props {
  pageObj: PageObjectId;
  url: string;
}

// ToDo move to constants
const libraryOptions = [
  {
    value: ElementLibrary.HTML5,
    label: libraryNames.HTML5,
  },
  {
    value: ElementLibrary.MUI,
    label: libraryNames.MUI,
  },
  {
    value: ElementLibrary.Vuetify,
    label: libraryNames.Vuetify,
  },
];

const frameworkTypeOptions = [
  {
    value: FrameworkType.JdiLight,
    label: FrameworkType.JdiLight,
    disabled: false,
  },
  {
    value: FrameworkType.Selenium,
    label: FrameworkType.Selenium,
    title: IN_DEVELOPMENT_TITLE,
    disabled: true,
  },
  {
    value: FrameworkType.Selenide,
    label: FrameworkType.Selenide,
    title: IN_DEVELOPMENT_TITLE,
    disabled: true,
  },
  {
    value: FrameworkType.Vividus,
    label: FrameworkType.Vividus,
    disabled: false,
  },
];

const annotationTypeOptions = [
  {
    value: AnnotationType.UI,
    label: AnnotationType.UI,
  },
  {
    value: AnnotationType.FindBy,
    label: AnnotationType.FindBy,
  },
];

const locatorTypeOptions = [
  {
    value: LocatorType.xPath,
    label: LocatorType.xPath,
  },
  {
    value: LocatorType.cssSelector,
    label: LocatorType.cssSelector,
  },
];

export const PageObjGenerationSettings: React.FC<Props> = ({ pageObj, url }) => {
  const currentPageObject = useSelector(selectCurrentPageObject);
  const pageObjects = useSelector(selectPageObjects);

  const dispatch = useDispatch<AppDispatch>();

  const refSettings = useRef<HTMLElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();

  useEffect(() => {
    if (refSettings.current) {
      updateStepRefs(OnboardingStep.POsettings, refSettings);
    }
  }, []);

  const currentLibrary = currentPageObject?.library;
  const isMoreThanOnePageObject = pageObjects?.length > 1;
  const currentAnnotation = currentPageObject?.annotationType;
  const isCurrentFrameworkVividus = currentPageObject?.framework === FrameworkType.Vividus;

  const onLibraryChange = (selectedLibrary: ElementLibrary) => {
    dispatch(changeElementLibrary({ id: pageObj, library: selectedLibrary }));
    setLocalStorage(LocalStorageKey.Library, selectedLibrary);
  };

  const onAnnotationTypeChange = (annotationType: AnnotationType) => {
    dispatch(setAnnotationType({ id: pageObj, annotationType }));
    setLocalStorage(LocalStorageKey.AnnotationType, annotationType);
  };

  const onFrameworkChange = (framework: FrameworkType) => {
    dispatch(changeFrameworkType({ id: pageObj, framework }));
    setLocalStorage(LocalStorageKey.Framework, framework);

    if (framework === FrameworkType.Vividus) {
      onLibraryChange(ElementLibrary.HTML5);
      onAnnotationTypeChange(AnnotationType.FindBy);
    }
  };

  const onLocatorTypeChange = (locatorType: LocatorType) => {
    dispatch(setLocatorType({ id: pageObj, locatorType }));
    setLocalStorage(LocalStorageKey.LocatorType, locatorType);
  };

  const isPageObjectsListUIEnabled = useSelector(selectIsPageObjectsListUIEnabled);

  return (
    <div className="jdn__pageObject__settings">
      <Footnote className="jdn__pageObject__settings-url">{url}</Footnote>
      <div className="jdn__generationButtons">
        <Space direction="vertical" size={16}>
          <div
            ref={refSettings as React.LegacyRef<HTMLDivElement>}
            className="jdn__generationButtons_onboardingMask"
          ></div>
          <Row>
            <Col flex="104px">
              <Typography.Text>Framework:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="frameworkType"
                disabled={isMoreThanOnePageObject || !isPageObjectsListUIEnabled}
                defaultValue={currentPageObject?.framework || FrameworkType.JdiLight}
                className="jdn__select"
                options={frameworkTypeOptions}
                onChange={onFrameworkChange}
              />
            </Col>
          </Row>
          <Row>
            <Col flex="104px">
              <Typography.Text>Library:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="library"
                disabled={isCurrentFrameworkVividus || !isPageObjectsListUIEnabled}
                value={currentLibrary}
                className="jdn__select"
                onChange={onLibraryChange}
                options={libraryOptions}
              />
            </Col>
          </Row>
          <Row>
            <Col flex="104px">
              <Typography.Text>Annotation:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="annotationType"
                disabled={isCurrentFrameworkVividus || !isPageObjectsListUIEnabled}
                value={currentAnnotation}
                defaultValue={currentPageObject?.annotationType || AnnotationType.UI}
                className="jdn__select"
                onChange={onAnnotationTypeChange}
                options={annotationTypeOptions}
              />
            </Col>
          </Row>
          <Row>
            <Col flex="104px">
              <Typography.Text>Locators type:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="locatorType"
                defaultValue={currentPageObject?.locatorType || LocatorType.xPath}
                className="jdn__select"
                onChange={onLocatorTypeChange}
                options={locatorTypeOptions}
                disabled={!isPageObjectsListUIEnabled}
              />
            </Col>
          </Row>
        </Space>
      </div>
    </div>
  );
};
