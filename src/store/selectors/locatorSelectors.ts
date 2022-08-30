import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

import { locatorTaskStatus } from "../../utils/constants";
import { ElementId, Locator } from "../slices/locatorSlice.types";
import { RootState } from "../store";

export const locatorsAdapter = createEntityAdapter<Locator>({
  selectId: (locator) => locator.element_id,
});

export const {
  selectAll: selectLocators,
  selectById: selectLocatorById,
} = locatorsAdapter.getSelectors<RootState>((state) => state.locators);

export const {
  selectAll: simpleSelectLocators,
  selectById: simpleSelectLocatorById,
} = locatorsAdapter.getSelectors();

export const selectLocatorsByProbability = createSelector(
  selectLocators,
  (state: RootState) => state.main.perception,
  (items: Locator[], perception) =>
    items.filter((e) => e.predicted_probability >= perception)
);

export const selectGeneratedLocators = createSelector(
  selectLocatorsByProbability,
  (items: Locator[]) =>
    items.filter(
      (el) =>
        (el.locator.taskStatus === locatorTaskStatus.SUCCESS ||
          el.isCustomLocator) &&
        !el.deleted
    )
);

export const selectLocatorsToGenerate = createSelector(
  selectLocatorsByProbability,
  (items: Locator[]) => items.filter((el) => el.generate && !el.deleted)
);

export const isLocatorIndeterminate = createSelector(
  selectLocators,
  selectLocatorById,
  (state: RootState) => state,
  (locators, locator, state) => {
    if (!locator) return false;
    if (locator.generate) return false;
    const hasChildToGenerate = (_locator: Locator) => {
      const hasSelectedChild =
        _locator.children &&
        _locator.children.some((childId) =>
          locators.some((loc) => loc.element_id === childId && loc.generate)
        );
      return (
        hasSelectedChild ||
        (_locator.children &&
          _locator.children.some((childId: ElementId) => {
            const _locator = selectLocatorById(state, childId);
            if (_locator) hasChildToGenerate(_locator);
          }))
      );
    };

    return hasChildToGenerate(locator);
  }
);

export const areChildrenChecked = createSelector(
  selectLocators,
  selectLocatorById,
  (locators, locator) =>
    locator &&
    locator.children &&
    locator.children.every((childId) =>
      locators.some((loc) => loc.element_id === childId && loc.generate)
    )
);