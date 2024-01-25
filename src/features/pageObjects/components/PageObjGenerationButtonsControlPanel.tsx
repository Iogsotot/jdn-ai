import React, { FC, useEffect, useRef } from 'react';
import { PageObjGenerationButton } from './PageObjGenerationButton';
import { isIdentificationLoading } from '../../locators/utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store/store';
import { selectCurrentPageObject } from '../selectors/pageObjects.selectors';
import { useOnboarding } from '../../onboarding/useOnboarding';
import { OnboardingStep } from '../../onboarding/constants';
import { PageObjectId } from '../types/pageObjectSlice.types';
import { setHideUnadded } from '../pageObject.slice';
import { identifyElements } from '../../locators/reducers/identifyElements.thunk';
import { disablePageObjectsListUI } from '../pageObjectsListUI.slice';
import { resetProgressBar, startProgressBar } from '../progressBar.slice';
import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { selectIsPageObjectsListUIEnabled } from '../selectors/pageObjectsListUI.selectors';
import { useOnboardingContext } from '../../onboarding/OnboardingProvider';

interface Props {
  pageObjectId: PageObjectId;
  library: ElementLibrary;
}

const PageObjGenerationButtonsControlPanel: FC<Props> = ({ pageObjectId, library }) => {
  const dispatch = useDispatch<AppDispatch>();

  const generationButtonRef = useRef<HTMLElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();

  const status = useSelector((state: RootState) => state.locators.present.status);
  const currentPageObject = useSelector(selectCurrentPageObject);
  const isPageObjectsListUIEnabled = useSelector(selectIsPageObjectsListUIEnabled);

  const isLoading = () => isIdentificationLoading(status) && currentPageObject?.id === pageObjectId;
  const isGenerateAllLoading = () => isLoading() && !currentPageObject?.hideUnadded;
  const isGenerateEmptyLoading = () => isLoading() && currentPageObject?.hideUnadded;

  const { isOnboardingOpen, handleOnChangeStep } = useOnboarding();

  const handleGenerate = () => {
    if (isOnboardingOpen) handleOnChangeStep(OnboardingStep.Generating);
    dispatch(setHideUnadded({ id: pageObjectId, hideUnadded: false }));
    void dispatch(identifyElements({ library, pageObj: pageObjectId }));
    // disable UI for PageObjList settings:
    dispatch(disablePageObjectsListUI());
    // reset to default progress bar:
    dispatch(resetProgressBar());
    // show and start progress bar:
    dispatch(startProgressBar());
  };

  const handleEmptyPO = () => {
    dispatch(setHideUnadded({ id: pageObjectId, hideUnadded: true }));
    void dispatch(identifyElements({ library, pageObj: pageObjectId }));
  };

  useEffect(() => {
    if (generationButtonRef.current) {
      updateStepRefs(OnboardingStep.Generate, generationButtonRef, handleGenerate);
    }
  }, []);

  return (
    <>
      <div
        ref={generationButtonRef as React.LegacyRef<HTMLDivElement>}
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: '16px',
          width: '275px',
        }}
      >
        <PageObjGenerationButton
          type="primary"
          loading={isGenerateAllLoading()}
          onClick={handleGenerate}
          disabled={!isPageObjectsListUIEnabled}
        >
          Generate All
        </PageObjGenerationButton>
        <PageObjGenerationButton
          loading={isGenerateEmptyLoading()}
          onClick={handleEmptyPO}
          disabled={isOnboardingOpen || !isPageObjectsListUIEnabled}
        >
          Empty Page Object
        </PageObjGenerationButton>
      </div>
    </>
  );
};

export default PageObjGenerationButtonsControlPanel;
