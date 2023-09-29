import { last } from 'lodash';
import { BackendStatus, Page, PageType } from './types/mainSlice.types';
import { RootState } from './store/store';
import { createSelector } from '@reduxjs/toolkit';
import { selectPageObjects } from '../features/pageObjects/selectors/pageObjects.selectors';
import { isPageObjectPage } from './utils/heplers';

export const selectCurrentPage = (state: RootState) => {
  return last(state.main.pageHistory) || ({ page: PageType.PageObject } as Page);
};

export const selectIsDefaultState = createSelector(
  selectCurrentPage,
  selectPageObjects,
  (state: RootState) => state.main.backendAvailable === BackendStatus.Accessed,
  (currentPage, pageObjects, isBackendAvailable) =>
    isPageObjectPage(currentPage.page) && pageObjects.length === 0 && isBackendAvailable,
);
